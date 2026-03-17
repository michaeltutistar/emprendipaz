from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from sqlalchemy import func

from ..models import NodeForumReply, NodeForumThread, User, db
from ..services.auth_service import instructor_required, token_required
from ..services.forum_node_service import get_forum_node_by_slug, get_forum_nodes, resolve_forum_node
from ..services.student_municipio_service import get_preferred_municipio


forum_bp = Blueprint('forum', __name__)


def _clamp_text(value, max_length=3000):
    if value is None:
        return ''
    return str(value).strip()[:max_length]


def _ensure_student_access(current_user):
    if current_user.rol not in ['estudiante', 'usuario']:
        return jsonify({
            'success': False,
            'error': 'Acceso denegado. Se requiere rol de estudiante',
        }), 403
    return None


def _serialize_author(user):
    preferred_municipio = get_preferred_municipio(
        user.id,
        f"{(user.nombre or '').strip()} {(user.apellido or '').strip()}".strip(),
        user.municipio,
    )
    return {
        'id': user.id,
        'nombre': f"{(user.nombre or '').strip()} {(user.apellido or '').strip()}".strip() or 'Usuario',
        'rol': user.rol,
        'municipio': preferred_municipio,
    }


def _serialize_reply(reply):
    return {
        'id': reply.id,
        'thread_id': reply.thread_id,
        'body': reply.body,
        'created_at': reply.created_at.isoformat() if reply.created_at else None,
        'updated_at': reply.updated_at.isoformat() if reply.updated_at else None,
        'author': _serialize_author(reply.author) if reply.author else None,
    }


def _serialize_thread(thread, include_replies=False):
    data = {
        'id': thread.id,
        'node_slug': thread.node_slug,
        'question': thread.question,
        'status': thread.status,
        'created_at': thread.created_at.isoformat() if thread.created_at else None,
        'updated_at': thread.updated_at.isoformat() if thread.updated_at else None,
        'author': _serialize_author(thread.author) if thread.author else None,
        'replies_count': len(thread.replies),
    }

    node = get_forum_node_by_slug(thread.node_slug)
    if node:
        data['node'] = node

    if include_replies:
        data['replies'] = [_serialize_reply(reply) for reply in thread.replies]

    return data


def _get_thread_or_404(thread_id):
    return NodeForumThread.query.filter_by(id=thread_id).first()


def _get_student_node_or_error(current_user):
    preferred_municipio = get_preferred_municipio(
        current_user.id,
        f"{(current_user.nombre or '').strip()} {(current_user.apellido or '').strip()}".strip(),
        current_user.municipio,
    )
    node = resolve_forum_node(preferred_municipio)
    if node:
        return node, preferred_municipio, None

    return None, preferred_municipio, (
        jsonify({
            'success': False,
            'error': 'No fue posible identificar el nodo del estudiante a partir de su municipio.',
        }),
        400,
    )


@forum_bp.route('/student/forum/me', methods=['GET'])
@token_required
@cross_origin()
def get_my_forum_node(current_user):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    node, preferred_municipio, node_error = _get_student_node_or_error(current_user)
    if node_error:
        return node_error

    threads_count = NodeForumThread.query.filter_by(node_slug=node['slug']).count()
    replies_count = (
        db.session.query(func.count(NodeForumReply.id))
        .join(NodeForumThread, NodeForumReply.thread_id == NodeForumThread.id)
        .filter(NodeForumThread.node_slug == node['slug'])
        .scalar()
    ) or 0

    return jsonify({
        'success': True,
        'data': {
            'node': node,
            'student': {
                'id': current_user.id,
                'municipio': preferred_municipio,
                'rol': current_user.rol,
            },
            'stats': {
                'threads_count': threads_count,
                'replies_count': replies_count,
            },
        },
    }), 200


@forum_bp.route('/student/forum/threads', methods=['GET'])
@token_required
@cross_origin()
def list_student_forum_threads(current_user):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    node, _, node_error = _get_student_node_or_error(current_user)
    if node_error:
        return node_error

    threads = (
        NodeForumThread.query
        .filter_by(node_slug=node['slug'])
        .order_by(NodeForumThread.updated_at.desc(), NodeForumThread.created_at.desc())
        .all()
    )

    return jsonify({
        'success': True,
        'data': {
            'node': node,
            'threads': [_serialize_thread(thread) for thread in threads],
        },
    }), 200


@forum_bp.route('/student/forum/threads', methods=['POST'])
@token_required
@cross_origin()
def create_student_forum_thread(current_user):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    node, _, node_error = _get_student_node_or_error(current_user)
    if node_error:
        return node_error

    data = request.get_json(silent=True) or {}
    question = _clamp_text(data.get('question'))
    if not question:
        return jsonify({
            'success': False,
            'error': 'La pregunta es obligatoria.',
        }), 400

    thread = NodeForumThread(
        node_slug=node['slug'],
        author_user_id=current_user.id,
        question=question,
        status='open',
    )
    db.session.add(thread)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Pregunta publicada exitosamente.',
        'data': _serialize_thread(thread),
    }), 201


