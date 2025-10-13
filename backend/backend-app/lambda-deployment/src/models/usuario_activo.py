from datetime import datetime
from . import db

class UsuarioActivo(db.Model):
    __tablename__ = 'usuarios_activos'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    activo_id = db.Column(db.Integer, db.ForeignKey('activos.id', ondelete='CASCADE'), nullable=False)
    fecha_entrega = db.Column(db.Date, nullable=True)
    estado = db.Column(db.String(20), default='pendiente', nullable=False)  # pendiente, entregado, rechazado
    observaciones = db.Column(db.Text, nullable=True)
    fecha_asignacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relaciones
    user = db.relationship('User', backref='activos_asignados', lazy=True)
    activo = db.relationship('Activo', backref='asignaciones', lazy=True)

    __table_args__ = (db.UniqueConstraint('user_id', 'activo_id', name='_user_activo_uc'),)

    def __repr__(self):
        return f'<UsuarioActivo User:{self.user_id} Activo:{self.activo_id} Estado:{self.estado}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activo_id': self.activo_id,
            'fecha_entrega': self.fecha_entrega.isoformat() if self.fecha_entrega else None,
            'estado': self.estado,
            'observaciones': self.observaciones,
            'fecha_asignacion': self.fecha_asignacion.isoformat() if self.fecha_asignacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'activo': self.activo.to_dict_simple() if self.activo else None,
            'usuario': {
                'id': self.user.id,
                'nombre': f"{self.user.nombre} {self.user.apellido}",
                'email': self.user.email
            } if self.user else None
        }
    
    def to_dict_with_activo(self):
        """Retorna la información con detalles del activo"""
        return {
            'id': self.id,
            'estado': self.estado,
            'fecha_entrega': self.fecha_entrega.isoformat() if self.fecha_entrega else None,
            'observaciones': self.observaciones,
            'fecha_asignacion': self.fecha_asignacion.isoformat() if self.fecha_asignacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
            'activo': self.activo.to_dict_simple() if self.activo else None
        }
