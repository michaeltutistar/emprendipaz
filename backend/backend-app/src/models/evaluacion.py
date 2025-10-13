from datetime import datetime
from . import db

class Evaluacion(db.Model):
    __tablename__ = 'evaluaciones'

    id = db.Column(db.Integer, primary_key=True)
    evaluador_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    criterio_id = db.Column(db.Integer, db.ForeignKey('criterios_evaluacion.id'), nullable=False)
    puntaje = db.Column(db.Integer, nullable=False)  # Puntaje asignado (0 a max_puntaje del criterio)
    observaciones = db.Column(db.Text, nullable=True)
    fecha_evaluacion = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    evaluador = db.relationship('User', foreign_keys=[evaluador_id], backref='evaluaciones_realizadas')
    usuario = db.relationship('User', foreign_keys=[usuario_id], backref='evaluaciones_recibidas')
    criterio = db.relationship('CriterioEvaluacion', backref='evaluaciones')

    def __repr__(self):
        return f'<Evaluacion {self.evaluador_id} -> {self.usuario_id} ({self.criterio.codigo}): {self.puntaje}>'

    def to_dict(self):
        return {
            'id': self.id,
            'evaluador_id': self.evaluador_id,
            'usuario_id': self.usuario_id,
            'criterio_id': self.criterio_id,
            'puntaje': self.puntaje,
            'observaciones': self.observaciones,
            'fecha_evaluacion': self.fecha_evaluacion.isoformat() if self.fecha_evaluacion else None,
            'criterio': {
                'codigo': self.criterio.codigo,
                'descripcion': self.criterio.descripcion,
                'peso': float(self.criterio.peso),
                'max_puntaje': self.criterio.max_puntaje
            } if self.criterio else None
        }

    @staticmethod
    def obtener_evaluaciones_usuario(usuario_id):
        """Obtener todas las evaluaciones de un usuario"""
        return Evaluacion.query.filter_by(usuario_id=usuario_id).all()

    @staticmethod
    def obtener_puntaje_total_usuario(usuario_id):
        """Calcular el puntaje total ponderado de un usuario"""
        evaluaciones = Evaluacion.query.filter_by(usuario_id=usuario_id).all()
        puntaje_total = 0.0
        
        for evaluacion in evaluaciones:
            # Puntaje ponderado = (puntaje / max_puntaje) * peso
            puntaje_ponderado = (evaluacion.puntaje / evaluacion.criterio.max_puntaje) * float(evaluacion.criterio.peso)
            puntaje_total += puntaje_ponderado
        
        return round(puntaje_total, 2)

    @staticmethod
    def verificar_evaluacion_completa(usuario_id):
        """Verificar si un usuario tiene todas las evaluaciones completas"""
        from .criterio_evaluacion import CriterioEvaluacion
        criterios_count = db.session.query(db.func.count(CriterioEvaluacion.id)).filter_by(activo=True).scalar()
        evaluaciones_count = db.session.query(db.func.count(Evaluacion.id)).filter_by(usuario_id=usuario_id).scalar()
        
        return criterios_count == evaluaciones_count
