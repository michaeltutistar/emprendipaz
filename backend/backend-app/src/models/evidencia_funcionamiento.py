from datetime import datetime
from . import db

class EvidenciaFuncionamiento(db.Model):
    __tablename__ = 'evidencias_funcionamiento'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    tipo = db.Column(db.String(10), nullable=False)  # formal, informal
    archivo1 = db.Column(db.LargeBinary, nullable=True)  # BYTEA
    archivo1_nombre = db.Column(db.String(255), nullable=True)
    archivo2 = db.Column(db.LargeBinary, nullable=True)  # BYTEA
    archivo2_nombre = db.Column(db.String(255), nullable=True)
    observaciones = db.Column(db.Text, nullable=True)
    fecha_subida = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    estado_revision = db.Column(db.String(20), default='pendiente', nullable=False)  # pendiente, aprobado, rechazado
    fecha_revision = db.Column(db.DateTime, nullable=True)
    revisado_por = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    # Relaciones
    user = db.relationship('User', foreign_keys=[user_id], backref='evidencias_funcionamiento', lazy=True)
    revisor = db.relationship('User', foreign_keys=[revisado_por], backref='evidencias_revisadas', lazy=True)

    def __repr__(self):
        return f'<EvidenciaFuncionamiento User:{self.user_id} Tipo:{self.tipo} Estado:{self.estado_revision}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'tipo': self.tipo,
            'archivo1_nombre': self.archivo1_nombre,
            'archivo2_nombre': self.archivo2_nombre,
            'observaciones': self.observaciones,
            'fecha_subida': self.fecha_subida.isoformat() if self.fecha_subida else None,
            'estado_revision': self.estado_revision,
            'fecha_revision': self.fecha_revision.isoformat() if self.fecha_revision else None,
            'revisado_por': self.revisado_por,
            'usuario': {
                'id': self.user.id,
                'nombre': f"{self.user.nombre} {self.user.apellido}",
                'email': self.user.email
            } if self.user else None,
            'revisor': {
                'id': self.revisor.id,
                'nombre': f"{self.revisor.nombre} {self.revisor.apellido}",
                'email': self.revisor.email
            } if self.revisor else None
        }
    
    def to_dict_with_files(self):
        """Retorna la información incluyendo los archivos (para descarga)"""
        data = self.to_dict()
        data['archivo1'] = self.archivo1
        data['archivo2'] = self.archivo2
        return data
    
    def get_archivo_info(self, numero):
        """Obtener información de un archivo específico"""
        if numero == 1:
            return {
                'contenido': self.archivo1,
                'nombre': self.archivo1_nombre,
                'tipo': 'matrícula_mercantil' if self.tipo == 'formal' else 'publicaciones_redes'
            }
        elif numero == 2:
            return {
                'contenido': self.archivo2,
                'nombre': self.archivo2_nombre,
                'tipo': 'facturas' if self.tipo == 'formal' else 'registro_ventas'
            }
        return None
