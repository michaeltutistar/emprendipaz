from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin as _cross_origin
from werkzeug.utils import secure_filename
import boto3
import os
import uuid
from datetime import datetime, timedelta
import json
from ..models import db, User, Curso, Modulo, Leccion, Recurso, Inscripcion, LogActividad, AsistenciaJornada, BalanceJornadaTutor
from ..services.auth_service import token_required, instructor_required
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

instructor_bp = Blueprint('instructor', __name__)

# Asegurar que cross_origin no rompa credenciales (credentials: include) en el frontend.
def cross_origin(*args, **kwargs):
    kwargs.setdefault('supports_credentials', True)
    kwargs.setdefault('origins', [
        'https://emprendimiento-narino.com',
        'https://www.emprendimiento-narino.com',
        'http://localhost:5173',
        'http://localhost:3000',
    ])
    return _cross_origin(*args, **kwargs)

# Configuración de S3
def get_s3_client():
    """Obtener cliente de S3"""
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION', 'us-east-1')
    )

def upload_to_s3(file, folder='content'):
    """Subir archivo a S3"""
    try:
        s3_client = get_s3_client()
        bucket_name = os.getenv('S3_BUCKET_NAME')
        
        # Generar nombre único para el archivo
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{folder}/{uuid.uuid4()}{file_extension}"
        
        # Subir archivo
        s3_client.upload_fileobj(
            file,
            bucket_name,
            unique_filename,
            ExtraArgs={
                'ContentType': file.content_type,
                'ACL': 'public-read'
            }
        )
        
        # Generar URL pública
        url = f"https://{bucket_name}.s3.amazonaws.com/{unique_filename}"
        
        return {
            'success': True,
            's3_key': unique_filename,
            's3_url': url,
            's3_bucket': bucket_name
        }
    except Exception as e:
        logger.error(f"Error uploading to S3: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

@instructor_bp.route('/dashboard', methods=['GET'])
@token_required
@instructor_required
def get_instructor_dashboard(current_user):
    """Obtener datos del dashboard del instructor"""
    try:
        user = current_user
        
        # Nota: En esta plataforma no dependemos del esquema "Cursos" (y en Lambda el modelo Curso no tiene
        # instructor_id/estado/fecha_creacion). Para evitar 500 devolvemos estadísticas seguras.
        total_cursos = 0
        promedio_progreso = 0
        cursos_data = []

        # Conteo aproximado de estudiantes activos: usuarios únicos con actividad de completado
        try:
            total_estudiantes = db.session.query(LogActividad.usuario_id).filter(
                LogActividad.accion.like('Completó:%')
            ).distinct().count()
        except Exception:
            total_estudiantes = 0
        
        # Actividad reciente (completados)
        try:
            actividades = LogActividad.query.filter(
                LogActividad.accion.like('Completó:%')
            ).order_by(LogActividad.fecha.desc()).limit(10).all()
            actividad_data = [a.to_dict() if hasattr(a, 'to_dict') else {
                'id': a.id,
                'accion': a.accion,
                'detalles': a.detalles,
                'fecha': a.fecha.isoformat() if a.fecha else None
            } for a in actividades]
        except Exception:
            actividad_data = []
        
        return jsonify({
            'success': True,
            'data': {
                'totalCursos': total_cursos,
                'totalEstudiantes': total_estudiantes,
                'promedioProgreso': promedio_progreso,
                'actividadReciente': actividad_data,
                'cursos': cursos_data
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor dashboard: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Error al obtener datos del dashboard'
        }), 500


@instructor_bp.route('/actividad-reciente', methods=['GET'])
@token_required
@instructor_required
def get_actividad_reciente(current_user):
    """Obtener actividad reciente de los estudiantes (usado por dashboard instructor)."""
    try:
        actividades = LogActividad.query.filter(
            LogActividad.accion.like('Completó:%')
        ).order_by(LogActividad.fecha.desc()).limit(20).all()

        actividades_data = [a.to_dict() if hasattr(a, 'to_dict') else {
            'id': a.id,
            'accion': a.accion,
            'detalles': a.detalles,
            'fecha': a.fecha.isoformat() if a.fecha else None
        } for a in actividades]

        return jsonify({'success': True, 'actividades': actividades_data}), 200
    except Exception as e:
        logger.error(f"Error obteniendo actividad reciente: {str(e)}", exc_info=True)
        return jsonify({'error': 'Error al obtener actividad reciente'}), 500


@instructor_bp.route('/progreso-estudiantes', methods=['GET'])
@token_required
@instructor_required
def get_progreso_estudiantes(current_user):
    """Obtener progreso de estudiantes por módulo (misma lógica que backend/src)."""
    try:
        from collections import defaultdict
        import re
        from ..models import IntentosEvaluacion, PuntosPlanNegocio
        import os
        import csv
        from sqlalchemy import func

        # Precargar metadata de usuarios para evitar N+1 (User.query.get en loops).
        user_rows = db.session.query(User.id, User.nombre, User.apellido, User.rol).all()
        user_meta = {uid: {'nombre': n or '', 'apellido': a or '', 'rol': r or ''} for uid, n, a, r in user_rows}
        def _is_student(uid: int) -> bool:
            m = user_meta.get(uid)
            return bool(m) and m.get('rol') in ('estudiante', 'usuario')
        def _full_name(uid: int) -> str:
            m = user_meta.get(uid) or {}
            return f"{(m.get('nombre') or '').strip()} {(m.get('apellido') or '').strip()}".strip()

        intentos_evaluacion = db.session.query(
            IntentosEvaluacion.usuario_id,
            IntentosEvaluacion.modulo_nombre,
            IntentosEvaluacion.paso_nombre
        ).all()
        # Mapa nombre_completo -> user.id (evita re-buscar por nombre y asegura ID estable)
        ids_por_nombre_estudiante = {}
        
        # Obtener puntos del plan de negocio por estudiante y módulo
        # Normalizar nombres largos (BD/frontend) al canónico para que el informe muestre puntos correctos
        mapeo_modulo_plan_negocio = {
            'Finanzas y Gestión Empresarial': 'Finanzas',
            'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente',
        }
        puntos_por_estudiante_modulo = defaultdict(lambda: defaultdict(int))
        fechas_plan_negocio = defaultdict(lambda: defaultdict(lambda: None))
        try:
            # Asegurar que la tabla existe
            asegurar_tabla_puntos_plan_negocio()
            
            # Agrupar en SQL por (usuario_id, modulo_nombre) para reducir volumen y evitar N+1
            rows = db.session.query(
                PuntosPlanNegocio.usuario_id,
                PuntosPlanNegocio.modulo_nombre,
                func.coalesce(func.sum(PuntosPlanNegocio.puntos), 0).label('puntos_sum'),
                func.max(PuntosPlanNegocio.fecha_registro).label('fecha_max')
            ).group_by(
                PuntosPlanNegocio.usuario_id, PuntosPlanNegocio.modulo_nombre
            ).all()

            for uid, mod_raw, puntos_sum, fecha_max in rows:
                if not uid or not _is_student(int(uid)):
                    continue
                uid = int(uid)
                nombre_estudiante = _full_name(uid)
                ids_por_nombre_estudiante[nombre_estudiante] = uid
                mod_nombre = (mod_raw or '').strip()
                mod_canonico = mapeo_modulo_plan_negocio.get(mod_nombre, mod_nombre)
                puntos_por_estudiante_modulo[nombre_estudiante][mod_canonico] += int(puntos_sum or 0)
                if fecha_max:
                    fecha_actual = fechas_plan_negocio[nombre_estudiante][mod_canonico]
                    if fecha_actual is None or fecha_max > fecha_actual:
                        fechas_plan_negocio[nombre_estudiante][mod_canonico] = fecha_max
        except Exception as e:
            # Si la tabla no existe o hay algún error, simplemente continuar sin puntos
            logger.warning(f"Error obteniendo puntos del plan de negocio: {str(e)}")
            pass

        intentos_por_estudiante = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
        modulos_por_estudiante = defaultdict(set)

        for uid, modulo_nombre, paso_nombre in intentos_evaluacion:
            if not uid or not _is_student(int(uid)):
                continue
            uid = int(uid)
            nombre_estudiante = _full_name(uid)
            ids_por_nombre_estudiante[nombre_estudiante] = uid
            modulo_normalizado = (modulo_nombre or '').strip()
            paso_normalizado = (paso_nombre or '').strip()
            match = re.search(r'Unidad\s+(\d+)', paso_normalizado, re.IGNORECASE)
            if match:
                unidad_key = f"Unidad {match.group(1)}"
                intentos_por_estudiante[nombre_estudiante][modulo_normalizado][unidad_key] += 1
                modulos_por_estudiante[nombre_estudiante].add(modulo_normalizado)

        actividades = db.session.query(
            LogActividad.usuario_id,
            LogActividad.accion,
            LogActividad.detalles,
            LogActividad.fecha
        ).filter(
            LogActividad.accion.like('Completó:%')
        ).all()

        progreso_por_estudiante = defaultdict(lambda: defaultdict(list))
        modulos_posibles = [
            'Marketing Digital', 'Marketing y Comercialización', 'Proyecto de vida',
            'Trabajo en Equipo', 'Descubrimiento de Oportunidades', 'Modelo de Negocios',
            'Atención al Cliente', 'Finanzas', 'Liderazgo', 'Plan de Inversión',
            # Variantes largas del frontend
            'Finanzas y Gestión Empresarial', 'Atención al Cliente y Resolución de Conflictos'
        ]
        
        # Mapeo de normalización: convertir nombres largos a nombres estándar
        mapeo_normalizacion = {
            'Finanzas y Gestión Empresarial': 'Finanzas',
            'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente'
        }

        for uid, accion, detalles, fecha in actividades:
            if not uid or not _is_student(int(uid)):
                continue
            uid = int(uid)
            nombre_estudiante = _full_name(uid)
            ids_por_nombre_estudiante[nombre_estudiante] = uid
            paso = (accion or '').replace('Completó: ', '')
            detalles = detalles or ''
            modulo = None
            texto_buscar = (detalles + ' ' + paso).lower()
            modulo_encontrado = None
            for mod in modulos_posibles:
                if mod.lower() in texto_buscar:
                    modulo_encontrado = mod
                    break
            if not modulo_encontrado:
                continue
            
            # Normalizar el nombre del módulo encontrado
            modulo = mapeo_normalizacion.get(modulo_encontrado, modulo_encontrado)
            modulos_por_estudiante[nombre_estudiante].add(modulo)
            if not any(p['paso'] == paso for p in progreso_por_estudiante[nombre_estudiante][modulo]):
                progreso_por_estudiante[nombre_estudiante][modulo].append({
                    'paso': paso,
                    'fecha': actividad.fecha.isoformat() if actividad.fecha else None,
                    'detalles': detalles
                })

        # Calcular progreso agrupado por estudiante (formato esperado por el frontend: progreso_estudiantes)
        resultado_por_estudiante = defaultdict(lambda: {
            'estudiante': '',
            'modulos': [],
            'porcentaje_total': 0,
            'total_modulos': 0
        })

        todos_estudiantes = set(list(modulos_por_estudiante.keys()) + list(progreso_por_estudiante.keys()))

        for estudiante in todos_estudiantes:
            resultado_por_estudiante[estudiante]['estudiante'] = estudiante
            # Incluir ID del estudiante (necesario para agrupación por municipio en frontend)
            resultado_por_estudiante[estudiante]['estudiante_id'] = ids_por_nombre_estudiante.get(estudiante)
            modulos_estudiante = modulos_por_estudiante.get(estudiante, set())
            modulos_estudiante.update(progreso_por_estudiante.get(estudiante, {}).keys())

            for modulo in modulos_estudiante:
                pasos_completados = progreso_por_estudiante.get(estudiante, {}).get(modulo, [])

                # Agrupar pasos por unidad
                unidades_encontradas = set()
                pasos_por_unidad = defaultdict(list)
                otros_pasos = []

                for paso_obj in pasos_completados:
                    paso = paso_obj['paso']
                    match = re.search(r'Unidad\s+(\d+)', paso, re.IGNORECASE)
                    if match:
                        unidad_key = f"Unidad {match.group(1)}"
                        unidades_encontradas.add(unidad_key)
                        pasos_por_unidad[unidad_key].append(paso_obj)
                    else:
                        otros_pasos.append(paso_obj)

                progreso_pasos = []

                # Pasos sin unidad (excluir "Plan de Negocio" ya que se agrega después con puntos)
                for paso_obj in otros_pasos:
                    # Filtrar "Plan de Negocio" para evitar duplicados (comparación flexible)
                    paso_nombre = paso_obj['paso'].strip().lower()
                    if 'plan' in paso_nombre and 'negocio' in paso_nombre:
                        continue
                    progreso_pasos.append({
                        'nombre': paso_obj['paso'],
                        'completado': True,
                        'porcentaje': 100.0,
                        'subpasos_completados': 1,
                        'total_subpasos': 1,
                        'fecha': paso_obj.get('fecha'),
                        'intentos': 0
                    })

                # Unidades con intentos o con pasos completados
                unidades_con_intentos = set(intentos_por_estudiante.get(estudiante, {}).get(modulo, {}).keys())
                todas_las_unidades = unidades_encontradas.union(unidades_con_intentos)

                def unidad_sort_key(x):
                    m = re.search(r'\d+', x)
                    return int(m.group()) if m else 0

                for unidad_key in sorted(todas_las_unidades, key=unidad_sort_key):
                    pasos_unidad = pasos_por_unidad.get(unidad_key, [])
                    total_pasos_unidad = 4 if modulo == 'Proyecto de vida' else 3
                    completados_count = len(pasos_unidad)
                    porcentaje_paso = min(100.0, (completados_count / total_pasos_unidad) * 100) if total_pasos_unidad > 0 else 0
                    completado = completados_count >= total_pasos_unidad

                    # Fecha más reciente del paso
                    fecha_completado = None
                    if pasos_unidad:
                        fechas = [p.get('fecha') for p in pasos_unidad if p.get('fecha')]
                        if fechas:
                            fecha_completado = max(fechas)

                    intentos = intentos_por_estudiante.get(estudiante, {}).get(modulo, {}).get(unidad_key, 0)

                    progreso_pasos.append({
                        'nombre': unidad_key,
                        'completado': completado,
                        'porcentaje': round(porcentaje_paso, 1),
                        'subpasos_completados': completados_count,
                        'total_subpasos': total_pasos_unidad,
                        'fecha': fecha_completado,
                        'intentos': intentos
                    })

                # Agregar tarjeta "Plan de Negocio" si el módulo tiene plan de negocio con puntos
                if modulo in ['Descubrimiento de Oportunidades', 'Modelo de Negocios', 'Marketing y Comercialización', 'Marketing Digital', 'Atención al Cliente', 'Trabajo en Equipo', 'Finanzas', 'Liderazgo']:
                    puntos_plan = puntos_por_estudiante_modulo.get(estudiante, {}).get(modulo, 0)
                    fecha_plan = fechas_plan_negocio.get(estudiante, {}).get(modulo)
                    progreso_pasos.append({
                        'nombre': 'Plan de Negocio',
                        'completado': puntos_plan > 0,
                        'porcentaje': 100.0 if puntos_plan > 0 else 0,
                        'subpasos_completados': 1 if puntos_plan > 0 else 0,
                        'total_subpasos': 1,
                        'fecha': fecha_plan.isoformat() if fecha_plan else None,
                        'intentos': 0,
                        'puntos_plan_negocio': puntos_plan
                    })

                # Calcular porcentaje del módulo basado en unidades completadas
                unidades_en_progreso = [p for p in progreso_pasos if re.search(r'Unidad\s+\d+', p['nombre'], re.IGNORECASE)]
                total_unidades = len(unidades_en_progreso)
                unidades_completadas = len([p for p in unidades_en_progreso if p['completado']])

                porcentaje_modulo = (unidades_completadas / total_unidades * 100) if total_unidades > 0 else 0

                # Normalizar nombre del módulo antes de obtener el orden
                mapeo_normalizacion = {
                    'Finanzas y Gestión Empresarial': 'Finanzas',
                    'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente'
                }
                modulo_normalizado = mapeo_normalizacion.get(modulo, modulo)
                
                # Obtener el orden del módulo usando mapeo por defecto
                # (más seguro que consultar BD, evita errores 502)
                # Orden según las capturas de pantalla del frontend
                mapeo_modulos = {
                    'Proyecto de vida': 1,
                    'Descubrimiento de Oportunidades': 2,
                    'Modelo de Negocios': 3,
                    'Marketing y Comercialización': 4,
                    'Marketing Digital': 5,
                    'Atención al Cliente': 6,
                    'Trabajo en Equipo': 7,
                    'Finanzas': 8,
                    'Plan de Inversión': 9,
                    'Liderazgo': 10
                }
                modulo_orden = mapeo_modulos.get(modulo_normalizado, 999)  # 999 para módulos no reconocidos
                
                # Usar el nombre normalizado para el registro
                modulo = modulo_normalizado

                resultado_por_estudiante[estudiante]['modulos'].append({
                    'modulo': modulo,
                    'modulo_orden': modulo_orden,
                    'progreso_pasos': progreso_pasos,
                    'porcentaje': round(porcentaje_modulo, 1),
                    'pasos_completados': unidades_completadas,
                    'total_pasos': total_unidades
                })

            # Progreso total del estudiante: 10% por módulo completado (100%), excluye Plan de Negocios
            modulos_est = resultado_por_estudiante[estudiante]['modulos']
            modulos_para_progreso = [m for m in modulos_est if m['modulo'] != 'Plan de Negocios']
            total_modulos_para_progreso = 10

            if modulos_para_progreso:
                modulos_completados = len([m for m in modulos_para_progreso if m['porcentaje'] >= 100])
                porcentaje_total_est = (modulos_completados / total_modulos_para_progreso) * 100
                resultado_por_estudiante[estudiante]['porcentaje_total'] = round(porcentaje_total_est, 1)
                resultado_por_estudiante[estudiante]['total_modulos'] = len(modulos_est)
            else:
                resultado_por_estudiante[estudiante]['porcentaje_total'] = 0
                resultado_por_estudiante[estudiante]['total_modulos'] = len(modulos_est)

        # Convertir a lista y ordenar módulos por orden dentro de cada estudiante
        resultado = list(resultado_por_estudiante.values())
        
        # Ordenar los módulos de cada estudiante por su número de orden
        try:
            for estudiante_data in resultado:
                if 'modulos' in estudiante_data and isinstance(estudiante_data['modulos'], list):
                    estudiante_data['modulos'].sort(key=lambda m: m.get('modulo_orden', 999) if isinstance(m, dict) else 999)
        except Exception as e:
            logger.warning(f"Error al ordenar módulos: {str(e)}")
            # Continuar sin ordenar si hay error
        
        # --- Expandir a roster completo (728 estudiantes del CSV), incluso si no tienen actividad ---
        # Buscar por NOMBRE COMPLETO (Nombre + Apellido) porque el ID del CSV no coincide con la BD
        import unicodedata
        def normalizar(s):
            """Normalizar texto: minúsculas, sin tildes, sin espacios extra"""
            if not s:
                return ''
            s = ' '.join(s.lower().split())  # espacios múltiples -> uno solo
            # Quitar tildes
            s = unicodedata.normalize('NFD', s)
            s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
            return s
        
        municipios_por_nombre = {}  # clave = nombre_normalizado
        nombres_csv = set()
        try:
            csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'municipios.csv')
            csv_path = os.path.abspath(csv_path)
            with open(csv_path, mode='r', encoding='latin-1', newline='') as f:
                reader = csv.DictReader(f, delimiter=';')
                for row in reader:
                    nombre = (row.get('Nombre') or row.get('Nombre ') or row.get('NOMBRE') or '').strip()
                    apellido = (row.get('Apellido') or row.get('APELLIDO') or '').strip()
                    municipio = (row.get('Municipio') or row.get('MUNICIPIO') or '').strip()
                    if not nombre:
                        continue
                    nombre_completo = f"{nombre} {apellido}".strip()
                    nombre_norm = normalizar(nombre_completo)
                    nombres_csv.add(nombre_norm)
                    if municipio:
                        municipios_por_nombre[nombre_norm] = municipio
        except Exception as e:
            logger.error(f"No se pudo leer municipios.csv: {str(e)}", exc_info=True)
        
        print(f"[Roster] CSV cargado: {len(nombres_csv)} nombres únicos, {len(municipios_por_nombre)} con municipio")

        # Indexar progreso ya calculado por estudiante_id
        progreso_por_id = {}
        for item in resultado:
            sid = item.get('estudiante_id')
            if sid:
                progreso_por_id[int(sid)] = item

        # Consultar TODOS los usuarios de la BD y matchear por nombre con el CSV
        # Estrategia: para cada nombre del CSV, buscar el PRIMER usuario de BD que contenga ese nombre
        roster = []
        ids_usados = set()  # Evitar duplicados por ID de usuario
        nombres_usados = set()  # Evitar duplicados por nombre normalizado
        try:
            usuarios = User.query.filter(User.rol.notin_(['admin', 'instructor'])).all()
            
            # Crear índice de usuarios por nombre normalizado
            # Ordenar cada lista por preferencia: nombres con más minúsculas primero
            usuarios_por_nombre = {}
            for u in usuarios:
                nombre_original = f"{u.nombre} {u.apellido}".strip()
                nombre_norm = normalizar(nombre_original)
                if nombre_norm not in usuarios_por_nombre:
                    usuarios_por_nombre[nombre_norm] = []
                usuarios_por_nombre[nombre_norm].append(u)
            
            # Ordenar cada lista: preferir usuarios con nombres más en minúsculas
            for nombre_norm in usuarios_por_nombre:
                usuarios_por_nombre[nombre_norm].sort(
                    key=lambda u: sum(1 for c in f"{u.nombre} {u.apellido}" if c.isupper()),
                    reverse=False  # Menos mayúsculas primero
                )
            
            matched = 0
            # Para cada nombre del CSV, buscar match en BD
            for nombre_csv in nombres_csv:
                usuario_match = None
                municipio = municipios_por_nombre.get(nombre_csv)
                
                # Primero: match exacto
                if nombre_csv in usuarios_por_nombre:
                    for u in usuarios_por_nombre[nombre_csv]:
                        if u.id not in ids_usados:
                            usuario_match = u
                            break
                
                # Segundo: match por todas las palabras (CSV subset de BD O BD subset de CSV)
                if not usuario_match:
                    palabras_csv = set(nombre_csv.split())
                    for nombre_bd, lista_usuarios in usuarios_por_nombre.items():
                        palabras_bd = set(nombre_bd.split())
                        # CSV es subconjunto de BD (caso normal)
                        # O BD es subconjunto de CSV (BD tiene menos info, ej: "nory yohana" vs "nory yohana araujo montano")
                        if palabras_csv.issubset(palabras_bd) or (len(palabras_bd) >= 2 and palabras_bd.issubset(palabras_csv)):
                            for u in lista_usuarios:
                                if u.id not in ids_usados:
                                    usuario_match = u
                                    break
                        if usuario_match:
                            break
                
                
                
                if usuario_match and usuario_match.id not in ids_usados:
                    # Verificar que este nombre normalizado no esté ya en el roster
                    nombre_norm_bd = normalizar(f"{usuario_match.nombre} {usuario_match.apellido}")
                    if nombre_norm_bd in nombres_usados:
                        continue  # Saltar si ya hay alguien con nombre similar
                    
                    ids_usados.add(usuario_match.id)
                    nombres_usados.add(nombre_norm_bd)
                    matched += 1
                    nombre_completo = f"{usuario_match.nombre} {usuario_match.apellido}".strip()
                    existing = progreso_por_id.get(usuario_match.id)
                    if existing:
                        existing['estudiante'] = nombre_completo
                        existing['estudiante_id'] = usuario_match.id
                        existing['municipio'] = municipio
                        roster.append(existing)
                    else:
                        roster.append({
                            'estudiante': nombre_completo,
                            'estudiante_id': usuario_match.id,
                            'municipio': municipio,
                            'modulos': [],
                            'porcentaje_total': 0,
                            'total_modulos': 0
                        })
            
            print(f"[Roster] Estudiantes en BD: {len(usuarios)}, matcheados con CSV: {matched}")
        except Exception as e:
            logger.error(f"Error consultando roster de estudiantes: {str(e)}", exc_info=True)
            roster = resultado
        
        # Si no hay roster del CSV, usar resultado original (estudiantes con actividad)
        if not roster:
            roster = resultado
        
        # IMPORTANT: No hacer escrituras/commits dentro de este endpoint (puede causar latencia y timeouts).
        # Las correcciones manuales de nombres deben hacerse por el panel admin o scripts de mantenimiento.
        
        # Agregar usuarios específicos que no matchean por nombre
        ids_forzados = {
            462: 'Ipiales',      # KEREN YULIETH PALLÉS LÓPEZ
            3724: 'San Lorenzo', # María Edilma Hidalgo Imbajoa
            3906: 'Pasto',       # Sandra Lorena Viteri Jamondino
            2407: 'Barbacoas',   # CESAR ALEXANDER GONZALEZ QUIÑONES
            2677: 'Barbacoas',   # MAIRA ALEJANDRA SEGURA QUIÑONES
            84: 'Barbacoas',     # Jader Ivan Lemos Hinestroza
            2706: 'El Tambo',    # MONICA YAQUELINE ORTEGA CHAVEZ
            2584: 'La Cruz',     # Katherin Elizabeth Solarte Muñoz
            4765: 'San Andrés de Tumaco',  # BLANCA MERCEDES PRADOS CORTES
            1608: 'San Andrés de Tumaco'   # Piter Daniel Cundumi Obando
        }
        for uid, municipio in ids_forzados.items():
            if uid not in ids_usados:
                u = User.query.get(uid)
                if u:
                    nombre = f"{u.nombre} {u.apellido}".strip()
                    # Verificar si ya existe progreso calculado para este usuario
                    existing = progreso_por_id.get(uid)
                    if existing:
                        existing['estudiante'] = nombre
                        existing['estudiante_id'] = u.id
                        existing['municipio'] = municipio
                        roster.append(existing)
                    else:
                        roster.append({
                            'estudiante': nombre,
                            'estudiante_id': u.id,
                            'municipio': municipio,
                            'modulos': [],
                            'porcentaje_total': 0,
                            'total_modulos': 0
                        })
                    ids_usados.add(uid)

        # PASO 1: Actualizar entradas del roster que tienen módulos vacíos pero SÍ tienen progreso real
        # Esto corrige estudiantes matched por CSV o forzados que no recibieron su progreso
        actualizados = 0
        for entry in roster:
            entry_id = entry.get('estudiante_id')
            if entry_id is None:
                continue
            try:
                entry_id_int = int(entry_id)
            except Exception:
                continue
            
            # Si la entrada tiene módulos vacíos, buscar si hay progreso real
            if not entry.get('modulos') or len(entry.get('modulos', [])) == 0:
                progreso_real = progreso_por_id.get(entry_id_int)
                if progreso_real and progreso_real.get('modulos'):
                    entry['modulos'] = progreso_real['modulos']
                    entry['porcentaje_total'] = progreso_real.get('porcentaje_total', 0)
                    entry['total_modulos'] = progreso_real.get('total_modulos', 0)
                    actualizados += 1
        
        if actualizados:
            print(f"[Roster] Entradas actualizadas con progreso real: {actualizados}")
        
        # PASO 2: Incluir también estudiantes "fuera del CSV" (p.ej. usuarios de prueba) que tienen progreso real.
        # Estos antes aparecían como "Sin municipio" y se perdían al devolver solo el roster del CSV.
        try:
            extras_agregados = 0
            for item in resultado:
                sid = item.get('estudiante_id')
                if sid is None:
                    continue
                try:
                    sid_int = int(sid)
                except Exception:
                    continue

                if sid_int in ids_usados:
                    continue

                nombre_item = (item.get('estudiante') or '').strip()
                nombre_norm_item = normalizar(nombre_item) if nombre_item else ''
                if nombre_norm_item and nombre_norm_item in nombres_usados:
                    continue

                # Forzar el grupo "Sin municipio" para que sea visible en el dashboard del instructor
                item['municipio'] = 'Sin municipio'

                roster.append(item)
                ids_usados.add(sid_int)
                if nombre_norm_item:
                    nombres_usados.add(nombre_norm_item)
                extras_agregados += 1

            if extras_agregados:
                print(f"[Roster] Extras agregados (no CSV): {extras_agregados}")
        except Exception as e:
            logger.warning(f"Error agregando extras fuera del CSV: {str(e)}")
        
        print(f"[Roster] Devolviendo {len(roster)} estudiantes (de {len(nombres_csv)} en CSV)")

        return jsonify({'success': True, 'progreso_estudiantes': roster}), 200
    except Exception as e:
        logger.error(f"Error obteniendo progreso estudiantes: {str(e)}", exc_info=True)
        return jsonify({'error': 'Error al obtener progreso de estudiantes'}), 500

@instructor_bp.route('/cursos', methods=['GET'])
@cross_origin()
def get_instructor_courses():
    """Obtener cursos del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        cursos = Curso.query.filter_by(instructor_id=user.id).all()
        
        cursos_data = []
        for curso in cursos:
            # Contar estudiantes y calcular progreso
            inscripciones = Inscripcion.query.filter_by(curso_id=curso.id).all()
            total_estudiantes = len(inscripciones)
            
            progreso_promedio = 0
            
            # Contar módulos y lecciones
            modulos = Modulo.query.filter_by(curso_id=curso.id).all()
            total_modulos = len(modulos)
            
            total_lecciones = 0
            for modulo in modulos:
                lecciones = Leccion.query.filter_by(modulo_id=modulo.id).all()
                total_lecciones += len(lecciones)
            
            cursos_data.append({
                'id': curso.id,
                'titulo': curso.titulo,
                'descripcion': curso.descripcion,
                'totalEstudiantes': total_estudiantes,
                'totalModulos': total_modulos,
                'totalLecciones': total_lecciones,
                'promedioProgreso': progreso_promedio,
                'estado': curso.estado,
                'fechaCreacion': curso.fecha_creacion.isoformat(),
                'fechaActualizacion': curso.fecha_actualizacion.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': cursos_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor courses: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener cursos'
        }), 500

@instructor_bp.route('/curso/<int:curso_id>', methods=['GET'])
@cross_origin()
def get_course_detail(curso_id):
    """Obtener detalles de un curso específico del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(id=curso_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Contar estudiantes y calcular progreso
        inscripciones = Inscripcion.query.filter_by(curso_id=curso_id).all()
        total_estudiantes = len(inscripciones)
        
        progreso_promedio = 0
        
        curso_data = {
            'id': curso.id,
            'titulo': curso.titulo,
            'descripcion': curso.descripcion,
            'totalEstudiantes': total_estudiantes,
            'promedioProgreso': progreso_promedio,
            'estado': curso.estado,
            'fechaCreacion': curso.fecha_creacion.isoformat(),
            'fechaActualizacion': curso.fecha_actualizacion.isoformat(),
            'fechaApertura': curso.fecha_apertura.isoformat() if curso.fecha_apertura else None,
            'fechaCierre': curso.fecha_cierre.isoformat() if curso.fecha_cierre else None,
            'duracionHoras': curso.duracion_horas,
            'nivel': curso.nivel,
            'categoria': curso.categoria,
            'imagenUrl': curso.imagen_url,
            'maxEstudiantes': curso.max_estudiantes
        }
        
        return jsonify({
            'success': True,
            'data': curso_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting course detail: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener detalles del curso'
        }), 500

@instructor_bp.route('/curso', methods=['POST'])
@cross_origin()
def create_course():
    """Crear nuevo curso para el instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({
                'success': False,
                'error': 'El título del curso es obligatorio'
            }), 400
        
        # Validar convocatoria (1 o 2)
        if data.get('convocatoria') not in ['1', '2']:
            return jsonify({
                'success': False,
                'error': 'La convocatoria es obligatoria y debe ser 1 o 2'
            }), 400
        
        # Crear nuevo curso
        curso = Curso(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            categoria=data.get('categoria', ''),
            nivel=data.get('nivel', 'básico'),
            duracion_horas=data.get('duracion_horas', 0),
            max_estudiantes=data.get('max_estudiantes', 0),
            estado=data.get('estado', 'activo'),
            instructor_id=user.id,
            convocatoria=data.get('convocatoria')
        )
        
        db.session.add(curso)
        db.session.commit()
        
        # Registrar actividad (modelo simplificado usa 'accion' y 'detalles')
        log_actividad = LogActividad(
            usuario_id=user.id,
            accion='nuevo_curso',
            detalles=f'Creó nuevo curso: {curso.titulo}',
            fecha=datetime.utcnow()
        )
        # Nota: Si LogActividad no es un modelo mapeado, omitir el add/commit
        try:
            db.session.add(log_actividad)
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'success': True,
            'message': 'Curso creado exitosamente',
            'data': {
                'id': curso.id,
                'titulo': curso.titulo,
                'descripcion': curso.descripcion,
                'categoria': curso.categoria,
                'nivel': curso.nivel,
                'duracion_horas': curso.duracion_horas,
                'max_estudiantes': curso.max_estudiantes,
                'estado': curso.estado,
                'instructor_id': curso.instructor_id,
                'convocatoria': curso.convocatoria,
                'fecha_creacion': curso.fecha_creacion.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating course: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear curso'
        }), 500

@instructor_bp.route('/curso/<int:curso_id>/estudiantes', methods=['GET'])
@cross_origin()
def get_course_students(curso_id):
    """Obtener estudiantes de un curso específico"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(id=curso_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Obtener inscripciones con datos del estudiante
        inscripciones = db.session.query(Inscripcion, User).join(
            User, Inscripcion.estudiante_id == User.id
        ).filter(Inscripcion.curso_id == curso_id).all()
        
        estudiantes_data = []
        for inscripcion, estudiante in inscripciones:
            estudiantes_data.append({
                'id': estudiante.id,
                'nombre': f"{estudiante.nombre} {estudiante.apellido}",
                'email': estudiante.email,
                'progreso': inscripcion.progreso,
                'fechaInscripcion': inscripcion.fecha_inscripcion.isoformat(),
                'ultimaActividad': inscripcion.fecha_ultima_actividad.isoformat() if inscripcion.fecha_ultima_actividad else None
            })
        
        return jsonify({
            'success': True,
            'data': estudiantes_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting course students: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener estudiantes'
        }), 500

@instructor_bp.route('/contenido/upload', methods=['POST'])
@cross_origin()
def upload_content():
    """Subir contenido a S3"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se proporcionó archivo'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó archivo'
            }), 400
        
        # Validar tipo de archivo
        allowed_extensions = {
            'video': ['.mp4', '.webm', '.ogg', '.avi', '.mov'],
            'documento': ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt']
        }
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        tipo_contenido = request.form.get('tipo_contenido', 'documento')
        
        if file_extension not in allowed_extensions.get(tipo_contenido, []):
            return jsonify({
                'success': False,
                'error': f'Tipo de archivo no permitido para {tipo_contenido}'
            }), 400
        
        # Validar tamaño
        max_size = 500 * 1024 * 1024 if tipo_contenido == 'video' else 50 * 1024 * 1024  # 500MB o 50MB
        if len(file.read()) > max_size:
            return jsonify({
                'success': False,
                'error': f'Archivo demasiado grande. Máximo: {max_size // (1024*1024)}MB'
            }), 400
        
        file.seek(0)  # Reset file pointer
        
        # Subir a S3
        upload_result = upload_to_s3(file, folder=f'content/{tipo_contenido}')
        
        if not upload_result['success']:
            return jsonify({
                'success': False,
                'error': f'Error al subir archivo: {upload_result["error"]}'
            }), 500
        
        # Guardar en base de datos
        recurso = Recurso(
            titulo=request.form.get('titulo', file.filename),
            descripcion=request.form.get('descripcion', ''),
            tipo=tipo_contenido,
            categoria=request.form.get('categoria', ''),
            s3_key=upload_result['s3_key'],
            s3_url=upload_result['s3_url'],
            s3_bucket=upload_result['s3_bucket'],
            nombre_original=file.filename,
            extension=file_extension,
            tamano_bytes=len(file.read()),
            mime_type=file.content_type,
            curso_id=request.form.get('curso_id'),
            modulo_id=request.form.get('modulo_id'),
            subido_por=user.id,
            acceso_publico=request.form.get('acceso_publico', 'true').lower() == 'true',
            requiere_autenticacion=request.form.get('requiere_autenticacion', 'false').lower() == 'true'
        )
        
        db.session.add(recurso)
        db.session.commit()
        
        # Registrar actividad
        log_actividad = LogActividad(
            usuario_id=user.id,
            tipo='nuevo_recurso',
            descripcion=f'Subió {tipo_contenido}: {recurso.titulo}',
            fecha=datetime.utcnow()
        )
        db.session.add(log_actividad)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': recurso.to_dict(),
            'message': 'Contenido subido exitosamente'
        }), 201
        
    except Exception as e:
        logger.error(f"Error uploading content: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al subir contenido'
        }), 500

@instructor_bp.route('/modulos', methods=['GET'])
@cross_origin()
def get_instructor_modules():
    """Obtener módulos de los cursos del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Obtener IDs de cursos del instructor
        curso_ids = [curso.id for curso in Curso.query.filter_by(instructor_id=user.id).all()]
        
        if not curso_ids:
            return jsonify({
                'success': True,
                'data': []
            }), 200
        
        # Obtener módulos
        modulos = Modulo.query.filter(Modulo.curso_id.in_(curso_ids)).all()
        
        modulos_data = []
        for modulo in modulos:
            # Contar lecciones y recursos
            lecciones = Leccion.query.filter_by(modulo_id=modulo.id).all()
            recursos = Recurso.query.filter_by(modulo_id=modulo.id).all()
            
            modulos_data.append({
                'id': modulo.id,
                'curso_id': modulo.curso_id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'duracion_estimada': modulo.duracion_estimada,
                'estado': modulo.estado,
                'totalLecciones': len(lecciones),
                'totalRecursos': len(recursos),
                'fechaCreacion': modulo.fecha_creacion.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': modulos_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor modules: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener módulos'
        }), 500

@instructor_bp.route('/modulo', methods=['POST'])
@cross_origin()
def create_module():
    """Crear nuevo módulo"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        data = request.get_json()
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(
            id=data.get('curso_id'), 
            instructor_id=user.id
        ).first()
        
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Crear módulo
        modulo = Modulo(
            curso_id=data.get('curso_id'),
            titulo=data.get('titulo'),
            descripcion=data.get('descripcion', ''),
            orden=data.get('orden', 1),
            duracion_estimada=data.get('duracion_estimada', ''),
            estado=data.get('estado', 'activo')
        )
        
        db.session.add(modulo)
        db.session.commit()
        
        # Registrar actividad
        log_actividad = LogActividad(
            usuario_id=user.id,
            accion='nuevo_modulo',
            detalles=f'Creó módulo: {modulo.titulo}',
            fecha=datetime.utcnow()
        )
        try:
            db.session.add(log_actividad)
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'success': True,
            'data': {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'estado': modulo.estado
            },
            'message': 'Módulo creado exitosamente'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear módulo'
        }), 500

@instructor_bp.route('/modulo/<int:modulo_id>', methods=['PUT'])
@cross_origin()
def update_module(modulo_id):
    """Actualizar módulo"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = db.session.query(Modulo).join(Curso).filter(
            Modulo.id == modulo_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        data = request.get_json()
        
        # Actualizar campos
        if 'titulo' in data:
            modulo.titulo = data['titulo']
        if 'descripcion' in data:
            modulo.descripcion = data['descripcion']
        if 'orden' in data:
            modulo.orden = data['orden']
        if 'duracion_estimada' in data:
            modulo.duracion_estimada = data['duracion_estimada']
        if 'estado' in data:
            modulo.estado = data['estado']
        
        modulo.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'estado': modulo.estado
            },
            'message': 'Módulo actualizado exitosamente'
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar módulo'
        }), 500

