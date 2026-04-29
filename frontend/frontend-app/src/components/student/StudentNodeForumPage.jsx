import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Clock3, MapPin, MessageCircle, MessageSquareMore, Reply, Send, Users } from 'lucide-react'

import StudentHeader from './StudentHeader'
import SupportCenterWidget from './SupportCenterWidget'
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage'
import { resolveForumNodeByMunicipio } from '@/constants/forumNodes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { nestForumReplies } from '@/utils/forumReplyTree'

const StudentNodeForumPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [replying, setReplying] = useState(false)
  const [forumInfo, setForumInfo] = useState(null)
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [questionDraft, setQuestionDraft] = useState('')
  const [replyDraft, setReplyDraft] = useState('')
  const [replyTarget, setReplyTarget] = useState(null)

  const authHeaders = useMemo(() => {
    const token = getAuthToken()
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    }
  }, [])

  const handleUnauthorized = () => {
    toast.error('Tu sesión expiró. Inicia sesión nuevamente.')
    navigate('/login')
  }

  const loadForumInfo = async () => {
    const response = await fetch(`${API_BASE_URL}/student/forum/me`, {
      credentials: 'include',
      headers: authHeaders,
    })

    if (response.status === 401) {
      handleUnauthorized()
      return null
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'No fue posible cargar tu foro.')
    }

    setForumInfo(data.data)
    return data.data
  }

  const loadThreads = async () => {
    const response = await fetch(`${API_BASE_URL}/student/forum/threads`, {
      credentials: 'include',
      headers: authHeaders,
    })

    if (response.status === 401) {
      handleUnauthorized()
      return []
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'No fue posible cargar las preguntas.')
    }

    setThreads(data.data?.threads || [])
    return data.data?.threads || []
  }

  const loadThreadDetail = async (threadId) => {
    const response = await fetch(`${API_BASE_URL}/student/forum/threads/${threadId}`, {
      credentials: 'include',
      headers: authHeaders,
    })

    if (response.status === 401) {
      handleUnauthorized()
      return null
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'No fue posible cargar el hilo.')
    }

    const thread = data.data?.thread || null
    setSelectedThread(thread)
    setReplyTarget(null)
    return thread
  }

  const refreshAll = async () => {
    try {
      setLoading(true)
      const info = await loadForumInfo()
      const loadedThreads = await loadThreads()
      if (loadedThreads.length > 0) {
        await loadThreadDetail(loadedThreads[0].id)
      } else {
        setSelectedThread(null)
      }

      if (!info?.node && info?.student?.municipio) {
        const fallbackNode = resolveForumNodeByMunicipio(info.student.municipio)
        if (fallbackNode) {
          setForumInfo((prev) => ({ ...prev, node: fallbackNode }))
        }
      }
    } catch (error) {
      toast.error(error.message || 'No fue posible cargar el foro.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const handlePublishQuestion = async (event) => {
    event.preventDefault()
    const question = questionDraft.trim()
    if (!question) {
      toast.error('Escribe una pregunta antes de publicar.')
      return
    }

    try {
      setPublishing(true)
      const response = await fetch(`${API_BASE_URL}/student/forum/threads`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ question }),
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'No fue posible publicar la pregunta.')
      }

      setQuestionDraft('')
      toast.success('Tu pregunta fue publicada.')
      await loadThreads()
      await loadThreadDetail(data.data.id)
      await loadForumInfo()
    } catch (error) {
      toast.error(error.message || 'No fue posible publicar la pregunta.')
    } finally {
      setPublishing(false)
    }
  }

  const handlePublishReply = async (event) => {
    event.preventDefault()
    if (!selectedThread?.id) {
      toast.error('Selecciona una pregunta para responder.')
      return
    }

    const body = replyDraft.trim()
    if (!body) {
      toast.error('Escribe una respuesta antes de enviarla.')
      return
    }

    try {
      setReplying(true)
      const payload = { body }
      if (replyTarget?.mode === 'nested') {
        payload.parent_reply_id = replyTarget.id
      }

      const response = await fetch(`${API_BASE_URL}/student/forum/threads/${selectedThread.id}/replies`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'No fue posible publicar la respuesta.')
      }

      setReplyDraft('')
      setReplyTarget(null)
      toast.success('Tu respuesta fue publicada.')
      await loadThreads()
      await loadThreadDetail(selectedThread.id)
      await loadForumInfo()
    } catch (error) {
      toast.error(error.message || 'No fue posible publicar la respuesta.')
    } finally {
      setReplying(false)
    }
  }

  const activeNode = forumInfo?.node || resolveForumNodeByMunicipio(forumInfo?.student?.municipio)

  const replyTree = useMemo(
    () => nestForumReplies(selectedThread?.replies || []),
    [selectedThread?.replies],
  )

  const renderReplyBranch = (node, depth) => (
    <div
      key={node.id}
      className={depth > 0 ? 'mt-3 ml-3 sm:ml-5 pl-3 border-l-2 border-blue-300' : ''}
    >
      <div className="rounded-xl border bg-gray-50 p-4">
        {node.parent_reply_preview && (
          <div className="mb-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600">
            <span className="font-medium text-gray-700">En respuesta a {node.parent_reply_preview.author_nombre}:</span>{' '}
            <span className="italic">{node.parent_reply_preview.body_preview}</span>
          </div>
        )}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={node.author?.rol === 'instructor' ? 'default' : 'outline'}>
              {node.author?.rol || 'usuario'}
            </Badge>
            <span className="text-sm font-medium text-gray-700">{node.author?.nombre || 'Usuario'}</span>
            <span className="text-xs text-gray-500">{new Date(node.created_at).toLocaleString('es-CO')}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0"
            onClick={() =>
              setReplyTarget({
                mode: 'nested',
                id: node.id,
                authorLabel: node.author?.nombre || 'Usuario',
                snippet: (node.body || '').slice(0, 100),
              })
            }
          >
            <Reply className="mr-1 h-3.5 w-3.5" />
            Responder
          </Button>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{node.body}</p>
      </div>
      {node.children?.length > 0 && (
        <div className="space-y-0">{node.children.map((child) => renderReplyBranch(child, depth + 1))}</div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader
        title="Foro de mi nodo"
        subtitle="Haz preguntas y responde a otros estudiantes de tu territorio"
        showBackButton={true}
        backUrl="/student/dashboard"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              {activeNode ? `Foro ${activeNode.name}` : 'Foro no disponible'}
            </CardTitle>
            <CardDescription>
              {activeNode
                ? `Tu municipio ${forumInfo?.student?.municipio || ''} participa en este foro.`
                : 'No fue posible identificar tu nodo a partir del municipio registrado.'}
            </CardDescription>
          </CardHeader>
          {activeNode && (
            <CardContent className="flex flex-wrap gap-3">
              <Badge variant="outline">Cabecera: {activeNode.central}</Badge>
              <Badge variant="outline">{forumInfo?.stats?.threads_count || 0} preguntas</Badge>
              <Badge variant="outline">{forumInfo?.stats?.replies_count || 0} respuestas</Badge>
              <Badge variant="outline">{activeNode.municipios.length} municipios</Badge>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nueva pregunta</CardTitle>
                <CardDescription>
                  Publica dudas o solicitudes para estudiantes e instructores de tu nodo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePublishQuestion} className="space-y-3">
                  <Textarea
                    value={questionDraft}
                    onChange={(event) => setQuestionDraft(event.target.value)}
                    placeholder="Ejemplo: ¿Alguien del nodo Costa Pacífica ya resolvió este trámite o dificultad?"
                    rows={5}
                  />
                  <Button type="submit" disabled={publishing || !activeNode} className="w-full">
                    <MessageSquareMore className="h-4 w-4" />
                    {publishing ? 'Publicando...' : 'Publicar pregunta'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preguntas del nodo</CardTitle>
                <CardDescription>
                  {threads.length ? 'Selecciona una conversación para leer y responder.' : 'Todavía no hay preguntas publicadas.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {threads.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                    Este foro aún no tiene publicaciones.
                  </div>
                )}

                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => loadThreadDetail(thread.id)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      selectedThread?.id === thread.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-gray-900 line-clamp-3">{thread.question}</p>
                      <Badge variant="outline">{thread.replies_count} resp.</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {thread.author?.nombre || 'Usuario'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {new Date(thread.updated_at || thread.created_at).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="min-h-[560px]">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedThread ? 'Detalle del hilo' : 'Selecciona una pregunta'}
              </CardTitle>
              <CardDescription>
                {selectedThread
                  ? 'Aquí puedes seguir la conversación y aportar una respuesta.'
                  : 'Elige una pregunta del panel izquierdo para ver las respuestas.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!selectedThread && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                  No hay un hilo seleccionado.
                </div>
              )}

              {selectedThread && (
                <>
                  <div className="rounded-xl border bg-white p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{selectedThread.author?.rol || 'usuario'}</Badge>
                        <Badge variant="outline">{selectedThread.status}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyTarget(null)
                          setReplyDraft('')
                        }}
                      >
                        <Reply className="mr-1 h-4 w-4" />
                        Responder
                      </Button>
                    </div>
                    <p className="text-base font-semibold text-gray-900 mb-2">{selectedThread.question}</p>
                    <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                      <span>{selectedThread.author?.nombre || 'Usuario'}</span>
                      <span>{new Date(selectedThread.created_at).toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {replyTree.length ? (
                      replyTree.map((node) => renderReplyBranch(node, 0))
                    ) : (
                      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                        Todavía no hay respuestas en esta conversación.
                      </div>
                    )}
                  </div>

                  <form onSubmit={handlePublishReply} className="space-y-3">
                    <div className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-sm text-gray-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          {replyTarget?.mode === 'nested' ? (
                            <>
                              Respondiendo a <strong>{replyTarget.authorLabel}</strong>
                              {replyTarget.snippet
                                ? ` «${replyTarget.snippet}${replyTarget.snippet.length >= 100 ? '…' : ''}»`
                                : ''}
                              .
                            </>
                          ) : (
                            <>Tu mensaje se publicará como respuesta a la pregunta del hilo.</>
                          )}
                        </span>
                        {replyTarget?.mode === 'nested' && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => setReplyTarget(null)}>
                            Volver a responder al hilo
                          </Button>
                        )}
                      </div>
                    </div>
                    <Textarea
                      value={replyDraft}
                      onChange={(event) => setReplyDraft(event.target.value)}
                      placeholder="Escribe una respuesta útil para otros estudiantes o para el instructor del nodo."
                      rows={4}
                    />
                    <Button type="submit" disabled={replying}>
                      <Send className="h-4 w-4" />
                      {replying ? 'Enviando...' : 'Enviar respuesta'}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <SupportCenterWidget screenLabel="student-node-forum" />
    </div>
  )
}

export default StudentNodeForumPage
