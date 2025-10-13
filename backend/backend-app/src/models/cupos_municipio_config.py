from datetime import datetime
from . import db

class CuposMunicipioConfig(db.Model):
    __tablename__ = 'cupos_municipio_config'
    
    id = db.Column(db.Integer, primary_key=True)
    municipio = db.Column(db.String(100), nullable=False)
    subregion = db.Column(db.String(100), nullable=False)
    cupo_total = db.Column(db.Integer, nullable=False, default=0)
    cupo_utilizado = db.Column(db.Integer, nullable=False, default=0)
    cupo_disponible = db.Column(db.Integer, nullable=False, default=0)
    es_activo = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'municipio': self.municipio,
            'subregion': self.subregion,
            'cupo_total': self.cupo_total,
            'cupo_utilizado': self.cupo_utilizado,
            'cupo_disponible': self.cupo_disponible,
            'es_activo': self.es_activo
        }
