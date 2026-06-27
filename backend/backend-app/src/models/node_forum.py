from datetime import datetime

from . import db


class NodeForumThread(db.Model):
    __tablename__ = 'node_forum_threads'

    id = db.Column(db.Integer, primary_key=True)
    node_slug = db.Column(db.String(80), nullable=False, index=True)
    author_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    question = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), nullable=False, default='open')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    author = db.relationship('User', backref=db.backref('forum_threads', lazy=True))
    replies = db.relationship(
        'NodeForumReply',
        backref='thread',
        lazy=True,
        cascade='all, delete-orphan',
        order_by='NodeForumReply.created_at.asc()',
    )

    def to_dict(self, include_replies=False):
        data = {
            'id': self.id,
            'node_slug': self.node_slug,
            'author_user_id': self.author_user_id,
            'question': self.question,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

        if include_replies:
            data['replies'] = [reply.to_dict() for reply in self.replies]

        return data


class NodeForumReply(db.Model):
    __tablename__ = 'node_forum_replies'

    id = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(
        db.Integer,
        db.ForeignKey('node_forum_threads.id', ondelete='CASCADE'),
        nullable=False,
        index=True,
    )
    parent_reply_id = db.Column(
        db.Integer,
        db.ForeignKey('node_forum_replies.id', ondelete='SET NULL'),
        nullable=True,
        index=True,
    )
    author_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, index=True)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    author = db.relationship('User', backref=db.backref('forum_replies', lazy=True))
    parent_reply = db.relationship(
        'NodeForumReply',
        foreign_keys=[parent_reply_id],
        remote_side=[id],
        backref=db.backref('child_replies', lazy=True),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'thread_id': self.thread_id,
            'parent_reply_id': self.parent_reply_id,
            'author_user_id': self.author_user_id,
            'body': self.body,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
