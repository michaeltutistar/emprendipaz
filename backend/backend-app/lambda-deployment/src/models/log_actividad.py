from datetime import datetime
from . import db, User


class LogActividad(db.Model):
    __tablename__ = 'log_actividad'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=True)
    accion = db.Column(db.String(100), nullable=False)
    detalles = db.Column(db.Text, nullable=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        # Intentar enriquecer con datos del usuario si existe
        usuario_nombre = None
        usuario_email = None
        if self.usuario_id:
            try:
                user = User.query.get(self.usuario_id)
                if user:
                    usuario_nombre = f"{user.nombre} {user.apellido}"
                    usuario_email = user.email
            except Exception:
                pass
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nombre': usuario_nombre,
            'usuario_email': usuario_email,
            'accion': self.accion,
            'detalles': self.detalles,
            'fecha': self.fecha.isoformat() if self.fecha else None
        }