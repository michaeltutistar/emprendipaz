from datetime import datetime
from . import db

class Modulo(db.Model):
    __tablename__ = 'modulo'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    curso_id = db.Column(db.Integer, db.ForeignKey('curso.id'), nullable=False)
    orden = db.Column(db.Integer, default=1)  # Para mantener el orden de los módulos
    estado = db.Column(db.String(20), default='activo')  # activo, inactivo, borrador
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones (temporalmente comentadas para evitar importaciones circulares)
    # curso = db.relationship('Curso', backref='modulos', foreign_keys=[curso_id])
    # lecciones = db.relationship('Leccion', backref='modulo', lazy='dynamic', foreign_keys='Leccion.modulo_id')
    
    def __repr__(self):
        return f'<Modulo {self.titulo}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'curso_id': self.curso_id,
            'orden': self.orden,
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'total_lecciones': 0  # Se obtendrá por consulta separada
        } 