@instructor_bp.route('/modulo/<int:modulo_id>', methods=['DELETE'])
@cross_origin()
def delete_module(modulo_id):
    """Eliminar módulo"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = db.session.query(Modulo).join(Curso).filter(
            Modulo.id == modulo_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        # Verificar que no tenga lecciones
        lecciones = Leccion.query.filter_by(modulo_id=modulo_id).count()
        if lecciones > 0:
            return jsonify({
                'success': False,
                'error': 'No se puede eliminar un módulo que contiene lecciones'
            }), 400
        
        db.session.delete(modulo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Módulo eliminado exitosamente'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar módulo'
        }), 500

@instructor_bp.route('/recursos', methods=['GET'])
@cross_origin()
def get_instructor_resources():
    """Obtener recursos del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        recursos = Recurso.query.filter_by(subido_por=user.id).order_by(
            Recurso.fecha_creacion.desc()
        ).all()
        
        recursos_data = []
        for recurso in recursos:
            recursos_data.append(recurso.to_dict())
        
        return jsonify({
            'success': True,
            'data': recursos_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor resources: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener recursos'
        }), 500

@instructor_bp.route('/recurso/<int:recurso_id>', methods=['DELETE'])
@cross_origin()
def delete_resource(recurso_id):
    """Eliminar recurso"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        recurso = Recurso.query.filter_by(
            id=recurso_id, 
            subido_por=user.id
        ).first()
        
        if not recurso:
            return jsonify({
                'success': False,
                'error': 'Recurso no encontrado'
            }), 404
        
        # Eliminar de S3
        try:
            s3_client = get_s3_client()
            s3_client.delete_object(
                Bucket=recurso.s3_bucket,
                Key=recurso.s3_key
            )
        except Exception as e:
            logger.warning(f"Error deleting from S3: {str(e)}")
        
        # Eliminar de base de datos
        db.session.delete(recurso)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Recurso eliminado exitosamente'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting resource: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar recurso'
        }), 500

@instructor_bp.route('/estadisticas', methods=['GET'])
@cross_origin()
def get_instructor_statistics():
    """Obtener estadísticas detalladas del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Cursos
        cursos = Curso.query.filter_by(instructor_id=user.id).all()
        total_cursos = len(cursos)
        
        # Estudiantes totales
        total_estudiantes = 0
        progreso_promedio = 0
        
        for curso in cursos:
            inscripciones = Inscripcion.query.filter_by(curso_id=curso.id).all()
            total_estudiantes += len(inscripciones)
            
            if inscripciones:
                progreso_curso = sum(inscripcion.progreso for inscripcion in inscripciones)
                progreso_promedio += progreso_curso / len(inscripciones)
        
        if total_cursos > 0:
            progreso_promedio = round(progreso_promedio / total_cursos, 1)
        
        # Recursos
        total_recursos = Recurso.query.filter_by(subido_por=user.id).count()
        
        # Módulos
        curso_ids = [curso.id for curso in cursos]
        total_modulos = 0
        if curso_ids:
            total_modulos = Modulo.query.filter(Modulo.curso_id.in_(curso_ids)).count()
        
        # Actividad reciente (últimos 7 días)
        fecha_limite = datetime.utcnow() - timedelta(days=7)
        actividad_reciente = LogActividad.query.filter(
            LogActividad.usuario_id == user.id,
            LogActividad.fecha >= fecha_limite
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'totalCursos': total_cursos,
                'totalEstudiantes': total_estudiantes,
                'progresoPromedio': progreso_promedio,
                'totalRecursos': total_recursos,
                'totalModulos': total_modulos,
                'actividadReciente': actividad_reciente
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor statistics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener estadísticas'
        }), 500

