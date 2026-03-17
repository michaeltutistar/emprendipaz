import json
import logging
import os
import re
import socket
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import List, Optional

from pypdf import PdfReader
from src.services.s3_service import S3Service

logger = logging.getLogger(__name__)

OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
DEFAULT_MODEL = 'openai/gpt-4o-mini'
MAX_MESSAGE_LENGTH = 1200
LOW_CONFIDENCE_THRESHOLD = 0.12
OPENROUTER_TIMEOUT_SECONDS = 8
USE_OPENROUTER = os.getenv('SUPPORT_USE_OPENROUTER', 'true').strip().lower() == 'true'
SUPPORT_DOCS_PREFIX = os.getenv('SUPPORT_DOCS_PREFIX', 'support/documents/')
SUPPORTED_DOC_EXTENSIONS = {'.pdf', '.md', '.txt'}
PREFERRED_DOC_EXTENSIONS = ['.md', '.txt', '.pdf']

_KB_CACHE = {
    'bucket': None,
    'key': None,
    'items': None,
}
_DOCUMENT_CACHE = {
    'bucket': None,
    'prefix': None,
    'items': None,
}


@dataclass
class SupportDecision:
    answer: str
    confidence: float
    topic: Optional[str]
    summary: str
    redirect_to_whatsapp: bool
    fallback_reason: Optional[str]
    context_items: List[dict]


def normalize_text(value: str) -> str:
    return _normalize((value or '').replace('\n', ' ').replace('\r', ' '))


def _normalize(value: str) -> str:
    normalized = unicodedata.normalize('NFD', (value or '').strip().lower())
    normalized = ''.join(char for char in normalized if unicodedata.category(char) != 'Mn')
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized


def _tokenize(value: str) -> List[str]:
    normalized = _normalize(value)
    return [token for token in re.split(r'[^a-z0-9]+', normalized) if token]


def clamp_message(value: str) -> str:
    return (value or '').strip()[:MAX_MESSAGE_LENGTH]


def is_simple_greeting(question: str) -> bool:
    normalized = normalize_text(question)
    if not normalized:
        return False

    greeting_patterns = {
        'hola',
        'buenas',
        'buenos dias',
        'buen dia',
        'buenas tardes',
        'buenas noches',
        'hello',
        'hi',
        'como vas',
        'como estas',
        'que tal',
        'que tal estas',
        'como te va',
        'como va',
        'saludos',
        'hey',
    }
    return normalized in greeting_patterns


def build_greeting_answer() -> str:
    return (
        'Hola. Puedo ayudarte con dudas sobre acceso, perfil, progreso, modulos, '
        'uso offline, sincronizacion y errores tecnicos de la plataforma. '
        'Cuéntame el problema o la accion que quieres realizar.'
    )


