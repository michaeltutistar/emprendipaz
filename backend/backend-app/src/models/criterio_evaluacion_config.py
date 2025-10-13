from datetime import datetime
from . import db

class CriterioEvaluacionConfig(db.Model):
    __tablename__ = 'criterios_evaluacion_config'
    
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(50), nullable=False, unique=True)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    categoria = db.Column(db.String(100), nullable=False)  # vulnerabilidad, madurez, formalizacion, etc.
    puntaje_maximo = db.Column(db.Integer, nullable=False, default=0)
    campo_formulario = db.Column(db.String(100), nullable=True)  # Nombre del campo que se evalúa
    criterios_puntuacion = db.Column(db.Text, nullable=True)  # JSON con criterios de puntuación
    es_activo = db.Column(db.Boolean, default=True, nullable=False)
    orden = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'categoria': self.categoria,
            'puntaje_maximo': self.puntaje_maximo,
            'campo_formulario': self.campo_formulario,
            'criterios_puntuacion': self.criterios_puntuacion,
            'es_activo': self.es_activo,
            'orden': self.orden
        }
