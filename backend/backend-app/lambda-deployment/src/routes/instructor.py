from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
import boto3
import os
import uuid
from datetime import datetime, timedelta
import json
from sqlalchemy import text, inspect
from ..models import db, User, Curso, Modulo, Leccion, Recurso, Inscripcion, LogActividad, AsistenciaJornada
from ..services.auth_service import token_required, instructor_required, admin_or_instructor_required
from ..services.student_municipio_service import get_preferred_municipio
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

instructor_bp = Blueprint('instructor', __name__)


def _build_full_jornadas_dict():
    return {str(jornada_num): True for jornada_num in range(1, 11)}


def _autocompletar_jornadas_estudiantes_completos(resultado, instructor_id=None):
    estudiantes_completos = []
    for entry in resultado or []:
        estudiante_id = entry.get('estudiante_id')
        porcentaje_total = entry.get('porcentaje_total') or 0
        if estudiante_id is None:
            continue
        try:
            if float(porcentaje_total) >= 100:
                estudiantes_completos.append(int(estudiante_id))
        except (TypeError, ValueError):
            continue

    if not estudiantes_completos:
        return

    asegurar_tabla_asistencia_jornada()

    registros = AsistenciaJornada.query.filter(
        AsistenciaJornada.estudiante_id.in_(estudiantes_completos)
    ).all()

    registros_por_estudiante = {}
    for registro in registros:
        registros_por_estudiante.setdefault(int(registro.estudiante_id), {})[int(registro.jornada_numero)] = registro

    now = datetime.utcnow()
    modified = False

    for estudiante_id in estudiantes_completos:
        jornadas_estudiante = registros_por_estudiante.setdefault(estudiante_id, {})
        for jornada_num in range(1, 11):
            registro = jornadas_estudiante.get(jornada_num)
            if registro:
                if not registro.marcada:
                    registro.marcada = True
                    registro.fecha_marcado = registro.fecha_marcado or now
                    if instructor_id is not None:
                        registro.instructor_id = instructor_id
                    modified = True
            else:
                db.session.add(AsistenciaJornada(
                    estudiante_id=estudiante_id,
                    jornada_numero=jornada_num,
                    marcada=True,
                    fecha_marcado=now,
                    instructor_id=instructor_id
                ))
                modified = True

    if modified:
        db.session.commit()

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

