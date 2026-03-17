from flask import Blueprint, jsonify, request, session, make_response  # pyright: ignore[reportMissingImports]
from src.models import db, User, RespuestasPlanNegocio
from src.models import CuposConfig, MunicipioCupo
from src.models import LogActividad, Notificacion
from src.models.intentos_evaluacion import IntentosEvaluacion
from src.constants.municipios import LISTA_MUNICIPIOS
from src.services.auth_service import generate_token, generate_refresh_token, verify_refresh_token, token_required, verify_token
from src.services.s3_service import S3Service
from src.services.student_municipio_service import get_preferred_municipio
from werkzeug.security import generate_password_hash  # pyright: ignore[reportMissingImports]
import re
from datetime import datetime
import base64
import json
import binascii
from werkzeug.exceptions import BadRequest
try:
    from zoneinfo import ZoneInfo
    def get_colombia_time():
        """Obtener la hora actual en zona horaria de Colombia (UTC-5)"""
        return datetime.now(ZoneInfo('America/Bogota'))
except ImportError:
    # Fallback para Python < 3.9 usando pytz
    try:
        import pytz
        def get_colombia_time():
            """Obtener la hora actual en zona horaria de Colombia (UTC-5)"""
            tz_colombia = pytz.timezone('America/Bogota')
            return datetime.now(tz_colombia)
    except ImportError:
        # Último fallback: usar UTC-5 manualmente
        from datetime import timedelta, timezone
        def get_colombia_time():
            """Obtener la hora actual en zona horaria de Colombia (UTC-5)"""
            tz_colombia = timezone(timedelta(hours=-5))
            return datetime.now(tz_colombia)