# ==================== RUTAS PARA GESTIÓN DE CONTENIDO ====================

@instructor_bp.route('/content/courses/<int:course_id>/modules', methods=['GET'])
@cross_origin()
def get_course_modules(course_id):
    """Obtener módulos de un curso del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(id=course_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Obtener módulos ordenados por orden
        modulos = Modulo.query.filter_by(curso_id=course_id).order_by(Modulo.orden).all()
        
        # Obtener información adicional para cada módulo
        module_dicts = []
        for modulo in modulos:
            module_dict = {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'estado': modulo.estado,
                'curso_id': modulo.curso_id,
                'fecha_creacion': modulo.fecha_creacion.isoformat(),
                'fecha_actualizacion': modulo.fecha_actualizacion.isoformat()
            }
            
            # Obtener total de lecciones
            total_lecciones = Leccion.query.filter_by(modulo_id=modulo.id).count()
            module_dict['total_lecciones'] = total_lecciones
            
            module_dicts.append(module_dict)
        
        return jsonify({
            'success': True,
            'modules': module_dicts
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting course modules: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener módulos'
        }), 500

@instructor_bp.route('/content/courses/<int:course_id>/modules', methods=['POST'])
@cross_origin()
def create_content_module(course_id):
    """Crear nuevo módulo en un curso del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(id=course_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({
                'success': False,
                'error': 'El título del módulo es obligatorio'
            }), 400
        
        # Obtener el siguiente orden
        ultimo_modulo = Modulo.query.filter_by(curso_id=course_id).order_by(Modulo.orden.desc()).first()
        siguiente_orden = (ultimo_modulo.orden + 1) if ultimo_modulo else 1
        
        # Crear nuevo módulo
        modulo = Modulo(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            curso_id=course_id,
            orden=siguiente_orden,
            estado=data.get('estado', 'activo')
        )
        
        db.session.add(modulo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Módulo creado exitosamente',
            'module': {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'estado': modulo.estado,
                'curso_id': modulo.curso_id,
                'total_lecciones': 0
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear módulo'
        }), 500

@instructor_bp.route('/content/modules/<int:module_id>', methods=['PUT'])
@cross_origin()
def update_content_module(module_id):
    """Actualizar módulo del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = Modulo.query.join(Curso).filter(
            Modulo.id == module_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        data = request.json
        
        # Actualizar campos
        if 'titulo' in data:
            modulo.titulo = data['titulo']
        if 'descripcion' in data:
            modulo.descripcion = data['descripcion']
        if 'estado' in data:
            modulo.estado = data['estado']
        
        modulo.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Módulo actualizado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar módulo'
        }), 500

@instructor_bp.route('/content/modules/<int:module_id>', methods=['DELETE'])
@cross_origin()
def delete_content_module(module_id):
    """Eliminar módulo del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = Modulo.query.join(Curso).filter(
            Modulo.id == module_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        # Eliminar lecciones asociadas
        Leccion.query.filter_by(modulo_id=module_id).delete()
        
        # Eliminar módulo
        db.session.delete(modulo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Módulo eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar módulo'
        }), 500

@instructor_bp.route('/content/modules/<int:module_id>/lessons', methods=['GET'])
@cross_origin()
def get_module_lessons(module_id):
    """Obtener lecciones de un módulo del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = Modulo.query.join(Curso).filter(
            Modulo.id == module_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        # Obtener lecciones ordenadas por orden
        lecciones = Leccion.query.filter_by(modulo_id=module_id).order_by(Leccion.orden).all()
        
        lesson_dicts = []
        for leccion in lecciones:
            lesson_dict = {
                'id': leccion.id,
                'titulo': leccion.titulo,
                'descripcion': leccion.descripcion,
                'contenido': leccion.contenido,
                'tipo': leccion.tipo,
                'duracion_minutos': leccion.duracion_minutos,
                'url_video': leccion.url_video,
                'archivo_url': leccion.archivo_url,
                'orden': leccion.orden,
                'estado': leccion.estado,
                'modulo_id': leccion.modulo_id,
                'fecha_creacion': leccion.fecha_creacion.isoformat(),
                'fecha_actualizacion': leccion.fecha_actualizacion.isoformat()
            }
            lesson_dicts.append(lesson_dict)
        
        return jsonify({
            'success': True,
            'lessons': lesson_dicts
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting module lessons: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener lecciones'
        }), 500

@instructor_bp.route('/content/modules/<int:module_id>/lessons', methods=['POST'])
@cross_origin()
def create_module_lesson(module_id):
    """Crear nueva lección en un módulo del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = Modulo.query.join(Curso).filter(
            Modulo.id == module_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({
                'success': False,
                'error': 'El título de la lección es obligatorio'
            }), 400
        
        # Obtener el siguiente orden
        ultima_leccion = Leccion.query.filter_by(modulo_id=module_id).order_by(Leccion.orden.desc()).first()
        siguiente_orden = (ultima_leccion.orden + 1) if ultima_leccion else 1
        
        # Crear nueva lección
        leccion = Leccion(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            contenido=data.get('contenido', ''),
            tipo=data.get('tipo', 'texto'),
            duracion_minutos=data.get('duracion_minutos', 0),
            url_video=data.get('url_video', ''),
            archivo_url=data.get('archivo_url', ''),
            modulo_id=module_id,
            orden=siguiente_orden,
            estado=data.get('estado', 'activo')
        )
        
        db.session.add(leccion)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lección creada exitosamente',
            'lesson': {
                'id': leccion.id,
                'titulo': leccion.titulo,
                'descripcion': leccion.descripcion,
                'contenido': leccion.contenido,
                'tipo': leccion.tipo,
                'duracion_minutos': leccion.duracion_minutos,
                'url_video': leccion.url_video,
                'archivo_url': leccion.archivo_url,
                'orden': leccion.orden,
                'estado': leccion.estado,
                'modulo_id': leccion.modulo_id,
                'fecha_creacion': leccion.fecha_creacion.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating lesson: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear lección'
        }), 500

@instructor_bp.route('/content/lessons/<int:lesson_id>', methods=['PUT'])
@cross_origin()
def update_content_lesson(lesson_id):
    """Actualizar lección del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que la lección pertenece a un módulo de un curso del instructor
        leccion = Leccion.query.join(Modulo).join(Curso).filter(
            Leccion.id == lesson_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not leccion:
            return jsonify({
                'success': False,
                'error': 'Lección no encontrada'
            }), 404
        
        data = request.json
        
        # Actualizar campos
        if 'titulo' in data:
            leccion.titulo = data['titulo']
        if 'descripcion' in data:
            leccion.descripcion = data['descripcion']
        if 'contenido' in data:
            leccion.contenido = data['contenido']
        if 'tipo' in data:
            leccion.tipo = data['tipo']
        if 'duracion_minutos' in data:
            leccion.duracion_minutos = data['duracion_minutos']
        if 'url_video' in data:
            leccion.url_video = data['url_video']
        if 'archivo_url' in data:
            leccion.archivo_url = data['archivo_url']
        if 'estado' in data:
            leccion.estado = data['estado']
        
        leccion.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lección actualizada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating lesson: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar lección'
        }), 500

@instructor_bp.route('/content/lessons/<int:lesson_id>', methods=['DELETE'])
@cross_origin()
def delete_content_lesson(lesson_id):
    """Eliminar lección del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que la lección pertenece a un módulo de un curso del instructor
        leccion = Leccion.query.join(Modulo).join(Curso).filter(
            Leccion.id == lesson_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not leccion:
            return jsonify({
                'success': False,
                'error': 'Lección no encontrada'
            }), 404
        
        # Eliminar lección
        db.session.delete(leccion)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lección eliminada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting lesson: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar lección'
        }), 500 

