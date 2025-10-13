from datetime import datetime
from . import db

class CriterioEvaluacion(db.Model):
    __tablename__ = 'criterios_evaluacion'

    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(20), nullable=False, unique=True)
    descripcion = db.Column(db.Text, nullable=False)
    peso = db.Column(db.Numeric(5, 2), nullable=False)  # Peso del criterio (ej: 25.50)
    max_puntaje = db.Column(db.Integer, nullable=False)  # Puntaje máximo del criterio
    orden = db.Column(db.Integer, nullable=False, unique=True)  # Orden de presentación
    activo = db.Column(db.Boolean, default=True, nullable=False)
    observaciones = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relación con evaluaciones (comentada temporalmente hasta crear el modelo Evaluacion)
    # evaluaciones = db.relationship('Evaluacion', backref='criterio', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<CriterioEvaluacion {self.codigo}: {self.descripcion[:50]}...>'

    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'descripcion': self.descripcion,
            'peso': float(self.peso),
            'max_puntaje': self.max_puntaje,
            'orden': self.orden,
            'activo': self.activo,
            'observaciones': self.observaciones,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def validar_pesos():
        """Validar que la suma de pesos sea 100"""
        total_peso = db.session.query(db.func.sum(CriterioEvaluacion.peso)).filter_by(activo=True).scalar()
        return total_peso == 100.0 if total_peso else False

    @staticmethod
    def obtener_total_peso():
        """Obtener el total de pesos de criterios activos"""
        return db.session.query(db.func.sum(CriterioEvaluacion.peso)).filter_by(activo=True).scalar() or 0.0

    @staticmethod
    def obtener_estadisticas():
        """Obtener estadísticas básicas de criterios"""
        total_criterios = CriterioEvaluacion.query.filter_by(activo=True).count()
        total_peso = CriterioEvaluacion.obtener_total_peso()
        return {
            'total_criterios': total_criterios,
            'total_peso': float(total_peso),
            'peso_valido': total_peso == 100.0
        }
