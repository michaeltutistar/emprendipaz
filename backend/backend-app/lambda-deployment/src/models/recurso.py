from datetime import datetime
from . import db

class Recurso(db.Model):
    __tablename__ = 'recurso'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    tipo = db.Column(db.String(50), nullable=False)  # documento, video, imagen, audio, etc.
    categoria = db.Column(db.String(100))  # académico, administrativo, tutorial, etc.
    
    # URLs de S3
    s3_key = db.Column(db.String(500), nullable=False)  # Clave única en S3
    s3_url = db.Column(db.String(500), nullable=False)  # URL pública del archivo
    s3_bucket = db.Column(db.String(100), nullable=False)  # Bucket de S3
    
    # Metadatos del archivo
    nombre_original = db.Column(db.String(255), nullable=False)  # Nombre original del archivo
    extension = db.Column(db.String(20), nullable=False)  # Extensión del archivo
    tamano_bytes = db.Column(db.BigInteger, nullable=False)  # Tamaño en bytes
    mime_type = db.Column(db.String(100), nullable=False)  # Tipo MIME
    
    # Relaciones
    curso_id = db.Column(db.Integer, db.ForeignKey('curso.id'))  # Opcional: recurso asociado a un curso
    modulo_id = db.Column(db.Integer, db.ForeignKey('modulo.id'))  # Opcional: recurso asociado a un módulo
    leccion_id = db.Column(db.Integer, db.ForeignKey('leccion.id'))  # Opcional: recurso asociado a una lección
    subido_por = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Usuario que subió el recurso
    
    # Estados y fechas
    estado = db.Column(db.String(20), default='activo')  # activo, inactivo, eliminado
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Configuración de acceso
    acceso_publico = db.Column(db.Boolean, default=True)  # Si es accesible públicamente
    requiere_autenticacion = db.Column(db.Boolean, default=False)  # Si requiere login para acceder
    
    # Relaciones (temporalmente comentadas para evitar importaciones circulares)
    # curso = db.relationship('Curso', backref='recursos', foreign_keys=[curso_id])
    # modulo = db.relationship('Modulo', backref='recursos', foreign_keys=[modulo_id])
    # leccion = db.relationship('Leccion', backref='recursos', foreign_keys=[leccion_id])
    # usuario = db.relationship('User', backref='recursos_subidos', foreign_keys=[subido_por])
    
    def __repr__(self):
        return f'<Recurso {self.titulo}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'tipo': self.tipo,
            'categoria': self.categoria,
            's3_key': self.s3_key,
            's3_url': self.s3_url,
            's3_bucket': self.s3_bucket,
            'nombre_original': self.nombre_original,
            'extension': self.extension,
            'tamano_bytes': self.tamano_bytes,
            'mime_type': self.mime_type,
            'curso_id': self.curso_id,
            'modulo_id': self.modulo_id,
            'leccion_id': self.leccion_id,
            'subido_por': self.subido_por,
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'acceso_publico': self.acceso_publico,
            'requiere_autenticacion': self.requiere_autenticacion,
            'tamano_formateado': self.format_file_size()
        }
    
    def format_file_size(self):
        """Formatear el tamaño del archivo en formato legible"""
        if self.tamano_bytes < 1024:
            return f"{self.tamano_bytes} B"
        elif self.tamano_bytes < 1024 * 1024:
            return f"{self.tamano_bytes / 1024:.1f} KB"
        elif self.tamano_bytes < 1024 * 1024 * 1024:
            return f"{self.tamano_bytes / (1024 * 1024):.1f} MB"
        else:
            return f"{self.tamano_bytes / (1024 * 1024 * 1024):.1f} GB"
    
    def get_file_icon(self):
        """Obtener el ícono correspondiente al tipo de archivo"""
        icon_map = {
            'documento': '📄',
            'pdf': '📕',
            'video': '🎥',
            'audio': '🎵',
            'imagen': '🖼️',
            'presentacion': '📊',
            'hoja_calculo': '📈',
            'archivo': '📁',
            'zip': '📦',
            'tutorial': '📚'
        }
        return icon_map.get(self.tipo, '📄') 