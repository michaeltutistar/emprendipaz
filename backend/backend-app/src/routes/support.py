import logging
import os

from flask import Blueprint, jsonify, request
from flask_cors import cross_origin

from src.models import (
    SupportTicket,
    SupportTicketMessage,
    SupportTicketSatisfaction,
    db,
)
from src.services.auth_service import token_required
from src.services.support_service import (
    archive_ticket_snapshot,
    build_support_decision,
    build_whatsapp_url,
    clamp_message,
)

logger = logging.getLogger(__name__)
support_bp = Blueprint('support', __name__)


def _ensure_student_access(current_user):
    if current_user.rol not in ['estudiante', 'usuario']:
        return jsonify({
            'success': False,
            'error': 'Acceso denegado. Se requiere rol de estudiante',
        }), 403
    return None


def _get_owned_ticket_or_404(ticket_id, user_id):
    ticket = SupportTicket.query.filter_by(id=ticket_id, user_id=user_id).first()
    if not ticket:
        return None, (
            jsonify({
                'success': False,
                'error': 'Ticket no encontrado',
            }),
            404,
        )
    return ticket, None


def _build_whatsapp_response(ticket, current_user):
    whatsapp_number = os.getenv('SUPPORT_WHATSAPP_NUMBER', '')
    whatsapp_message = (
        f"Hola, necesito apoyo con mi ticket #{ticket.id}. "
        f"Usuario: {current_user.nombre} {current_user.apellido}. "
        f"Resumen: {ticket.summary or 'Soporte sobre la plataforma.'}"
    )
    whatsapp_url = build_whatsapp_url(whatsapp_number, whatsapp_message)
    return {
        'redirect_to_whatsapp': True,
        'whatsapp_url': whatsapp_url,
        'ticket_id': ticket.id,
    }


@support_bp.route('/start', methods=['POST'])
@token_required
@cross_origin()
def start_support_ticket(current_user):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    data = request.get_json(silent=True) or {}
    message = clamp_message(data.get('message', ''))
    screen_label = data.get('screen_label')
    if not message:
        return jsonify({
            'success': False,
            'error': 'El mensaje es obligatorio',
        }), 400

    try:
        ticket = SupportTicket(user_id=current_user.id, status='open')
        db.session.add(ticket)
        db.session.flush()

        db.session.add(
            SupportTicketMessage(
                ticket_id=ticket.id,
                sender='user',
                message=message,
            )
        )

        decision = build_support_decision(message)

        ticket.topic = decision.topic
        ticket.summary = decision.summary
        if decision.redirect_to_whatsapp:
            ticket.status = 'escalated_whatsapp'
            ticket.channel_final = 'whatsapp'

        db.session.add(
            SupportTicketMessage(
                ticket_id=ticket.id,
                sender='assistant',
                message=decision.answer,
                confidence=decision.confidence,
            )
        )
        db.session.commit()
        archive_ticket_snapshot(ticket, 'ticket_started', {
            'screen_label': screen_label,
            'user_id': current_user.id,
        })

        response_payload = {
            'success': True,
            'ticket': ticket.to_dict(),
            'assistant_message': decision.answer,
            'confidence': decision.confidence,
            'topic': decision.topic,
            'fallback_reason': decision.fallback_reason,
            'redirect_to_whatsapp': False,
        }

        if decision.redirect_to_whatsapp:
            response_payload.update(_build_whatsapp_response(ticket, current_user))

        return jsonify(response_payload), 201
    except Exception as error:
        db.session.rollback()
        logger.error('Error creando ticket de soporte: %s', error)
        return jsonify({
            'success': False,
            'error': 'No fue posible crear el ticket de soporte',
        }), 500


@support_bp.route('/message', methods=['POST'])
@token_required
@cross_origin()
def continue_support_ticket(current_user):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    data = request.get_json(silent=True) or {}
    ticket_id = data.get('ticket_id')
    message = clamp_message(data.get('message', ''))
    screen_label = data.get('screen_label')

    if not ticket_id or not message:
        return jsonify({
            'success': False,
            'error': 'ticket_id y message son obligatorios',
        }), 400

    ticket, error_response = _get_owned_ticket_or_404(ticket_id, current_user.id)
    if error_response:
        return error_response

    if ticket.status == 'closed':
        return jsonify({
            'success': False,
            'error': 'El ticket ya fue cerrado',
        }), 409

    try:
        db.session.add(
            SupportTicketMessage(
                ticket_id=ticket.id,
                sender='user',
                message=message,
            )
        )

        decision = build_support_decision(message)
        ticket.topic = ticket.topic or decision.topic
        ticket.summary = decision.summary
        if decision.redirect_to_whatsapp:
            ticket.status = 'escalated_whatsapp'
            ticket.channel_final = 'whatsapp'

        db.session.add(
            SupportTicketMessage(
                ticket_id=ticket.id,
                sender='assistant',
                message=decision.answer,
                confidence=decision.confidence,
            )
        )
        db.session.commit()
        archive_ticket_snapshot(ticket, 'ticket_message', {
            'screen_label': screen_label,
            'user_id': current_user.id,
        })

        response_payload = {
            'success': True,
            'ticket': ticket.to_dict(),
            'assistant_message': decision.answer,
            'confidence': decision.confidence,
            'topic': ticket.topic,
            'fallback_reason': decision.fallback_reason,
            'redirect_to_whatsapp': False,
        }

        if decision.redirect_to_whatsapp:
            response_payload.update(_build_whatsapp_response(ticket, current_user))

        return jsonify(response_payload), 200
    except Exception as error:
        db.session.rollback()
        logger.error('Error continuando ticket de soporte: %s', error)
        return jsonify({
            'success': False,
            'error': 'No fue posible procesar el mensaje',
        }), 500


