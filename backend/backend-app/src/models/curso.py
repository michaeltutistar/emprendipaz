from datetime import datetime
from . import db

class Curso(db.Model):
    __tablename__ = 'cursos'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)
    tipo = db.Column(db.String(20), nullable=False)  # video, pdf, quiz, otro
    url = db.Column(db.String(500), nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relación con usuarios a través de UsuarioCurso
    usuarios = db.relationship('UsuarioCurso', backref='curso_rel', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Curso {self.titulo}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'tipo': self.tipo,
            'url': self.url,
            'activo': self.activo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'total_usuarios': len(self.usuarios),
            'usuarios_completados': len([u for u in self.usuarios if u.estado == 'completado'])
        }
    
    def to_dict_simple(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descripcion': self.descripcion,
            'tipo': self.tipo,
            'url': self.url,
            'activo': self.activo
        }