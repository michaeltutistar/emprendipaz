from datetime import datetime
from . import db

class UsuarioCurso(db.Model):
    __tablename__ = 'usuarios_cursos'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    curso_id = db.Column(db.Integer, db.ForeignKey('cursos.id'), nullable=False)
    estado = db.Column(db.String(20), default='pendiente', nullable=False)  # pendiente, en_progreso, completado
    fecha_asignacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    fecha_completado = db.Column(db.DateTime, nullable=True)
    progreso = db.Column(db.Integer, default=0, nullable=False)  # 0-100
    fecha_inicio = db.Column(db.DateTime, nullable=True)
    fecha_ultima_actividad = db.Column(db.DateTime, nullable=True)
    
    # Relaciones
    user = db.relationship('User', backref='cursos_asignados', lazy=True)
    curso = db.relationship('Curso', backref='asignaciones', lazy=True)
    
    def __repr__(self):
        return f'<UsuarioCurso {self.user_id}-{self.curso_id}: {self.estado}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'curso_id': self.curso_id,
            'estado': self.estado,
            'fecha_asignacion': self.fecha_asignacion.isoformat() if self.fecha_asignacion else None,
            'fecha_completado': self.fecha_completado.isoformat() if self.fecha_completado else None,
            'progreso': self.progreso,
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_ultima_actividad': self.fecha_ultima_actividad.isoformat() if self.fecha_ultima_actividad else None,
            'curso': self.curso.to_dict_simple() if self.curso else None,
            'usuario': {
                'id': self.user.id,
                'nombre': f"{self.user.nombre} {self.user.apellido}",
                'email': self.user.email
            } if self.user else None
        }
    
    def to_dict_with_curso(self):
        """Retorna la información con detalles del curso"""
        return {
            'id': self.id,
            'estado': self.estado,
            'progreso': self.progreso,
            'fecha_asignacion': self.fecha_asignacion.isoformat() if self.fecha_asignacion else None,
            'fecha_completado': self.fecha_completado.isoformat() if self.fecha_completado else None,
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_ultima_actividad': self.fecha_ultima_actividad.isoformat() if self.fecha_ultima_actividad else None,
            'curso': self.curso.to_dict_simple() if self.curso else None
        }
