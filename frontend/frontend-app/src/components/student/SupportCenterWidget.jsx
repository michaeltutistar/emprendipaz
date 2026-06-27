import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, Ticket, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import API_BASE_URL from '@/config/api';
import { getAuthToken } from '@/utils/auth-storage';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';

const initialSurveyState = {
  resolved: null,
  rating: null,
  comment: '',
};

const initialAssistantMessage = {
  sender: 'assistant',
  message:
    'Hola. Soy el centro de ayuda de la plataforma. Cuéntame tu inconveniente y abriré un ticket para darte seguimiento.',
};

const resolutionStatuses = new Set(['open', 'resolved_ai']);

function buildAuthHeaders() {
  const token = getAuthToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
}

async function parseApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return { success: false, error: text || null };
}

function getStatusLabel(status) {
  const labels = {
    open: 'Abierto',
    resolved_ai: 'Resuelto por IA',
    escalated_whatsapp: 'Escalado a WhatsApp',
    closed: 'Cerrado',
  };
  return labels[status] || status || 'Sin estado';
}

const SupportCenterWidget = ({ screenLabel = 'dashboard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([initialAssistantMessage]);
  const [ticketId, setTicketId] = useState(null);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [sending, setSending] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [availableTickets, setAvailableTickets] = useState([]);
  const [showResolutionPrompt, setShowResolutionPrompt] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [survey, setSurvey] = useState(initialSurveyState);
  const [submittingSurvey, setSubmittingSurvey] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const messagesEndRef = useRef(null);

  const activeTicket = useMemo(
    () => availableTickets.find((ticket) => ticket.status !== 'closed'),
    [availableTickets],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages, showSurvey]);

  useEffect(() => {
    if (!isOpen || availableTickets.length > 0) {
      return;
    }

    loadTickets();
  }, [isOpen]);

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await fetch(`${API_BASE_URL}/student/support/tickets`, {
        method: 'GET',
        credentials: 'include',
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.tickets)) {
        setAvailableTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error cargando tickets de soporte:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadTicketDetail = async (selectedTicketId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/support/tickets/${selectedTicketId}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('No fue posible cargar el ticket');
      }

      const data = await response.json();
      if (!data.success || !data.ticket) {
        throw new Error('Respuesta inválida al cargar ticket');
      }

      const ticket = data.ticket;
      setTicketId(ticket.id);
      setTicketStatus(ticket.status);
      setMessages(
        ticket.messages?.length
          ? ticket.messages.map((item) => ({
              sender: item.sender,
              message: item.message,
            }))
          : [initialAssistantMessage],
      );
      setWhatsappUrl(data.whatsapp_url || '');
      setShowResolutionPrompt(false);
      setShowSurvey(false);
      toast.success(`Ticket #${ticket.id} cargado`);
    } catch (error) {
      console.error(error);
      toast.error('No fue posible retomar el ticket');
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || sending) {
      return;
    }

    try {
      setSending(true);
      const endpoint = ticketId ? 'message' : 'start';
      const payload = ticketId
        ? { ticket_id: ticketId, message: trimmedMessage, screen_label: screenLabel }
        : { message: trimmedMessage, screen_label: screenLabel };

      const response = await fetch(`${API_BASE_URL}/student/support/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await parseApiResponse(response);
      if (!response.ok || !data.success) {
        const fallbackMessage =
          response.status === 504
            ? 'El centro de ayuda tardó demasiado en responder. Intenta de nuevo en unos segundos.'
            : 'No fue posible procesar el mensaje';
        throw new Error(data.error || fallbackMessage);
      }

      const nextMessages = [
        ...messages,
        { sender: 'user', message: trimmedMessage },
        { sender: 'assistant', message: data.assistant_message },
      ];

      setMessages(nextMessages);
      setMessage('');
      setTicketId(data.ticket?.id || ticketId);
      setTicketStatus(data.ticket?.status || ticketStatus);
      setAvailableTickets((prev) => {
        const incomingTicket = data.ticket;
        if (!incomingTicket) {
          return prev;
        }
        const filtered = prev.filter((item) => item.id !== incomingTicket.id);
        return [incomingTicket, ...filtered];
      });

      if (data.redirect_to_whatsapp && data.whatsapp_url) {
        setWhatsappUrl(data.whatsapp_url);
        setShowResolutionPrompt(false);
        setShowSurvey(true);
        setSurvey({
          resolved: false,
          rating: null,
          comment: '',
        });
        toast.info('No encontré una respuesta segura. Te redirijo a WhatsApp.');
        window.open(data.whatsapp_url, '_blank', 'noopener,noreferrer');
      } else {
        setWhatsappUrl('');
        setShowResolutionPrompt(true);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Error enviando el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleManualEscalation = async () => {
    if (!ticketId) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/student/support/escalate`, {
        method: 'POST',
        credentials: 'include',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ ticket_id: ticketId }),
      });
      const data = await parseApiResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No fue posible escalar el caso');
      }

      setTicketStatus(data.ticket?.status || 'escalated_whatsapp');
      setWhatsappUrl(data.whatsapp_url || '');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          message: 'Tu caso fue escalado a WhatsApp para atención manual.',
        },
      ]);
      setShowResolutionPrompt(false);
      setShowSurvey(true);
      setSurvey({
        resolved: false,
        rating: null,
        comment: '',
      });

      if (data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No fue posible escalar el caso');
    }
  };

  const handleOpenSurveyResolved = () => {
    setShowResolutionPrompt(false);
    setShowSurvey(true);
    setSurvey({
      resolved: true,
      rating: null,
      comment: '',
    });
  };

  const handleSubmitSurvey = async () => {
    if (!ticketId || survey.resolved === null || !survey.rating || submittingSurvey) {
      toast.info('Completa la encuesta antes de finalizar');
      return;
    }

    try {
      setSubmittingSurvey(true);
      const response = await fetch(`${API_BASE_URL}/student/support/satisfaction`, {
        method: 'POST',
        credentials: 'include',
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          ticket_id: ticketId,
          resolved: survey.resolved,
          rating: survey.rating,
          comment: survey.comment,
        }),
      });
      const data = await parseApiResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No fue posible guardar la encuesta');
      }

      toast.success('Gracias por tu retroalimentación');
      setAvailableTickets((prev) =>
        prev.map((item) =>
          item.id === ticketId
            ? { ...item, status: 'closed', resolved: survey.resolved, channel_final: item.channel_final || (whatsappUrl ? 'whatsapp' : 'ia') }
            : item,
        ),
      );
      setTicketStatus('closed');
      setShowSurvey(false);
      setShowResolutionPrompt(false);
      setWhatsappUrl('');
      setTicketId(null);
      setMessages([initialAssistantMessage]);
      setSurvey(initialSurveyState);
      await loadTickets();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No fue posible guardar la encuesta');
    } finally {
      setSubmittingSurvey(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[70]">
      {isOpen ? (
        <Card className="w-[360px] max-w-[calc(100vw-2rem)] shadow-2xl border border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#006837]" />
                  Centro de ayuda
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Soporte operativo para problemas de acceso, uso y funcionamiento.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
              <span>
                {ticketId ? `Ticket #${ticketId}` : 'Sin ticket activo'}
              </span>
              <span className="font-medium">{getStatusLabel(ticketStatus)}</span>
            </div>

            {!ticketId && activeTicket && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">
                <div className="font-medium text-amber-900">Tienes un caso reciente</div>
                <div className="text-amber-800 mt-1">
                  Ticket #{activeTicket.id} · {getStatusLabel(activeTicket.status)}
                </div>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => loadTicketDetail(activeTicket.id)}
                  disabled={loadingTickets}
                >
                  Retomar caso
                </Button>
              </div>
            )}

            <div className="h-[280px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 space-y-3">
              {messages.map((item, index) => (
                <div
                  key={`${item.sender}-${index}`}
                  className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      item.sender === 'user'
                        ? 'bg-[#006837] text-white'
                        : item.sender === 'system'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {showResolutionPrompt && resolutionStatuses.has(ticketStatus) && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-3">
                <div className="text-sm text-green-900 font-medium">
                  ¿Tu problema quedó resuelto con esta respuesta?
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleOpenSurveyResolved}>
                    Sí, quedó resuelto
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleManualEscalation}>
                    No, escalar a WhatsApp
                  </Button>
                </div>
              </div>
            )}

            {showSurvey && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Encuesta rápida de satisfacción
                </div>

                {whatsappUrl && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Abrir WhatsApp nuevamente
                  </Button>
                )}

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-800">¿Tu problema fue resuelto?</div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={survey.resolved === true ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSurvey((prev) => ({ ...prev, resolved: true }))}
                    >
                      Sí
                    </Button>
                    <Button
                      type="button"
                      variant={survey.resolved === false ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSurvey((prev) => ({ ...prev, resolved: false }))}
                    >
                      No
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-800">Califica la atención</div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={survey.rating === value ? 'default' : 'outline'}
                        onClick={() => setSurvey((prev) => ({ ...prev, rating: value }))}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>

                <Textarea
                  value={survey.comment}
                  onChange={(event) =>
                    setSurvey((prev) => ({
                      ...prev,
                      comment: event.target.value,
                    }))
                  }
                  placeholder="Comentario opcional"
                  rows={3}
                />

                <Button className="w-full" onClick={handleSubmitSurvey} disabled={submittingSurvey}>
                  {submittingSurvey ? 'Guardando...' : 'Finalizar caso'}
                </Button>
              </div>
            )}

            {!showSurvey && (
              <div className="space-y-3">
                <Textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe tu problema o duda operativa..."
                  rows={3}
                  maxLength={1200}
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Se creará un ticket desde tu primer mensaje.
                  </div>
                  <Button onClick={handleSendMessage} disabled={sending}>
                    {sending ? 'Enviando...' : 'Enviar'}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 px-5 shadow-2xl bg-[#006837] hover:bg-[#004d26] text-white"
        >
          <Ticket className="w-5 h-5 mr-2" />
          Centro de ayuda
        </Button>
      )}
    </div>
  );
};

export default SupportCenterWidget;
