from flask import Blueprint, jsonify, request, session  # pyright: ignore[reportMissingImports]
from src.models import db, User, RespuestasPlanNegocio
from src.models import CuposConfig, MunicipioCupo, LogActividad, Notificacion
from src.constants.municipios import LISTA_MUNICIPIOS
from src.services.auth_service import generate_token, token_required
from werkzeug.exceptions import BadRequest
from werkzeug.security import generate_password_hash  # pyright: ignore[reportMissingImports]
import json
import binascii
import re
from datetime import datetime
import base64
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

@user_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validar campos obligatorios
        required_fields = ['nombre', 'apellido', 'email', 'tipo_documento', 'numero_documento', 'password', 'confirm_password', 'convocatoria', 'fecha_nacimiento', 'sexo', 'estado_civil', 'telefono', 'direccion', 'municipio', 'emprendimiento_nombre', 'emprendimiento_sector', 'tipo_persona', 'emprendimiento_formalizado', 'financiado_estado', 'declara_veraz', 'declara_no_beneficiario', 'acepta_terminos', 'doc_terminos_pdf', 'doc_uso_imagen_pdf', 'doc_plan_negocio_xls', 'doc_vecindad_pdf']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'El campo {field} es obligatorio'}), 400
        
        # Validar formato de email
        if not validate_email(data['email']):
            return jsonify({'error': 'Formato de email inválido'}), 400
        
        # Validar contraseña
        if not validate_password(data['password']):
            return jsonify({'error': 'La contraseña debe tener al menos 8 caracteres, incluir letras y números'}), 400
        
        # Validar que las contraseñas coincidan
        if data['password'] != data['confirm_password']:
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
        
        # Verificar si el usuario ya existe para determinar validaciones
        try:
            existing_user = User.query.filter_by(numero_documento=data['numero_documento']).first()
        except Exception as e:
            print(f"Error consultando usuario existente: {str(e)}")
            existing_user = None
        
        # Solo verificar email único si es un usuario nuevo
        if not existing_user:
            # Verificar si el email ya existe
            email_exists = User.query.filter_by(email=data['email']).first()
            if email_exists:
                return jsonify({'error': 'El email ya está registrado'}), 400
        
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
        
        # Validar y decodificar TDR (PDF obligatorio)
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
            # Persona Natural: RUT + Cédula obligatorios
            if not data.get('rut_pdf'):
                return jsonify({'error': 'Debe adjuntar el RUT actualizado 2025 (obligatorio para Persona Natural)'}), 400
            if not data.get('cedula_pdf'):
                return jsonify({'error': 'Debe adjuntar la cédula de ciudadanía (obligatorio para Persona Natural)'}), 400
            
            # Procesar RUT
            try:
                rut_pdf = base64.b64decode(data['rut_pdf'])
                rut_pdf_nombre = data.get('rut_pdf_nombre', 'rut.pdf')
                if len(rut_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo del RUT no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo del RUT'}), 400
            
            # Procesar Cédula
            try:
                cedula_pdf = base64.b64decode(data['cedula_pdf'])
                cedula_pdf_nombre = data.get('cedula_pdf_nombre', 'cedula.pdf')
                if len(cedula_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El archivo de la cédula no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el archivo de la cédula'}), 400
                
        elif tipo_persona_val == 'juridica':
            # Persona Jurídica: RUT + Cédula representante + Certificado existencia obligatorios
            # Comentado temporalmente para permitir archivos ya subidos a S3
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
                # Procesar archivos si están presentes
                from src.services.s3_service import S3Service as LambdaS3Service
                s3_service = LambdaS3Service()
                archivos_guardados = []

                # Lista de campos de archivos a procesar
                archivos_campos = [
                    'doc_terminos_pdf', 'doc_uso_imagen_pdf', 'doc_plan_negocio_xls', 'doc_vecindad_pdf',
                    'rut_pdf', 'cedula_pdf', 'cedula_representante_pdf', 'cert_existencia_pdf',
                    'ruv_pdf', 'sisben_pdf', 'grupo_etnico_pdf', 'arn_pdf', 'discapacidad_pdf',
                    'antecedentes_fiscales_pdf', 'antecedentes_disciplinarios_pdf', 'antecedentes_judiciales_pdf',
                    'antecedentes_contraloria_pdf', 'antecedentes_procuraduria_pdf', 'rnmc_pdf', 'redam_pdf',
                    'inhabilidades_sexuales_pdf', 'declaracion_capacidad_legal_pdf',
                    'matricula_mercantil_pdf', 'facturas_6meses_pdf', 'facturas_venta_pdf',
                    'publicaciones_redes_pdf', 'redes_sociales_pdf', 'registro_ventas_pdf',
                    'comprobantes_ventas_pdf', 'video_presentacion'
                ]

                for campo in archivos_campos:
                    if data.get(campo):
                        try:
                            print(f"Procesando archivo: {campo}")
                            print(f"Tipo de dato recibido: {type(data[campo])}")
                            print(f"Contenido (primeros 200 chars): {str(data[campo])[:200]}")

                            # Ensure we have a string from the request
                            if not isinstance(data[campo], str):
                                print(f"WARNING: El campo {campo} no es string, intentando convertir...")
                                try:
                                    data_value = str(data[campo])
                                except Exception:
                                    print(f"ERROR: No se pudo convertir el campo {campo} a str")
                                    continue
                            else:
                                data_value = data[campo]

                            # Determinar el tipo de documento basado en el campo
                            if 'terminos' in campo:
                                doc_type = 'obligatorios/tdr'
                            elif 'uso_imagen' in campo:
                                doc_type = 'obligatorios/uso-imagen'
                            elif 'plan_negocio' in campo:
                                doc_type = 'obligatorios/plan-negocio'
                            elif 'vecindad' in campo:
                                doc_type = 'obligatorios/vecindad'
                            elif 'rut' in campo and 'representante' not in campo:
                                doc_type = 'por-tipo/persona-natural/rut'
                            elif 'cedula' in campo and 'representante' not in campo:
                                doc_type = 'por-tipo/persona-natural/cedula'
                            elif 'cedula_representante' in campo:
                                doc_type = 'por-tipo/persona-juridica/cedula-representante'
                            elif 'cert_existencia' in campo:
                                doc_type = 'por-tipo/persona-juridica/certificado-existencia'
                            elif 'ruv' in campo:
                                doc_type = 'diferenciales/ruv'
                            elif 'sisben' in campo:
                                doc_type = 'diferenciales/sisben'
                            elif 'grupo_etnico' in campo:
                                doc_type = 'diferenciales/grupo-etnico'
                            elif 'arn' in campo:
                                doc_type = 'diferenciales/arn'
                            elif 'discapacidad' in campo:
                                doc_type = 'diferenciales/discapacidad'
                            elif 'antecedentes_fiscales' in campo:
                                doc_type = 'control/antecedentes-fiscales'
                            elif 'antecedentes_disciplinarios' in campo:
                                doc_type = 'control/antecedentes-disciplinarios'
                            elif 'antecedentes_judiciales' in campo:
                                doc_type = 'control/antecedentes-judiciales'
                            elif 'antecedentes_contraloria' in campo:
                                doc_type = 'control/antecedentes-contraloria'
                            elif 'antecedentes_procuraduria' in campo:
                                doc_type = 'control/antecedentes-procuraduria'
                            elif 'rnmc' in campo:
                                doc_type = 'control/rnmc'
                            elif 'redam' in campo:
                                doc_type = 'control/redam'
                            elif 'inhabilidades_sexuales' in campo:
                                doc_type = 'control/inhabilidades-sexuales'
                            elif 'declaracion_capacidad' in campo:
                                doc_type = 'control/declaracion-capacidad'
                            elif 'matricula_mercantil' in campo:
                                doc_type = 'funcionamiento/matricula-mercantil'
                            elif 'facturas_6meses' in campo:
                                doc_type = 'funcionamiento/facturas-6meses'
                            elif 'facturas_venta' in campo:
                                doc_type = 'funcionamiento/facturas-venta'
                            elif 'publicaciones_redes' in campo:
                                doc_type = 'funcionamiento/publicaciones-redes'
                            elif 'redes_sociales' in campo:
                                doc_type = 'funcionamiento/redes-sociales'
                            elif 'registro_ventas' in campo:
                                doc_type = 'funcionamiento/registro-ventas'
                            elif 'comprobantes_ventas' in campo:
                                doc_type = 'funcionamiento/comprobantes-ventas'
                            elif 'video_presentacion' in campo:
                                doc_type = 'videos/presentacion'
                            else:
                                print(f"WARNING: Campo {campo} no mapeado a doc_type, se omitirá")
                                continue

                            # Decodificar y subir archivo
                            print(f"Decodificando archivo: {campo}")
                            try:
                                file_data = base64.b64decode(data_value)
                            except Exception as e:
                                print(f"ERROR: Falló base64.b64decode para {campo}: {e}")
                                continue

                            filename = data.get(f'{campo}_nombre', f'{campo}.pdf')
                            print(f"Archivo decodificado, tipo: {type(file_data)}, tamaño: {len(file_data) if hasattr(file_data, '__len__') else 'n/a'} bytes")

                            # Defensive: ensure bytes-like for S3
                            if isinstance(file_data, str):
                                print(f"WARNING: file_data es str, convirtiendo a bytes usando utf-8")
                                try:
                                    file_data = file_data.encode('utf-8')
                                except Exception as e:
                                    print(f"ERROR: No se pudo convertir file_data a bytes: {e}")
                                    continue

                            # Subir a S3
                            print(f"Subiendo archivo a S3: {filename}")
                            file_key = s3_service.upload_file_data(
                                file_data=file_data,
                                user_id=user.id,
                                document_type=doc_type,
                                filename=filename
                            )
                            print(f"Archivo subido, key: {file_key}")

                            if file_key:
                                archivos_guardados.append(f"{campo}: {filename}")
                                # Actualizar el campo correspondiente en el modelo de usuario
                                setattr(user, campo, file_key)
                                setattr(user, f'{campo}_nombre', filename)

                        except Exception as e:
                            print(f"Error al procesar archivo {campo}: {str(e)}")
                            # Continuar con otros archivos aunque uno falle
                            # (No se retorna aquí, para continuar con otros archivos y no cortar el flujo.)
                        # NOTA: Fin del bloque except interno de procesamiento de archivos disciplinarios

            except Exception as e:
                # Los documentos diferenciales/control pueden venir opcionalmente y no deben tumbar el registro
                # (si algún archivo falla se omite y el usuario podrá subsanar).
                print(f"Error al procesar documentos diferenciales/control (ruv_pdf): {str(e)}")
                # No interrumpir el flujo del registro por fallas en este bloque.
                pass
        
        try:
            redam_pdf = base64.b64decode(data['redam_pdf'])
            redam_pdf_nombre = data.get('redam_pdf_nombre', 'redam.pdf')
            if len(redam_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'El certificado REDAM no puede superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar el certificado REDAM'}), 400
        
        try:
            inhabilidades_sexuales_pdf = base64.b64decode(data['inhabilidades_sexuales_pdf'])
            inhabilidades_sexuales_pdf_nombre = data.get('inhabilidades_sexuales_pdf_nombre', 'inhabilidades_sexuales.pdf')
            if len(inhabilidades_sexuales_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'La consulta de inhabilidades sexuales no puede superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar la consulta de inhabilidades sexuales'}), 400
        
        try:
            declaracion_capacidad_legal_pdf = base64.b64decode(data['declaracion_capacidad_legal_pdf'])
            declaracion_capacidad_legal_pdf_nombre = data.get('declaracion_capacidad_legal_pdf_nombre', 'declaracion_capacidad.pdf')
            if len(declaracion_capacidad_legal_pdf) > 20 * 1024 * 1024:
                return jsonify({'error': 'La declaración de capacidad legal no puede superar 20MB'}), 400
        except Exception as e:
            return jsonify({'error': 'Error al procesar la declaración de capacidad legal'}), 400
        
        # Validación condicional de certificación de funcionamiento
        emprendimiento_formalizado = data.get('emprendimiento_formalizado')
        if emprendimiento_formalizado is None:
            return jsonify({'error': 'Debe especificar si el emprendimiento está formalizado'}), 400
        
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
            # Emprendimiento formalizado - requiere matrícula mercantil y facturas
            if not data.get('matricula_mercantil_pdf'):
                return jsonify({'error': 'Para emprendimientos formalizados, la matrícula mercantil es obligatoria'}), 400
            if not data.get('facturas_6meses_pdf'):
                return jsonify({'error': 'Para emprendimientos formalizados, las facturas de los últimos 6 meses son obligatorias'}), 400
            
            try:
                matricula_mercantil_pdf = base64.b64decode(data['matricula_mercantil_pdf'])
                matricula_mercantil_pdf_nombre = data.get('matricula_mercantil_pdf_nombre', 'matricula_mercantil.pdf')
                if len(matricula_mercantil_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'La matrícula mercantil no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar la matrícula mercantil'}), 400
            
            try:
                facturas_6meses_pdf = base64.b64decode(data['facturas_6meses_pdf'])
                facturas_6meses_pdf_nombre = data.get('facturas_6meses_pdf_nombre', 'facturas_6meses.pdf')
                if len(facturas_6meses_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'Las facturas de los últimos 6 meses no pueden superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar las facturas de los últimos 6 meses'}), 400
                
        else:
            # Emprendimiento informal - requiere publicaciones de redes y registro de ventas
            if not data.get('publicaciones_redes_pdf'):
                return jsonify({'error': 'Para emprendimientos informales, las publicaciones de redes sociales son obligatorias'}), 400
            if not data.get('registro_ventas_pdf'):
                return jsonify({'error': 'Para emprendimientos informales, el registro de ventas de los últimos 6 meses es obligatorio'}), 400
            
            try:
                publicaciones_redes_pdf = base64.b64decode(data['publicaciones_redes_pdf'])
                publicaciones_redes_pdf_nombre = data.get('publicaciones_redes_pdf_nombre', 'publicaciones_redes.pdf')
                if len(publicaciones_redes_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'Las publicaciones de redes sociales no pueden superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar las publicaciones de redes sociales'}), 400
            
            try:
                registro_ventas_pdf = base64.b64decode(data['registro_ventas_pdf'])
                registro_ventas_pdf_nombre = data.get('registro_ventas_pdf_nombre', 'registro_ventas.pdf')
                if len(registro_ventas_pdf) > 20 * 1024 * 1024:
                    return jsonify({'error': 'El registro de ventas no puede superar 20MB'}), 400
            except Exception as e:
                return jsonify({'error': 'Error al procesar el registro de ventas'}), 400
        
        # Validación condicional de financiación de otras fuentes
        financiado_estado = data.get('financiado_estado')
        if financiado_estado is None:
            return jsonify({'error': 'Debe especificar si el emprendimiento ha sido financiado por otros programas del Estado'}), 400
        
        # Procesar fuentes de financiación
        financiado_regalias = data.get('financiado_regalias', False)
        financiado_camara_comercio = data.get('financiado_camara_comercio', False)
        financiado_incubadoras = data.get('financiado_incubadoras', False)
        financiado_otro = data.get('financiado_otro', False)
        financiado_otro_texto = data.get('financiado_otro_texto', None)
        
        if financiado_estado:
            # Si ha sido financiado, debe especificar al menos una fuente
            if not any([financiado_regalias, financiado_camara_comercio, financiado_incubadoras, financiado_otro]):
                return jsonify({'error': 'Si el emprendimiento ha sido financiado por otros programas del Estado, debe especificar al menos una fuente de financiación'}), 400
            
            # Si marcó "otro", debe proporcionar el texto
            if financiado_otro and not financiado_otro_texto:
                return jsonify({'error': 'Si selecciona "Otro" como fuente de financiación, debe especificar cuál'}), 400
        else:
            # Si no ha sido financiado, resetear todas las fuentes a False
            financiado_regalias = False
            financiado_camara_comercio = False
            financiado_incubadoras = False
            financiado_otro = False
            financiado_otro_texto = None
        
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

        estado_cuenta = 'inscrito'

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
                total_confirmados = q_base.filter(User.estado_cuenta.in_(['inscrito', 'seleccionado'])).count()
                muni_confirmados = q_base.filter(
                    User.municipio == data['municipio'],
                    User.estado_cuenta.in_(['inscrito', 'seleccionado'])
                ).count()

                municipio_lleno = bool(muni_row) and muni_confirmados >= int(muni_row.cupo_max)
                global_lleno = cupo_global_max is not None and total_confirmados >= int(cupo_global_max)

                if municipio_lleno or global_lleno:
                    estado_cuenta = 'lista_espera'
                else:
                    estado_cuenta = 'inscrito'

        # Verificar si es un usuario existente para actualizar o crear nuevo
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
                
                # Actualizar campos de financiación (Paso 10)
                existing_user.financiado_estado = data.get('financiado_estado')
                existing_user.financiado_regalias = data.get('financiado_regalias', False)
                existing_user.financiado_camara_comercio = data.get('financiado_camara_comercio', False)
                existing_user.financiado_incubadoras = data.get('financiado_incubadoras', False)
                existing_user.financiado_otro = data.get('financiado_otro', False)
                existing_user.financiado_otro_texto = data.get('financiado_otro_texto', '')
                
                # Actualizar campos de declaraciones (Paso 11)
                existing_user.declara_veraz = data.get('declara_veraz', False)
                existing_user.declara_no_beneficiario = data.get('declara_no_beneficiario', False)
                existing_user.acepta_terminos = data.get('acepta_terminos', False)
                
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
            # Usuario nuevo - crear nuevo usuario
            is_new_user = True
        
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
            # Campos de población diferencial (Paso 2)
            mujer_cabeza_familia=data.get('mujer_cabeza_familia', False),
            victima_conflicto=data.get('victima_conflicto', False),
            persona_discapacidad=data.get('persona_discapacidad', False),
            pertenencia_etnica=data.get('pertenencia_etnica', False),
            sisben_grupo=data.get('sisben_grupo', ''),
            persona_reincorporacion=data.get('persona_reincorporacion', False),
            # Campos de emprendimiento (Paso 3)
            tiempo_funcionamiento=data.get('tiempo_funcionamiento', ''),
            empleos_generados=data.get('empleos_generados', ''),
            acceso_mercados=data.get('acceso_mercados', ''),
            doc_terminos_pdf=doc_terminos_pdf,
            doc_terminos_pdf_nombre=doc_terminos_pdf_nombre,
            doc_uso_imagen_pdf=doc_uso_imagen_pdf,
            doc_uso_imagen_pdf_nombre=doc_uso_imagen_pdf_nombre,
            doc_plan_negocio_xls=doc_plan_negocio_xls,
            doc_plan_negocio_nombre=doc_plan_negocio_nombre,
            doc_vecindad_pdf=doc_vecindad_pdf,
            doc_vecindad_pdf_nombre=doc_vecindad_pdf_nombre,
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
            declaracion_capacidad_legal_pdf=declaracion_capacidad_legal_pdf,
            declaracion_capacidad_legal_pdf_nombre=declaracion_capacidad_legal_pdf_nombre,
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
            financiado_estado=financiado_estado,
            financiado_regalias=financiado_regalias,
            financiado_camara_comercio=financiado_camara_comercio,
            financiado_incubadoras=financiado_incubadoras,
            financiado_otro=financiado_otro,
            financiado_otro_texto=financiado_otro_texto,
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
        user.set_password(data['password'])
        
        db.session.add(user)
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
            'message': 'Usuario registrado exitosamente. Tu cuenta está pendiente de activación por el administrador.',
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
        paso = data.get('paso', 1)
        
        if not user_id:
            return jsonify({'error': 'ID de usuario requerido'}), 400
        
        user = User.query.get_or_404(user_id)
        
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
        
        if paso >= 7:  # Financiación
            if 'financiado_estado' in data:
                user.financiado_estado = data['financiado_estado']
                user.financiado_regalias = data.get('financiado_regalias', False)
                user.financiado_camara_comercio = data.get('financiado_camara_comercio', False)
                user.financiado_incubadoras = data.get('financiado_incubadoras', False)
                user.financiado_otro = data.get('financiado_otro', False)
                user.financiado_otro_texto = data.get('financiado_otro_texto', '')
        
        if paso >= 8:  # Declaraciones
            if 'declara_veraz' in data:
                user.declara_veraz = data['declara_veraz']
            if 'declara_no_beneficiario' in data:
                user.declara_no_beneficiario = data['declara_no_beneficiario']
            if 'acepta_terminos' in data:
                user.acepta_terminos = data['acepta_terminos']
        
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
        
        return jsonify({
            'message': 'Progreso guardado exitosamente',
            'paso_actual': user.paso_actual,
            'estado_inscripcion': user.estado_inscripcion
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al guardar progreso: {str(e)}'}), 500

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

@user_bp.route('/login', methods=['POST'])
def login():
    try:
        # request.json lanza BadRequest si el body no es JSON válido.
        # En producción (API Gateway + PWA/proxies), a veces el body llega como texto/base64.
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

                # Intento 2: base64 JSON (caso isBase64Encoded)
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
        
        email = (data.get('email') or '').strip()
        password = data.get('password') or ''

        # Buscar usuario por email
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
        # Verificar estado de la cuenta
        if user.estado_cuenta == 'inactiva':
            return jsonify({'error': 'Tu cuenta está inactiva. Contacta al administrador para activarla.'}), 401
        elif user.estado_cuenta == 'suspendida':
            return jsonify({'error': 'Tu cuenta está suspendida. Contacta al administrador.'}), 401
        
        # Generar token JWT
        token = generate_token(user.id)
        if not token:
            return jsonify({'error': 'Error al generar token de autenticación'}), 500
        
        return jsonify({
            'message': 'Inicio de sesión exitoso',
            'user': user.to_dict(),
            'token': token
        }), 200
        
    except BadRequest:
        # JSON inválido o body malformado
        return jsonify({'error': 'JSON inválido en la solicitud'}), 400
    except Exception as e:
        print(f"❌ Error en login: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@user_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Sesión cerrada exitosamente'}), 200

@user_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        
        if not data.get('email'):
            return jsonify({'error': 'Email es obligatorio'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            # Por seguridad, no revelar si el email existe o no
            return jsonify({'message': 'Si el email existe, se enviará un enlace de recuperación'}), 200
        
        # Generar token de recuperación
        token = user.generate_reset_token()
        db.session.commit()
        
        # Aquí normalmente se enviaría un email con el token
        # Para propósitos de desarrollo, devolvemos el token
        return jsonify({
            'message': 'Token de recuperación generado',
            'token': token  # En producción, esto se enviaría por email
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
        # No bloquear /profile si falla S3
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
        
        if data['emprendimiento_sector'] not in ['agroindustria', 'industria_comercio', 'turismo_servicios']:
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


# ------------------------------------------------------------
# PROGRESO / EVALUACIONES (usado por student dashboard + unlock)
# ------------------------------------------------------------

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
            
            # Si vienen puntos en el request (módulo 3), usarlos; si no, buscar en el mapeo (módulo 2)
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


# Soportar ambas rutas (con y sin tilde). El frontend actual está llamando la versión con tilde.
@user_bp.route('/registrar-intento-evaluacion', methods=['POST'])
@user_bp.route('/registrar-intento-evaluación', methods=['POST'])
@token_required
def registrar_intento_evaluacion(current_user):
    """
    Registrar un intento de evaluación cuando el estudiante envía respuestas.
    Se usa para métricas e incluso para lógica de desbloqueo (cuando aplica).
    """
    try:
        from src.models import IntentosEvaluacion
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


@user_bp.route('/verificar-evaluacion', methods=['GET'])
@token_required
def verificar_evaluacion(current_user):
    """Verificar si el usuario ya pasó una evaluación específica"""
    try:
        from src.models import IntentosEvaluacion
        
        modulo_nombre_raw = request.args.get('modulo_nombre', '').strip()
        unidad_nombre = request.args.get('unidad_nombre', '').strip()
        paso_nombre = request.args.get('paso_nombre', '').strip()

        if not modulo_nombre_raw or not unidad_nombre or not paso_nombre:
            return jsonify({'success': False, 'error': 'Faltan parámetros requeridos'}), 400

        # Normalizar nombre del módulo
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

        # Buscar si existe un intento con todas_correctas = True
        intento_exitoso = IntentosEvaluacion.query.filter_by(
            usuario_id=current_user.id,
            modulo_nombre=modulo_nombre,
            unidad_nombre=unidad_nombre,
            paso_nombre=paso_nombre,
            todas_correctas=True
        ).first()

        return jsonify({
            'success': True,
            'ya_paso': intento_exitoso is not None,
            'fecha_paso': intento_exitoso.fecha_intento.isoformat() if intento_exitoso else None
        }), 200

    except Exception as e:
        db.session.rollback()
        import logging
        logging.getLogger(__name__).error(f"Error en verificar_evaluacion: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error al verificar evaluación'}), 500

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
        respuestas_json = data.get('respuestas')

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
    """Obtener todas las respuestas del plan de negocio del usuario (o de otro usuario si admin/instructor)."""
    try:
        usuario_id_param = request.args.get('usuario_id', type=int)
        target_user_id = current_user.id
        if usuario_id_param is not None:
            if current_user.rol not in ('admin', 'instructor'):
                return jsonify({'success': False, 'error': 'No autorizado'}), 403
            target = User.query.get(usuario_id_param)
            if not target:
                return jsonify({'success': False, 'error': 'Usuario no encontrado'}), 404
            target_user_id = usuario_id_param

        respuestas = RespuestasPlanNegocio.query.filter_by(usuario_id=target_user_id).all()
        
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
