from datetime import datetime
from . import db

class AsistenciaJornada(db.Model):
    __tablename__ = 'asistencia_jornada'
    
    id = db.Column(db.Integer, primary_key=True)
    estudiante_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    jornada_numero = db.Column(db.Integer, nullable=False)  # 1-10
    marcada = db.Column(db.Boolean, default=False, nullable=False)
    fecha_marcado = db.Column(db.DateTime, nullable=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    __table_args__ = (db.UniqueConstraint('estudiante_id', 'jornada_numero', name='_estudiante_jornada_uc'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'estudiante_id': self.estudiante_id,
            'jornada_numero': self.jornada_numero,
            'marcada': self.marcada,
            'fecha_marcado': self.fecha_marcado.isoformat() if self.fecha_marcado else None,
            'instructor_id': self.instructor_id,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None
        }
