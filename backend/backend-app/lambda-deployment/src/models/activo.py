from datetime import datetime
from . import db

class Activo(db.Model):
    __tablename__ = 'activos'

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    categoria = db.Column(db.String(100), nullable=False)
    valor_estimado = db.Column(db.Numeric(12, 2), nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relación con usuarios_activos
    usuarios_activos = db.relationship('UsuarioActivo', backref='activo_rel', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Activo {self.nombre}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'categoria': self.categoria,
            'valor_estimado': float(self.valor_estimado) if self.valor_estimado else None,
            'activo': self.activo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'total_asignaciones': len(self.usuarios_activos),
            'asignaciones_entregadas': len([u for u in self.usuarios_activos if u.estado == 'entregado'])
        }
    
    def to_dict_simple(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'categoria': self.categoria,
            'valor_estimado': float(self.valor_estimado) if self.valor_estimado else None,
            'activo': self.activo
        }
