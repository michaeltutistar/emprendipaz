from datetime import datetime
from . import db

class FormularioCampo(db.Model):
    __tablename__ = 'formulario_campos'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre_campo = db.Column(db.String(100), nullable=False, unique=True)
    etiqueta = db.Column(db.String(200), nullable=False)
    tipo_campo = db.Column(db.String(50), nullable=False)  # text, email, select, checkbox, file, date, etc.
    es_obligatorio = db.Column(db.Boolean, default=False, nullable=False)
    es_subsanable = db.Column(db.Boolean, default=True, nullable=False)
    orden = db.Column(db.Integer, nullable=False, default=0)
    seccion = db.Column(db.String(100), nullable=False, default='general')  # personal, emprendimiento, documentos, etc.
    opciones = db.Column(db.Text, nullable=True)  # JSON para selects, checkboxes
    validaciones = db.Column(db.Text, nullable=True)  # JSON con reglas de validación
    descripcion = db.Column(db.Text, nullable=True)
    es_activo = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre_campo': self.nombre_campo,
            'etiqueta': self.etiqueta,
            'tipo_campo': self.tipo_campo,
            'es_obligatorio': self.es_obligatorio,
            'es_subsanable': self.es_subsanable,
            'orden': self.orden,
            'seccion': self.seccion,
            'opciones': self.opciones,
            'validaciones': self.validaciones,
            'descripcion': self.descripcion,
            'es_activo': self.es_activo
        }