def _extract_text_from_pdf_bytes(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    pages = [(page.extract_text() or '').strip() for page in reader.pages]
    return '\n\n'.join(page for page in pages if page)


def _extract_text_from_document_bytes(key: str, file_bytes: bytes) -> str:
    suffix = Path(key).suffix.lower()
    if suffix == '.pdf':
        return _extract_text_from_pdf_bytes(file_bytes)
    return file_bytes.decode('utf-8', errors='ignore')


def _clean_text(value: str) -> str:
    text = (value or '').replace('\r', '\n')
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def _chunk_paragraph(paragraph: str, max_chars: int) -> List[str]:
    paragraph = paragraph.strip()
    if not paragraph:
        return []
    if len(paragraph) <= max_chars:
        return [paragraph]

    sentences = re.split(r'(?<=[.!?])\s+', paragraph)
    chunks = []
    current = ''

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        candidate = f'{current} {sentence}'.strip()
        if current and len(candidate) > max_chars:
            chunks.append(current.strip())
            current = sentence
        else:
            current = candidate

    if current:
        chunks.append(current.strip())

    return chunks or [paragraph[:max_chars]]


def _choose_preferred_document_keys(keys: List[str]) -> List[str]:
    grouped = {}
    for key in keys:
        path = Path(key)
        suffix = path.suffix.lower()
        if suffix not in SUPPORTED_DOC_EXTENSIONS:
            continue
        grouped.setdefault(path.stem.lower(), {})[suffix] = key

    selected = []
    for stem in sorted(grouped.keys()):
        variants = grouped[stem]
        chosen = None
        for suffix in PREFERRED_DOC_EXTENSIONS:
            if suffix in variants:
                chosen = variants[suffix]
                break
        if chosen:
            selected.append(chosen)
    return selected


def _build_fragments_from_markdown(source_name: str, text: str, max_chars: int = 900) -> List[dict]:
    document_title = Path(source_name).stem.replace('_', ' ').replace('-', ' ').strip() or 'Documento de soporte'
    lines = text.splitlines()
    fragments = []
    current_title = document_title
    current_lines: List[str] = []
    section_index = 0

    def flush_section():
        nonlocal section_index, current_lines, current_title
        content = _clean_text('\n'.join(current_lines))
        if not content:
            current_lines = []
            return

        section_index += 1
        for chunk_idx, chunk in enumerate(_chunk_paragraph(content, max_chars), start=1):
            fragments.append({
                'id': f'{document_title}-{section_index}-{chunk_idx}',
                'title': current_title,
                'content': chunk,
                'category': document_title,
                'keywords': [document_title, current_title],
                'source': source_name,
            })
        current_lines = []

    for raw_line in lines:
        line = raw_line.strip()
        if re.match(r'^#{1,3}\s+', line):
            flush_section()
            current_title = re.sub(r'^#{1,3}\s+', '', line).strip() or document_title
            continue

        if line.startswith('- '):
            current_lines.append(line[2:].strip())
        else:
            current_lines.append(raw_line)

    flush_section()
    return fragments


def _build_fragments_from_text(source_name: str, text: str, max_chars: int = 700) -> List[dict]:
    normalized_text = _clean_text(text)
    if not normalized_text:
        return []

    title = Path(source_name).stem.replace('_', ' ').replace('-', ' ').strip() or 'Documento de soporte'
    paragraphs = [segment.strip() for segment in re.split(r'\n\s*\n+', normalized_text) if segment.strip()]
    fragments = []

    for index, paragraph in enumerate(paragraphs, start=1):
        for chunk_idx, chunk in enumerate(_chunk_paragraph(paragraph, max_chars), start=1):
            fragments.append({
                'id': f'{title}-{index}-{chunk_idx}',
                'title': title,
                'content': chunk,
                'category': title,
                'keywords': [title],
                'source': source_name,
            })

    return fragments


def _load_local_support_documents() -> List[dict]:
    support_dir = Path(__file__).resolve().parents[2] / 'support'
    if not support_dir.exists():
        return []

    fragments = []
    selected_names = _choose_preferred_document_keys([path.name for path in support_dir.iterdir()])
    for file_name in selected_names:
        path = support_dir / file_name

        try:
            file_bytes = path.read_bytes()
            text = _extract_text_from_document_bytes(path.name, file_bytes)
            if path.suffix.lower() == '.md':
                fragments.extend(_build_fragments_from_markdown(path.name, text))
            else:
                fragments.extend(_build_fragments_from_text(path.name, text))
        except Exception as error:
            logger.warning('No fue posible cargar documento local %s: %s', path.name, error)

    return fragments


def load_support_documents():
    bucket_name = os.getenv('SUPPORT_KB_BUCKET') or os.getenv('S3_BUCKET')
    prefix = SUPPORT_DOCS_PREFIX

    if not bucket_name:
        raise RuntimeError('SUPPORT_KB_BUCKET o S3_BUCKET no está configurado')

    if (
        _DOCUMENT_CACHE.get('items') is not None
        and _DOCUMENT_CACHE.get('bucket') == bucket_name
        and _DOCUMENT_CACHE.get('prefix') == prefix
    ):
        return _DOCUMENT_CACHE['items']

    fragments = []

    try:
        s3_service = S3Service()
        paginator = s3_service.s3_client.get_paginator('list_objects_v2')
        all_keys = []
        for page in paginator.paginate(Bucket=bucket_name, Prefix=prefix):
            for item in page.get('Contents', []):
                key = item.get('Key')
                if not key or key.endswith('/'):
                    continue
                all_keys.append(key)

        for key in _choose_preferred_document_keys(all_keys):
                response = s3_service.s3_client.get_object(Bucket=bucket_name, Key=key)
                file_bytes = response['Body'].read()
                text = _extract_text_from_document_bytes(key, file_bytes)
                if Path(key).suffix.lower() == '.md':
                    fragments.extend(_build_fragments_from_markdown(Path(key).name, text))
                else:
                    fragments.extend(_build_fragments_from_text(Path(key).name, text))
    except Exception as error:
        logger.warning('No fue posible cargar documentos desde S3, usando fallback local: %s', error)
        fragments = _load_local_support_documents()

    if not fragments:
        raise RuntimeError('No hay documentos de soporte disponibles para el centro de ayuda')

    _DOCUMENT_CACHE['bucket'] = bucket_name
    _DOCUMENT_CACHE['prefix'] = prefix
    _DOCUMENT_CACHE['items'] = fragments
    return fragments


def retrieve_context(question: str, items: List[dict], limit: int = 3) -> List[dict]:
    question_tokens = _tokenize(question)
    if not question_tokens:
        return []

    scored_items = []
    for item in items:
        title = item.get('title', '')
        content = item.get('content', '')
        keywords = item.get('keywords') or []
        category = item.get('category')

        title_tokens = _tokenize(title)
        content_tokens = _tokenize(content)
        keyword_tokens = []
        for keyword in keywords:
            keyword_tokens.extend(_tokenize(keyword))

        overlap_title = len(set(question_tokens) & set(title_tokens))
        overlap_keywords = len(set(question_tokens) & set(keyword_tokens))
        overlap_content = len(set(question_tokens) & set(content_tokens))

        phrase_bonus = 0
        normalized_question = _normalize(question)
        if title and _normalize(title) in normalized_question:
            phrase_bonus += 6
        for keyword in keywords:
            if keyword and _normalize(keyword) in normalized_question:
                phrase_bonus += 2

        score = (
            overlap_keywords * 3
            + overlap_title * 5
            + overlap_content * 1
            + phrase_bonus
        )

        if score <= 0:
            continue

        scored_items.append(
            {
                'id': item.get('id'),
                'title': title,
                'content': content,
                'category': category,
                'keywords': keywords,
                'score': score / max(len(question_tokens), 1),
            }
        )

    scored_items.sort(key=lambda item: item['score'], reverse=True)
    return scored_items[:limit]


def _build_messages(question: str, contexts: List[dict]):
    context_text = '\n\n'.join(
        (
            f"TITULO: {item.get('title')}\n"
            f"FUENTE: {item.get('source')}\n"
            f"CATEGORIA: {item.get('category')}\n"
            f"EVIDENCIA: {item.get('content')}"
        )
        for item in contexts
    )

    system_message = (
        'Eres un asistente de soporte tecnico y operativo de una plataforma educativa para estudiantes. '
        'Debes responder solo con base en las evidencias documentales proporcionadas. '
        'No reveles contenido pedagogico, respuestas de evaluaciones, respuestas de talleres, '
        'soluciones academicas ni codigo. '
        'No inventes procesos, politicas ni datos. '
        'Si las evidencias no alcanzan para responder con seguridad, responde exactamente NO_SE. '
        'Redacta la respuesta en español, de forma breve, clara, tecnica y util para el estudiante.'
    )

    user_message = (
        f"CONTEXTO:\n{context_text or 'SIN CONTEXTO SUFICIENTE'}\n\n"
        f"PREGUNTA DEL USUARIO:\n{question}"
    )

    return [
        {'role': 'system', 'content': system_message},
        {'role': 'user', 'content': user_message},
    ]


def call_openrouter(question: str, contexts: List[dict]):
    api_key = os.getenv('OPENROUTER_API_KEY')
    model = os.getenv('OPENROUTER_MODEL', DEFAULT_MODEL)

    if not api_key:
        raise RuntimeError('OPENROUTER_API_KEY no está configurada')

    payload = {
        'model': model,
        'messages': _build_messages(question, contexts),
        'temperature': 0.2,
        'max_tokens': 350,
    }

    request_data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        OPENROUTER_URL,
        data=request_data,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    original_getaddrinfo = socket.getaddrinfo

    def ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
        return original_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)

    try:
        socket.getaddrinfo = ipv4_only_getaddrinfo
        with urllib.request.urlopen(req, timeout=OPENROUTER_TIMEOUT_SECONDS) as response:
            body = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as error:
        detail = error.read().decode('utf-8', errors='ignore')
        logger.error('Error HTTP en OpenRouter: %s', detail)
        raise RuntimeError('Error al consultar OpenRouter') from error
    except urllib.error.URLError as error:
        logger.error('Error de red en OpenRouter: %s', error)
        raise RuntimeError('Error de red al consultar OpenRouter') from error
    finally:
        socket.getaddrinfo = original_getaddrinfo

    choices = body.get('choices') or []
    if not choices:
        raise RuntimeError('OpenRouter no devolvió respuestas')

    message = choices[0].get('message') or {}
    content = (message.get('content') or '').strip()
    if not content:
        raise RuntimeError('La respuesta de OpenRouter llegó vacía')

    return content