@support_bp.route('/escalate', methods=['POST'])
@token_required
@cross_origin()
def escalate_support_ticket(current_user):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    data = request.get_json(silent=True) or {}
    ticket_id = data.get('ticket_id')
    if not ticket_id:
        return jsonify({
            'success': False,
            'error': 'ticket_id es obligatorio',
        }), 400

    ticket, error_response = _get_owned_ticket_or_404(ticket_id, current_user.id)
    if error_response:
        return error_response

    try:
        ticket.status = 'escalated_whatsapp'
        ticket.channel_final = 'whatsapp'
        db.session.add(
            SupportTicketMessage(
                ticket_id=ticket.id,
                sender='system',
                message='Caso escalado a WhatsApp para atención manual.',
            )
        )
        db.session.commit()
        archive_ticket_snapshot(ticket, 'ticket_escalated', {
            'user_id': current_user.id,
        })

        payload = {
            'success': True,
            'ticket': ticket.to_dict(),
        }
        payload.update(_build_whatsapp_response(ticket, current_user))
        return jsonify(payload), 200
    except Exception as error:
        db.session.rollback()
        logger.error('Error escalando ticket de soporte: %s', error)
        return jsonify({
            'success': False,
            'error': 'No fue posible escalar el ticket',
        }), 500


@support_bp.route('/satisfaction', methods=['POST'])
@token_required
@cross_origin()
def save_support_satisfaction(current_user):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    data = request.get_json(silent=True) or {}
    ticket_id = data.get('ticket_id')
    resolved = data.get('resolved')
    rating = data.get('rating')
    comment = clamp_message(data.get('comment', ''))

    if ticket_id is None or resolved is None:
        return jsonify({
            'success': False,
            'error': 'ticket_id y resolved son obligatorios',
        }), 400

    if rating is not None:
        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return jsonify({
                'success': False,
                'error': 'La calificación debe ser numérica',
            }), 400

        if rating < 1 or rating > 5:
            return jsonify({
                'success': False,
                'error': 'La calificación debe estar entre 1 y 5',
            }), 400

    ticket, error_response = _get_owned_ticket_or_404(ticket_id, current_user.id)
    if error_response:
        return error_response

    try:
        satisfaction = SupportTicketSatisfaction.query.filter_by(ticket_id=ticket.id).first()
        if not satisfaction:
            satisfaction = SupportTicketSatisfaction(ticket_id=ticket.id)
            db.session.add(satisfaction)

        satisfaction.resolved = bool(resolved)
        satisfaction.rating = rating
        satisfaction.comment = comment or None

        ticket.resolved = bool(resolved)
        ticket.status = 'closed'
        if not ticket.channel_final:
            ticket.channel_final = 'ia'

        db.session.commit()
        archive_ticket_snapshot(ticket, 'ticket_closed', {
            'user_id': current_user.id,
        })
        return jsonify({
            'success': True,
            'ticket': ticket.to_dict(include_satisfaction=True),
        }), 200
    except Exception as error:
        db.session.rollback()
        logger.error('Error guardando satisfacción del soporte: %s', error)
        return jsonify({
            'success': False,
            'error': 'No fue posible guardar la satisfacción',
        }), 500


@support_bp.route('/tickets', methods=['GET'])
@token_required
@cross_origin()
def list_support_tickets(current_user):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    try:
        tickets = (
            SupportTicket.query.filter_by(user_id=current_user.id)
            .order_by(SupportTicket.updated_at.desc())
            .limit(20)
            .all()
        )
        return jsonify({
            'success': True,
            'tickets': [
                ticket.to_dict(include_satisfaction=True)
                for ticket in tickets
            ],
        }), 200
    except Exception as error:
        logger.error('Error listando tickets de soporte: %s', error)
        return jsonify({
            'success': False,
            'error': 'No fue posible listar los tickets',
        }), 500


@support_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@token_required
@cross_origin()
def get_support_ticket_detail(current_user, ticket_id):
    access_error = _ensure_student_access(current_user)
    if access_error:
        return access_error

    ticket, error_response = _get_owned_ticket_or_404(ticket_id, current_user.id)
    if error_response:
        return error_response

    payload = {
        'success': True,
        'ticket': ticket.to_dict(include_messages=True, include_satisfaction=True),
    }
    if ticket.status == 'escalated_whatsapp':
        payload.update(_build_whatsapp_response(ticket, current_user))

    return jsonify(payload), 200
