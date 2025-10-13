from datetime import datetime
from . import db
import json

class Sorteo(db.Model):
    __tablename__ = 'sorteos'

    id = db.Column(db.Integer, primary_key=True)
    fecha_sorteo = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    administrador_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    descripcion = db.Column(db.Text, nullable=False)
    participantes = db.Column(db.JSON, nullable=False)  # Lista de participantes
    resultado = db.Column(db.JSON, nullable=False)  # Resultado del sorteo
    ganador_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    observaciones = db.Column(db.Text, nullable=True)
    archivo_acta = db.Column(db.LargeBinary, nullable=True)
    archivo_acta_nombre = db.Column(db.String(255), nullable=True)
    
    # Relaciones
    administrador = db.relationship('User', foreign_keys=[administrador_id], backref='sorteos_realizados')
    ganador = db.relationship('User', foreign_keys=[ganador_id], backref='sorteos_ganados')

    def __repr__(self):
        return f'<Sorteo {self.id}: {self.descripcion[:50]}...>'

    def to_dict(self):
        return {
            'id': self.id,
            'fecha_sorteo': self.fecha_sorteo.isoformat() if self.fecha_sorteo else None,
            'administrador_id': self.administrador_id,
            'descripcion': self.descripcion,
            'participantes': self.participantes,
            'resultado': self.resultado,
            'ganador_id': self.ganador_id,
            'observaciones': self.observaciones,
            'archivo_acta_nombre': self.archivo_acta_nombre,
            'administrador': {
                'nombre': self.administrador.nombre if self.administrador else None,
                'apellido': self.administrador.apellido if self.administrador else None,
                'email': self.administrador.email if self.administrador else None
            } if self.administrador else None,
            'ganador': {
                'nombre': self.ganador.nombre if self.ganador else None,
                'apellido': self.ganador.apellido if self.ganador else None,
                'email': self.ganador.email if self.ganador else None
            } if self.ganador else None
        }

    @staticmethod
    def ejecutar_sorteo(participantes, administrador_id, descripcion, observaciones=None):
        """Ejecutar un sorteo público entre participantes"""
        import random
        import secrets
        
        # Generar semilla aleatoria segura
        random.seed(secrets.randbits(32))
        
        # Crear resultado del sorteo
        resultado = {
            'fecha_ejecucion': datetime.utcnow().isoformat(),
            'participantes_count': len(participantes),
            'semilla_aleatoria': secrets.randbits(32),
            'proceso': []
        }
        
        # Proceso de sorteo
        participantes_copia = participantes.copy()
        random.shuffle(participantes_copia)
        
        # Registrar el proceso
        for i, participante in enumerate(participantes_copia):
            resultado['proceso'].append({
                'orden': i + 1,
                'participante_id': participante['id'],
                'nombre': participante['nombre'],
                'numero_aleatorio': random.randint(1, 1000)
            })
        
        # El ganador es el primero en la lista mezclada
        ganador = participantes_copia[0]
        
        # Generar acta en PDF
        archivo_acta, nombre_acta = Sorteo.generar_acta_pdf(descripcion, participantes, ganador, resultado)
        
        # Crear registro del sorteo
        sorteo = Sorteo(
            administrador_id=administrador_id,
            descripcion=descripcion,
            participantes=participantes,
            resultado=resultado,
            ganador_id=ganador['id'],
            observaciones=observaciones,
            archivo_acta=archivo_acta,
            archivo_acta_nombre=nombre_acta
        )
        
        db.session.add(sorteo)
        db.session.commit()
        
        return sorteo

    @staticmethod
    def generar_acta_pdf(descripcion, participantes, ganador, resultado):
        """Generar acta de sorteo en PDF"""
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.lib import colors
            from io import BytesIO
            import datetime
            
            # Crear buffer para el PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            styles = getSampleStyleSheet()
            
            # Estilos personalizados
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=16,
                spaceAfter=30,
                alignment=1  # Centrado
            )
            
            # Contenido del PDF
            story = []
            
            # Título
            story.append(Paragraph("ACTA DE SORTEO PÚBLICO", title_style))
            story.append(Spacer(1, 20))
            
            # Información del sorteo
            story.append(Paragraph(f"<b>Descripción:</b> {descripcion}", styles['Normal']))
            story.append(Paragraph(f"<b>Fecha:</b> {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", styles['Normal']))
            story.append(Paragraph(f"<b>Total de participantes:</b> {len(participantes)}", styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Tabla de participantes
            story.append(Paragraph("<b>PARTICIPANTES:</b>", styles['Heading2']))
            story.append(Spacer(1, 10))
            
            data = [['#', 'Nombre', 'Email', 'Municipio']]
            for i, participante in enumerate(participantes, 1):
                data.append([
                    str(i),
                    f"{participante.get('nombre', '')} {participante.get('apellido', '')}",
                    participante.get('email', ''),
                    participante.get('municipio', '')
                ])
            
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
            story.append(Spacer(1, 20))
            
            # Ganador
            story.append(Paragraph("<b>GANADOR DEL SORTEO:</b>", styles['Heading2']))
            story.append(Paragraph(f"<b>Nombre:</b> {ganador.get('nombre', '')} {ganador.get('apellido', '')}", styles['Normal']))
            story.append(Paragraph(f"<b>Email:</b> {ganador.get('email', '')}", styles['Normal']))
            story.append(Paragraph(f"<b>Municipio:</b> {ganador.get('municipio', '')}", styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Proceso del sorteo
            story.append(Paragraph("<b>PROCESO DEL SORTEO:</b>", styles['Heading2']))
            for paso in resultado.get('proceso', []):
                story.append(Paragraph(f"Posición {paso['orden']}: {paso['nombre']} (Número aleatorio: {paso['numero_aleatorio']})", styles['Normal']))
            
            story.append(Spacer(1, 20))
            story.append(Paragraph(f"<b>Semilla aleatoria:</b> {resultado.get('semilla_aleatoria', 'N/A')}", styles['Normal']))
            story.append(Paragraph(f"<b>Fecha de ejecución:</b> {resultado.get('fecha_ejecucion', 'N/A')}", styles['Normal']))
            
            # Construir PDF
            doc.build(story)
            
            # Obtener contenido del buffer
            pdf_content = buffer.getvalue()
            buffer.close()
            
            # Nombre del archivo
            nombre_archivo = f"acta_sorteo_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            
            return pdf_content, nombre_archivo
            
        except Exception as e:
            print(f"Error generando acta PDF: {str(e)}")
            # Retornar PDF básico en caso de error
            return b"Acta de sorteo no disponible", "acta_error.pdf"

    @staticmethod
    def obtener_sorteos_recientes(limit=10):
        """Obtener sorteos recientes"""
        return Sorteo.query.order_by(Sorteo.fecha_sorteo.desc()).limit(limit).all()
