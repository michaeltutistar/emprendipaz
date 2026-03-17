from datetime import datetime
from . import db

class RespuestasPlanNegocio(db.Model):
    __tablename__ = 'respuestas_plan_negocio'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    modulo_nombre = db.Column(db.String(200), nullable=False)
    respuestas_json = db.Column(db.JSON, nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'modulo_nombre': self.modulo_nombre,
            'respuestas_json': self.respuestas_json,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None
        }