def build_context_fallback_answer(question: str, contexts: List[dict]) -> str:
    if not contexts:
        return (
            'No encontre informacion suficiente para responder con seguridad. '
            'Voy a escalar tu caso para atencion por WhatsApp.'
        )

    primary = contexts[0]
    title = primary.get('title') or 'Ayuda de la plataforma'
    content = (primary.get('content') or '').strip()
    if not content:
        return (
            f'Segun la base de conocimiento, el tema mas cercano es "{title}". '
            'Si quieres, describe con mas detalle el problema para orientarte mejor.'
        )

    return content


def archive_ticket_snapshot(ticket, archive_reason: str, extra_data: Optional[dict] = None):
    bucket_name = os.getenv('SUPPORT_KB_BUCKET') or os.getenv('S3_BUCKET')
    if not bucket_name:
        return

    try:
        s3_service = S3Service()
        payload = {
            'archive_reason': archive_reason,
            'archived_at': datetime.utcnow().isoformat(),
            'ticket': ticket.to_dict(include_messages=True, include_satisfaction=True),
            'extra': extra_data or {},
        }
        ticket_id = ticket.id
        history_key = (
            f"support/conversations/history/ticket-{ticket_id}/"
            f"{payload['archived_at'].replace(':', '-').replace('.', '-')}.json"
        )
        latest_key = f'support/conversations/latest/ticket-{ticket_id}.json'
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')

        s3_service.s3_client.put_object(
            Bucket=bucket_name,
            Key=history_key,
            Body=body,
            ContentType='application/json; charset=utf-8',
        )
        s3_service.s3_client.put_object(
            Bucket=bucket_name,
            Key=latest_key,
            Body=body,
            ContentType='application/json; charset=utf-8',
        )
    except Exception as error:
        logger.warning('No fue posible archivar la conversacion del ticket %s: %s', getattr(ticket, 'id', None), error)


