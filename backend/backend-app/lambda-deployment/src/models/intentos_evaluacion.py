from datetime import datetime
from . import db


class IntentosEvaluacion(db.Model):
    __tablename__ = 'intentos_evaluacion'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    modulo_nombre = db.Column(db.String(200), nullable=False)
    unidad_nombre = db.Column(db.String(200), nullable=False)
    paso_nombre = db.Column(db.String(200), nullable=False)
    todas_correctas = db.Column(db.Boolean, default=False)
    fecha_intento = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'modulo_nombre': self.modulo_nombre,
            'unidad_nombre': self.unidad_nombre,
            'paso_nombre': self.paso_nombre,
            'todas_correctas': self.todas_correctas,
            'fecha_intento': self.fecha_intento.isoformat() if self.fecha_intento else None
        }



