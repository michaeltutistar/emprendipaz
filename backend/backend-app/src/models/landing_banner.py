from datetime import datetime

from . import db


class LandingBanner(db.Model):
    __tablename__ = 'landing_banners'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    body = db.Column(db.Text, nullable=False)
    image_s3_key = db.Column(db.String(500), nullable=False)
    image_filename = db.Column(db.String(255), nullable=False)
    image_content_type = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_by = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_landing_banners_active_created', 'is_active', 'created_at'),
    )

    def to_dict(self, s3_service=None, expires_in=3600):
        image_url = None
        if s3_service and self.image_s3_key:
            image_url = s3_service.generate_presigned_url(self.image_s3_key, expiration=expires_in)

        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'image_url': image_url,
            'image_filename': self.image_filename,
            'image_content_type': self.image_content_type,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