@forum_bp.route('/student/forum/threads/<int:thread_id>', methods=['GET'])
@token_required
@cross_origin()
def get_student_forum_thread(current_user, thread_id):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    node, _, node_error = _get_student_node_or_error(current_user)
    if node_error:
        return node_error

    thread = _get_thread_or_404(thread_id)
    if not thread:
        return jsonify({
            'success': False,
            'error': 'Hilo no encontrado.',
        }), 404

    if thread.node_slug != node['slug']:
        return jsonify({
            'success': False,
            'error': 'No tienes acceso a este hilo.',
        }), 403

    return jsonify({
        'success': True,
        'data': {
            'node': node,
            'thread': _serialize_thread(thread, include_replies=True),
        },
    }), 200


@forum_bp.route('/student/forum/threads/<int:thread_id>/replies', methods=['POST'])
@token_required
@cross_origin()
def create_student_forum_reply(current_user, thread_id):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    node, _, node_error = _get_student_node_or_error(current_user)
    if node_error:
        return node_error

    thread = _get_thread_or_404(thread_id)
    if not thread:
        return jsonify({
            'success': False,
            'error': 'Hilo no encontrado.',
        }), 404

    if thread.node_slug != node['slug']:
        return jsonify({
            'success': False,
            'error': 'No tienes acceso a este hilo.',
        }), 403

    data = request.get_json(silent=True) or {}
    body = _clamp_text(data.get('body'))
    if not body:
        return jsonify({
            'success': False,
            'error': 'La respuesta es obligatoria.',
        }), 400

    reply = NodeForumReply(
        thread_id=thread.id,
        author_user_id=current_user.id,
        body=body,
    )
    thread.updated_at = datetime.utcnow()
    db.session.add(reply)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Respuesta publicada exitosamente.',
        'data': _serialize_reply(reply),
    }), 201


@forum_bp.route('/instructor/forum/nodes', methods=['GET'])
@token_required
@instructor_required
@cross_origin()
def list_instructor_forum_nodes(current_user):
    del current_user

    nodes = []
    for node in get_forum_nodes():
        threads = NodeForumThread.query.filter_by(node_slug=node['slug']).all()
        replies_count = sum(len(thread.replies) for thread in threads)
        latest_activity = None
        for thread in threads:
            if not latest_activity or (thread.updated_at and thread.updated_at > latest_activity):
                latest_activity = thread.updated_at

        nodes.append({
            **node,
            'threads_count': len(threads),
            'replies_count': replies_count,
            'latest_activity_at': latest_activity.isoformat() if latest_activity else None,
        })

    return jsonify({
        'success': True,
        'data': {
            'nodes': nodes,
        },
    }), 200


@forum_bp.route('/instructor/forum/threads', methods=['GET'])
@token_required
@instructor_required
@cross_origin()
def list_instructor_forum_threads(current_user):
    del current_user

    node_slug = _clamp_text(request.args.get('node_slug'), max_length=80)
    query = NodeForumThread.query
    node = None

    if node_slug:
        node = get_forum_node_by_slug(node_slug)
        if not node:
            return jsonify({
                'success': False,
                'error': 'Nodo no encontrado.',
            }), 404
        query = query.filter_by(node_slug=node['slug'])

    threads = query.order_by(NodeForumThread.updated_at.desc(), NodeForumThread.created_at.desc()).all()

    return jsonify({
        'success': True,
        'data': {
            'node': node,
            'threads': [_serialize_thread(thread) for thread in threads],
        },
    }), 200


@forum_bp.route('/instructor/forum/threads/<int:thread_id>', methods=['GET'])
@token_required
@instructor_required
@cross_origin()
def get_instructor_forum_thread(current_user, thread_id):
    del current_user

    thread = _get_thread_or_404(thread_id)
    if not thread:
        return jsonify({
            'success': False,
            'error': 'Hilo no encontrado.',
        }), 404

    return jsonify({
        'success': True,
        'data': {
            'thread': _serialize_thread(thread, include_replies=True),
        },
    }), 200


@forum_bp.route('/instructor/forum/threads/<int:thread_id>/replies', methods=['POST'])
@token_required
@instructor_required
@cross_origin()
def create_instructor_forum_reply(current_user, thread_id):
    thread = _get_thread_or_404(thread_id)
    if not thread:
        return jsonify({
            'success': False,
            'error': 'Hilo no encontrado.',
        }), 404

    data = request.get_json(silent=True) or {}
    body = _clamp_text(data.get('body'))
    if not body:
        return jsonify({
            'success': False,
            'error': 'La respuesta es obligatoria.',
        }), 400

    reply = NodeForumReply(
        thread_id=thread.id,
        author_user_id=current_user.id,
        body=body,
    )
    thread.updated_at = datetime.utcnow()
    db.session.add(reply)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Respuesta del instructor publicada exitosamente.',
        'data': _serialize_reply(reply),
    }), 201
