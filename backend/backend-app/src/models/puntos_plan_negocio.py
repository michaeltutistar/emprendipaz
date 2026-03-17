from datetime import datetime
from . import db


class PuntosPlanNegocio(db.Model):
    __tablename__ = 'puntos_plan_negocio'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    modulo_nombre = db.Column(db.String(200), nullable=False)
    etapa = db.Column(db.String(50), nullable=False)  # introduccion, crecimiento, madurez, declive
    estrategia = db.Column(db.String(200), nullable=False)
    puntos = db.Column(db.Integer, nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'modulo_nombre': self.modulo_nombre,
            'etapa': self.etapa,
            'estrategia': self.estrategia,
            'puntos': self.puntos,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None
        }
