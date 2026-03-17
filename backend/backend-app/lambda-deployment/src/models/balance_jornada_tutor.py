import json
from datetime import datetime
from . import db


class BalanceJornadaTutor(db.Model):
    __tablename__ = 'balance_jornada_tutor'

    id = db.Column(db.Integer, primary_key=True)
    instructor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Fecha de la jornada (solo fecha, sin hora)
    fecha = db.Column(db.Date, nullable=False)
    nodo_territorial = db.Column(db.String(120), nullable=False)

    # Guardamos municipios como JSON en texto para compatibilidad
    municipios = db.Column(db.Text, nullable=True)

    modulos_desarrollados = db.Column(db.Text, nullable=True)
    nombre_tutor = db.Column(db.String(200), nullable=True)
    participantes_programados = db.Column(db.Integer, nullable=True)
    participantes_asistentes = db.Column(db.Integer, nullable=True)

    actividades = db.Column(db.Text, nullable=True)
    metodologia = db.Column(db.Text, nullable=True)
    mayores_dificultades = db.Column(db.Text, nullable=True)
    novedades_operativas = db.Column(db.Text, nullable=True)
    recomendaciones_mejora = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('instructor_id', 'fecha', 'nodo_territorial', name='uq_balance_instructor_fecha_nodo'),
    )

    def to_dict(self):
        municipios_list = []
        if self.municipios:
            try:
                municipios_list = json.loads(self.municipios) or []
            except Exception:
                municipios_list = []

        return {
            'id': self.id,
            'instructor_id': self.instructor_id,
            'fecha': self.fecha.isoformat() if self.fecha else None,
            'nodo_territorial': self.nodo_territorial,
            'municipios': municipios_list,
            'modulos_desarrollados': self.modulos_desarrollados or '',
            'nombre_tutor': self.nombre_tutor or '',
            'participantes_programados': self.participantes_programados,
            'participantes_asistentes': self.participantes_asistentes,
            'actividades': self.actividades or '',
            'metodologia': self.metodologia or '',
            'mayores_dificultades': self.mayores_dificultades or '',
            'novedades_operativas': self.novedades_operativas or '',
            'recomendaciones_mejora': self.recomendaciones_mejora or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

