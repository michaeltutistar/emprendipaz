from datetime import datetime
from . import db


class CuposConfig(db.Model):
    __tablename__ = 'cupos_config'

    id = db.Column(db.Integer, primary_key=True)
    convocatoria = db.Column(db.String(50), nullable=False, default='2025')
    modo = db.Column(db.String(20), nullable=False, default='abierto')  # 'abierto' | 'bloqueado'
    cupo_global_max = db.Column(db.Integer, nullable=True)  # None = ilimitado
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'convocatoria': self.convocatoria,
            'modo': self.modo,
            'cupo_global_max': self.cupo_global_max,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