def build_whatsapp_url(number: str, text_message: str) -> str:
    sanitized_number = re.sub(r'[^0-9]', '', number or '')
    if not sanitized_number:
        raise RuntimeError('SUPPORT_WHATSAPP_NUMBER no está configurado')

    encoded_message = urllib.parse.quote(text_message)
    return f'https://wa.me/{sanitized_number}?text={encoded_message}'


def build_support_decision(question: str) -> SupportDecision:
    question = clamp_message(question)
    if is_simple_greeting(question):
        return SupportDecision(
            answer=build_greeting_answer(),
            confidence=1,
            topic='saludo',
            summary=question[:280],
            redirect_to_whatsapp=False,
            fallback_reason=None,
            context_items=[],
        )

    document_items = load_support_documents()
    contexts = retrieve_context(question, document_items, limit=4)

    topic = contexts[0].get('category') if contexts else None
    summary = question[:280]
    top_score = contexts[0]['score'] if contexts else 0.0

    if not contexts or top_score < LOW_CONFIDENCE_THRESHOLD:
        return SupportDecision(
            answer=(
                'No encontré información suficiente para responder con certeza. '
                'Voy a escalar tu caso para atención por WhatsApp.'
            ),
            confidence=top_score,
            topic=topic,
            summary=summary,
            redirect_to_whatsapp=True,
            fallback_reason='low_context_match',
            context_items=contexts,
        )

    try:
        if not USE_OPENROUTER:
            raise RuntimeError('OpenRouter deshabilitado por configuracion')
        answer = call_openrouter(question, contexts)
    except Exception as error:
        logger.error('Fallo del asistente OpenRouter: %s', error)
        return SupportDecision(
            answer=build_context_fallback_answer(question, contexts),
            confidence=min(max(top_score, LOW_CONFIDENCE_THRESHOLD), 1),
            topic=topic,
            summary=summary,
            redirect_to_whatsapp=False,
            fallback_reason='openrouter_error',
            context_items=contexts,
        )

    if answer.strip().upper() == 'NO_SE':
        return SupportDecision(
            answer=(
                'No tengo suficiente contexto para darte una respuesta confiable. '
                'Voy a escalar tu caso para atención por WhatsApp.'
            ),
            confidence=top_score,
            topic=topic,
            summary=summary,
            redirect_to_whatsapp=True,
            fallback_reason='model_unsure',
            context_items=contexts,
        )

    return SupportDecision(
        answer=answer,
        confidence=min(max(top_score, LOW_CONFIDENCE_THRESHOLD), 1),
        topic=topic,
        summary=summary,
        redirect_to_whatsapp=False,
        fallback_reason=None,
        context_items=contexts,
    )
