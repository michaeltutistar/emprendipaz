from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash  # pyright: ignore[reportMissingImports]
import secrets
from . import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    sexo = db.Column(db.String(20), nullable=True)
    estado_civil = db.Column(db.String(30), nullable=True)
    direccion = db.Column(db.String(255), nullable=True)
    municipio = db.Column(db.String(120), nullable=True)
    corregimiento_vereda = db.Column(db.String(100), nullable=True)
    pais = db.Column(db.String(100), nullable=True)
    ciudad = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    tipo_documento = db.Column(db.String(50), nullable=False)
    numero_documento = db.Column(db.String(20), unique=True, nullable=False)
    # Documentos específicos obligatorios
    doc_terminos_pdf = db.Column(db.LargeBinary, nullable=True)
    doc_terminos_pdf_nombre = db.Column(db.String(255), nullable=True)
    doc_uso_imagen_pdf = db.Column(db.LargeBinary, nullable=True)
    doc_uso_imagen_pdf_nombre = db.Column(db.String(255), nullable=True)
    doc_plan_negocio_xls = db.Column(db.LargeBinary, nullable=True)
    doc_plan_negocio_nombre = db.Column(db.String(255), nullable=True)
    doc_vecindad_pdf = db.Column(db.LargeBinary, nullable=True)
    doc_vecindad_pdf_nombre = db.Column(db.String(255), nullable=True)
    # Video opcional
    video_url = db.Column(db.String(500), nullable=True)
    # Documentos condicionales según tipo de persona
    rut_pdf = db.Column(db.LargeBinary, nullable=True)
    rut_pdf_nombre = db.Column(db.String(255), nullable=True)
    cedula_pdf = db.Column(db.LargeBinary, nullable=True)  # Para Persona Natural
    cedula_pdf_nombre = db.Column(db.String(255), nullable=True)
    cedula_representante_pdf = db.Column(db.LargeBinary, nullable=True)  # Para Persona Jurídica
    cedula_representante_pdf_nombre = db.Column(db.String(255), nullable=True)
    cert_existencia_pdf = db.Column(db.LargeBinary, nullable=True)  # Solo Persona Jurídica
    cert_existencia_pdf_nombre = db.Column(db.String(255), nullable=True)
    # Documentación diferencial (subsanable/opcional)
    ruv_pdf = db.Column(db.LargeBinary, nullable=True)
    ruv_pdf_nombre = db.Column(db.String(255), nullable=True)
    sisben_pdf = db.Column(db.LargeBinary, nullable=True)
    sisben_pdf_nombre = db.Column(db.String(255), nullable=True)
    grupo_etnico_pdf = db.Column(db.LargeBinary, nullable=True)
    grupo_etnico_pdf_nombre = db.Column(db.String(255), nullable=True)
    arn_pdf = db.Column(db.LargeBinary, nullable=True)
    arn_pdf_nombre = db.Column(db.String(255), nullable=True)
    discapacidad_pdf = db.Column(db.LargeBinary, nullable=True)
    discapacidad_pdf_nombre = db.Column(db.String(255), nullable=True)
    # Nuevos documentos diferenciales
    mujer_cabeza_familia_pdf = db.Column(db.Text, nullable=True)
    mujer_cabeza_familia_pdf_nombre = db.Column(db.String(255), nullable=True)
    persona_discapacidad_pdf = db.Column(db.Text, nullable=True)
    persona_discapacidad_pdf_nombre = db.Column(db.String(255), nullable=True)
    # Documentación de control (obligatoria)
    antecedentes_fiscales_pdf = db.Column(db.LargeBinary, nullable=True)
    antecedentes_fiscales_pdf_nombre = db.Column(db.String(255), nullable=True)
    antecedentes_disciplinarios_pdf = db.Column(db.LargeBinary, nullable=True)
    antecedentes_disciplinarios_pdf_nombre = db.Column(db.String(255), nullable=True)
    antecedentes_judiciales_pdf = db.Column(db.LargeBinary, nullable=True)
    antecedentes_judiciales_pdf_nombre = db.Column(db.String(255), nullable=True)
    redam_pdf = db.Column(db.LargeBinary, nullable=True)
    redam_pdf_nombre = db.Column(db.String(255), nullable=True)
    inhabilidades_sexuales_pdf = db.Column(db.LargeBinary, nullable=True)
    inhabilidades_sexuales_pdf_nombre = db.Column(db.String(255), nullable=True)
    declaracion_capacidad_legal_pdf = db.Column(db.LargeBinary, nullable=True)
    declaracion_capacidad_legal_pdf_nombre = db.Column(db.String(255), nullable=True)
    # declaracion_juramentada_pdf = db.Column(db.LargeBinary, nullable=True)
    # declaracion_juramentada_pdf_nombre = db.Column(db.String(255), nullable=True)
    # Estado y resultado de control
    estado_control = db.Column(db.String(20), default='pendiente')  # pendiente | completo
    resultado_certificados = db.Column(db.String(30), default='pendiente')  # pendiente | limpio | inhabilidad_detectada
    
    # Certificación de Funcionamiento del Emprendimiento
    emprendimiento_formalizado = db.Column(db.Boolean, nullable=True)  # True = formalizado, False = informal
    # Documentos para emprendimientos formalizados
    matricula_mercantil_pdf = db.Column(db.LargeBinary, nullable=True)
    matricula_mercantil_pdf_nombre = db.Column(db.String(255), nullable=True)
    facturas_6meses_pdf = db.Column(db.LargeBinary, nullable=True)
    facturas_6meses_pdf_nombre = db.Column(db.String(255), nullable=True)
    # Documentos para emprendimientos informales
    publicaciones_redes_pdf = db.Column(db.LargeBinary, nullable=True)
    publicaciones_redes_pdf_nombre = db.Column(db.String(255), nullable=True)
    registro_ventas_pdf = db.Column(db.LargeBinary, nullable=True)
    registro_ventas_pdf_nombre = db.Column(db.String(255), nullable=True)
    
    # Población Diferencial (Paso 2)
    mujer_cabeza_familia = db.Column(db.Boolean, default=False, nullable=True)
    victima_conflicto = db.Column(db.Boolean, default=False, nullable=True)
    persona_discapacidad = db.Column(db.Boolean, default=False, nullable=True)
    pertenencia_etnica = db.Column(db.Boolean, default=False, nullable=True)
    sisben_grupo = db.Column(db.String(10), nullable=True)  # A, B, C, D
    persona_reincorporacion = db.Column(db.Boolean, default=False, nullable=True)
    
    # Información del Emprendimiento (Paso 3)
    tiempo_funcionamiento = db.Column(db.String(50), nullable=True)  # 6-12, 12-24, 24+
    empleos_generados = db.Column(db.String(50), nullable=True)  # 0, 1, 2-3, 4-5, 5+
    acceso_mercados = db.Column(db.String(100), nullable=True)  # locales, regionales, nacionales
    
    # Financiación de Otras Fuentes
    financiado_estado = db.Column(db.Boolean, nullable=True)  # True = ha sido financiado, False = no ha sido financiado
    financiado_regalias = db.Column(db.Boolean, default=False)
    financiado_camara_comercio = db.Column(db.Boolean, default=False)
    financiado_incubadoras = db.Column(db.Boolean, default=False)
    financiado_otro = db.Column(db.Boolean, default=False)
    financiado_otro_texto = db.Column(db.String(500), nullable=True)  # Campo de texto libre para "otro"
    
    # Declaraciones y Aceptaciones (obligatorias para cumplimiento legal)
    declara_veraz = db.Column(db.Boolean, nullable=False, default=False)
    declara_no_beneficiario = db.Column(db.Boolean, nullable=False, default=False)
    acepta_terminos = db.Column(db.Boolean, nullable=False, default=False)
    fecha_aceptacion_terminos = db.Column(db.DateTime, nullable=True)  # Para trazabilidad legal
    
    # Estado de inscripción y progreso (para guardado parcial)
    estado_inscripcion = db.Column(db.String(20), default='en_progreso')  # en_progreso, completada, enviada, rechazada
    paso_actual = db.Column(db.Integer, default=1)  # Paso actual del formulario (1-8)
    fecha_ultimo_guardado = db.Column(db.DateTime, default=datetime.utcnow)
    formulario_enviado = db.Column(db.Boolean, default=False)  # True = ya no se puede editar
    fecha_finalizacion = db.Column(db.DateTime, nullable=True)  # Fecha cuando envía el formulario completo
    
    password_hash = db.Column(db.String(255), nullable=False)
    rol = db.Column(db.String(20), default='estudiante')
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    estado_cuenta = db.Column(db.String(20), default='inscrito')
    token_reset = db.Column(db.String(100), nullable=True)
    token_reset_expira = db.Column(db.DateTime, nullable=True)
    convocatoria = db.Column(db.String(20), nullable=True)
    # Emprendimiento
    emprendimiento_nombre = db.Column(db.String(200), nullable=True)
    emprendimiento_sector = db.Column(db.String(80), nullable=True)  # agroindustria | industria_comercio | turismo_servicios
    tipo_persona = db.Column(db.String(20), nullable=True)  # natural | juridica
    
    # Gestión de fases del proyecto (implementación segura)
    fase_actual = db.Column(db.String(20), default='inscripcion', nullable=True)  # inscripcion | formacion | entrega_activos
    fecha_entrada_fase = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)
    fase_completada = db.Column(db.Boolean, default=False, nullable=True)
    

    def __repr__(self):
        return f'<User {self.email}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_reset_token(self):
        self.token_reset = secrets.token_urlsafe(32)
        self.token_reset_expira = datetime.utcnow() + timedelta(hours=1)
        return self.token_reset

    def count_uploaded_documents(self):
        """Contar el número de documentos subidos usando la misma lógica que el modal de detalles"""
        try:
            from ..services.s3_service import S3Service
            
            s3_service = S3Service()
            prefix = f"usuarios/{self.id}/"
            
            # Mapeo de tipos de documentos (igual que en get_user_detailed_info)
            document_types_mapping = {
                'obligatorios/tdr': {'name': 'TDR - Términos y Condiciones', 'section': 'obligatorios'},
                'obligatorios/uso-imagen': {'name': 'Autorización Uso de Imagen', 'section': 'obligatorios'},
                'obligatorios/plan-negocio': {'name': 'Plan de Negocio (Excel)', 'section': 'obligatorios'},
                'obligatorios/vecindad': {'name': 'Certificado de Vecindad', 'section': 'obligatorios'},
                'obligatorios/declaracion-capacidad': {'name': 'Declaración de Capacidad Legal', 'section': 'obligatorios'},
                'por-tipo/persona-natural/cedula': {'name': 'Cédula de Ciudadanía', 'section': 'por_tipo'},
                'por-tipo/persona-natural/rut': {'name': 'RUT Persona Natural', 'section': 'por_tipo'},
                'por-tipo/persona-juridica/camara-comercio': {'name': 'Certificado Cámara de Comercio', 'section': 'por_tipo'},
                'por-tipo/persona-juridica/rut-empresa': {'name': 'RUT Empresa', 'section': 'por_tipo'},
                'por-tipo/persona-juridica/cedula-representante': {'name': 'Cédula Representante Legal', 'section': 'por_tipo'},
                'por-tipo/persona-juridica/certificado-existencia': {'name': 'Certificado de Existencia', 'section': 'por_tipo'},
                'diferenciales/ruv': {'name': 'RUV - Registro Único de Víctimas', 'section': 'diferenciales'},
                'diferenciales/sisben': {'name': 'Certificado SISBEN', 'section': 'diferenciales'},
                'diferenciales/grupo-etnico': {'name': 'Certificado Grupo Étnico', 'section': 'diferenciales'},
                'diferenciales/arn': {'name': 'Certificado ARN', 'section': 'diferenciales'},
                'diferenciales/discapacidad': {'name': 'Certificado Discapacidad', 'section': 'diferenciales'},
                'diferenciales/mujer-cabeza-familia': {'name': 'Mujer Cabeza de Familia', 'section': 'diferenciales'},
                'diferenciales/persona-discapacidad': {'name': 'Persona en Situación de Discapacidad', 'section': 'diferenciales'},
                'control/antecedentes-fiscales': {'name': 'Antecedentes Fiscales', 'section': 'control'},
                'control/antecedentes-disciplinarios': {'name': 'Antecedentes Disciplinarios', 'section': 'control'},
                'control/antecedentes-judiciales': {'name': 'Antecedentes Judiciales', 'section': 'control'},
                'control/antecedentes-contraloria': {'name': 'Antecedentes Contraloría', 'section': 'control'},
                'control/antecedentes-procuraduria': {'name': 'Antecedentes Procuraduría', 'section': 'control'},
                'control/redam': {'name': 'Certificado REDAM', 'section': 'control'},
                'control/rnmc': {'name': 'Certificado RNMC', 'section': 'control'},
                'control/inhabilidades-sexuales': {'name': 'Antecedentes Sexuales', 'section': 'control'},
                'funcionamiento/matricula-mercantil': {'name': 'Matrícula Mercantil', 'section': 'funcionamiento'},
                'funcionamiento/facturas-6meses': {'name': 'Facturas 6 Meses', 'section': 'funcionamiento'},
                'funcionamiento/facturas-venta': {'name': 'Facturas de Venta', 'section': 'funcionamiento'},
                'funcionamiento/publicaciones-redes': {'name': 'Publicaciones en Redes', 'section': 'funcionamiento'},
                'funcionamiento/redes-sociales': {'name': 'Redes Sociales', 'section': 'funcionamiento'},
                'funcionamiento/registro-ventas': {'name': 'Registro de Ventas', 'section': 'funcionamiento'},
                'funcionamiento/comprobantes-ventas': {'name': 'Comprobantes de Ventas', 'section': 'funcionamiento'},
                'videos/presentacion': {'name': 'Video de Presentación', 'section': 'videos'}
            }
            
            response = s3_service.s3_client.list_objects_v2(
                Bucket=s3_service.bucket_name,
                Prefix=prefix
            )
            
            # Diccionario para agrupar archivos por tipo de documento (igual que en get_user_detailed_info)
            files_by_type = {}
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    file_key = obj['Key']
                    
                    # Extraer información del archivo
                    file_parts = file_key.split('/')
                    if len(file_parts) >= 4:  # usuarios/ID/documentos/tipo/archivo
                        filename = file_parts[-1]
                        
                        # Filtrar archivos .keep y otros archivos técnicos
                        if filename == '.keep' or filename.startswith('.'):
                            continue
                            
                        doc_type_path = '/'.join(file_parts[3:-1])  # tipo/subtipo
                        
                        # Obtener información del documento - solo procesar si está mapeado
                        doc_info = document_types_mapping.get(doc_type_path)
                        if not doc_info:
                            # Saltar archivos no mapeados (elimina la sección "otros")
                            continue
                        
                        # Agrupar por tipo de documento y mantener solo el más reciente
                        if doc_type_path not in files_by_type:
                            files_by_type[doc_type_path] = obj
                        else:
                            # Comparar fechas y mantener el más reciente
                            if obj['LastModified'] > files_by_type[doc_type_path]['LastModified']:
                                files_by_type[doc_type_path] = obj
            
            # Contar archivos únicos (igual que total_files en get_user_detailed_info)
            total_files = len(files_by_type)
            
            return total_files
            
        except Exception as e:
            print(f"Error contando documentos de S3: {e}")
            # Fallback: contar campos de la base de datos
            return self._count_documents_fallback()
    
    def _count_documents_fallback(self):
        """Método de respaldo para contar documentos desde la base de datos"""
        count = 0
        
        # Lista completa de campos de documentos
        document_fields = [
            # Documentos obligatorios
            'doc_terminos_pdf', 'doc_uso_imagen_pdf', 'doc_plan_negocio_xls', 
            'doc_vecindad_pdf', 'declaracion_capacidad_legal_pdf',
            
            # Documentos por tipo de persona
            'rut_pdf', 'cedula_pdf', 'cedula_representante_pdf', 'cert_existencia_pdf',
            
            # Documentos diferenciales
            'ruv_pdf', 'sisben_pdf', 'grupo_etnico_pdf', 'arn_pdf', 'discapacidad_pdf',
            'mujer_cabeza_familia_pdf', 'persona_discapacidad_pdf',
            
            # Documentos de control
            'antecedentes_fiscales_pdf', 'antecedentes_disciplinarios_pdf', 
            'antecedentes_judiciales_pdf', 'redam_pdf', 'inhabilidades_sexuales_pdf',
            
            # Documentos de funcionamiento
            'matricula_mercantil_pdf', 'facturas_6meses_pdf', 
            'publicaciones_redes_pdf', 'registro_ventas_pdf'
        ]
        
        # Contar campos que tienen referencias de archivos
        for field in document_fields:
            field_value = getattr(self, field, None)
            if field_value:
                # Verificar si es una referencia válida (string) o datos binarios
                if isinstance(field_value, str) and field_value.strip():
                    count += 1
                elif isinstance(field_value, bytes) and len(field_value) > 0:
                    count += 1
        
        # Video de presentación (campo especial)
        if self.video_url and self.video_url.strip():
            count += 1
        
        return count

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'email': self.email,
            'telefono': self.telefono,
            'fecha_nacimiento': self.fecha_nacimiento.isoformat() if self.fecha_nacimiento else None,
            'sexo': self.sexo,
            'estado_civil': self.estado_civil,
            'direccion': self.direccion,
            'municipio': self.municipio,
            'corregimiento_vereda': self.corregimiento_vereda,
            'pais': self.pais,
            'ciudad': self.ciudad,
            'bio': self.bio,
            'tipo_documento': self.tipo_documento,
            'numero_documento': self.numero_documento,
            'doc_terminos_pdf_nombre': self.doc_terminos_pdf_nombre,
            'doc_uso_imagen_pdf_nombre': self.doc_uso_imagen_pdf_nombre,
            'doc_plan_negocio_nombre': self.doc_plan_negocio_nombre,
            'doc_vecindad_pdf_nombre': self.doc_vecindad_pdf_nombre,
            'video_url': self.video_url,
            'rut_pdf_nombre': self.rut_pdf_nombre,
            'cedula_pdf_nombre': self.cedula_pdf_nombre,
            'cedula_representante_pdf_nombre': self.cedula_representante_pdf_nombre,
            'cert_existencia_pdf_nombre': self.cert_existencia_pdf_nombre,
            'ruv_pdf_nombre': self.ruv_pdf_nombre,
            'sisben_pdf_nombre': self.sisben_pdf_nombre,
            'grupo_etnico_pdf_nombre': self.grupo_etnico_pdf_nombre,
            'arn_pdf_nombre': self.arn_pdf_nombre,
            'discapacidad_pdf_nombre': self.discapacidad_pdf_nombre,
            'antecedentes_fiscales_pdf_nombre': self.antecedentes_fiscales_pdf_nombre,
            'antecedentes_disciplinarios_pdf_nombre': self.antecedentes_disciplinarios_pdf_nombre,
            'antecedentes_judiciales_pdf_nombre': self.antecedentes_judiciales_pdf_nombre,
            'redam_pdf_nombre': self.redam_pdf_nombre,
            'inhabilidades_sexuales_pdf_nombre': self.inhabilidades_sexuales_pdf_nombre,
            'declaracion_capacidad_legal_pdf_nombre': self.declaracion_capacidad_legal_pdf_nombre,
            # 'declaracion_juramentada_pdf_nombre': self.declaracion_juramentada_pdf_nombre,
            'estado_control': self.estado_control,
            'resultado_certificados': self.resultado_certificados,
            'emprendimiento_formalizado': self.emprendimiento_formalizado,
            'matricula_mercantil_pdf_nombre': self.matricula_mercantil_pdf_nombre,
            'facturas_6meses_pdf_nombre': self.facturas_6meses_pdf_nombre,
            'publicaciones_redes_pdf_nombre': self.publicaciones_redes_pdf_nombre,
            'registro_ventas_pdf_nombre': self.registro_ventas_pdf_nombre,
            # Población Diferencial (Paso 2)
            'mujer_cabeza_familia': self.mujer_cabeza_familia,
            'victima_conflicto': self.victima_conflicto,
            'persona_discapacidad': self.persona_discapacidad,
            'pertenencia_etnica': self.pertenencia_etnica,
            'sisben_grupo': self.sisben_grupo,
            'persona_reincorporacion': self.persona_reincorporacion,
            # Información del Emprendimiento (Paso 3)
            'tiempo_funcionamiento': self.tiempo_funcionamiento,
            'empleos_generados': self.empleos_generados,
            'acceso_mercados': self.acceso_mercados,
            'financiado_estado': self.financiado_estado,
            'financiado_regalias': self.financiado_regalias,
            'financiado_camara_comercio': self.financiado_camara_comercio,
            'financiado_incubadoras': self.financiado_incubadoras,
            'financiado_otro': self.financiado_otro,
            'financiado_otro_texto': self.financiado_otro_texto,
            'declara_veraz': self.declara_veraz,
            'declara_no_beneficiario': self.declara_no_beneficiario,
            'acepta_terminos': self.acepta_terminos,
            'fecha_aceptacion_terminos': self.fecha_aceptacion_terminos.isoformat() if self.fecha_aceptacion_terminos else None,
            'estado_inscripcion': self.estado_inscripcion,
            'paso_actual': self.paso_actual,
            'fecha_ultimo_guardado': self.fecha_ultimo_guardado.isoformat() if self.fecha_ultimo_guardado else None,
            'formulario_enviado': self.formulario_enviado,
            'rol': self.rol,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'fecha_finalizacion': self.fecha_finalizacion.isoformat() if self.fecha_finalizacion else None,
            'estado_cuenta': self.estado_cuenta,
            'convocatoria': self.convocatoria,
            'emprendimiento_nombre': self.emprendimiento_nombre,
            'emprendimiento_sector': self.emprendimiento_sector,
            'tipo_persona': self.tipo_persona,
            # Gestión de fases (con verificaciones seguras)
            'fase_actual': getattr(self, 'fase_actual', 'inscripcion'),
            'fecha_entrada_fase': getattr(self, 'fecha_entrada_fase', None).isoformat() if hasattr(self, 'fecha_entrada_fase') and getattr(self, 'fecha_entrada_fase', None) else None,
            'fase_completada': getattr(self, 'fase_completada', False),
            'documentos_subidos': self.count_uploaded_documents()
        }
