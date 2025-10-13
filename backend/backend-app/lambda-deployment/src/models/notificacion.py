from datetime import datetime
from . import db

class Notificacion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    mensaje = db.Column(db.Text, nullable=False)
    fase_nueva = db.Column(db.String(20), nullable=False)  # inscripcion | formacion | entrega_activos
    fecha = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    leida = db.Column(db.Boolean, default=False, nullable=False)
    
    # Relación con User
    user = db.relationship('User', backref=db.backref('notificaciones', lazy=True))
    
    def __repr__(self):
        return f'<Notificacion {self.id} - {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'mensaje': self.mensaje,
            'fase_nueva': self.fase_nueva,
            'fecha': self.fecha.isoformat(),
            'leida': self.leida
        }