@instructor_bp.route('/curso/<int:curso_id>', methods=['DELETE'])
@cross_origin()
def delete_course(curso_id):
    """Eliminar curso del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Buscar curso del instructor
        curso = Curso.query.filter_by(id=curso_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Verificar inscripciones (no eliminar si hay estudiantes inscritos)
        from src.models import Inscripcion
        inscripciones_count = Inscripcion.query.filter_by(curso_id=curso.id).count()
        if inscripciones_count > 0:
            return jsonify({
                'success': False,
                'error': 'No se puede eliminar un curso que tiene estudiantes inscritos'
            }), 400
        
        db.session.delete(curso)
        db.session.commit()
        
        # Registrar actividad
        try:
            log_actividad = LogActividad(
                usuario_id=user.id,
                accion='eliminar_curso',
                detalles=f'Eliminó el curso: {curso.titulo}',
                fecha=datetime.utcnow()
            )
            db.session.add(log_actividad)
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'success': True,
            'message': 'Curso eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting course: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar curso'
        }), 500


def asegurar_tabla_asistencia_jornada():
    """Crear la tabla asistencia_jornada si no existe"""
    from sqlalchemy import text, inspect
    
    try:
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if 'asistencia_jornada' not in existing_tables:
            logger.info("Creando tabla asistencia_jornada...")
            
            # PostgreSQL: usar IF NOT EXISTS por resiliencia (evita depender de inspector)
            create_table_sql = text("""
                CREATE TABLE IF NOT EXISTS asistencia_jornada (
                    id SERIAL PRIMARY KEY,
                    estudiante_id INTEGER NOT NULL,
                    jornada_numero INTEGER NOT NULL CHECK (jornada_numero >= 1 AND jornada_numero <= 10),
                    marcada BOOLEAN NOT NULL DEFAULT FALSE,
                    fecha_marcado TIMESTAMP NULL,
                    instructor_id INTEGER NULL,
                    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_estudiante FOREIGN KEY (estudiante_id) REFERENCES "user"(id) ON DELETE CASCADE,
                    CONSTRAINT fk_instructor FOREIGN KEY (instructor_id) REFERENCES "user"(id) ON DELETE SET NULL,
                    CONSTRAINT _estudiante_jornada_uc UNIQUE (estudiante_id, jornada_numero)
                )
            """)
            
            db.session.execute(create_table_sql)
            
            # Crear índices
            index1_sql = text("CREATE INDEX IF NOT EXISTS idx_asistencia_jornada_estudiante ON asistencia_jornada(estudiante_id)")
            index2_sql = text("CREATE INDEX IF NOT EXISTS idx_asistencia_jornada_jornada ON asistencia_jornada(jornada_numero)")
            
            db.session.execute(index1_sql)
            db.session.execute(index2_sql)
            
            db.session.commit()
            logger.info("Tabla asistencia_jornada creada exitosamente")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creando tabla asistencia_jornada: {str(e)}", exc_info=True)
        # No lanzar excepción, solo loguear el error

def asegurar_tabla_puntos_plan_negocio():
    """Asegurar que la tabla puntos_plan_negocio existe, crearla si no existe"""
    try:
        from sqlalchemy import text
        from sqlalchemy import inspect
        
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        if 'puntos_plan_negocio' not in existing_tables:
            logger.info("Creando tabla puntos_plan_negocio...")
            
            create_table_sql = text("""
                CREATE TABLE puntos_plan_negocio (
                    id SERIAL PRIMARY KEY,
                    usuario_id INTEGER NOT NULL,
                    modulo_nombre VARCHAR(200) NOT NULL,
                    etapa VARCHAR(50) NOT NULL,
                    estrategia VARCHAR(200) NOT NULL,
                    puntos INTEGER NOT NULL,
                    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES "user"(id) ON DELETE CASCADE
                )
            """)
            
            db.session.execute(create_table_sql)
            
            # Crear índices
            index1_sql = text("CREATE INDEX idx_puntos_plan_negocio_usuario ON puntos_plan_negocio(usuario_id)")
            index2_sql = text("CREATE INDEX idx_puntos_plan_negocio_modulo ON puntos_plan_negocio(modulo_nombre)")
            
            db.session.execute(index1_sql)
            db.session.execute(index2_sql)
            
            db.session.commit()
            logger.info("Tabla puntos_plan_negocio creada exitosamente")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creando tabla puntos_plan_negocio: {str(e)}", exc_info=True)
        # No lanzar excepción, solo loguear el error


def asegurar_tabla_balance_jornada_tutor():
    """Asegurar que la tabla balance_jornada_tutor existe, crearla si no existe."""
    from sqlalchemy import text, inspect

    try:
        inspector = inspect(db.engine)
        existing_tables = inspector.get_table_names()

        if 'balance_jornada_tutor' not in existing_tables:
            logger.info("Creando tabla balance_jornada_tutor...")

            create_table_sql = text("""
                CREATE TABLE IF NOT EXISTS balance_jornada_tutor (
                    id SERIAL PRIMARY KEY,
                    instructor_id INTEGER NOT NULL,
                    fecha DATE NOT NULL,
                    nodo_territorial VARCHAR(120) NOT NULL,
                    municipios TEXT NULL,
                    modulos_desarrollados TEXT NULL,
                    nombre_tutor VARCHAR(200) NULL,
                    participantes_programados INTEGER NULL,
                    participantes_asistentes INTEGER NULL,
                    actividades TEXT NULL,
                    metodologia TEXT NULL,
                    mayores_dificultades TEXT NULL,
                    novedades_operativas TEXT NULL,
                    recomendaciones_mejora TEXT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT fk_balance_instructor FOREIGN KEY (instructor_id) REFERENCES "user"(id) ON DELETE CASCADE,
                    CONSTRAINT uq_balance_instructor_fecha_nodo UNIQUE (instructor_id, fecha, nodo_territorial)
                )
            """)

            db.session.execute(create_table_sql)
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_balance_jornada_instructor ON balance_jornada_tutor(instructor_id)"))
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_balance_jornada_fecha ON balance_jornada_tutor(fecha)"))
            db.session.execute(text("CREATE INDEX IF NOT EXISTS idx_balance_jornada_nodo ON balance_jornada_tutor(nodo_territorial)"))
            db.session.commit()
            logger.info("Tabla balance_jornada_tutor creada exitosamente")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creando tabla balance_jornada_tutor: {str(e)}", exc_info=True)


@instructor_bp.route('/balance-jornada', methods=['GET'])
@token_required
@instructor_required
def get_balance_jornada_tutor(current_user):
    """Obtener balance de jornada (por nodo y fecha) del instructor actual."""
    try:
        asegurar_tabla_balance_jornada_tutor()

        nodo = (request.args.get('nodo') or '').strip()
        fecha_str = (request.args.get('fecha') or '').strip()

        if not nodo or not fecha_str:
            return jsonify({'success': False, 'error': 'Parámetros requeridos: nodo, fecha'}), 400

        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except Exception:
            return jsonify({'success': False, 'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400

        item = BalanceJornadaTutor.query.filter_by(
            instructor_id=current_user.id,
            nodo_territorial=nodo,
            fecha=fecha
        ).first()

        return jsonify({
            'success': True,
            'data': item.to_dict() if item else None
        }), 200
    except Exception as e:
        logger.error(f"Error obteniendo balance de jornada: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@instructor_bp.route('/balance-jornada', methods=['POST'])
@token_required
@instructor_required
def upsert_balance_jornada_tutor(current_user):
    """Crear/actualizar balance de jornada (por nodo y fecha) del instructor actual."""
    try:
        asegurar_tabla_balance_jornada_tutor()

        def _to_int(value):
            try:
                if value is None or value == '':
                    return None
                return int(value)
            except Exception:
                return None

        data = request.get_json() or {}
        nodo = (data.get('nodo_territorial') or '').strip()
        fecha_str = (data.get('fecha') or '').strip()

        if not nodo or not fecha_str:
            return jsonify({'success': False, 'error': 'Campos requeridos: nodo_territorial, fecha'}), 400

        try:
            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except Exception:
            return jsonify({'success': False, 'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400

        municipios = data.get('municipios', [])
        try:
            municipios_json = json.dumps(municipios if isinstance(municipios, list) else [])
        except Exception:
            municipios_json = '[]'

        item = BalanceJornadaTutor.query.filter_by(
            instructor_id=current_user.id,
            nodo_territorial=nodo,
            fecha=fecha
        ).first()

        if not item:
            item = BalanceJornadaTutor(
                instructor_id=current_user.id,
                nodo_territorial=nodo,
                fecha=fecha
            )
            db.session.add(item)

        item.municipios = municipios_json
        item.modulos_desarrollados = data.get('modulos_desarrollados', '')
        item.nombre_tutor = data.get('nombre_tutor', '')
        item.participantes_programados = _to_int(data.get('participantes_programados'))
        item.participantes_asistentes = _to_int(data.get('participantes_asistentes'))
        item.actividades = data.get('actividades', '')
        item.metodologia = data.get('metodologia', '')
        item.mayores_dificultades = data.get('mayores_dificultades', '')
        item.novedades_operativas = data.get('novedades_operativas', '')
        item.recomendaciones_mejora = data.get('recomendaciones_mejora', '')
        item.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'success': True,
            'data': item.to_dict(),
            'message': 'Balance de jornada guardado'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error guardando balance de jornada: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500

def buscar_estudiante_por_nombre(nombre_completo):
    """Buscar estudiante por nombre completo, con manejo flexible de espacios"""
    from sqlalchemy import func as db_func
    
    # Normalizar el nombre: eliminar espacios extra
    nombre_normalizado = ' '.join(nombre_completo.split())
    
    # Buscar primero con el nombre completo exacto
    partes = nombre_normalizado.split(' ', 1)
    if len(partes) == 2:
        nombre, apellido = partes
        estudiante = User.query.filter(
            User.nombre == nombre.strip(),
            User.apellido == apellido.strip(),
            User.rol.notin_(['admin', 'instructor'])
        ).first()
        
        if estudiante:
            return estudiante
        
        # Si no se encuentra exacto, buscar por nombre completo concatenado (insensible a mayúsculas)
        nombre_completo_lower = nombre_normalizado.lower()
        estudiantes = User.query.filter(
            User.rol.notin_(['admin', 'instructor']),
            db_func.lower(db_func.concat(User.nombre, ' ', User.apellido)) == nombre_completo_lower
        ).all()
        
        if estudiantes:
            return estudiantes[0]
    
    # Buscar solo por nombre si no tiene apellido separado
    if len(partes) == 1:
        estudiante = User.query.filter(
            User.nombre == partes[0].strip(),
            User.rol.notin_(['admin', 'instructor'])
        ).first()
        if estudiante:
            return estudiante
    
    # Última opción: buscar por coincidencia parcial
    nombre_buscar = f"%{nombre_normalizado}%"
    estudiante = User.query.filter(
        User.rol.notin_(['admin', 'instructor']),
        db_func.lower(db_func.concat(User.nombre, ' ', User.apellido)).like(nombre_buscar.lower())
    ).first()
    
    return estudiante


@instructor_bp.route('/jornadas/<estudiante_id_o_nombre>', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin()
@token_required
@instructor_required
def manejar_jornadas_estudiante(current_user, estudiante_id_o_nombre):
    """Obtener o guardar jornadas marcadas de un estudiante (por ID o nombre)"""
    # Para OPTIONS (preflight CORS), retornar inmediatamente
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    
    try:
        # Asegurar que la tabla existe
        asegurar_tabla_asistencia_jornada()
        
        # Buscar el estudiante - primero intentar por ID, luego por nombre
        estudiante = None
        if estudiante_id_o_nombre.isdigit():
            estudiante = User.query.filter(
                User.id == int(estudiante_id_o_nombre),
                User.rol.notin_(['admin', 'instructor'])
            ).first()
        if not estudiante:
            estudiante = buscar_estudiante_por_nombre(estudiante_id_o_nombre)
        
        if not estudiante:
            return jsonify({'success': False, 'error': 'Estudiante no encontrado'}), 404
        
        # GET: Obtener jornadas
        if request.method == 'GET':
            try:
                jornadas = AsistenciaJornada.query.filter_by(estudiante_id=estudiante.id).all()
            except Exception as e:
                logger.error(f"Error consultando asistencia_jornada (GET jornadas) estudiante_id={estudiante.id}: {str(e)}", exc_info=True)
                return jsonify({'success': True, 'jornadas': {}}), 200
            jornadas_dict = {}
            for jornada in jornadas:
                if jornada.marcada:
                    jornadas_dict[jornada.jornada_numero] = True
            
            return jsonify({
                'success': True,
                'jornadas': jornadas_dict
            }), 200
        
        # POST: Guardar jornadas
        elif request.method == 'POST':
            from datetime import datetime
            try:
                from zoneinfo import ZoneInfo
                def get_colombia_time():
                    return datetime.now(ZoneInfo('America/Bogota'))
            except ImportError:
                try:
                    import pytz
                    def get_colombia_time():
                        tz_colombia = pytz.timezone('America/Bogota')
                        return datetime.now(tz_colombia)
                except ImportError:
                    from datetime import timedelta, timezone
                    def get_colombia_time():
                        tz_colombia = timezone(timedelta(hours=-5))
                        return datetime.now(tz_colombia)
            
            data = request.get_json()
            jornadas_marcadas = data.get('jornadas', {})  # {1: true, 2: false, ...}
            
            # Procesar cada jornada (1-10)
            for jornada_num in range(1, 11):
                marcada = jornadas_marcadas.get(str(jornada_num), False) or jornadas_marcadas.get(jornada_num, False)
                
                # Buscar si ya existe
                jornada = AsistenciaJornada.query.filter_by(
                    estudiante_id=estudiante.id,
                    jornada_numero=jornada_num
                ).first()
                
                if jornada:
                    jornada.marcada = marcada
                    jornada.fecha_marcado = get_colombia_time() if marcada else None
                    jornada.instructor_id = current_user.id
                else:
                    jornada = AsistenciaJornada(
                        estudiante_id=estudiante.id,
                        jornada_numero=jornada_num,
                        marcada=marcada,
                        fecha_marcado=get_colombia_time() if marcada else None,
                        instructor_id=current_user.id
                    )
                    db.session.add(jornada)
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Jornadas guardadas exitosamente'
            }), 200
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error en jornadas: {str(e)}", exc_info=True)
        return jsonify({'success': True, 'jornadas': {}}), 200


@instructor_bp.route('/debug/student-progress/<int:student_id>', methods=['GET'])
@token_required
@instructor_required
def debug_student_progress(current_user, student_id):
    """Debug endpoint para consultar progreso de un estudiante específico"""
    try:
        from ..models import IntentosEvaluacion, PuntosPlanNegocio, RespuestasPlanNegocio
        
        # Obtener datos del estudiante
        estudiante = User.query.filter_by(id=student_id).first()
        if not estudiante:
            return jsonify({'success': False, 'error': 'Estudiante no encontrado'}), 404
        
        # Obtener LogActividad
        actividades = LogActividad.query.filter_by(usuario_id=student_id).order_by(LogActividad.fecha.desc()).limit(50).all()
        actividades_data = [{
            'id': a.id,
            'accion': a.accion,
            'detalles': a.detalles,
            'fecha': a.fecha.isoformat() if a.fecha else None
        } for a in actividades]
        
        # Obtener intentos de evaluación
        try:
            intentos = IntentosEvaluacion.query.filter_by(estudiante_id=student_id).all()
            intentos_data = [{
                'id': i.id,
                'modulo': i.modulo,
                'unidad': i.unidad,
                'puntaje': i.puntaje,
                'fecha': i.fecha.isoformat() if i.fecha else None
            } for i in intentos]
        except Exception as e:
            intentos_data = {'error': str(e)}
        
        # Obtener puntos de plan de negocio
        try:
            puntos = PuntosPlanNegocio.query.filter_by(estudiante_id=student_id).all()
            puntos_data = [{
                'id': p.id,
                'modulo': p.modulo,
                'puntos': p.puntos,
                'fecha': p.fecha.isoformat() if hasattr(p, 'fecha') and p.fecha else None
            } for p in puntos]
        except Exception as e:
            puntos_data = {'error': str(e)}
        
        # Obtener UsuarioCurso
        try:
            from ..models import UsuarioCurso
            cursos = UsuarioCurso.query.filter_by(usuario_id=student_id).all()
            cursos_data = [{
                'curso_id': c.curso_id,
                'progreso': c.progreso,
                'fecha_inscripcion': c.fecha_inscripcion.isoformat() if hasattr(c, 'fecha_inscripcion') and c.fecha_inscripcion else None
            } for c in cursos]
        except Exception as e:
            cursos_data = {'error': str(e)}
        
        return jsonify({
            'success': True,
            'estudiante': {
                'id': estudiante.id,
                'nombre': estudiante.nombre,
                'apellido': estudiante.apellido,
                'municipio': estudiante.municipio if hasattr(estudiante, 'municipio') else None
            },
            'actividades': actividades_data,
            'intentos_evaluacion': intentos_data,
            'puntos_plan_negocio': puntos_data,
            'cursos': cursos_data
        }), 200
    except Exception as e:
        logger.error(f"Error en debug student progress: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500