user_bp = Blueprint('user', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    # Al menos 8 caracteres, incluir letras y números
    if len(password) < 8:
        return False
    if not re.search(r'[a-zA-Z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

def check_registration_period():
    """Verificar si el período de registro está abierto"""
    # Registro siempre habilitado
    return True

def check_admin_access():
    """Verificar si el usuario actual es admin"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    
    try:
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        return user and user.rol == 'admin'
    except Exception:
        return False

@user_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        is_demo_mode = data.get('demo_mode', False)
        
        # Log de diagnóstico para ver qué datos está enviando el frontend
        print("=== DIAGNOSTICO REGISTER ===")
        print(f"Datos recibidos: {list(data.keys()) if data else 'None'}")
        campos_requeridos = ['nombre', 'apellido', 'email', 'tipo_documento', 'numero_documento', 'password', 'confirm_password', 'convocatoria', 'fecha_nacimiento', 'sexo', 'estado_civil', 'telefono', 'direccion', 'municipio', 'emprendimiento_nombre', 'emprendimiento_sector', 'tipo_persona', 'emprendimiento_formalizado', 'financiado_estado', 'declara_veraz', 'declara_no_beneficiario', 'acepta_terminos']
        campos_faltantes = [k for k in campos_requeridos if k not in data] if data else campos_requeridos
        print(f"Campos faltantes: {campos_faltantes}")
        print("Valores de campos criticos:")
        for field in ['email', 'convocatoria', 'municipio', 'emprendimiento_sector', 'tipo_persona', 'emprendimiento_formalizado', 'financiado_estado']:
            print(f"  {field}: {data.get(field) if data else 'None'}")
        print("==========================")
        
        # Verificar si el período de registro está abierto, si es admin, o si es modo demo
        if not check_registration_period() and not check_admin_access() and not is_demo_mode:
            return jsonify({
                'error': 'El período de registro aún no ha comenzado. Las inscripciones abren el 30 de septiembre de 2025 a las 8:00 AM'
            }), 403
        
        data = request.json
        
        # Verificar si el usuario ya existe para determinar validaciones
        try:
            existing_user = User.query.filter_by(numero_documento=data['numero_documento']).first()
        except Exception as e:
            print(f"Error consultando usuario existente: {str(e)}")
            existing_user = None
        
        # Validar campos obligatorios básicos (excluyendo booleanos)
        required_fields = ['nombre', 'apellido', 'email', 'tipo_documento', 'numero_documento', 'convocatoria', 'fecha_nacimiento', 'sexo', 'estado_civil', 'telefono', 'direccion', 'municipio', 'emprendimiento_nombre', 'emprendimiento_sector', 'tipo_persona']
        
        # Solo requerir contraseña si es un usuario nuevo
        if not existing_user:
            print("Usuario nuevo detectado - requiriendo contraseña")
            required_fields.extend(['password', 'confirm_password'])
        else:
            print(f"Usuario existente detectado (ID: {existing_user.id}) - contraseña opcional")
        
        for field in required_fields:
            if data.get(field) is None or data.get(field) == '':
                return jsonify({'error': f'El campo {field} es obligatorio'}), 400
        
        # Validar campos booleanos por separado
        boolean_fields = ['emprendimiento_formalizado', 'financiado_estado', 'declara_veraz', 'declara_no_beneficiario', 'acepta_terminos']
        for field in boolean_fields:
            if field not in data:
                return jsonify({'error': f'El campo {field} es obligatorio'}), 400
        
        # Los documentos son opcionales, no se validan como obligatorios
        
        # Validar formato de email
        if not validate_email(data['email']):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        # Validar contraseña solo si es un usuario nuevo o si se proporciona contraseña
        if not existing_user or (data.get('password') and data.get('password').strip()):
            if not validate_password(data.get('password', '')):
                return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'}), 400
            
            # Validar que las contraseñas coincidan
            if data.get('password') != data.get('confirm_password'):
                return jsonify({'error': 'Las contraseñas no coinciden'}), 400
        
        # Validar convocatoria (solo '1' o '2')
        if data.get('convocatoria') not in ['1', '2']:
            return jsonify({'error': 'La convocatoria seleccionada no es válida'}), 400

        # Validar municipio
        if data.get('municipio') not in LISTA_MUNICIPIOS:
            return jsonify({'error': 'El municipio seleccionado no es válido'}), 400

        # Validar sector económico (según TDR Ajustados-4)
        sectores_validos = {'agroindustria', 'industria_comercio', 'servicios', 'turismo'}
        sector_val = (data.get('emprendimiento_sector') or '').strip().lower()
        if sector_val not in sectores_validos:
            return jsonify({'error': 'Sector económico inválido'}), 400

        # Validar tipo de persona
        tipos_validos = {'natural', 'juridica'}
        tipo_persona_val = (data.get('tipo_persona') or '').strip().lower()
        if tipo_persona_val not in tipos_validos:
            return jsonify({'error': 'Tipo de persona inválido'}), 400

        # Validar fecha de nacimiento y rango de edad (18-32)
        try:
            fecha_nac = datetime.fromisoformat(data['fecha_nacimiento']).date()
        except Exception:
            return jsonify({'error': 'La fecha de nacimiento debe tener formato ISO (YYYY-MM-DD)'}), 400

        hoy = datetime.utcnow().date()
        edad = (hoy - fecha_nac).days // 365
        if edad < 18 or edad > 32:
            return jsonify({'error': 'La edad debe estar entre 18 y 32 años'}), 400
        
        if existing_user:
            # Usuario existe - actualizar datos en lugar de crear nuevo
            print(f"Usuario existente encontrado (ID: {existing_user.id}), actualizando datos...")
            
            # TEMPORAL: Permitir re-envío para testing
            if existing_user.formulario_enviado:
                print(f"ADVERTENCIA: Usuario {existing_user.numero_documento} ya tiene formulario enviado, permitiendo re-envío para testing")
                existing_user.formulario_enviado = False
                existing_user.estado_inscripcion = 'en_proceso'
            
            try:
                # Verificar si el email está siendo cambiado a uno que ya existe
                if existing_user.email != data['email']:
                    email_exists = User.query.filter_by(email=data['email']).first()
                    if email_exists and email_exists.id != existing_user.id:
                        return jsonify({'error': 'El email ya está registrado por otro usuario'}), 400
                
                # Actualizar datos del usuario existente
                existing_user.nombre = data['nombre']
                existing_user.apellido = data['apellido']
                existing_user.email = data['email']
                existing_user.tipo_documento = data['tipo_documento']
                existing_user.fecha_nacimiento = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
                existing_user.sexo = data['sexo']
                existing_user.estado_civil = data['estado_civil']
                existing_user.telefono = data['telefono']
                existing_user.direccion = data['direccion']
                existing_user.municipio = data['municipio']
                existing_user.corregimiento_vereda = data.get('corregimiento_vereda', '')
                existing_user.emprendimiento_nombre = data['emprendimiento_nombre']
                existing_user.emprendimiento_sector = sector_val
                existing_user.tipo_persona = tipo_persona_val
                existing_user.convocatoria = data.get('convocatoria')
                
                # Actualizar campos de población diferencial (Paso 2)
                existing_user.mujer_cabeza_familia = data.get('mujer_cabeza_familia', False)
                existing_user.victima_conflicto = data.get('victima_conflicto', False)
                existing_user.persona_discapacidad = data.get('persona_discapacidad', False)
                existing_user.pertenencia_etnica = data.get('pertenencia_etnica', False)
                existing_user.sisben_grupo = data.get('sisben_grupo', '')
                existing_user.persona_reincorporacion = data.get('persona_reincorporacion', False)
                
                # Actualizar campos de emprendimiento (Paso 3)
                existing_user.tiempo_funcionamiento = data.get('tiempo_funcionamiento', '')
                existing_user.empleos_generados = data.get('empleos_generados', '')
                existing_user.acceso_mercados = data.get('acceso_mercados', '')
                existing_user.emprendimiento_formalizado = data.get('emprendimiento_formalizado')
                
                # Actualizar campos de financiación (Paso 10) - SOLO si vienen con valor True explícito
                # Esto permite que se guarden cuando el usuario marca los checkbox
                # pero NO los sobrescribe con False si no están presentes
                if data.get('financiado_regalias') is True:
                    existing_user.financiado_regalias = True
                if data.get('financiado_camara_comercio') is True:
                    existing_user.financiado_camara_comercio = True
                if data.get('financiado_incubadoras') is True:
                    existing_user.financiado_incubadoras = True
                if data.get('financiado_otro') is True:
                    existing_user.financiado_otro = True
                if data.get('financiado_otro_texto'):
                    existing_user.financiado_otro_texto = data['financiado_otro_texto']
                # Si al menos uno es True, marcar financiado_estado
                if any([data.get('financiado_regalias'), data.get('financiado_camara_comercio'), 
                        data.get('financiado_incubadoras'), data.get('financiado_otro')]):
                    existing_user.financiado_estado = True
                
                # Actualizar campos de declaraciones (Paso 11)
                if data.get('declara_veraz') is True:
                    existing_user.declara_veraz = True
                if data.get('declara_no_beneficiario') is True:
                    existing_user.declara_no_beneficiario = True
                if data.get('acepta_terminos') is True:
                    existing_user.acepta_terminos = True
                
                existing_user.estado_inscripcion = 'completada'
                existing_user.formulario_enviado = True
                existing_user.fecha_ultimo_guardado = datetime.utcnow()
                existing_user.fecha_finalizacion = datetime.utcnow()
                
                # Actualizar contraseña solo si se proporciona
                if data.get('password') and data.get('password').strip():
                    existing_user.set_password(data['password'])
                
                user = existing_user
                is_new_user = False
                
                # Guardar cambios en la base de datos
                print("Guardando cambios en la base de datos...")
                db.session.commit()
                print("Cambios guardados exitosamente")
                
            except Exception as e:
                print(f"Error actualizando usuario existente: {str(e)}")
                db.session.rollback()
                return jsonify({'error': 'Error interno del servidor al actualizar usuario'}), 500
        else:
            # Usuario nuevo - verificar si el email ya existe
            email_exists = User.query.filter_by(email=data['email']).first()
            if email_exists:
                return jsonify({'error': 'El email ya está registrado'}), 400
            
            is_new_user = True
        
        # Procesar documentos específicos obligatorios
        doc_terminos_pdf = None
        doc_terminos_pdf_nombre = None
        doc_uso_imagen_pdf = None
        doc_uso_imagen_pdf_nombre = None
        doc_plan_negocio_xls = None
        doc_plan_negocio_nombre = None
        doc_vecindad_pdf = None
        doc_vecindad_pdf_nombre = None
        video_url = data.get('video_url', None)  # Opcional por ahora
        
        # Validar y decodificar TDR (PDF opcional para pruebas)
        if data.get('doc_terminos_pdf'):
            try:
                doc_terminos_pdf = base64.b64decode(data['doc_terminos_pdf'])
                doc_terminos_pdf_nombre = data.get('doc_terminos_pdf_nombre', 'terminos.pdf')
                # Validar tamaño (20MB máximo)
                if len(doc_terminos_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo de términos de referencia no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo de términos de referencia'}), 400
        
        # Validar y decodificar Uso de Imagen (PDF obligatorio)
        if data.get('doc_uso_imagen_pdf'):
            try:
                doc_uso_imagen_pdf = base64.b64decode(data['doc_uso_imagen_pdf'])
                doc_uso_imagen_pdf_nombre = data.get('doc_uso_imagen_pdf_nombre', 'uso_imagen.pdf')
                if len(doc_uso_imagen_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo de autorización de uso de imagen no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo de autorización de uso de imagen'}), 400
        
        # Validar y decodificar Plan de Negocio (Excel obligatorio)
        if data.get('doc_plan_negocio_xls'):
            try:
                doc_plan_negocio_xls = base64.b64decode(data['doc_plan_negocio_xls'])
                doc_plan_negocio_nombre = data.get('doc_plan_negocio_nombre', 'plan_negocio.xlsx')
                if len(doc_plan_negocio_xls) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo del plan de negocio no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo del plan de negocio'}), 400
        
        # Validar y decodificar Vecindad (PDF obligatorio)
        if data.get('doc_vecindad_pdf'):
            try:
                doc_vecindad_pdf = base64.b64decode(data['doc_vecindad_pdf'])
                doc_vecindad_pdf_nombre = data.get('doc_vecindad_pdf_nombre', 'vecindad.pdf')
                if len(doc_vecindad_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado de vecindad no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado de vecindad'}), 400
        
        # Validar y procesar documentos condicionales según tipo de persona
        rut_pdf = None
        rut_pdf_nombre = None
        cedula_pdf = None
        cedula_pdf_nombre = None
        cedula_representante_pdf = None
        cedula_representante_pdf_nombre = None
        cert_existencia_pdf = None
        cert_existencia_pdf_nombre = None
        
        if tipo_persona_val == 'natural':
            # Persona Natural: RUT + Cédula opcionales para pruebas
            # if not data.get('rut_pdf'):
            #     return jsonify({'error': 'Debe adjuntar el RUT actualizado 2025 (obligatorio para Persona Natural)'}), 400
            # if not data.get('cedula_pdf'):
            #     return jsonify({'error': 'Debe adjuntar la cédula de ciudadanía (obligatorio para Persona Natural)'}), 400
            
            # Procesar RUT (solo si está presente)
            if data.get('rut_pdf'):
                try:
                    rut_pdf = base64.b64decode(data['rut_pdf'])
                    rut_pdf_nombre = data.get('rut_pdf_nombre', 'rut.pdf')
                    if len(rut_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'El archivo del RUT no puede superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar el archivo del RUT'}), 400
            
            # Procesar Cédula (solo si está presente)
            if data.get('cedula_pdf'):
                try:
                    cedula_pdf = base64.b64decode(data['cedula_pdf'])
                    cedula_pdf_nombre = data.get('cedula_pdf_nombre', 'cedula.pdf')
                    if len(cedula_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'El archivo de la cédula no puede superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar el archivo de la cédula'}), 400
                
        elif tipo_persona_val == 'juridica':
            # Persona Jurídica: RUT + Cédula representante + Certificado existencia opcionales para pruebas
            # if not data.get('rut_pdf'):
            #     return jsonify({'error': 'Debe adjuntar el RUT actualizado 2025 (obligatorio para Persona Jurídica)'}), 400
            # if not data.get('cedula_representante_pdf'):
            #     return jsonify({'error': 'Debe adjuntar la cédula del representante legal (obligatorio para Persona Jurídica)'}), 400
            # if not data.get('cert_existencia_pdf'):
            #     return jsonify({'error': 'Debe adjuntar el certificado de existencia y representación legal no mayor a 30 días (obligatorio para Persona Jurídica)'}), 400
            
            # Procesar RUT (solo si está presente en el request)
            if data.get('rut_pdf'):
                try:
                    rut_pdf = base64.b64decode(data['rut_pdf'])
                    rut_pdf_nombre = data.get('rut_pdf_nombre', 'rut.pdf')
                    if len(rut_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'El archivo del RUT no puede superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar el archivo del RUT'}), 400
            
            # Procesar Cédula representante (solo si está presente en el request)
            if data.get('cedula_representante_pdf'):
                try:
                    cedula_representante_pdf = base64.b64decode(data['cedula_representante_pdf'])
                    cedula_representante_pdf_nombre = data.get('cedula_representante_pdf_nombre', 'cedula_representante.pdf')
                    if len(cedula_representante_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'El archivo de la cédula del representante no puede superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar el archivo de la cédula del representante'}), 400
            
            # Procesar Certificado de existencia (solo si está presente en el request)
            if data.get('cert_existencia_pdf'):
                try:
                    cert_existencia_pdf = base64.b64decode(data['cert_existencia_pdf'])
                    cert_existencia_pdf_nombre = data.get('cert_existencia_pdf_nombre', 'certificado_existencia.pdf')
                    if len(cert_existencia_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'El certificado de existencia no puede superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar el certificado de existencia'}), 400
        
        # Procesar documentación diferencial (opcional/subsanable)
        ruv_pdf = None
        ruv_pdf_nombre = None
        sisben_pdf = None
        sisben_pdf_nombre = None
        grupo_etnico_pdf = None
        grupo_etnico_pdf_nombre = None
        arn_pdf = None
        arn_pdf_nombre = None
        discapacidad_pdf = None
        discapacidad_pdf_nombre = None
        
        docs_diferenciales_cargados = []
        docs_diferenciales_pendientes = []
        
        # RUV (opcional)
        if data.get('ruv_pdf'):
            try:
                ruv_pdf = base64.b64decode(data['ruv_pdf'])
                ruv_pdf_nombre = data.get('ruv_pdf_nombre', 'ruv.pdf')
                if len(ruv_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado RUV no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('RUV')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado RUV'}), 400
        else:
            docs_diferenciales_pendientes.append('RUV')
        
        # SISBEN (opcional)
        if data.get('sisben_pdf'):
            try:
                sisben_pdf = base64.b64decode(data['sisben_pdf'])
                sisben_pdf_nombre = data.get('sisben_pdf_nombre', 'sisben.pdf')
                if len(sisben_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'La copia del SISBEN no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('SISBEN')
            except Exception as e:
                return jsonify({'error': 'Error al procesar la copia del SISBEN'}), 400
        else:
            docs_diferenciales_pendientes.append('SISBEN')
        
        # Grupo étnico (opcional)
        if data.get('grupo_etnico_pdf'):
            try:
                grupo_etnico_pdf = base64.b64decode(data['grupo_etnico_pdf'])
                grupo_etnico_pdf_nombre = data.get('grupo_etnico_pdf_nombre', 'grupo_etnico.pdf')
                if len(grupo_etnico_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado de grupo étnico no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('Grupo Étnico')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado de grupo étnico'}), 400
        else:
            docs_diferenciales_pendientes.append('Grupo Étnico')
        
        # ARN (opcional)
        if data.get('arn_pdf'):
            try:
                arn_pdf = base64.b64decode(data['arn_pdf'])
                arn_pdf_nombre = data.get('arn_pdf_nombre', 'arn.pdf')
                if len(arn_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado ARN no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('ARN')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado ARN'}), 400
        else:
            docs_diferenciales_pendientes.append('ARN')
        
        # Discapacidad (opcional)
        if data.get('discapacidad_pdf'):
            try:
                discapacidad_pdf = base64.b64decode(data['discapacidad_pdf'])
                discapacidad_pdf_nombre = data.get('discapacidad_pdf_nombre', 'discapacidad.pdf')
                if len(discapacidad_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado de discapacidad no puede superar 20MB'}), 400
                docs_diferenciales_cargados.append('Discapacidad')
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado de discapacidad'}), 400
        else:
            docs_diferenciales_pendientes.append('Discapacidad')
        
        # Validar documentación de control (OBLIGATORIA - bloquea registro si falta)
        docs_control_obligatorios = [
            'antecedentes_fiscales_pdf',
            'antecedentes_disciplinarios_pdf', 
            'antecedentes_judiciales_pdf',
            'redam_pdf',
            'inhabilidades_sexuales_pdf'
        ]
        
        docs_control_faltantes = []
        for doc_field in docs_control_obligatorios:
            if not data.get(doc_field):
                docs_control_faltantes.append(doc_field)
        
        # Comentado para pruebas - certificados de control opcionales
        # if docs_control_faltantes:
        #     docs_nombres = {
        #         'antecedentes_fiscales_pdf': 'Antecedentes fiscales (Contraloría)',
        #         'antecedentes_disciplinarios_pdf': 'Antecedentes disciplinarios (Procuraduría)',
        #         'antecedentes_judiciales_pdf': 'Antecedentes judiciales (Policía Nacional)',
        #         'redam_pdf': 'Certificado REDAM',
        #         'inhabilidades_sexuales_pdf': 'Consulta de inhabilidades por delitos sexuales',
        #         'declaracion_capacidad_legal_pdf': 'Declaración juramentada de capacidad legal'
        #     }
        #     faltantes_nombres = [docs_nombres[doc] for doc in docs_control_faltantes]
        #     return jsonify({
        #         'error': f'Debe adjuntar todos los certificados de control. Sin ellos, la inscripción no será válida. Faltan: {", ".join(faltantes_nombres)}'
        #     }), 400
        
        # Procesar documentos de control obligatorios
        antecedentes_fiscales_pdf = None
        antecedentes_fiscales_pdf_nombre = None
        antecedentes_disciplinarios_pdf = None
        antecedentes_disciplinarios_pdf_nombre = None
        antecedentes_judiciales_pdf = None
        antecedentes_judiciales_pdf_nombre = None
        redam_pdf = None
        redam_pdf_nombre = None
        inhabilidades_sexuales_pdf = None
        inhabilidades_sexuales_pdf_nombre = None
        declaracion_capacidad_legal_pdf = None
        declaracion_capacidad_legal_pdf_nombre = None
        
        # Procesar Declaración de Capacidad Legal (documento obligatorio)
        if data.get('declaracion_capacidad_legal_pdf'):
            try:
                declaracion_capacidad_legal_pdf = base64.b64decode(data['declaracion_capacidad_legal_pdf'])
                declaracion_capacidad_legal_pdf_nombre = data.get('declaracion_capacidad_legal_pdf_nombre', 'declaracion_capacidad.pdf')
                if len(declaracion_capacidad_legal_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'La declaración de capacidad legal no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar la declaración de capacidad legal'}), 400
        
        # Procesar cada documento de control (solo si están presentes)
        if data.get('antecedentes_fiscales_pdf'):
            try:
                antecedentes_fiscales_pdf = base64.b64decode(data['antecedentes_fiscales_pdf'])
                antecedentes_fiscales_pdf_nombre = data.get('antecedentes_fiscales_pdf_nombre', 'antecedentes_fiscales.pdf')
                if len(antecedentes_fiscales_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'Los antecedentes fiscales no pueden superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar los antecedentes fiscales'}), 400
        
        if data.get('antecedentes_disciplinarios_pdf'):
            try:
                antecedentes_disciplinarios_pdf = base64.b64decode(data['antecedentes_disciplinarios_pdf'])
                antecedentes_disciplinarios_pdf_nombre = data.get('antecedentes_disciplinarios_pdf_nombre', 'antecedentes_disciplinarios.pdf')
                if len(antecedentes_disciplinarios_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'Los antecedentes disciplinarios no pueden superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar los antecedentes disciplinarios'}), 400
        
        if data.get('antecedentes_judiciales_pdf'):
            try:
                antecedentes_judiciales_pdf = base64.b64decode(data['antecedentes_judiciales_pdf'])
                antecedentes_judiciales_pdf_nombre = data.get('antecedentes_judiciales_pdf_nombre', 'antecedentes_judiciales.pdf')
                if len(antecedentes_judiciales_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'Los antecedentes judiciales no pueden superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar los antecedentes judiciales'}), 400
        
        if data.get('redam_pdf'):
            try:
                redam_pdf = base64.b64decode(data['redam_pdf'])
                redam_pdf_nombre = data.get('redam_pdf_nombre', 'redam.pdf')
                if len(redam_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El certificado REDAM no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el certificado REDAM'}), 400
        
        if data.get('inhabilidades_sexuales_pdf'):
            try:
                inhabilidades_sexuales_pdf = base64.b64decode(data['inhabilidades_sexuales_pdf'])
                inhabilidades_sexuales_pdf_nombre = data.get('inhabilidades_sexuales_pdf_nombre', 'inhabilidades_sexuales.pdf')
                if len(inhabilidades_sexuales_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'La consulta de inhabilidades sexuales no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar la consulta de inhabilidades sexuales'}), 400
        
        # Validación condicional de certificación de funcionamiento
        emprendimiento_formalizado = data.get('emprendimiento_formalizado')
        # Comentado para pruebas - campo opcional
        # if emprendimiento_formalizado is None:
        #     return jsonify({'error': 'Debe especificar si el emprendimiento está formalizado'}), 400
        
        # Procesar documentos de funcionamiento según formalización
        matricula_mercantil_pdf = None
        matricula_mercantil_pdf_nombre = None
        facturas_6meses_pdf = None
        facturas_6meses_pdf_nombre = None
        publicaciones_redes_pdf = None
        publicaciones_redes_pdf_nombre = None
        registro_ventas_pdf = None
        registro_ventas_pdf_nombre = None
        
        if emprendimiento_formalizado:
            # Emprendimiento formalizado - matrícula mercantil y facturas opcionales para pruebas
            # if not data.get('matricula_mercantil_pdf'):
            #     return jsonify({'error': 'Para emprendimientos formalizados, la matrícula mercantil es obligatoria'}), 400
            # if not data.get('facturas_6meses_pdf'):
            #     return jsonify({'error': 'Para emprendimientos formalizados, las facturas de los últimos 6 meses son obligatorias'}), 400
            
            if data.get('matricula_mercantil_pdf'):
                try:
                    matricula_mercantil_pdf = base64.b64decode(data['matricula_mercantil_pdf'])
                    matricula_mercantil_pdf_nombre = data.get('matricula_mercantil_pdf_nombre', 'matricula_mercantil.pdf')
                    if len(matricula_mercantil_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'La matrícula mercantil no puede superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar la matrícula mercantil'}), 400
            
            if data.get('facturas_6meses_pdf'):
                try:
                    facturas_6meses_pdf = base64.b64decode(data['facturas_6meses_pdf'])
                    facturas_6meses_pdf_nombre = data.get('facturas_6meses_pdf_nombre', 'facturas_6meses.pdf')
                    if len(facturas_6meses_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'Las facturas de los últimos 6 meses no pueden superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar las facturas de los últimos 6 meses'}), 400
                
        else:
            # Emprendimiento informal - publicaciones de redes y registro de ventas opcionales para pruebas
            # if not data.get('publicaciones_redes_pdf'):
            #     return jsonify({'error': 'Para emprendimientos informales, las publicaciones de redes sociales son obligatorias'}), 400
            # if not data.get('registro_ventas_pdf'):
            #     return jsonify({'error': 'Para emprendimientos informales, el registro de ventas de los últimos 6 meses es obligatorio'}), 400
            
            if data.get('publicaciones_redes_pdf'):
                try:
                    publicaciones_redes_pdf = base64.b64decode(data['publicaciones_redes_pdf'])
                    publicaciones_redes_pdf_nombre = data.get('publicaciones_redes_pdf_nombre', 'publicaciones_redes.pdf')
                    if len(publicaciones_redes_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'Las publicaciones de redes sociales no pueden superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar las publicaciones de redes sociales'}), 400
            
            if data.get('registro_ventas_pdf'):
                try:
                    registro_ventas_pdf = base64.b64decode(data['registro_ventas_pdf'])
                    registro_ventas_pdf_nombre = data.get('registro_ventas_pdf_nombre', 'registro_ventas.pdf')
                    if len(registro_ventas_pdf) > 20 * 1024 * 1024:
                        return jsonify({'error': 'El registro de ventas no puede superar 20MB'}), 400
                except Exception as e:
                    return jsonify({'error': 'Error al procesar el registro de ventas'}), 400
        
        # Validación condicional de financiación de otras fuentes
        financiado_estado = data.get('financiado_estado')
        # Comentado para pruebas - campo opcional
        # if financiado_estado is None:
        #     return jsonify({'error': 'Debe especificar si el emprendimiento ha sido financiado por otros programas del Estado'}), 400
        
        # Procesar fuentes de financiación - NO usar valores por defecto para evitar sobrescribir datos existentes
        financiado_regalias = data.get('financiado_regalias') if 'financiado_regalias' in data else None
        financiado_camara_comercio = data.get('financiado_camara_comercio') if 'financiado_camara_comercio' in data else None
        financiado_incubadoras = data.get('financiado_incubadoras') if 'financiado_incubadoras' in data else None
        financiado_otro = data.get('financiado_otro') if 'financiado_otro' in data else None
        financiado_otro_texto = data.get('financiado_otro_texto') if 'financiado_otro_texto' in data else None
        
        if financiado_estado:
            # Si ha sido financiado, debe especificar al menos una fuente
            if not any([financiado_regalias, financiado_camara_comercio, financiado_incubadoras, financiado_otro]):
                return jsonify({'error': 'Si el emprendimiento ha sido financiado por otros programas del Estado, debe especificar al menos una fuente de financiación'}), 400
            
            # Si marcó "otro", debe proporcionar el texto
            if financiado_otro and not financiado_otro_texto:
                return jsonify({'error': 'Si selecciona "Otro" como fuente de financiación, debe especificar cuál'}), 400
        # ⚠️ EMERGENCIA: NO resetear variables de financiación
        # Este bloque causaba que si financiado_estado es None/False, se reseteen todos los valores
        # Dejamos las variables con los valores que vinieron del frontend (None si no están presentes)
        # else:
        #     # Si no ha sido financiado, resetear todas las fuentes a False
        #     financiado_regalias = False
        #     financiado_camara_comercio = False
        #     financiado_incubadoras = False
        #     financiado_otro = False
        #     financiado_otro_texto = None
        
        # Validación de declaraciones y aceptaciones (obligatorias para cumplimiento legal)
        declara_veraz = data.get('declara_veraz', False)
        declara_no_beneficiario = data.get('declara_no_beneficiario', False)
        acepta_terminos = data.get('acepta_terminos', False)
        
        # Validar que todas las declaraciones sean verdaderas
        if not declara_veraz or not declara_no_beneficiario or not acepta_terminos:
            return jsonify({'error': 'Las declaraciones y aceptaciones son obligatorias para inscribirse. Debe aceptar que la información es veraz, que no ha sido beneficiario de recursos públicos para este emprendimiento, y los términos y condiciones de la convocatoria.'}), 400
        
        # Fecha de aceptación para trazabilidad legal
        fecha_aceptacion_terminos = datetime.utcnow()
        
        # Lógica de cupos (modo abierto/bloqueado con lista de espera)
        modo = 'abierto'
        cupo_global_max = None
        cfg = CuposConfig.query.order_by(CuposConfig.id.desc()).first()
        if cfg:
            modo = (cfg.modo or 'abierto').strip()
            cupo_global_max = cfg.cupo_global_max

        estado_cuenta = 'inactiva'

        if modo == 'bloqueado':
            # Transacción: bloquear fila de municipio y contar
            with db.session.begin_nested():
                muni_row = (
                    db.session.query(MunicipioCupo)
                    .filter(MunicipioCupo.municipio_slug == data['municipio'])
                    .with_for_update()
                    .first()
                )

                # Conteos actuales (confirmados/pedientes activación)
                q_base = db.session.query(User).filter(
                    User.convocatoria == data['convocatoria']
                )
                total_confirmados = q_base.filter(User.estado_cuenta.in_(['activa', 'inactiva'])).count()
                muni_confirmados = q_base.filter(
                    User.municipio == data['municipio'],
                    User.estado_cuenta.in_(['activa', 'inactiva'])
                ).count()

                municipio_lleno = bool(muni_row) and muni_confirmados >= int(muni_row.cupo_max)
                global_lleno = cupo_global_max is not None and total_confirmados >= int(cupo_global_max)

                if municipio_lleno or global_lleno:
                    estado_cuenta = 'lista_espera'
                else:
                    estado_cuenta = 'inactiva'

        # Crear nuevo usuario solo si no existe
        if is_new_user:
            user = User(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email'],
            tipo_documento=data['tipo_documento'],
            numero_documento=data['numero_documento'],
            telefono=data.get('telefono'),
            fecha_nacimiento=fecha_nac,
            sexo=data.get('sexo'),
            estado_civil=data.get('estado_civil'),
            direccion=data.get('direccion'),
            municipio=data.get('municipio'),
            emprendimiento_nombre=data.get('emprendimiento_nombre'),
            emprendimiento_sector=sector_val,
            tipo_persona=tipo_persona_val,
            doc_terminos_pdf=doc_terminos_pdf,
            doc_terminos_pdf_nombre=doc_terminos_pdf_nombre,
            doc_uso_imagen_pdf=doc_uso_imagen_pdf,
            doc_uso_imagen_pdf_nombre=doc_uso_imagen_pdf_nombre,
            doc_plan_negocio_xls=doc_plan_negocio_xls,
            doc_plan_negocio_nombre=doc_plan_negocio_nombre,
            doc_vecindad_pdf=doc_vecindad_pdf,
            doc_vecindad_pdf_nombre=doc_vecindad_pdf_nombre,
            declaracion_capacidad_legal_pdf=declaracion_capacidad_legal_pdf,
            declaracion_capacidad_legal_pdf_nombre=declaracion_capacidad_legal_pdf_nombre,
            video_url=video_url,
            rut_pdf=rut_pdf,
            rut_pdf_nombre=rut_pdf_nombre,
            cedula_pdf=cedula_pdf,
            cedula_pdf_nombre=cedula_pdf_nombre,
            cedula_representante_pdf=cedula_representante_pdf,
            cedula_representante_pdf_nombre=cedula_representante_pdf_nombre,
            cert_existencia_pdf=cert_existencia_pdf,
            cert_existencia_pdf_nombre=cert_existencia_pdf_nombre,
            ruv_pdf=ruv_pdf,
            ruv_pdf_nombre=ruv_pdf_nombre,
            sisben_pdf=sisben_pdf,
            sisben_pdf_nombre=sisben_pdf_nombre,
            grupo_etnico_pdf=grupo_etnico_pdf,
            grupo_etnico_pdf_nombre=grupo_etnico_pdf_nombre,
            arn_pdf=arn_pdf,
            arn_pdf_nombre=arn_pdf_nombre,
            discapacidad_pdf=discapacidad_pdf,
            discapacidad_pdf_nombre=discapacidad_pdf_nombre,
            antecedentes_fiscales_pdf=antecedentes_fiscales_pdf,
            antecedentes_fiscales_pdf_nombre=antecedentes_fiscales_pdf_nombre,
            antecedentes_disciplinarios_pdf=antecedentes_disciplinarios_pdf,
            antecedentes_disciplinarios_pdf_nombre=antecedentes_disciplinarios_pdf_nombre,
            antecedentes_judiciales_pdf=antecedentes_judiciales_pdf,
            antecedentes_judiciales_pdf_nombre=antecedentes_judiciales_pdf_nombre,
            redam_pdf=redam_pdf,
            redam_pdf_nombre=redam_pdf_nombre,
            inhabilidades_sexuales_pdf=inhabilidades_sexuales_pdf,
            inhabilidades_sexuales_pdf_nombre=inhabilidades_sexuales_pdf_nombre,
            estado_control='completo',  # Todos los documentos de control están cargados
            resultado_certificados='pendiente',  # Pendiente de revisión administrativa
            # Certificación de funcionamiento
            emprendimiento_formalizado=emprendimiento_formalizado,
            matricula_mercantil_pdf=matricula_mercantil_pdf,
            matricula_mercantil_pdf_nombre=matricula_mercantil_pdf_nombre,
            facturas_6meses_pdf=facturas_6meses_pdf,
            facturas_6meses_pdf_nombre=facturas_6meses_pdf_nombre,
            publicaciones_redes_pdf=publicaciones_redes_pdf,
            publicaciones_redes_pdf_nombre=publicaciones_redes_pdf_nombre,
            registro_ventas_pdf=registro_ventas_pdf,
            registro_ventas_pdf_nombre=registro_ventas_pdf_nombre,
            # Financiación de otras fuentes
            financiado_estado=financiado_estado if financiado_estado is not None else False,
            financiado_regalias=financiado_regalias if financiado_regalias is not None else False,
            financiado_camara_comercio=financiado_camara_comercio if financiado_camara_comercio is not None else False,
            financiado_incubadoras=financiado_incubadoras if financiado_incubadoras is not None else False,
            financiado_otro=financiado_otro if financiado_otro is not None else False,
            financiado_otro_texto=financiado_otro_texto if financiado_otro_texto else '',
            # Declaraciones y aceptaciones
            declara_veraz=declara_veraz,
            declara_no_beneficiario=declara_no_beneficiario,
            acepta_terminos=acepta_terminos,
            fecha_aceptacion_terminos=fecha_aceptacion_terminos,
            # Estado de inscripción (formulario completo enviado)
            estado_inscripcion='enviada',
            paso_actual=8,
            formulario_enviado=True,
            fecha_ultimo_guardado=datetime.utcnow(),
            fecha_finalizacion=datetime.utcnow(),
            convocatoria=data.get('convocatoria'),
            estado_cuenta=estado_cuenta
            )
            if data.get('password'):
                user.set_password(data['password'])
            
            db.session.add(user)
            db.session.commit()
            
            # Crear estructura de carpetas en S3 para el nuevo usuario
            try:
                s3_service = S3Service()
                folder_result = s3_service.create_user_folders(user.id)
                if folder_result['success']:
                    print(f"SUCCESS: Carpetas creadas para usuario {user.id}: {folder_result['folders_created']} carpetas")
                else:
                    print(f"WARNING: Error creando carpetas para usuario {user.id}: {folder_result.get('error', 'Error desconocido')}")
            except Exception as e:
                print(f"WARNING: Error creando carpetas S3 para usuario {user.id}: {str(e)}")
                # No fallar la creación del usuario por problemas de S3
        else:
            # Usuario existente - solo actualizar campos adicionales
            user.estado_inscripcion = 'enviada'
            user.paso_actual = 8
            user.formulario_enviado = True
            user.fecha_ultimo_guardado = datetime.utcnow()
            user.fecha_finalizacion = datetime.utcnow()
            
            # Actualizar campos adicionales que podrían haber cambiado
            user.doc_terminos_pdf = doc_terminos_pdf
            user.doc_terminos_pdf_nombre = doc_terminos_pdf_nombre
            user.doc_uso_imagen_pdf = doc_uso_imagen_pdf
            user.doc_uso_imagen_pdf_nombre = doc_uso_imagen_pdf_nombre
            user.doc_plan_negocio_xls = doc_plan_negocio_xls
            user.doc_plan_negocio_nombre = doc_plan_negocio_nombre
            user.doc_vecindad_pdf = doc_vecindad_pdf
            user.doc_vecindad_pdf_nombre = doc_vecindad_pdf_nombre
            user.declaracion_capacidad_legal_pdf = declaracion_capacidad_legal_pdf
            user.declaracion_capacidad_legal_pdf_nombre = declaracion_capacidad_legal_pdf_nombre
            user.video_url = video_url
            user.rut_pdf = rut_pdf
            user.rut_pdf_nombre = rut_pdf_nombre
            user.cedula_pdf = cedula_pdf
            user.cedula_pdf_nombre = cedula_pdf_nombre
            user.cedula_representante_pdf = cedula_representante_pdf
            user.cedula_representante_pdf_nombre = cedula_representante_pdf_nombre
            user.cert_existencia_pdf = cert_existencia_pdf
            user.cert_existencia_pdf_nombre = cert_existencia_pdf_nombre
            user.ruv_pdf = ruv_pdf
            user.ruv_pdf_nombre = ruv_pdf_nombre
            user.sisben_pdf = sisben_pdf
            user.sisben_pdf_nombre = sisben_pdf_nombre
            user.grupo_etnico_pdf = grupo_etnico_pdf
            user.grupo_etnico_pdf_nombre = grupo_etnico_pdf_nombre
            user.arn_pdf = arn_pdf
            user.arn_pdf_nombre = arn_pdf_nombre
            user.discapacidad_pdf = discapacidad_pdf
            user.discapacidad_pdf_nombre = discapacidad_pdf_nombre
            user.antecedentes_fiscales_pdf = antecedentes_fiscales_pdf
            user.antecedentes_fiscales_pdf_nombre = antecedentes_fiscales_pdf_nombre
            user.antecedentes_disciplinarios_pdf = antecedentes_disciplinarios_pdf
            user.antecedentes_disciplinarios_pdf_nombre = antecedentes_disciplinarios_pdf_nombre
            user.antecedentes_judiciales_pdf = antecedentes_judiciales_pdf
            user.antecedentes_judiciales_pdf_nombre = antecedentes_judiciales_pdf_nombre
            user.redam_pdf = redam_pdf
            user.redam_pdf_nombre = redam_pdf_nombre
            user.inhabilidades_sexuales_pdf = inhabilidades_sexuales_pdf
            user.inhabilidades_sexuales_pdf_nombre = inhabilidades_sexuales_pdf_nombre
            user.estado_control = 'completo'
            user.resultado_certificados = 'pendiente'
            user.emprendimiento_formalizado = emprendimiento_formalizado
            user.matricula_mercantil_pdf = matricula_mercantil_pdf
            user.matricula_mercantil_pdf_nombre = matricula_mercantil_pdf_nombre
            user.facturas_6meses_pdf = facturas_6meses_pdf
            user.facturas_6meses_pdf_nombre = facturas_6meses_pdf_nombre
            user.publicaciones_redes_pdf = publicaciones_redes_pdf
            user.publicaciones_redes_pdf_nombre = publicaciones_redes_pdf_nombre
            user.registro_ventas_pdf = registro_ventas_pdf
            user.registro_ventas_pdf_nombre = registro_ventas_pdf_nombre
            
            # ⚠️ EMERGENCIA: NO actualizar campos de financiación (Paso 10) aquí
            # Ya fueron actualizados en el bloque anterior (líneas 193-203)
            # user.financiado_estado = financiado_estado
            # user.financiado_regalias = financiado_regalias
            # user.financiado_camara_comercio = financiado_camara_comercio
            # user.financiado_incubadoras = financiado_incubadoras
            # user.financiado_otro = financiado_otro
            # user.financiado_otro_texto = financiado_otro_texto
            
            # Declaraciones del Paso 11 ya fueron actualizadas en líneas 198-203
            # user.declara_veraz = declara_veraz
            # user.declara_no_beneficiario = declara_no_beneficiario
            # user.acepta_terminos = acepta_terminos
            user.fecha_aceptacion_terminos = fecha_aceptacion_terminos
            
            db.session.commit()

        # Log de registro con estado de documentos diferenciales, control y funcionamiento
        try:
            detalles_log = f"Registro {'lista_espera' if estado_cuenta=='lista_espera' else 'confirmado'} en {user.municipio} (conv {user.convocatoria})"
            detalles_log += f". Control: {user.estado_control} (todos los certificados de control cargados)"
            
            # Información de funcionamiento
            tipo_funcionamiento = "formalizado" if emprendimiento_formalizado else "informal"
            docs_funcionamiento = []
            if emprendimiento_formalizado:
                if matricula_mercantil_pdf:
                    docs_funcionamiento.append("matrícula mercantil")
                if facturas_6meses_pdf:
                    docs_funcionamiento.append("facturas 6 meses")
            else:
                if publicaciones_redes_pdf:
                    docs_funcionamiento.append("publicaciones redes")
                if registro_ventas_pdf:
                    docs_funcionamiento.append("registro ventas")
            
            detalles_log += f". Funcionamiento: {tipo_funcionamiento} ({', '.join(docs_funcionamiento)})"
            
            # Información de financiación
            financiacion_info = "No financiado"
            if financiado_estado:
                fuentes_financiacion = []
                if financiado_regalias:
                    fuentes_financiacion.append("Regalías")
                if financiado_camara_comercio:
                    fuentes_financiacion.append("Cámara de Comercio")
                if financiado_incubadoras:
                    fuentes_financiacion.append("Incubadoras")
                if financiado_otro:
                    fuentes_financiacion.append(f"Otro ({financiado_otro_texto})")
                financiacion_info = f"Financiado por: {', '.join(fuentes_financiacion)}"
            
            detalles_log += f". Financiación: {financiacion_info}"
            
            # Información de declaraciones (para trazabilidad legal)
            declaraciones_info = f"Declaraciones aceptadas: Veraz={declara_veraz}, No beneficiario={declara_no_beneficiario}, Términos={acepta_terminos} el {fecha_aceptacion_terminos.strftime('%Y-%m-%d %H:%M:%S')}"
            detalles_log += f". {declaraciones_info}"
            
            if docs_diferenciales_cargados:
                detalles_log += f". Docs diferenciales cargados: {', '.join(docs_diferenciales_cargados)}"
            if docs_diferenciales_pendientes:
                detalles_log += f". Docs diferenciales pendientes/subsanables: {', '.join(docs_diferenciales_pendientes)}"
            
            db.session.add(LogActividad(
                usuario_id=user.id,
                accion='register',
                detalles=detalles_log
            ))
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'message': 'La inscripción se ha registrado con éxito. Espere a la aprobación del administrador. Le informaremos al correo registrado.',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/save-partial', methods=['POST'])
def save_partial():
    """Guardar progreso parcial del formulario de inscripción"""
    try:
        data = request.json
        user_id = data.get('user_id')
        numero_documento = data.get('numero_documento')
        paso = data.get('paso', 1)
        
        # Buscar usuario por ID o por número de documento
        if user_id:
            user = User.query.get_or_404(user_id)
        elif numero_documento:
            user = User.query.filter_by(numero_documento=numero_documento).first()
            if not user:
                # Si el usuario no existe, crear uno nuevo (como en register-initial)
                user = User(
                    nombre=data.get('nombre', ''),
                    apellido=data.get('apellido', ''),
                    email=data.get('email', ''),
                    tipo_documento=data.get('tipo_documento', ''),
                    numero_documento=numero_documento,
                    telefono=data.get('telefono', ''),
                    fecha_nacimiento=datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date() if data.get('fecha_nacimiento') else None,
                    sexo=data.get('sexo', ''),
                    estado_civil=data.get('estado_civil', ''),
                    direccion=data.get('direccion', ''),
                    municipio=data.get('municipio', ''),
                    corregimiento_vereda=data.get('corregimiento_vereda', ''),
                    emprendimiento_nombre=data.get('emprendimiento_nombre', ''),
                    emprendimiento_sector=data.get('emprendimiento_sector', ''),
                    tipo_persona=data.get('tipo_persona', ''),
                    convocatoria=data.get('convocatoria', ''),
                    estado_inscripcion='en_proceso',
                    paso_actual=paso,
                    formulario_enviado=False,
                    fecha_ultimo_guardado=datetime.utcnow(),
                    estado_cuenta='inscrito',
                    rol='usuario'
                )
                # Establecer una contraseña temporal si no se proporciona
                if data.get('password'):
                    user.set_password(data['password'])
                else:
                    user.set_password('temp_password_123')  # Contraseña temporal
                
                db.session.add(user)
                db.session.flush()  # Para obtener el ID
                
                # Crear estructura de carpetas en S3 para el nuevo usuario
                try:
                    s3_service = S3Service()
                    folder_result = s3_service.create_user_folders(user.id)
                    if folder_result['success']:
                        print(f"SUCCESS: Carpetas creadas para usuario {user.id}: {folder_result['folders_created']} carpetas")
                    else:
                        print(f"WARNING: Error creando carpetas para usuario {user.id}: {folder_result.get('error', 'Error desconocido')}")
                except Exception as e:
                    print(f"WARNING: Error creando carpetas S3 para usuario {user.id}: {str(e)}")
                    # No fallar la creación del usuario por problemas de S3
        else:
            return jsonify({'error': 'ID de usuario o número de documento requerido'}), 400
        
        # Verificar que el formulario no haya sido enviado
        if user.formulario_enviado:
            return jsonify({'error': 'El formulario ya ha sido enviado y no se puede modificar'}), 400
        
        # Actualizar campos según el paso
        if paso >= 1:  # Datos generales
            if data.get('nombre'): user.nombre = data['nombre']
            if data.get('apellido'): user.apellido = data['apellido']
            if data.get('email'): user.email = data['email']
            if data.get('tipo_documento'): user.tipo_documento = data['tipo_documento']
            if data.get('numero_documento'): user.numero_documento = data['numero_documento']
            if data.get('telefono'): user.telefono = data['telefono']
            if data.get('fecha_nacimiento'): 
                user.fecha_nacimiento = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
            if data.get('sexo'): user.sexo = data['sexo']
            if data.get('estado_civil'): user.estado_civil = data['estado_civil']
            if data.get('direccion'): user.direccion = data['direccion']
            if data.get('municipio'): user.municipio = data['municipio']
            if data.get('corregimiento_vereda'): user.corregimiento_vereda = data['corregimiento_vereda']
            if data.get('emprendimiento_nombre'): user.emprendimiento_nombre = data['emprendimiento_nombre']
            if data.get('emprendimiento_sector'): user.emprendimiento_sector = data['emprendimiento_sector']
            if data.get('tipo_persona'): user.tipo_persona = data['tipo_persona']
            if data.get('convocatoria'): user.convocatoria = data['convocatoria']
        
        if paso >= 2:  # Población diferencial
            if 'mujer_cabeza_familia' in data:
                user.mujer_cabeza_familia = data['mujer_cabeza_familia']
            if 'victima_conflicto' in data:
                user.victima_conflicto = data['victima_conflicto']
            if 'persona_discapacidad' in data:
                user.persona_discapacidad = data['persona_discapacidad']
            if 'pertenencia_etnica' in data:
                user.pertenencia_etnica = data['pertenencia_etnica']
            if 'sisben_grupo' in data:
                user.sisben_grupo = data['sisben_grupo']
            if 'persona_reincorporacion' in data:
                user.persona_reincorporacion = data['persona_reincorporacion']
        
        if paso >= 3:  # Emprendimiento
            if 'tiempo_funcionamiento' in data:
                user.tiempo_funcionamiento = data['tiempo_funcionamiento']
            if 'empleos_generados' in data:
                user.empleos_generados = data['empleos_generados']
            if 'acceso_mercados' in data:
                user.acceso_mercados = data['acceso_mercados']
        
        if paso >= 6:  # Funcionamiento
            if 'emprendimiento_formalizado' in data:
                user.emprendimiento_formalizado = data['emprendimiento_formalizado']
        
        # ⚠️ EMERGENCIA: Código de actualización del Paso 7 (Financiación) DESHABILITADO
        # Este código estaba sobrescribiendo los datos del Paso 10 con valores por defecto False
        # Los datos del Paso 10 se guardan SOLO cuando el usuario completa ese paso específico
        # NO se deben actualizar en finalizaciones posteriores
        # if paso >= 7:  # Financiación
        #     if 'financiado_estado' in data:
        #         user.financiado_estado = data['financiado_estado']
        #         user.financiado_regalias = data.get('financiado_regalias', False)
        #         user.financiado_camara_comercio = data.get('financiado_camara_comercio', False)
        #         user.financiado_incubadoras = data.get('financiado_incubadoras', False)
        #         user.financiado_otro = data.get('financiado_otro', False)
        #         user.financiado_otro_texto = data.get('financiado_otro_texto', '')
        
        if paso >= 8:  # Declaraciones
            if 'declara_veraz' in data:
                user.declara_veraz = data['declara_veraz']
            if 'declara_no_beneficiario' in data:
                user.declara_no_beneficiario = data['declara_no_beneficiario']
            if 'acepta_terminos' in data:
                user.acepta_terminos = data['acepta_terminos']
        
        # NO procesar archivos aquí - eso lo hace uploadFiles() por separado
        # Esta función solo guarda datos del formulario
        archivos_guardados = []

        
        # Actualizar progreso
        user.paso_actual = max(user.paso_actual, paso)
        user.fecha_ultimo_guardado = datetime.utcnow()
        
        # Determinar estado de inscripción
        if paso == 8 and user.declara_veraz and user.declara_no_beneficiario and user.acepta_terminos:
            user.estado_inscripcion = 'completada'
        else:
            user.estado_inscripcion = 'en_progreso'
        
        db.session.commit()
        
        # Log de guardado parcial
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='guardado_parcial',
            detalles=f"Guardado parcial paso {paso}. Estado: {user.estado_inscripcion}"
        ))
        db.session.commit()
        
        # Crear mensaje de confirmación
        mensaje = 'Progreso guardado exitosamente'
        
        return jsonify({
            'message': mensaje,
            'user_id': user.id,
            'paso_actual': user.paso_actual,
            'estado_inscripcion': user.estado_inscripcion
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al guardar progreso: {str(e)}'}), 500

@user_bp.route('/upload-file', methods=['POST'])
def upload_file():
    """Subir un archivo individual durante el proceso de registro"""
    try:
        print(f"=== UPLOAD FILE ENDPOINT ===")
        data = request.json
        numero_documento = data.get('numero_documento')
        campo = data.get('campo')  # ej: 'rut_pdf'
        archivo_base64 = data.get('archivo')
        nombre_archivo = data.get('nombre_archivo')
        
        print(f"Datos recibidos: numero_documento={numero_documento}, campo={campo}, nombre_archivo={nombre_archivo}")
        print(f"Archivo base64 length: {len(archivo_base64) if archivo_base64 else 'None'}")
        
        if not all([numero_documento, campo, archivo_base64, nombre_archivo]):
            print(f"ERROR: Faltan datos requeridos")
            return jsonify({'error': 'Faltan datos requeridos'}), 400
        
        # Buscar usuario
        user = User.query.filter_by(numero_documento=numero_documento).first()
        if not user:
            print(f"ERROR: Usuario no encontrado: {numero_documento}")
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        print(f"Usuario encontrado: {user.id}")
        
        # Verificar si el archivo ya está subido (permitir sobrescribir)
        current_file_key = getattr(user, campo, None)
        if current_file_key:
            # Convertir bytes a string si es necesario
            if isinstance(current_file_key, bytes):
                current_file_key = current_file_key.decode('utf-8')
            print(f"ARCHIVO YA EXISTE, PERMITIENDO SOBRESCRIBIR: {campo} = {current_file_key}")
            # No retornar aquí, continuar con la subida para sobrescribir
        
        # Determinar el tipo de documento basado en el campo y tipo de persona
        print(f"Tipo de persona del usuario: {user.tipo_persona}")
        
        # Mapeo base para documentos que no dependen del tipo de persona
        doc_type_mapping = {
            'doc_terminos_pdf': 'obligatorios/tdr',
            'doc_uso_imagen_pdf': 'obligatorios/uso-imagen',
            'doc_plan_negocio_xls': 'obligatorios/plan-negocio',
            'doc_vecindad_pdf': 'obligatorios/vecindad',
            # 'declaracion_juramentada_pdf': 'obligatorios/declaracion-juramentada',
            'cedula_pdf': 'por-tipo/persona-natural/cedula',
            'cedula_representante_pdf': 'por-tipo/persona-juridica/cedula-representante',
            'cert_existencia_pdf': 'por-tipo/persona-juridica/certificado-existencia',
            # 'camara_comercio_pdf': 'por-tipo/persona-juridica/camara-comercio',  # TEMPORAL: Comentado
            'ruv_pdf': 'diferenciales/ruv',
            'sisben_pdf': 'diferenciales/sisben',
            'grupo_etnico_pdf': 'diferenciales/grupo-etnico',
            'arn_pdf': 'diferenciales/arn',
            'discapacidad_pdf': 'diferenciales/discapacidad',
            'mujer_cabeza_familia_pdf': 'diferenciales/mujer-cabeza-familia',
            'persona_discapacidad_pdf': 'diferenciales/persona-discapacidad',
            'antecedentes_fiscales_pdf': 'control/antecedentes-fiscales',
            'antecedentes_disciplinarios_pdf': 'control/antecedentes-disciplinarios',
            'antecedentes_judiciales_pdf': 'control/antecedentes-judiciales',
            'antecedentes_contraloria_pdf': 'control/antecedentes-contraloria',
            'antecedentes_procuraduria_pdf': 'control/antecedentes-procuraduria',
            'rnmc_pdf': 'control/rnmc',
            'redam_pdf': 'control/redam',
            'inhabilidades_sexuales_pdf': 'control/inhabilidades-sexuales',
            'declaracion_capacidad_legal_pdf': 'obligatorios/declaracion-capacidad',
            'matricula_mercantil_pdf': 'funcionamiento/matricula-mercantil',
            'facturas_6meses_pdf': 'funcionamiento/facturas-6meses',
            'facturas_venta_pdf': 'funcionamiento/facturas-venta',
            'publicaciones_redes_pdf': 'funcionamiento/publicaciones-redes',
            'redes_sociales_pdf': 'funcionamiento/redes-sociales',
            'registro_ventas_pdf': 'funcionamiento/registro-ventas',
            'comprobantes_ventas_pdf': 'funcionamiento/comprobantes-ventas',
            'video_presentacion': 'videos/presentacion'
        }
        
        # Mapeo especial para RUT basado en tipo de persona
        if campo == 'rut_pdf':
            if user.tipo_persona == 'juridica':
                doc_type = 'por-tipo/persona-juridica/rut-empresa'
                print(f"RUT para persona jurídica: {doc_type}")
            else:
                doc_type = 'por-tipo/persona-natural/rut'
                print(f"RUT para persona natural: {doc_type}")
        else:
            doc_type = doc_type_mapping.get(campo)
        
        if not doc_type:
            print(f"ERROR: Tipo de documento no válido: {campo}")
            return jsonify({'error': f'Tipo de documento no válido: {campo}'}), 400
        
        print(f"Tipo de documento: {doc_type}")
        
        # Decodificar archivo
        try:
            print(f"Decodificando archivo base64...")
            file_data = base64.b64decode(archivo_base64)
            print(f"Archivo decodificado, tamaño: {len(file_data)} bytes")
        except Exception as e:
            return jsonify({'error': f'Error decodificando archivo: {str(e)}'}), 400
        
        # Subir a S3
        print(f"Iniciando subida a S3...")
        s3_service = S3Service()
        file_key = s3_service.upload_file_data(
            file_data=file_data,
            user_id=user.id,
            document_type=doc_type,
            filename=nombre_archivo
        )
        
        if not file_key:
            print(f"ERROR: No se pudo subir archivo a S3")
            return jsonify({'error': 'Error subiendo archivo a S3'}), 500
        
        print(f"Archivo subido exitosamente a S3: {file_key}")
        
        # Mapeo de nombres del frontend a nombres del modelo
        field_mapping = {
            'antecedentes_contraloria_pdf': 'antecedentes_fiscales_pdf',
            'antecedentes_procuraduria_pdf': 'antecedentes_disciplinarios_pdf',
            'rnmc_pdf': 'inhabilidades_sexuales_pdf',
            'facturas_venta_pdf': 'facturas_6meses_pdf',
            'redes_sociales_pdf': 'publicaciones_redes_pdf',
            'comprobantes_ventas_pdf': 'registro_ventas_pdf'
        }
        
        # Usar el nombre mapeado si existe, de lo contrario usar el campo tal como viene
        db_field = field_mapping.get(campo, campo)
        
        # Actualizar usuario con la referencia del archivo
        print(f"Actualizando usuario en base de datos (campo: {campo} -> {db_field})...")
        try:
            setattr(user, db_field, file_key.encode('utf-8'))
        except Exception:
            setattr(user, db_field, file_key)
        setattr(user, f'{db_field}_nombre', nombre_archivo)
        user.fecha_ultimo_guardado = datetime.utcnow()
        
        db.session.commit()
        print(f"Usuario actualizado exitosamente")
        
        return jsonify({
            'message': 'Archivo subido exitosamente',
            'file_key': file_key,
            'campo': campo
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"ERROR en upload_file: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/get-partial/<int:user_id>', methods=['GET'])
def get_partial(user_id):
    """Obtener progreso parcial del usuario"""
    try:
        user = User.query.get_or_404(user_id)
        
        return jsonify({
            'user_data': user.to_dict(),
            'paso_actual': user.paso_actual,
            'estado_inscripcion': user.estado_inscripcion,
            'formulario_enviado': user.formulario_enviado,
            'fecha_ultimo_guardado': user.fecha_ultimo_guardado.isoformat() if user.fecha_ultimo_guardado else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener progreso: {str(e)}'}), 500

@user_bp.route('/resume-process', methods=['POST'])
def resume_process():
    """Retomar proceso de inscripción por número de documento"""
    try:
        data = request.json
        numero_documento = data.get('numero_documento')
        
        if not numero_documento:
            return jsonify({'error': 'Número de documento requerido'}), 400
        
        # Buscar usuario por número de documento (usando TRIM para ignorar espacios)
        user = User.query.filter(db.func.trim(User.numero_documento) == numero_documento.strip()).first()
        
        if not user:
            return jsonify({'error': 'No se encontró un proceso iniciado con este número de documento'}), 404
        
        # Verificar que el formulario no haya sido enviado
        if user.formulario_enviado:
            return jsonify({'error': 'El formulario ya ha sido enviado y no se puede modificar'}), 400
        
        # Preparar datos del formulario para el frontend
        form_data = {
            'nombre': user.nombre or '',
            'apellido': user.apellido or '',
            'email': user.email or '',
            'tipo_documento': user.tipo_documento or '',
            'numero_documento': user.numero_documento or '',
            'telefono': user.telefono or '',
            'fecha_nacimiento': user.fecha_nacimiento.strftime('%Y-%m-%d') if user.fecha_nacimiento else '',
            'sexo': user.sexo or '',
            'estado_civil': user.estado_civil or '',
            'direccion': user.direccion or '',
            'municipio': user.municipio or '',
            'emprendimiento_nombre': user.emprendimiento_nombre or '',
            'emprendimiento_sector': user.emprendimiento_sector or '',
            'tipo_persona': user.tipo_persona or '',
            'convocatoria': user.convocatoria or '',
            # Campos de población diferencial (Paso 2)
            'mujer_cabeza_familia': user.mujer_cabeza_familia or False,
            'victima_conflicto': user.victima_conflicto or False,
            'persona_discapacidad': user.persona_discapacidad or False,
            'pertenencia_etnica': user.pertenencia_etnica or False,
            'sisben_grupo': user.sisben_grupo or '',
            'persona_reincorporacion': user.persona_reincorporacion or False,
            # Campos de emprendimiento (Paso 3)
            'tiempo_funcionamiento': user.tiempo_funcionamiento or '',
            'empleos_generados': user.empleos_generados or '',
            'acceso_mercados': user.acceso_mercados or '',
            'emprendimiento_formalizado': user.emprendimiento_formalizado,
            'financiado_estado': user.financiado_estado,
            'financiado_regalias': user.financiado_regalias or False,
            'financiado_camara_comercio': user.financiado_camara_comercio or False,
            'financiado_incubadoras': user.financiado_incubadoras or False,
            'financiado_otro': user.financiado_otro or False,
            'financiado_otro_texto': user.financiado_otro_texto or '',
            'declara_veraz': user.declara_veraz or False,
            'declara_no_beneficiario': user.declara_no_beneficiario or False,
            'acepta_terminos': user.acepta_terminos or False,
            'password': '',  # No devolver la contraseña
            'confirm_password': ''
        }
        
        # Helper para convertir campos de archivos
        def get_file_field_value(field_value):
            """Convierte bytes a string si es necesario, o retorna el valor directamente si es string o None"""
            if field_value is None:
                return None
            if isinstance(field_value, bytes):
                # Convertir bytes a string (asumiendo que es una ruta UTF-8)
                return field_value.decode('utf-8')
            return field_value
        
        # Campos de archivos PDF - para que el frontend sepa qué documentos ya están subidos
        file_fields = [
            'doc_terminos_pdf', 'doc_uso_imagen_pdf', 'doc_plan_negocio_xls', 'doc_vecindad_pdf',
            'rut_pdf', 'cedula_pdf', 'cedula_representante_pdf', 'cert_existencia_pdf',
            'ruv_pdf', 'sisben_pdf', 'grupo_etnico_pdf', 'arn_pdf', 'discapacidad_pdf',
            'mujer_cabeza_familia_pdf', 'persona_discapacidad_pdf',
            'antecedentes_fiscales_pdf', 'antecedentes_disciplinarios_pdf',
            'antecedentes_judiciales_pdf', 'redam_pdf', 'inhabilidades_sexuales_pdf',
            'declaracion_capacidad_legal_pdf', 'matricula_mercantil_pdf',
            'facturas_6meses_pdf', 'publicaciones_redes_pdf', 'registro_ventas_pdf'
        ]
        
        for field in file_fields:
            field_value = getattr(user, field, None)
            form_data[field] = get_file_field_value(field_value)
        
        # Agregar campos con nombres alternativos que espera el frontend
        # (mapeo inverso: del modelo al frontend)
        form_data['antecedentes_contraloria_pdf'] = get_file_field_value(user.antecedentes_fiscales_pdf)
        form_data['antecedentes_procuraduria_pdf'] = get_file_field_value(user.antecedentes_disciplinarios_pdf)
        form_data['rnmc_pdf'] = get_file_field_value(user.inhabilidades_sexuales_pdf)
        form_data['facturas_venta_pdf'] = get_file_field_value(user.facturas_6meses_pdf)
        form_data['redes_sociales_pdf'] = get_file_field_value(user.publicaciones_redes_pdf)
        form_data['comprobantes_ventas_pdf'] = get_file_field_value(user.registro_ventas_pdf)
        
        # Agregar video_url si existe (el frontend usa video_presentacion pero el backend guarda video_url)
        if user.video_url:
            form_data['video_presentacion'] = user.video_url
            form_data['video_url'] = user.video_url
        
        # Log de retomar proceso
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='retomar_proceso',
            detalles=f"Usuario retomó proceso desde paso {user.paso_actual}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': 'Proceso cargado exitosamente',
            'user_id': user.id,
            'formData': form_data,
            'currentStep': user.paso_actual,
            'estado_inscripcion': user.estado_inscripcion,
            'fecha_ultimo_guardado': user.fecha_ultimo_guardado.isoformat() if user.fecha_ultimo_guardado else None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al cargar el proceso: {str(e)}'}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    try:
        # request.json puede lanzar BadRequest si el body no es JSON válido.
        # En API Gateway/Lambda a veces el body llega como texto o base64.
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            raw = request.get_data(cache=False) or b""
            raw_text = ""
            if raw:
                try:
                    raw_text = raw.decode("utf-8", errors="strict")
                except Exception:
                    raw_text = raw.decode("latin-1", errors="ignore")
                raw_text = (raw_text or "").strip()

            parsed = None
            if raw_text:
                # Intento 1: JSON directo
                try:
                    parsed = json.loads(raw_text)
                except Exception:
                    parsed = None

                # Intento 2: base64 JSON
                if parsed is None:
                    try:
                        decoded = base64.b64decode(raw_text, validate=True)
                        parsed = json.loads(decoded.decode("utf-8", errors="strict"))
                    except (binascii.Error, ValueError, json.JSONDecodeError, UnicodeDecodeError):
                        parsed = None

            data = parsed if isinstance(parsed, dict) else {}
        
        # Validar campos obligatorios
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email y contraseña son obligatorios'}), 400
        
        # Buscar usuario por email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Verificar estado de la cuenta
        if user.estado_cuenta == 'inactiva':
            return jsonify({'error': 'Tu cuenta está inactiva. Contacta al administrador para activarla.'}), 401
        elif user.estado_cuenta == 'suspendida':
            return jsonify({'error': 'Tu cuenta está suspendida. Contacta al administrador.'}), 401
        
        # Generar token JWT (access) + refresh token (30 días)
        token = generate_token(user.id)
        if not token:
            return jsonify({'error': 'Error al generar token de autenticación'}), 500

        refresh_token = generate_refresh_token(user.id)
        if not refresh_token:
            return jsonify({'error': 'Error al generar token de autenticación'}), 500

        resp = make_response(jsonify({
            'message': 'Inicio de sesión exitoso',
            'user': user.to_dict(),
            'token': token,
            'expires_in': 24 * 60 * 60,
            'refresh_expires_in': 30 * 24 * 60 * 60
        }), 200)

        host = (request.host or "").split(":")[0].lower()
        domain = ".emprendimiento-narino.com" if host.endswith("emprendimiento-narino.com") else None
        secure = (request.scheme == "https") or host.endswith("emprendimiento-narino.com")
        same_site = "None" if secure else "Lax"

        resp.set_cookie(
            "refreshToken",
            refresh_token,
            max_age=30 * 24 * 60 * 60,
            httponly=True,
            secure=secure,
            samesite=same_site,
            path="/",
            domain=domain
        )
        
        return resp
        
    except BadRequest:
        return jsonify({'error': 'JSON inválido en la solicitud'}), 400
    except Exception as e:
        print(f"ERROR en login: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@user_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    resp = make_response(jsonify({'message': 'Sesión cerrada exitosamente'}), 200)
    host = (request.host or "").split(":")[0].lower()
    domain = ".emprendimiento-narino.com" if host.endswith("emprendimiento-narino.com") else None
    resp.delete_cookie("refreshToken", path="/", domain=domain)
    return resp

@user_bp.route('/refresh', methods=['POST'])
def refresh():
    """Renovar el access token usando refresh token (cookie HttpOnly o body)."""
    try:
        rt = request.cookies.get("refreshToken")
        if not rt:
            data = request.get_json(silent=True) or {}
            if isinstance(data, dict):
                rt = data.get("refreshToken") or data.get("refresh_token")

        if not rt:
            return jsonify({'success': False, 'error': 'Refresh token requerido'}), 401

        user = verify_refresh_token(rt)
        if not user:
            return jsonify({'success': False, 'error': 'Refresh token inválido o expirado'}), 401

        token = generate_token(user.id)
        if not token:
            return jsonify({'success': False, 'error': 'Error al generar token'}), 500

        new_rt = generate_refresh_token(user.id)
        if not new_rt:
            return jsonify({'success': False, 'error': 'Error al generar refresh token'}), 500

        resp = make_response(jsonify({
            'success': True,
            'token': token,
            'expires_in': 24 * 60 * 60,
            'refresh_expires_in': 30 * 24 * 60 * 60
        }), 200)

        host = (request.host or "").split(":")[0].lower()
        domain = ".emprendimiento-narino.com" if host.endswith("emprendimiento-narino.com") else None
        secure = (request.scheme == "https") or host.endswith("emprendimiento-narino.com")
        same_site = "None" if secure else "Lax"

        resp.set_cookie(
            "refreshToken",
            new_rt,
            max_age=30 * 24 * 60 * 60,
            httponly=True,
            secure=secure,
            samesite=same_site,
            path="/",
            domain=domain
        )

        return resp
    except Exception:
        return jsonify({'success': False, 'error': 'Error al renovar token'}), 500

@user_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        
        if not data.get('email'):
            return jsonify({'error': 'Email es obligatorio'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            # Por seguridad, no revelar si el email existe o no
            return jsonify({'message': 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.'}), 200
        
        # Generar token de recuperación
        token = user.generate_reset_token()
        db.session.commit()
        
        # Enviar email con el link de recuperación
        from src.services.email_service import send_password_reset_email
        nombre_completo = f"{(user.nombre or '').strip()} {(user.apellido or '').strip()}".strip()
        email_enviado = send_password_reset_email(user.email, token, nombre_completo)
        
        if not email_enviado:
            # Si falla el envío (ej. EMAIL_APP_PASSWORD no configurada), no revelar el token
            return jsonify({
                'message': 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña. Si no lo recibes, contacta al administrador.'
            }), 200
        
        return jsonify({
            'message': 'Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña en los próximos minutos. Revisa tu bandeja de entrada y spam.'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        
        required_fields = ['token', 'new_password', 'confirm_password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es obligatorio'}), 400
        
        # Validar nueva contraseña
        if not validate_password(data['new_password']):
            return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'}), 400
        
        # Validar que las contraseñas coincidan
        if data['new_password'] != data['confirm_password']:
            return jsonify({'error': 'Las contraseñas no coinciden'}), 400
        
        # Buscar usuario por token
        user = User.query.filter_by(token_reset=data['token']).first()
        
        if not user or not user.token_reset_expira or user.token_reset_expira < datetime.utcnow():
            return jsonify({'error': 'Token inválido o expirado'}), 400
        
        # Actualizar contraseña
        user.set_password(data['new_password'])
        user.token_reset = None
        user.token_reset_expira = None
        
        db.session.commit()
        
        return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    data = current_user.to_dict()
    data['municipio'] = get_preferred_municipio(
        current_user.id,
        f"{(current_user.nombre or '').strip()} {(current_user.apellido or '').strip()}".strip(),
        current_user.municipio,
    )
    try:
        from src.services.s3_service import S3Service
        import os

        s3 = S3Service()
        def latest_url(folder: str):
            prefix = f"usuarios/{current_user.id}/{folder}/"
            resp = s3.s3_client.list_objects_v2(Bucket=s3.bucket_name, Prefix=prefix)
            contents = resp.get('Contents') or []
            images = [o for o in contents if os.path.splitext((o.get('Key') or ''))[1].lower() in ['.jpg', '.jpeg', '.png', '.webp']]
            if not images:
                return None
            latest = max(images, key=lambda o: o.get('LastModified'))
            key = latest.get('Key')
            if not key:
                return None
            return s3.s3_client.generate_presigned_url('get_object', Params={'Bucket': s3.bucket_name, 'Key': key}, ExpiresIn=3600)

        data['foto_perfil_url'] = latest_url('perfil')
        data['foto_emprendimiento_url'] = latest_url('emprendimiento')
    except Exception:
        pass

    return jsonify(data), 200

@user_bp.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

@user_bp.route('/register-initial', methods=['POST'])
def register_initial():
    """Crear usuario inicial con datos básicos del primer paso"""
    try:
        data = request.get_json()
        is_demo_mode = data.get('demo_mode', False)
        
        # Verificar si el período de registro está abierto, si es admin, o si es modo demo
        if not check_registration_period() and not check_admin_access() and not is_demo_mode:
            return jsonify({
                'error': 'El período de registro aún no ha comenzado. Las inscripciones abren el 30 de septiembre de 2025 a las 8:00 AM'
            }), 403
        
        data = request.json
        
        # Validar campos básicos obligatorios
        required_fields = [
            'nombre', 'apellido', 'email', 'tipo_documento', 'numero_documento', 
            'fecha_nacimiento', 'sexo', 'estado_civil', 'telefono', 'direccion', 
            'municipio', 'emprendimiento_nombre', 'emprendimiento_sector', 
            'tipo_persona', 'password', 'confirm_password'
        ]
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es obligatorio'}), 400
        
        # Validar email único
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'El correo electrónico ya está registrado'}), 400
        
        # Validar documento único
        existing_doc = User.query.filter_by(numero_documento=data['numero_documento']).first()
        if existing_doc:
            return jsonify({'error': 'El número de documento ya está registrado'}), 400
        
        # Validar email
        if not validate_email(data['email']):
            return jsonify({'error': 'El formato del correo electrónico no es válido'}), 400
        
        # Validar contraseña
        if not validate_password(data['password']):
            return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'}), 400
        
        if data['password'] != data['confirm_password']:
            return jsonify({'error': 'Las contraseñas no coinciden'}), 400
        
        # Validar edad (18-32)
        try:
            birth_date = datetime.strptime(data['fecha_nacimiento'], '%Y-%m-%d').date()
            today = datetime.now().date()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            if age < 18 or age > 32:
                return jsonify({'error': 'Debe tener entre 18 y 32 años para participar'}), 400
        except ValueError:
            return jsonify({'error': 'Fecha de nacimiento inválida'}), 400
        
        # Validar municipio
        if data['municipio'] not in LISTA_MUNICIPIOS:
            return jsonify({'error': 'Municipio no válido'}), 400
        
        # Validar otros campos
        if data['sexo'] not in ['masculino', 'femenino', 'otro']:
            return jsonify({'error': 'Sexo no válido'}), 400
        
        if data['estado_civil'] not in ['soltero', 'casado', 'union_libre', 'separado', 'divorciado', 'viudo']:
            return jsonify({'error': 'Estado civil no válido'}), 400
        
        if data['emprendimiento_sector'] not in ['agroindustria', 'industria_comercio', 'servicios', 'turismo']:
            return jsonify({'error': 'Sector económico no válido'}), 400
        
        if data['tipo_persona'] not in ['natural', 'juridica']:
            return jsonify({'error': 'Tipo de persona no válido'}), 400
        
        # Crear usuario inicial
        user = User(
            nombre=data['nombre'],
            apellido=data['apellido'],
            email=data['email'],
            tipo_documento=data['tipo_documento'],
            numero_documento=data['numero_documento'],
            fecha_nacimiento=birth_date,
            sexo=data['sexo'],
            estado_civil=data['estado_civil'],
            telefono=data['telefono'],
            direccion=data['direccion'],
            municipio=data['municipio'],
            corregimiento_vereda=data.get('corregimiento_vereda', ''),
            emprendimiento_nombre=data['emprendimiento_nombre'],
            emprendimiento_sector=data['emprendimiento_sector'],
            tipo_persona=data['tipo_persona'],
            password_hash=generate_password_hash(data['password']),
            convocatoria=data.get('convocatoria', '2025'),
            estado_inscripcion='en_progreso',
            paso_actual=1,
            formulario_enviado=False,
            fecha_ultimo_guardado=datetime.utcnow(),
            estado_cuenta='inscrito',  # Estado inicial cuando completa paso 1
            rol='usuario'
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Crear estructura de carpetas en S3 para el nuevo usuario
        try:
            s3_service = S3Service()
            folder_result = s3_service.create_user_folders(user.id)
            if folder_result['success']:
                print(f"SUCCESS: Carpetas creadas para usuario {user.id}: {folder_result['folders_created']} carpetas")
            else:
                print(f"WARNING: Error creando carpetas para usuario {user.id}: {folder_result.get('error', 'Error desconocido')}")
        except Exception as e:
            print(f"WARNING: Error creando carpetas S3 para usuario {user.id}: {str(e)}")
            # No fallar la creación del usuario por problemas de S3
        
        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='registro_inicial',
            detalles=f"Usuario creado con datos básicos. Estado: en_progreso, Paso: 1"
        ))
        db.session.commit()
        
        return jsonify({
            'message': 'Usuario creado exitosamente. Puede continuar completando el formulario.',
            'user_id': user.id,
            'paso_actual': 1,
            'estado_inscripcion': 'en_progreso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear usuario: {str(e)}'}), 500

# ===== ENDPOINTS PARA GESTIÓN DE FASES =====

@user_bp.route('/fases/estado', methods=['GET'])
def get_phase_status():
    """Obtener el estado actual de fases de un usuario"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'fase_actual': getattr(user, 'fase_actual', 'inscripcion'),
            'fecha_entrada_fase': user.fecha_entrada_fase.isoformat() if hasattr(user, 'fecha_entrada_fase') and user.fecha_entrada_fase else None,
            'fase_completada': getattr(user, 'fase_completada', False),
            'estado_inscripcion': user.estado_inscripcion,
            'formulario_enviado': user.formulario_enviado
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener estado de fase: {str(e)}'}), 500

@user_bp.route('/fases/avanzar', methods=['POST'])
def advance_phase():
    """Avanzar a la siguiente fase del proyecto"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        data = request.json
        nueva_fase = data.get('nueva_fase')
        
        # Validar fase válida
        fases_validas = ['inscripcion', 'formacion', 'entrega_activos']
        if nueva_fase not in fases_validas:
            return jsonify({'error': 'Fase no válida'}), 400
        
        # Verificar que el usuario puede avanzar
        fase_actual = getattr(user, 'fase_actual', 'inscripcion')
        
        # Solo permitir avanzar si está en la fase anterior
        if fase_actual == 'inscripcion' and nueva_fase != 'formacion':
            return jsonify({'error': 'Debe completar la inscripción antes de avanzar'}), 400
        elif fase_actual == 'formacion' and nueva_fase != 'entrega_activos':
            return jsonify({'error': 'Debe completar la formación antes de avanzar'}), 400
        elif fase_actual == 'entrega_activos':
            return jsonify({'error': 'Ya está en la fase final'}), 400
        
        # Actualizar fase
        user.fase_actual = nueva_fase
        user.fecha_entrada_fase = datetime.utcnow()
        user.fase_completada = False
        
        db.session.commit()
        
        # Crear notificación de cambio de fase
        mensajes = {
            'inscripcion': 'Tu emprendimiento ha pasado a la fase de Inscripción y Selección',
            'formacion': 'Tu emprendimiento ha pasado a la fase de Formación',
            'entrega_activos': 'Tu emprendimiento ha pasado a la fase de Entrega de Activos Productivos'
        }
        
        mensaje = mensajes.get(nueva_fase, f'Tu emprendimiento ha pasado a la fase: {nueva_fase}')
        
        notificacion = Notificacion(
            user_id=user.id,
            mensaje=mensaje,
            fase_nueva=nueva_fase
        )
        db.session.add(notificacion)
        
        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='cambio_fase',
            detalles=f"Usuario avanzó de {fase_actual} a {nueva_fase}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': f'Fase actualizada a {nueva_fase}',
            'fase_actual': nueva_fase,
            'fecha_entrada_fase': user.fecha_entrada_fase.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al avanzar fase: {str(e)}'}), 500

@user_bp.route('/fases/completar', methods=['POST'])
def complete_phase():
    """Marcar la fase actual como completada"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Marcar fase como completada
        user.fase_completada = True
        
        db.session.commit()
        
        # Log de actividad
        fase_actual = getattr(user, 'fase_actual', 'inscripcion')
        db.session.add(LogActividad(
            usuario_id=user.id,
            accion='fase_completada',
            detalles=f"Usuario completó la fase {fase_actual}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': f'Fase {fase_actual} completada exitosamente',
            'fase_completada': True
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al completar fase: {str(e)}'}), 500

@user_bp.route('/fases/historial', methods=['GET'])
def get_phase_history():
    """Obtener el historial de cambios de fase de un usuario"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        # Buscar logs de cambios de fase
        logs = LogActividad.query.filter_by(
            usuario_id=user_id,
            accion='cambio_fase'
        ).order_by(LogActividad.fecha.desc()).all()
        
        historial = []
        for log in logs:
            historial.append({
                'fecha': log.fecha.isoformat(),
                'detalles': log.detalles,
                'accion': log.accion
            })
        
        return jsonify({
            'historial': historial,
            'total_cambios': len(historial)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener historial: {str(e)}'}), 500

@user_bp.route('/get-video-upload-url', methods=['POST'])
def get_video_upload_url():
    """
    Generar una URL pre-firmada para subir un video directamente a S3
    Solo para videos del Paso 4 (video de presentación)
    """
    try:
        data = request.json
        
        # Obtener datos del request
        numero_documento = data.get('numero_documento')
        filename = data.get('filename')
        content_type = data.get('content_type')
        file_size = data.get('file_size', 0)
        
        # Validaciones
        if not all([numero_documento, filename, content_type]):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        # Validar tamaño (100MB máximo)
        max_size = 100 * 1024 * 1024  # 100MB en bytes
        if file_size > max_size:
            return jsonify({'error': f'El video no puede superar 100MB. Tamaño: {file_size / 1024 / 1024:.2f}MB'}), 400
        
        # Buscar usuario
        user = User.query.filter_by(numero_documento=numero_documento).first()
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Validar que el formulario no haya sido enviado
        if user.formulario_enviado:
            return jsonify({'error': 'El formulario ya ha sido enviado y no se pueden subir más archivos'}), 400
        
        # Generar URL pre-firmada
        s3_service = S3Service()
        result = s3_service.generate_presigned_upload_url(
            user_id=user.id,
            filename=filename,
            content_type=content_type,
            max_size_mb=100
        )
        
        if not result['success']:
            return jsonify({'error': result.get('error', 'Error generando URL de subida')}), 500
        
        print(f"✅ URL generada para usuario {user.numero_documento}: {result['file_key']}")
        
        return jsonify({
            'success': True,
            'upload_url': result['upload_url'],
            'file_key': result['file_key'],
            'expires_in': result['expires_in']
        }), 200
        
    except Exception as e:
        print(f"❌ Error en get_video_upload_url: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/confirm-video-upload', methods=['POST'])
def confirm_video_upload():
    """
    Confirmar que el video fue subido correctamente a S3 y actualizar la DB
    """
    try:
        data = request.json
        
        numero_documento = data.get('numero_documento')
        file_key = data.get('file_key')
        
        if not all([numero_documento, file_key]):
            return jsonify({'error': 'Faltan campos requeridos'}), 400
        
        # Buscar usuario
        user = User.query.filter_by(numero_documento=numero_documento).first()
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar que el archivo existe en S3
        s3_service = S3Service()
        verification = s3_service.verify_file_exists(file_key)
        
        if not verification['success']:
            return jsonify({'error': 'Error verificando el archivo en S3'}), 500
        
        if not verification['exists']:
            return jsonify({'error': 'El archivo no fue encontrado en S3. Por favor, intente subir nuevamente.'}), 404
        
        # Construir la URL del video
        video_url = f"https://{s3_service.bucket_name}.s3.{s3_service.region}.amazonaws.com/{file_key}"
        
        # Actualizar la base de datos
        user.video_url = video_url
        user.fecha_ultimo_guardado = datetime.utcnow()
        
        db.session.commit()
        
        print(f"✅ Video confirmado para usuario {user.numero_documento}")
        print(f"   URL: {video_url}")
        print(f"   Tamaño: {verification['size'] / 1024 / 1024:.2f} MB")
        
        return jsonify({
            'success': True,
            'message': 'Video subido y confirmado exitosamente',
            'video_url': video_url,
            'size_mb': round(verification['size'] / 1024 / 1024, 2)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error en confirm_video_upload: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@user_bp.route('/registrar-progreso-modulo', methods=['POST'])
@token_required
def registrar_progreso_modulo(current_user):
    """
    Registrar un "paso completado" del estudiante.
    El sistema de desbloqueo y cálculo de progreso se basa en LogActividad.accion = 'Completó: ...'
    y busca el nombre del módulo en (detalles + paso).
    """
    try:
        data = request.get_json(silent=True) or {}
        if not isinstance(data, dict):
            return jsonify({'success': False, 'error': 'Formato de solicitud inválido'}), 400

        modulo_nombre_raw = (data.get('modulo_nombre') or '').strip()
        paso_nombre = (data.get('paso_nombre') or '').strip()
        curso_nombre = (data.get('curso_nombre') or '').strip()

        if not modulo_nombre_raw or not paso_nombre:
            return jsonify({'success': False, 'error': 'Faltan datos requeridos'}), 400

        # Normalizar nombre del módulo: convertir nombres largos del frontend a nombres estándar del backend
        mapeo_normalizacion = {
            'Finanzas y Gestión Empresarial': 'Finanzas',
            'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente',
            'Descubrimiento de Oportunidades': 'Descubrimiento de Oportunidades',
            'Modelo de Negocios': 'Modelo de Negocios',
            'Marketing Digital': 'Marketing Digital',
            'Marketing y Comercialización': 'Marketing y Comercialización',
            'Proyecto de vida': 'Proyecto de vida',
            'Trabajo en Equipo': 'Trabajo en Equipo',
            'Liderazgo': 'Liderazgo',
            'Plan de Inversión': 'Plan de Inversión'
        }
        modulo_nombre = mapeo_normalizacion.get(modulo_nombre_raw, modulo_nombre_raw)

        detalles_parts = [f"Módulo: {modulo_nombre}", f"Paso: {paso_nombre}"]
        if curso_nombre:
            detalles_parts.append(f"Curso: {curso_nombre}")
        detalles = " | ".join(detalles_parts)

        db.session.add(LogActividad(
            usuario_id=current_user.id,
            accion=f"Completó: {paso_nombre}",
            detalles=detalles,
            fecha=get_colombia_time()
        ))
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Progreso registrado exitosamente'
        }), 200
    except Exception as e:
        db.session.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error en registrar_progreso_modulo: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500


@user_bp.route('/registrar-puntos-plan-negocio', methods=['POST'])
@token_required
def registrar_puntos_plan_negocio(current_user):
    """
    Registrar puntos del plan de negocio basados en las estrategias seleccionadas.
    """
    try:
        from src.models import PuntosPlanNegocio
        from sqlalchemy import inspect, text
        
        # Asegurar que la tabla existe
        try:
            inspector = inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if 'puntos_plan_negocio' not in existing_tables:
                import logging
                logger = logging.getLogger(__name__)
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
        except Exception as table_error:
            # Si ya existe la tabla, ignorar el error
            db.session.rollback()
            pass
        
        data = request.get_json(silent=True) or {}
        if not isinstance(data, dict):
            return jsonify({'success': False, 'error': 'Formato de solicitud inválido'}), 400

        modulo_nombre = (data.get('modulo_nombre') or '').strip()
        estrategias_seleccionadas = data.get('estrategias', [])  # Lista de {etapa, estrategia}

        if not modulo_nombre or not estrategias_seleccionadas:
            return jsonify({'success': False, 'error': 'Faltan datos requeridos'}), 400

        # Mapeo de puntos por estrategia (para módulo Descubrimiento de Oportunidades)
        puntos_por_estrategia = {
            # Introducción
            'Promoción fuerte': 3,
            'Pruebas gratuitas': 4,
            'Definición de mercado meta': 5,
            # Crecimiento
            'Diferenciar': 5,
            'Ampliar distribución': 4,
            'Mejorar la calidad del producto': 3,
            # Madurez
            'Versiones nuevas': 4,
            'Promociones': 3,
            'Extensión de marca': 5,
            # Declive
            'Liquidación': 2,
            'Segmentación selectiva': 4,
            'Retiro gradual': 3
        }

        # Eliminar puntos anteriores del mismo módulo para este usuario (para permitir actualizaciones)
        try:
            registros_anteriores = PuntosPlanNegocio.query.filter_by(
                usuario_id=current_user.id,
                modulo_nombre=modulo_nombre
            ).all()
            
            for registro in registros_anteriores:
                db.session.delete(registro)
            db.session.commit()
        except Exception as delete_error:
            db.session.rollback()
            # Continuar aunque falle la eliminación (puede que no haya registros anteriores)

        # Registrar cada estrategia seleccionada
        puntos_totales = 0
        for estrategia_data in estrategias_seleccionadas:
            etapa = estrategia_data.get('etapa', '').strip()
            estrategia = estrategia_data.get('estrategia', '').strip()
            puntos_recibidos = estrategia_data.get('puntos', None)
            
            if not etapa or not estrategia:
                continue
            
            # Si vienen puntos en el request (módulo 3+), usarlos; si no, buscar en el mapeo (módulo 2)
            if puntos_recibidos is not None:
                puntos = puntos_recibidos
            else:
                puntos = puntos_por_estrategia.get(estrategia, 0)
            
            puntos_totales += puntos
            
            db.session.add(PuntosPlanNegocio(
                usuario_id=current_user.id,
                modulo_nombre=modulo_nombre,
                etapa=etapa,
                estrategia=estrategia,
                puntos=puntos,
                fecha_registro=get_colombia_time()
            ))

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Puntos del plan de negocio registrados exitosamente',
            'puntos_totales': puntos_totales
        }), 200
    except Exception as e:
        db.session.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error en registrar_puntos_plan_negocio: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': f'Error interno del servidor: {str(e)}'}), 500


@user_bp.route('/registrar-intento-evaluacion', methods=['POST'])
@token_required
def registrar_intento_evaluacion(current_user):
    """
    Registrar un intento de evaluación cuando el estudiante envía respuestas.
    Se usa para métricas e incluso para lógica de desbloqueo (cuando aplica).
    """
    try:
        data = request.get_json(silent=True) or {}
        if not isinstance(data, dict):
            return jsonify({'success': False, 'error': 'Formato de solicitud inválido'}), 400

        modulo_nombre_raw = (data.get('modulo_nombre') or '').strip()
        unidad_nombre = (data.get('unidad_nombre') or '').strip()
        paso_nombre = (data.get('paso_nombre') or '').strip()
        todas_correctas = bool(data.get('todas_correctas', False))

        if not modulo_nombre_raw or not paso_nombre:
            return jsonify({'success': False, 'error': 'Faltan datos requeridos'}), 400

        # Normalizar nombre del módulo: convertir nombres largos del frontend a nombres estándar del backend
        mapeo_normalizacion = {
            'Finanzas y Gestión Empresarial': 'Finanzas',
            'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente',
            'Descubrimiento de Oportunidades': 'Descubrimiento de Oportunidades',
            'Modelo de Negocios': 'Modelo de Negocios',
            'Marketing Digital': 'Marketing Digital',
            'Marketing y Comercialización': 'Marketing y Comercialización',
            'Proyecto de vida': 'Proyecto de vida',
            'Trabajo en Equipo': 'Trabajo en Equipo',
            'Liderazgo': 'Liderazgo',
            'Plan de Inversión': 'Plan de Inversión'
        }
        modulo_nombre = mapeo_normalizacion.get(modulo_nombre_raw, modulo_nombre_raw)

        intento = IntentosEvaluacion(
            usuario_id=current_user.id,
            modulo_nombre=modulo_nombre,
            unidad_nombre=unidad_nombre,
            paso_nombre=paso_nombre,
            todas_correctas=todas_correctas,
            fecha_intento=get_colombia_time()
        )

        db.session.add(intento)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Intento registrado exitosamente',
            'intento_id': intento.id
        }), 200
    except Exception as e:
        db.session.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error en registrar_intento_evaluacion: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error interno del servidor'}), 500

# ------------------------------------------------------------
# RESPUESTAS PLAN DE NEGOCIO (Persistencia de ejercicios)
# ------------------------------------------------------------

@user_bp.route('/save-respuestas-plan', methods=['POST'])
@token_required
def save_respuestas_plan(current_user):
    """
    Guardar las respuestas de un ejercicio del plan de negocio.
    Incluye lógica para asegurar que la tabla existe en AWS Lambda.
    """
    try:
        from sqlalchemy import inspect, text
        
        # Asegurar que la tabla existe (única forma de agregar tablas es vía Lambda)
        try:
            inspector = inspect(db.engine)
            if 'respuestas_plan_negocio' not in inspector.get_table_names():
                import logging
                logging.getLogger(__name__).info("Creando tabla respuestas_plan_negocio...")
                
                create_table_sql = text("""
                    CREATE TABLE respuestas_plan_negocio (
                        id SERIAL PRIMARY KEY,
                        usuario_id INTEGER NOT NULL,
                        modulo_nombre VARCHAR(200) NOT NULL,
                        respuestas_json JSONB NOT NULL,
                        fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT fk_usuario_respuestas FOREIGN KEY (usuario_id) REFERENCES "user"(id) ON DELETE CASCADE
                    )
                """)
                db.session.execute(create_table_sql)
                db.session.commit()
        except Exception as table_error:
            db.session.rollback()
            # Si falla porque ya existe u otro error, intentamos continuar

        data = request.get_json(silent=True) or {}
        modulo_nombre = data.get('modulo_nombre')
        # Buscamos 'respuestas' o 'respuestas_json' para máxima compatibilidad durante la transición
        respuestas_json = data.get('respuestas') or data.get('respuestas_json')

        if not modulo_nombre or respuestas_json is None:
            return jsonify({'success': False, 'error': 'Faltan datos requeridos (modulo_nombre, respuestas)'}), 400

        # Buscar si ya existe una respuesta para este módulo para actualizarla
        registro = RespuestasPlanNegocio.query.filter_by(
            usuario_id=current_user.id,
            modulo_nombre=modulo_nombre
        ).first()

        if registro:
            registro.respuestas_json = respuestas_json
            registro.fecha_registro = get_colombia_time()
        else:
            registro = RespuestasPlanNegocio(
                usuario_id=current_user.id,
                modulo_nombre=modulo_nombre,
                respuestas_json=respuestas_json,
                fecha_registro=get_colombia_time()
            )
            db.session.add(registro)

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Respuestas guardadas exitosamente'
        }), 200

    except Exception as e:
        db.session.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error en save_respuestas_plan: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': f'Error interno: {str(e)}'}), 500

@user_bp.route('/get-respuestas-plan', methods=['GET'])
@token_required
def get_respuestas_plan(current_user):
    """Obtener todas las respuestas del plan de negocio del usuario"""
    try:
        respuestas = RespuestasPlanNegocio.query.filter_by(usuario_id=current_user.id).all()
        
        # Agrupar por módulo para facilitar uso en frontend
        resultado = {}
        for r in respuestas:
            resultado[r.modulo_nombre] = r.respuestas_json

        return jsonify({
            'success': True,
            'respuestas': resultado
        }), 200

    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error en get_respuestas_plan: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error al obtener respuestas'}), 500

# ===== ENDPOINT TEMPORAL PARA CAMBIAR CONTRASEÑA POR ID (SOLO USO INTERNO) =====
@user_bp.route('/admin/change-password/<int:user_id>', methods=['POST'])
def admin_change_password(user_id):

    """
    Endpoint temporal para cambiar contraseña de un usuario por ID
    SOLO PARA USO INTERNO - NO REQUIERE AUTENTICACIÓN
    """
    try:
        data = request.json
        new_password = data.get('new_password')
        
        if not new_password:
            return jsonify({'error': 'new_password es obligatorio'}), 400
        
        # Validar que la contraseña tenga al menos 8 caracteres
        if len(new_password) < 8:
            return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres'}), 400
        
        # Buscar usuario
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': f'Usuario con ID {user_id} no encontrado'}), 404
        
        # Actualizar contraseña
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Contraseña actualizada exitosamente para el usuario {user.email}',
            'user_id': user_id,
            'email': user.email,
            'nombre': f'{user.nombre} {user.apellido}'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al cambiar contraseña: {str(e)}'}), 500
