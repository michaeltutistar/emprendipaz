from datetime import datetime
from . import db

class DocumentoConfig(db.Model):
    __tablename__ = 'documentos_config'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre_campo = db.Column(db.String(100), nullable=False, unique=True)
    nombre_documento = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    es_obligatorio = db.Column(db.Boolean, default=False, nullable=False)
    es_subsanable = db.Column(db.Boolean, default=True, nullable=False)
    formatos_permitidos = db.Column(db.Text, nullable=True)  # JSON con formatos: ["pdf", "jpg", "png"]
    tamano_maximo_mb = db.Column(db.Integer, nullable=True, default=10)
    orden = db.Column(db.Integer, nullable=False, default=0)
    es_activo = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre_campo': self.nombre_campo,
            'nombre_documento': self.nombre_documento,
            'descripcion': self.descripcion,
            'es_obligatorio': self.es_obligatorio,
            'es_subsanable': self.es_subsanable,
            'formatos_permitidos': self.formatos_permitidos,
            'tamano_maximo_mb': self.tamano_maximo_mb,
            'orden': self.orden,
            'es_activo': self.es_activo
        }
