from datetime import datetime
from . import db

class Leccion(db.Model):
    __tablename__ = 'leccion'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    contenido = db.Column(db.Text)  # Contenido de la lección (texto, HTML, etc.)
    modulo_id = db.Column(db.Integer, db.ForeignKey('modulo.id'), nullable=False)
    orden = db.Column(db.Integer, default=1)  # Para mantener el orden de las lecciones
    tipo = db.Column(db.String(50), default='texto')  # texto, video, pdf, quiz, etc.
    duracion_minutos = db.Column(db.Integer, default=0)
    url_video = db.Column(db.String(500))  # URL del video si es tipo video
    archivo_url = db.Column(db.String(500))  # URL del archivo adjunto
    estado = db.Column(db.String(20), default='activo')  # activo, inactivo, borrador
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones (temporalmente comentadas para evitar importaciones circulares)
    # modulo = db.relationship('Modulo', backref='lecciones', foreign_keys=[modulo_id])
    
    def __repr__(self):
        return f'<Leccion {self.titulo}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'contenido': self.contenido,
            'modulo_id': self.modulo_id,
            'orden': self.orden,
            'tipo': self.tipo,
            'duracion_minutos': self.duracion_minutos,
            'url_video': self.url_video,
            'archivo_url': self.archivo_url,
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        } 