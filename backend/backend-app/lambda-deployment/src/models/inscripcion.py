from datetime import datetime
from . import db

class Inscripcion(db.Model):
    __tablename__ = 'inscripcion'
    
    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    curso_id = db.Column(db.Integer, db.ForeignKey('curso.id'), nullable=False)
    fecha_inscripcion = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.String(20), default='activa')
    
    # Relaciones (temporalmente comentadas para evitar importaciones circulares)
    # estudiante = db.relationship('User', backref='inscripciones', foreign_keys=[estudiante_id])
    # curso = db.relationship('Curso', backref='inscripciones', foreign_keys=[curso_id])
    
    def __repr__(self):
        return f'<Inscripcion {self.estudiante_id}-{self.curso_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'estudiante_id': self.estudiante_id,
            'estudiante_nombre': None,  # Se obtendrá por consulta separada
            'estudiante_email': None,   # Se obtendrá por consulta separada
            'curso_id': self.curso_id,
            'curso_titulo': None,       # Se obtendrá por consulta separada
            'fecha_inscripcion': self.fecha_inscripcion.isoformat() if self.fecha_inscripcion else None,
            'estado': self.estado
        } 