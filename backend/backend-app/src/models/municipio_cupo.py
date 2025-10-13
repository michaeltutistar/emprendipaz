from datetime import datetime
from . import db


class MunicipioCupo(db.Model):
    __tablename__ = 'municipio_cupo'

    id = db.Column(db.Integer, primary_key=True)
    municipio_slug = db.Column(db.String(120), unique=True, nullable=False)
    subregion = db.Column(db.String(80), nullable=False)
    cupo_max = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'municipio_slug': self.municipio_slug,
            'subregion': self.subregion,
            'cupo_max': self.cupo_max,
        }