@instructor_bp.route('/actividad-reciente', methods=['GET'])
@token_required
@admin_or_instructor_required
def get_actividad_reciente(current_user):
    """Obtener actividad reciente de los estudiantes"""
    try:
        # Obtener los últimos 20 registros de actividad
        actividades = LogActividad.query.filter(
            LogActividad.accion.like('Completó:%')
        ).order_by(
            LogActividad.fecha.desc()
        ).limit(20).all()
        
        actividades_data = [actividad.to_dict() for actividad in actividades]
        
        return jsonify({
            'success': True,
            'actividades': actividades_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo actividad reciente: {str(e)}")
        return jsonify({'error': 'Error al obtener actividad reciente'}), 500

@instructor_bp.route('/progreso-estudiantes', methods=['GET'])
@token_required
@admin_or_instructor_required
def get_progreso_estudiantes(current_user):
    """Obtener progreso de estudiantes por módulo - Versión simplificada que funciona con todos los módulos"""
    try:
        from collections import defaultdict
        import re
        from sqlalchemy import func

        # Alias puntual para unificar estudiantes duplicados (Edwin 273->1465, Cristian 1124->2586)
        _ALIAS_MAP = {273: 1465, 1124: 2586}
        def _alias_id(uid: int) -> int:
            try:
                return _ALIAS_MAP.get(int(uid), int(uid))
            except Exception:
                return uid

        # Solo el padrón del CSV oficial (municipios.csv); si no hay archivo, no se filtra.
        from ..services.student_municipio_service import get_tutor_csv_estudiante_ids
        _csv_ids_raw = get_tutor_csv_estudiante_ids()
        _csv_filter_on = len(_csv_ids_raw) > 0
        _allowed_csv = frozenset(_alias_id(int(i)) for i in _csv_ids_raw) if _csv_filter_on else None

        def _in_tutor_csv(eid: int) -> bool:
            if _allowed_csv is None:
                return True
            try:
                return int(eid) in _allowed_csv
            except (TypeError, ValueError):
                return False

        # ID -> Nombre completo
        # Se usa en varios pasos; declarar antes para evitar NameError.
        estudiante_nombres = {}

        # Precargar metadata de usuarios para evitar N+1 (User.query.get en loops).
        user_rows = db.session.query(User.id, User.nombre, User.apellido, User.rol, User.municipio).all()
        user_meta = {
            uid: {'nombre': n or '', 'apellido': a or '', 'rol': r or '', 'municipio': (mun or '').strip()}
            for uid, n, a, r, mun in user_rows
        }
        def _is_student(uid: int) -> bool:
            m = user_meta.get(uid)
            # Para el dashboard del tutor, la fuente de verdad es el padrón CSV.
            # En la BD existen cuentas históricas con rol "usuario" que igual
            # pertenecen al listado oficial y deben verse aquí.
            return bool(m) and m.get('rol') in ('estudiante', 'usuario')
        def _full_name(uid: int) -> str:
            m = user_meta.get(uid) or {}
            return f"{(m.get('nombre') or '').strip()} {(m.get('apellido') or '').strip()}".strip()
        
        # Obtener todos los intentos de evaluación
        from ..models import IntentosEvaluacion, PuntosPlanNegocio
        intentos_evaluacion = db.session.query(
            IntentosEvaluacion.usuario_id,
            IntentosEvaluacion.modulo_nombre,
            IntentosEvaluacion.paso_nombre
        ).all()
        
        # Obtener puntos del plan de negocio por estudiante_id y módulo
        # Normalizar nombres largos del frontend/BD al nombre canónico usado en la UI (evita 0 puntos en informe)
        mapeo_modulo_plan_negocio = {
            'Finanzas y Gestión Empresarial': 'Finanzas',
            'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente',
        }
        puntos_por_estudiante_id_modulo = defaultdict(lambda: defaultdict(int))
        fechas_plan_negocio_por_id = defaultdict(lambda: defaultdict(lambda: None))
        try:
            # Asegurar que la tabla existe
            asegurar_tabla_puntos_plan_negocio()
            
            # Agrupar en SQL por (usuario_id, modulo_nombre) para evitar iteración fila-a-fila
            rows = db.session.query(
                User.id,
                User.nombre,
                User.apellido,
                PuntosPlanNegocio.modulo_nombre,
                func.coalesce(func.sum(PuntosPlanNegocio.puntos), 0).label('puntos_sum'),
                func.max(PuntosPlanNegocio.fecha_registro).label('fecha_max')
            ).join(
                User, User.id == PuntosPlanNegocio.usuario_id
            ).filter(
                User.rol.in_(['estudiante', 'usuario'])
            ).group_by(
                User.id, User.nombre, User.apellido, PuntosPlanNegocio.modulo_nombre
            ).all()

            for uid, nombre_u, apellido_u, mod_raw, puntos_sum, fecha_max in rows:
                estudiante_nombres[uid] = f"{nombre_u} {apellido_u}".strip()
                mod_nombre = (mod_raw or '').strip()
                mod_canonico = mapeo_modulo_plan_negocio.get(mod_nombre, mod_nombre)
                puntos_por_estudiante_id_modulo[uid][mod_canonico] += int(puntos_sum or 0)
                if fecha_max:
                    fecha_actual = fechas_plan_negocio_por_id[uid][mod_canonico]
                    if fecha_actual is None or fecha_max > fecha_actual:
                        fechas_plan_negocio_por_id[uid][mod_canonico] = fecha_max
        except Exception as e:
            # Si la tabla no existe o hay algún error, simplemente continuar sin puntos
            logger.warning(f"Error obteniendo puntos del plan de negocio: {str(e)}")
            pass
        
        # Agrupar intentos por estudiante_id, módulo y unidad
        intentos_por_estudiante = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
        modulos_por_estudiante = defaultdict(set)  # Para saber qué módulos tiene cada estudiante (ID -> set)
        
        for usuario_id, modulo_nombre, paso_nombre in intentos_evaluacion:
            if not usuario_id or not _is_student(int(usuario_id)):
                continue

            estudiante_id = _alias_id(int(usuario_id))
            if not _in_tutor_csv(estudiante_id):
                continue
            estudiante_nombres[estudiante_id] = _full_name(estudiante_id)
            modulo_normalizado = (modulo_nombre or '').strip()
            paso_normalizado = (paso_nombre or '').strip()
            
            # Extraer el número de unidad del paso
            match = re.search(r'Unidad\s+(\d+)', paso_normalizado, re.IGNORECASE)
            if match:
                numero_unidad = match.group(1)
                unidad_key = f"Unidad {numero_unidad}"
                intentos_por_estudiante[estudiante_id][modulo_normalizado][unidad_key] += 1
                modulos_por_estudiante[estudiante_id].add(modulo_normalizado)
        
        # Obtener todas las actividades de completado
        actividades = db.session.query(
            LogActividad.usuario_id,
            LogActividad.accion,
            LogActividad.detalles,
            LogActividad.fecha
        ).filter(
            LogActividad.accion.like('Completó:%')
        ).all()
        
        # Agrupar actividades por estudiante_id, módulo y paso
        progreso_estudiantes_data = defaultdict(lambda: defaultdict(list))
        
        for usuario_id, accion, detalles, fecha in actividades:
            if not usuario_id or not _is_student(int(usuario_id)):
                continue

            estudiante_id = _alias_id(int(usuario_id))
            if not _in_tutor_csv(estudiante_id):
                continue
            estudiante_nombres[estudiante_id] = _full_name(estudiante_id)
            paso = (accion or '').replace('Completó: ', '')
            fecha_actividad = fecha.isoformat() if fecha else None
            
            # Buscar el módulo en los detalles o en el paso
            modulo = None
            detalles = detalles or ''
            
            # Lista de módulos posibles (case insensitive) con variantes
            modulos_posibles = [
                'Marketing Digital', 'Marketing y Comercialización', 'Proyecto de vida', 
                'Trabajo en Equipo', 'Descubrimiento de Oportunidades', 'Modelo de Negocios', 
                'Atención al Cliente', 'Finanzas', 'Liderazgo', 'Plan de Inversión',
                'Finanzas y Gestión Empresarial', 'Atención al Cliente y Resolución de Conflictos'
            ]
            
            # Mapeo de normalización
            mapeo_normalizacion = {
                'Finanzas y Gestión Empresarial': 'Finanzas',
                'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente'
            }
            
            # Buscar módulo en detalles o paso
            texto_buscar = (detalles + ' ' + paso).lower()
            modulo_encontrado = None
            for mod in modulos_posibles:
                if mod.lower() in texto_buscar:
                    modulo_encontrado = mod
                    break
            
            if modulo_encontrado:
                modulo = mapeo_normalizacion.get(modulo_encontrado, modulo_encontrado)
            
            if not modulo:
                continue
            
            modulos_por_estudiante[estudiante_id].add(modulo)
            
            # Agregar el paso al progreso (evitar duplicados)
            paso_existente = False
            for paso_exist in progreso_estudiantes_data[estudiante_id][modulo]:
                if paso_exist['paso'] == paso:
                    paso_existente = True
                    break
            
            if not paso_existente:
                progreso_estudiantes_data[estudiante_id][modulo].append({
                    'paso': paso,
                    'fecha': fecha_actividad,
                    'detalles': detalles
                })
        
        # Calcular progreso agrupado por estudiante_id
        resultado_por_estudiante = defaultdict(lambda: {
            'estudiante': '',
            'estudiante_id': None,
            'modulos': [],
            'porcentaje_total': 0,
            'total_modulos': 0
        })
        
        # Procesar todos los estudiantes que tienen intentos, progreso o puntos de plan de negocio
        # Aplicar alias para evitar que aparezca el duplicado 273 y consolidar en 1465.
        todos_estudiante_ids_raw = set(
            list(modulos_por_estudiante.keys()) + list(progreso_estudiantes_data.keys()) + list(puntos_por_estudiante_id_modulo.keys())
        )
        todos_estudiante_ids = set(_alias_id(eid) for eid in todos_estudiante_ids_raw)

        # Incluir estudiantes del padrón CSV aunque no tengan intentos, logs ni plan de negocio
        for uid, meta in user_meta.items():
            if meta.get('rol') not in ('estudiante', 'usuario'):
                continue
            eid = _alias_id(int(uid))
            if not _in_tutor_csv(eid):
                continue
            todos_estudiante_ids.add(eid)
            if not estudiante_nombres.get(eid):
                estudiante_nombres[eid] = _full_name(eid) or f'Estudiante {eid}'

        if _allowed_csv is not None:
            todos_estudiante_ids = {eid for eid in todos_estudiante_ids if _in_tutor_csv(eid)}

        for eid in todos_estudiante_ids:
            resultado_por_estudiante[eid]['estudiante'] = estudiante_nombres.get(eid, f"Estudiante {eid}")
            resultado_por_estudiante[eid]['estudiante_id'] = eid
            mun_db = (user_meta.get(eid) or {}).get('municipio')
            preferred_municipio = get_preferred_municipio(
                eid,
                resultado_por_estudiante[eid]['estudiante'],
                mun_db
            )
            if preferred_municipio:
                resultado_por_estudiante[eid]['municipio'] = preferred_municipio
            modulos_estudiante = modulos_por_estudiante.get(eid, set())
            modulos_estudiante.update(progreso_estudiantes_data.get(eid, {}).keys())
            modulos_estudiante.update(puntos_por_estudiante_id_modulo.get(eid, {}).keys())
            
            for modulo in modulos_estudiante:
                pasos_completados = progreso_estudiantes_data.get(eid, {}).get(modulo, [])
                pasos_completados_nombres = [p['paso'] for p in pasos_completados]
                
                # Agrupar pasos por unidad
                unidades_encontradas = set()
                pasos_por_unidad = defaultdict(list)
                otros_pasos = []
                
                for paso_obj in pasos_completados:
                    paso = paso_obj['paso']
                    match = re.search(r'Unidad\s+(\d+)', paso, re.IGNORECASE)
                    if match:
                        numero_unidad = match.group(1)
                        unidad_key = f"Unidad {numero_unidad}"
                        unidades_encontradas.add(unidad_key)
                        pasos_por_unidad[unidad_key].append(paso_obj)
                    else:
                        otros_pasos.append(paso_obj)
                
                # Crear array de progreso para este módulo
                progreso_pasos = []
                
                # Agregar otros pasos (no unidades) - excluir "Plan de Negocio" ya que se agrega después con puntos
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
                
                # Obtener todas las unidades que tienen intentos
                unidades_con_intentos = set(intentos_por_estudiante.get(eid, {}).get(modulo, {}).keys())
                # Combinar con las unidades encontradas en los pasos
                todas_las_unidades = unidades_encontradas.union(unidades_con_intentos)
                
                # Agregar unidades con sus intentos
                for unidad_key in sorted(todas_las_unidades, key=lambda x: int(re.search(r'\d+', x).group()) if re.search(r'\d+', x) else 0):
                    # Verificar si esta unidad tiene pasos completados
                    pasos_unidad = pasos_por_unidad.get(unidad_key, [])
                    # Todos los módulos tienen 4 pasos por unidad (25% cada uno = 100% total)
                    # "Proyecto de vida": Presentación, Fundamentación, Taller, Evaluación
                    # Módulos 2-10: Inicio, Desarrollo, Taller, Cierre
                    total_pasos_unidad = 4  # 4 pasos = 25% cada uno = 100% total
                    completados_count = len(pasos_unidad)
                    porcentaje_paso = min(100.0, (completados_count / total_pasos_unidad) * 100) if total_pasos_unidad > 0 else 0
                    completado = completados_count >= total_pasos_unidad
                    
                    # Obtener fecha más reciente
                    fecha_completado = None
                    if pasos_unidad:
                        fechas = [p.get('fecha') for p in pasos_unidad if p.get('fecha')]
                        if fechas:
                            fecha_completado = max(fechas)
                    
                    # Buscar intentos para esta unidad
                    intentos = intentos_por_estudiante.get(eid, {}).get(modulo, {}).get(unidad_key, 0)
                    logger.info(f"🔍 ID:{eid} ({estudiante_nombres.get(eid)}) - {modulo} - {unidad_key}: {intentos} intentos, {completados_count} pasos completados")
                    
                    progreso_pasos.append({
                        'nombre': unidad_key,
                        'completado': completado,
                        'porcentaje': round(porcentaje_paso, 1),
                        'subpasos_completados': completados_count,
                        'total_subpasos': total_pasos_unidad,
                        'fecha': fecha_completado,
                        'intentos': intentos
                    })

                # Agregar tarjeta "Plan de Negocio" si el módulo tiene plan de negocio con puntos (Módulos 2-8 y 10)
                if modulo in ['Descubrimiento de Oportunidades', 'Modelo de Negocios', 'Marketing y Comercialización', 'Marketing Digital', 'Atención al Cliente', 'Trabajo en Equipo', 'Finanzas', 'Liderazgo']:
                    # Usar el ID para buscar puntos (ya corregido arriba)
                    # En la lógica de carga de puntos, ya tenemos puntos_por_estudiante_modulo indexado por NOMBRE_ESTUDIANTE (esto es frágil)
                    # VOY A CORREGIR TAMBIÉN LA CARGA DE PUNTOS ARRIBA
                    # Pero por ahora usemos eid para buscar si lo corregimos arriba.
                    # Corrijo la carga de puntos arriba en este mismo tool call si es posible.
                    # Sí, lo haré.
                    puntos_plan = puntos_por_estudiante_id_modulo.get(eid, {}).get(modulo, 0)
                    fecha_plan = fechas_plan_negocio_por_id.get(eid, {}).get(modulo)
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
                
                # Calcular porcentaje total del módulo
                # Solo contar las unidades (no otros pasos) para el cálculo del porcentaje del módulo
                unidades_en_progreso = [p for p in progreso_pasos if re.search(r'Unidad\s+\d+', p['nombre'], re.IGNORECASE)]
                total_unidades = len(unidades_en_progreso)
                unidades_completadas = len([p for p in unidades_en_progreso if p['completado']])
                
                # Si hay unidades, calcular porcentaje basado en unidades completadas
                if total_unidades > 0:
                    porcentaje_modulo = (unidades_completadas / total_unidades * 100)
                else:
                    # Si no hay unidades, usar el cálculo anterior
                    total_pasos = len(progreso_pasos)
                    pasos_completados_count = len([p for p in progreso_pasos if p['completado']])
                    porcentaje_modulo = (pasos_completados_count / total_pasos * 100) if total_pasos > 0 else 0
                
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
                
                # Agregar módulo al estudiante
                resultado_por_estudiante[eid]['modulos'].append({
                    'modulo': modulo,
                    'modulo_orden': modulo_orden,
                    'progreso_pasos': progreso_pasos,
                    'porcentaje': round(porcentaje_modulo, 1),
                    'pasos_completados': unidades_completadas if total_unidades > 0 else len([p for p in progreso_pasos if p['completado']]),
                    'total_pasos': total_unidades if total_unidades > 0 else len(progreso_pasos)
                })
            
            # Calcular porcentaje total del estudiante
            # Excluir "Plan de Negocios" del cálculo
            # Cada módulo completado (100%) = 10% del progreso general
            modulos_est = resultado_por_estudiante[eid]['modulos']
            modulos_para_progreso = [m for m in modulos_est if m['modulo'] != 'Plan de Negocios']
            total_modulos_para_progreso = 10  # 10 módulos (excluyendo Plan de Negocios)
            
            if modulos_para_progreso:
                # Contar módulos completados (100%)
                modulos_completados = len([m for m in modulos_para_progreso if m['porcentaje'] >= 100])
                # Cada módulo completado = 10%
                porcentaje_total_est = (modulos_completados / total_modulos_para_progreso) * 100
                resultado_por_estudiante[eid]['porcentaje_total'] = round(porcentaje_total_est, 1)
                resultado_por_estudiante[eid]['total_modulos'] = len(modulos_est)
            else:
                resultado_por_estudiante[eid]['porcentaje_total'] = 0
                resultado_por_estudiante[eid]['total_modulos'] = len(modulos_est)
        
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

        # Incluir jornadas de asistencia para todos los estudiantes (para que aparezcan sin depender del lazy-load)
        try:
            _autocompletar_jornadas_estudiantes_completos(resultado, getattr(current_user, 'id', None))
            asegurar_tabla_asistencia_jornada()
            ids_resultado = [e.get('estudiante_id') for e in resultado if e.get('estudiante_id') is not None]
            # Incluir IDs incorrectos por si hay registros antiguos (273, 1124)
            for wrong_id, right_id in _ALIAS_MAP.items():
                if right_id in ids_resultado and wrong_id not in ids_resultado:
                    ids_resultado.append(wrong_id)
            if ids_resultado:
                registros_jornada = AsistenciaJornada.query.filter(
                    AsistenciaJornada.estudiante_id.in_(ids_resultado)
                ).all()
                jornadas_por_id = {}
                for j in registros_jornada:
                    eid = _alias_id(j.estudiante_id)
                    if eid not in jornadas_por_id:
                        jornadas_por_id[eid] = {}
                    jornadas_por_id[eid][str(j.jornada_numero)] = j.marcada
                for entry in resultado:
                    eid = entry.get('estudiante_id')
                    if eid is not None:
                        if float(entry.get('porcentaje_total') or 0) >= 100:
                            entry['jornadas'] = _build_full_jornadas_dict()
                        else:
                            entry['jornadas'] = jornadas_por_id.get(eid, {})
        except Exception as e:
            logger.warning(f"Error cargando jornadas para progreso: {str(e)}")
            for entry in resultado:
                if entry.get('estudiante_id') is not None and 'jornadas' not in entry:
                    if float(entry.get('porcentaje_total') or 0) >= 100:
                        entry['jornadas'] = _build_full_jornadas_dict()
                    else:
                        entry['jornadas'] = {}

        return jsonify({
            'success': True,
            'progreso_estudiantes': resultado
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo progreso de estudiantes: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Error al obtener progreso de estudiantes'}), 500


@instructor_bp.route('/dashboard', methods=['GET'])
@token_required
@admin_or_instructor_required
def get_instructor_dashboard(current_user):
    """Obtener datos del dashboard del instructor"""
    try:
        # El decorador ya verificó que current_user es instructor
        user = current_user
        
        # Obtener cursos del instructor
        cursos = Curso.query.filter_by(instructor_id=user.id).all()
        
        # Calcular estadísticas
        total_cursos = len(cursos)
        total_estudiantes = 0
        promedio_progreso = 0
        
        cursos_data = []
        for curso in cursos:
            # Contar estudiantes inscritos
            inscripciones = Inscripcion.query.filter_by(curso_id=curso.id).all()
            total_estudiantes_curso = len(inscripciones)
            total_estudiantes += total_estudiantes_curso
            
            # Progreso promedio (no disponible en modelo actual)
            progreso_curso = 0
            
            promedio_progreso += progreso_curso
            
            cursos_data.append({
                'id': curso.id,
                'titulo': curso.titulo,
                'descripcion': curso.descripcion,
                'totalEstudiantes': total_estudiantes_curso,
                'promedioProgreso': progreso_curso,
                'activo': curso.activo,
                'fechaCreacion': curso.created_at.isoformat() if curso.created_at else None,
                'ultimaActividad': curso.updated_at.isoformat() if curso.updated_at else None
            })
        
        if total_cursos > 0:
            promedio_progreso = round(promedio_progreso / total_cursos, 1)
        
        # Obtener actividad reciente (temporalmente vacío hasta implementar LogActividad)
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
        logger.error(f"Error getting instructor dashboard: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener datos del dashboard'
        }), 500

@instructor_bp.route('/cursos', methods=['GET'])
@token_required
@instructor_required
def get_instructor_courses(current_user):
    """Obtener cursos del instructor"""
    try:
        user = current_user
        
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
                'activo': curso.activo,
                'fechaCreacion': curso.created_at.isoformat() if curso.created_at else None,
                'fechaActualizacion': curso.updated_at.isoformat() if curso.updated_at else None
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
@token_required
@instructor_required
def get_course_detail(current_user, curso_id):
    """Obtener detalles de un curso específico del instructor"""
    try:
        user = current_user
        
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
            'tipo': curso.tipo,
            'url': curso.url,
            'activo': curso.activo,
            'totalEstudiantes': total_estudiantes,
            'promedioProgreso': progreso_promedio,
            'fechaCreacion': curso.created_at.isoformat() if curso.created_at else None,
            'fechaActualizacion': curso.updated_at.isoformat() if curso.updated_at else None
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
@token_required
@instructor_required
def create_course(current_user):
    """Crear nuevo curso para el instructor"""
    try:
        user = current_user
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({
                'success': False,
                'error': 'El título del curso es obligatorio'
            }), 400
        
        # Crear nuevo curso con los campos que existen en el modelo
        # Solo hay convocatoria 1, no necesitamos guardarla en la DB
        curso = Curso(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            tipo=data.get('tipo', 'curso'),  # video, pdf, quiz, otro
            url=data.get('url', ''),
            activo=True,
            instructor_id=user.id
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
                'tipo': curso.tipo,
                'url': curso.url,
                'activo': curso.activo,
                'instructor_id': curso.instructor_id,
                'created_at': curso.created_at.isoformat() if curso.created_at else None
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
@token_required
@instructor_required
def get_course_students(current_user, curso_id):
    """Obtener estudiantes de un curso específico"""
    try:
        user = current_user
        
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
@token_required
@instructor_required
def get_instructor_resources(current_user):
    """Obtener recursos del instructor"""
    try:
        user = current_user
        
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
@token_required
@instructor_required
def delete_resource(current_user, recurso_id):
    """Eliminar recurso"""
    try:
        user = current_user
        
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
@token_required
@instructor_required
def delete_course(current_user, curso_id):
    """Eliminar curso del instructor"""
    try:
        user = current_user
        
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
            
            create_table_sql = text("""
                CREATE TABLE asistencia_jornada (
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
            index1_sql = text("CREATE INDEX idx_asistencia_jornada_estudiante ON asistencia_jornada(estudiante_id)")
            index2_sql = text("CREATE INDEX idx_asistencia_jornada_jornada ON asistencia_jornada(jornada_numero)")
            
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

def buscar_estudiante_por_nombre(nombre_completo):
    """Buscar estudiante por nombre completo, con manejo flexible de espacios"""
    from sqlalchemy import func as db_func
    
    # Normalizar el nombre: eliminar espacios extra
    nombre_normalizado = ' '.join(nombre_completo.split())
    
    # Buscar primero con el nombre completo exacto
    partes = nombre_normalizado.split(' ', 1)
    if len(partes) == 2:
        nombre, apellido = partes
        estudiante = User.query.filter_by(
            nombre=nombre.strip(),
            apellido=apellido.strip(),
            rol='estudiante'
        ).first()
        
        if estudiante:
            return estudiante
        
        # Si no se encuentra exacto, buscar por nombre completo concatenado (insensible a mayúsculas)
        nombre_completo_lower = nombre_normalizado.lower()
        estudiantes = User.query.filter(
            User.rol == 'estudiante',
            db_func.lower(db_func.concat(User.nombre, ' ', User.apellido)) == nombre_completo_lower
        ).all()
        
        if estudiantes:
            return estudiantes[0]
    
    # Buscar solo por nombre si no tiene apellido separado
    if len(partes) == 1:
        estudiante = User.query.filter_by(nombre=partes[0].strip(), rol='estudiante').first()
        if estudiante:
            return estudiante
    
    # Última opción: buscar por coincidencia parcial
    nombre_buscar = f"%{nombre_normalizado}%"
    estudiante = User.query.filter(
        User.rol == 'estudiante',
        db_func.lower(db_func.concat(User.nombre, ' ', User.apellido)).like(nombre_buscar.lower())
    ).first()
    
    return estudiante

@instructor_bp.route('/jornadas/<int:estudiante_id>', methods=['GET'])
@token_required
@admin_or_instructor_required
def get_jornadas_estudiante(current_user, estudiante_id):
    """Obtener jornadas marcadas de un estudiante"""
    try:
        # Asegurar que la tabla existe
        asegurar_tabla_asistencia_jornada()

        # Alias puntual: IDs incorrectos -> correctos (Edwin 273->1465, Cristian 1124->2586)
        if estudiante_id == 273:
            estudiante_id = 1465
        elif estudiante_id == 1124:
            estudiante_id = 2586
        
        # Buscar el estudiante por ID
        estudiante = User.query.get(estudiante_id)
        
        if not estudiante:
            return jsonify({'success': False, 'error': 'Estudiante no encontrado'}), 404
        
        jornadas = AsistenciaJornada.query.filter_by(estudiante_id=estudiante_id).all()
        jornadas_dict = {}
        for j in jornadas:
            jornadas_dict[str(j.jornada_numero)] = j.marcada
        
        return jsonify({
            'success': True,
            'jornadas': jornadas_dict
        }), 200
    except Exception as e:
        logger.error(f"Error obteniendo jornadas: {str(e)}")
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@instructor_bp.route('/jornadas/<int:estudiante_id>', methods=['POST'])
@token_required
@admin_or_instructor_required
def guardar_jornadas_estudiante(current_user, estudiante_id):
    """Guardar jornadas marcadas de un estudiante"""
    try:
        # Asegurar que la tabla existe
        asegurar_tabla_asistencia_jornada()
        
        from datetime import datetime
        import pytz
        
        def get_colombia_time():
            co_tz = pytz.timezone('America/Bogota')
            return datetime.now(co_tz)
        
        data = request.get_json()
        jornadas_marcadas = data.get('jornadas', {})  # {1: true, 2: false, ...}
        
        # Alias puntual: IDs incorrectos -> correctos (Edwin 273->1465, Cristian 1124->2586)
        if estudiante_id == 273:
            estudiante_id = 1465
        elif estudiante_id == 1124:
            estudiante_id = 2586

        # Buscar el estudiante por ID
        estudiante = User.query.get(estudiante_id)
        
        if not estudiante:
            return jsonify({'success': False, 'error': 'Estudiante no encontrado'}), 404
        
        # Procesar cada jornada (1-10)
        for jornada_num in range(1, 11):
            marcada = jornadas_marcadas.get(str(jornada_num), False) or jornadas_marcadas.get(jornada_num, False)
            
            # Buscar si ya existe
            jornada = AsistenciaJornada.query.filter_by(
                estudiante_id=estudiante_id,
                jornada_numero=jornada_num
            ).first()
            
            if jornada:
                jornada.marcada = marcada
                jornada.fecha_marcado = get_colombia_time() if marcada else None
                jornada.instructor_id = current_user.id
            else:
                jornada = AsistenciaJornada(
                    estudiante_id=estudiante_id,
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
        logger.error(f"Error guardando jornadas para estudiante_id={estudiante_id}: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@instructor_bp.route('/merge-student-ids/edwin-273-to-1465', methods=['POST'])
@token_required
@instructor_required
def merge_student_ids_edwin_273_to_1465(current_user):
    """
    Migración puntual y segura: mover datos de usuario duplicado 273 -> 1465 (Edwin Alexis Hurtado Payan).
    No cambia estructura, solo actualiza filas cuyo usuario/estudiante_id == 273.
    """
    FROM_ID = 273
    TO_ID = 1465
    try:
        # Safety: permitir únicamente este caso puntual
        payload = request.get_json(silent=True) or {}
        if isinstance(payload, dict):
            req_from = payload.get('from_id')
            req_to = payload.get('to_id')
            if req_from is not None and int(req_from) != FROM_ID:
                return jsonify({'success': False, 'error': 'Operación no permitida'}), 403
            if req_to is not None and int(req_to) != TO_ID:
                return jsonify({'success': False, 'error': 'Operación no permitida'}), 403

        from_user = User.query.get(FROM_ID)
        to_user = User.query.get(TO_ID)
        if not from_user or not to_user:
            return jsonify({'success': False, 'error': 'Usuario origen/destino no encontrado'}), 404

        def norm(s: str) -> str:
            try:
                import unicodedata
                return unicodedata.normalize('NFD', (s or '')).encode('ascii', 'ignore').decode('ascii').strip().lower()
            except Exception:
                return (s or '').strip().lower()

        # Validación suave por nombre (no bloqueante si hay espacios raros)
        expected = norm('Edwin Alexis Hurtado Payan')
        if norm(f"{from_user.nombre} {from_user.apellido}") != expected:
            logger.warning(f"[merge] FROM_ID {FROM_ID} no parece Edwin: '{from_user.nombre} {from_user.apellido}'")
        if norm(f"{to_user.nombre} {to_user.apellido}") != expected:
            logger.warning(f"[merge] TO_ID {TO_ID} no parece Edwin: '{to_user.nombre} {to_user.apellido}'")

        from ..models import IntentosEvaluacion, PuntosPlanNegocio, RespuestasPlanNegocio, LogActividad, AsistenciaJornada

        counts_before = {
            'log_actividad': LogActividad.query.filter_by(usuario_id=FROM_ID).count(),
            'intentos_evaluacion': IntentosEvaluacion.query.filter_by(usuario_id=FROM_ID).count(),
            'puntos_plan_negocio': PuntosPlanNegocio.query.filter_by(usuario_id=FROM_ID).count(),
            'respuestas_plan_negocio': RespuestasPlanNegocio.query.filter_by(usuario_id=FROM_ID).count(),
            'asistencia_jornada': AsistenciaJornada.query.filter_by(estudiante_id=FROM_ID).count(),
        }

        moved = {'log_actividad': 0, 'intentos_evaluacion': 0, 'puntos_plan_negocio': 0, 'respuestas_plan_negocio': 0, 'asistencia_jornada': 0}

        # Actualizaciones masivas (no afectan a otros usuarios)
        moved['log_actividad'] = LogActividad.query.filter_by(usuario_id=FROM_ID).update({'usuario_id': TO_ID})
        moved['intentos_evaluacion'] = IntentosEvaluacion.query.filter_by(usuario_id=FROM_ID).update({'usuario_id': TO_ID})
        moved['puntos_plan_negocio'] = PuntosPlanNegocio.query.filter_by(usuario_id=FROM_ID).update({'usuario_id': TO_ID})
        moved['respuestas_plan_negocio'] = RespuestasPlanNegocio.query.filter_by(usuario_id=FROM_ID).update({'usuario_id': TO_ID})

        # Asistencia: manejar posible conflicto por UNIQUE(estudiante_id, jornada_numero)
        for jornada_num in range(1, 11):
            old_row = AsistenciaJornada.query.filter_by(estudiante_id=FROM_ID, jornada_numero=jornada_num).first()
            if not old_row:
                continue
            new_row = AsistenciaJornada.query.filter_by(estudiante_id=TO_ID, jornada_numero=jornada_num).first()
            if new_row:
                # Merge conservador
                if old_row.marcada and not new_row.marcada:
                    new_row.marcada = True
                if old_row.fecha_marcado and (not new_row.fecha_marcado or old_row.fecha_marcado > new_row.fecha_marcado):
                    new_row.fecha_marcado = old_row.fecha_marcado
                if old_row.instructor_id and not new_row.instructor_id:
                    new_row.instructor_id = old_row.instructor_id
                db.session.delete(old_row)
            else:
                old_row.estudiante_id = TO_ID
            moved['asistencia_jornada'] += 1

        db.session.commit()

        counts_after = {
            'log_actividad': LogActividad.query.filter_by(usuario_id=FROM_ID).count(),
            'intentos_evaluacion': IntentosEvaluacion.query.filter_by(usuario_id=FROM_ID).count(),
            'puntos_plan_negocio': PuntosPlanNegocio.query.filter_by(usuario_id=FROM_ID).count(),
            'respuestas_plan_negocio': RespuestasPlanNegocio.query.filter_by(usuario_id=FROM_ID).count(),
            'asistencia_jornada': AsistenciaJornada.query.filter_by(estudiante_id=FROM_ID).count(),
        }

        return jsonify({
            'success': True,
            'from_id': FROM_ID,
            'to_id': TO_ID,
            'counts_before': counts_before,
            'moved': moved,
            'counts_after': counts_after,
            'message': 'Merge aplicado (273 -> 1465)'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error merge_student_ids_edwin_273_to_1465: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@instructor_bp.route('/merge-student-ids/carlos-4224-to-4345', methods=['POST'])
@token_required
@instructor_required
def merge_student_ids_carlos_4224_to_4345(current_user):
    """
    Migración puntual y segura: mover datos del usuario duplicado 4224 -> 4345
    para el caso de Carlos Moran / Lácteos Sultana de Sur.
    """
    FROM_ID = 4224
    TO_ID = 4345
    try:
        # Safety: permitir únicamente este caso puntual
        payload = request.get_json(silent=True) or {}
        if isinstance(payload, dict):
            req_from = payload.get('from_id')
            req_to = payload.get('to_id')
            if req_from is not None and int(req_from) != FROM_ID:
                return jsonify({'success': False, 'error': 'Operación no permitida'}), 403
            if req_to is not None and int(req_to) != TO_ID:
                return jsonify({'success': False, 'error': 'Operación no permitida'}), 403

        from_user = User.query.get(FROM_ID)
        to_user = User.query.get(TO_ID)
        if not from_user or not to_user:
            return jsonify({'success': False, 'error': 'Usuario origen/destino no encontrado'}), 404

        def norm(s: str) -> str:
            try:
                import unicodedata
                return unicodedata.normalize('NFD', (s or '')).encode('ascii', 'ignore').decode('ascii').strip().lower()
            except Exception:
                return (s or '').strip().lower()

        # Validación suave para detectar si se está ejecutando sobre usuarios inesperados.
        expected = norm('Carlos Moran')
        if norm(f"{from_user.nombre} {from_user.apellido}") != expected:
            logger.warning(f"[merge] FROM_ID {FROM_ID} no parece Carlos Moran: '{from_user.nombre} {from_user.apellido}'")
        if norm(f"{to_user.nombre} {to_user.apellido}") != expected:
            logger.warning(f"[merge] TO_ID {TO_ID} no parece Carlos Moran: '{to_user.nombre} {to_user.apellido}'")

        from ..models import IntentosEvaluacion, PuntosPlanNegocio, RespuestasPlanNegocio, LogActividad, AsistenciaJornada

        counts_before = {
            'log_actividad': LogActividad.query.filter_by(usuario_id=FROM_ID).count(),
            'intentos_evaluacion': IntentosEvaluacion.query.filter_by(usuario_id=FROM_ID).count(),
            'puntos_plan_negocio': PuntosPlanNegocio.query.filter_by(usuario_id=FROM_ID).count(),
            'respuestas_plan_negocio': RespuestasPlanNegocio.query.filter_by(usuario_id=FROM_ID).count(),
            'asistencia_jornada': AsistenciaJornada.query.filter_by(estudiante_id=FROM_ID).count(),
        }

        moved = {'log_actividad': 0, 'intentos_evaluacion': 0, 'puntos_plan_negocio': 0, 'respuestas_plan_negocio': 0, 'asistencia_jornada': 0}

        # Actualizaciones masivas (no afectan a otros usuarios)
        moved['log_actividad'] = LogActividad.query.filter_by(usuario_id=FROM_ID).update({'usuario_id': TO_ID})
        moved['intentos_evaluacion'] = IntentosEvaluacion.query.filter_by(usuario_id=FROM_ID).update({'usuario_id': TO_ID})
        moved['puntos_plan_negocio'] = PuntosPlanNegocio.query.filter_by(usuario_id=FROM_ID).update({'usuario_id': TO_ID})
        moved['respuestas_plan_negocio'] = RespuestasPlanNegocio.query.filter_by(usuario_id=FROM_ID).update({'usuario_id': TO_ID})

        # Asistencia: manejar posible conflicto por UNIQUE(estudiante_id, jornada_numero)
        for jornada_num in range(1, 11):
            old_row = AsistenciaJornada.query.filter_by(estudiante_id=FROM_ID, jornada_numero=jornada_num).first()
            if not old_row:
                continue
            new_row = AsistenciaJornada.query.filter_by(estudiante_id=TO_ID, jornada_numero=jornada_num).first()
            if new_row:
                # Merge conservador
                if old_row.marcada and not new_row.marcada:
                    new_row.marcada = True
                if old_row.fecha_marcado and (not new_row.fecha_marcado or old_row.fecha_marcado > new_row.fecha_marcado):
                    new_row.fecha_marcado = old_row.fecha_marcado
                if old_row.instructor_id and not new_row.instructor_id:
                    new_row.instructor_id = old_row.instructor_id
                db.session.delete(old_row)
            else:
                old_row.estudiante_id = TO_ID
            moved['asistencia_jornada'] += 1

        db.session.commit()

        counts_after = {
            'log_actividad': LogActividad.query.filter_by(usuario_id=FROM_ID).count(),
            'intentos_evaluacion': IntentosEvaluacion.query.filter_by(usuario_id=FROM_ID).count(),
            'puntos_plan_negocio': PuntosPlanNegocio.query.filter_by(usuario_id=FROM_ID).count(),
            'respuestas_plan_negocio': RespuestasPlanNegocio.query.filter_by(usuario_id=FROM_ID).count(),
            'asistencia_jornada': AsistenciaJornada.query.filter_by(estudiante_id=FROM_ID).count(),
        }

        return jsonify({
            'success': True,
            'from_id': FROM_ID,
            'to_id': TO_ID,
            'counts_before': counts_before,
            'moved': moved,
            'counts_after': counts_after,
            'message': 'Merge aplicado (4224 -> 4345)'
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error merge_student_ids_carlos_4224_to_4345: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500

