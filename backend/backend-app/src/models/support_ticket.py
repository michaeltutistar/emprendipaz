from datetime import datetime

from . import db


class SupportTicket(db.Model):
    __tablename__ = 'support_tickets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    status = db.Column(db.String(30), nullable=False, default='open')
    topic = db.Column(db.String(120), nullable=True)
    summary = db.Column(db.Text, nullable=True)
    resolved = db.Column(db.Boolean, nullable=False, default=False)
    channel_final = db.Column(db.String(30), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    user = db.relationship('User', backref=db.backref('support_tickets', lazy=True))
    messages = db.relationship(
        'SupportTicketMessage',
        backref='ticket',
        lazy=True,
        cascade='all, delete-orphan',
        order_by='SupportTicketMessage.created_at.asc()',
    )
    satisfaction = db.relationship(
        'SupportTicketSatisfaction',
        backref='ticket',
        uselist=False,
        lazy=True,
        cascade='all, delete-orphan',
    )

    def to_dict(self, include_messages=False, include_satisfaction=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'status': self.status,
            'topic': self.topic,
            'summary': self.summary,
            'resolved': self.resolved,
            'channel_final': self.channel_final,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_messages:
            data['messages'] = [message.to_dict() for message in self.messages]

        if include_satisfaction:
            data['satisfaction'] = self.satisfaction.to_dict() if self.satisfaction else None

        return data


class SupportTicketMessage(db.Model):
    __tablename__ = 'support_ticket_messages'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(
        db.Integer,
        db.ForeignKey('support_tickets.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    sender = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text, nullable=False)
    confidence = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'sender': self.sender,
            'message': self.message,
            'confidence': self.confidence,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class SupportTicketSatisfaction(db.Model):
    __tablename__ = 'support_ticket_satisfaction'

    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(
        db.Integer,
        db.ForeignKey('support_tickets.id', ondelete='CASCADE'),
        nullable=False,
        unique=True,
        index=True,
    )
    resolved = db.Column(db.Boolean, nullable=False, default=False)
    rating = db.Column(db.Integer, nullable=True)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    def to_dict(self):
        return {
            'id': self.id,
            'ticket_id': self.ticket_id,
            'resolved': self.resolved,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
