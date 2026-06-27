import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, Filter, MapPin, MessageSquareMore, Reply, Send, Trash2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

import InstructorHeader from './InstructorHeader'
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { nestForumReplies } from '@/utils/forumReplyTree'

const STUDENT_ROLES = new Set(['estudiante', 'usuario'])

const isStudentAuthor = (author) => STUDENT_ROLES.has(author?.rol)

const InstructorNodeForumPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [replying, setReplying] = useState(false)
  const [nodes, setNodes] = useState([])
  const [selectedNodeSlug, setSelectedNodeSlug] = useState('')
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [questionDraft, setQuestionDraft] = useState('')
  const [replyDraft, setReplyDraft] = useState('')
  /** null = respuesta al hilo (pregunta); objeto = respuesta a un mensaje concreto */
  const [replyTarget, setReplyTarget] = useState(null)
  const [exportingNodeSlug, setExportingNodeSlug] = useState('')
  const [deletingThreadId, setDeletingThreadId] = useState(null)
  const [deletingReplyId, setDeletingReplyId] = useState(null)

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

  const loadNodes = async () => {
    const response = await fetch(`${API_BASE_URL}/instructor/forum/nodes`, {
      credentials: 'include',
      headers: authHeaders,
    })

    if (response.status === 401) {
      handleUnauthorized()
      return []
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'No fue posible cargar los nodos del foro.')
    }

    const loadedNodes = data.data?.nodes || []
    setNodes(loadedNodes)
    return loadedNodes
  }

  const loadThreads = async (nodeSlug = '') => {
    const query = nodeSlug ? `?node_slug=${encodeURIComponent(nodeSlug)}` : ''
    const response = await fetch(`${API_BASE_URL}/instructor/forum/threads${query}`, {
      credentials: 'include',
      headers: authHeaders,
    })

    if (response.status === 401) {
      handleUnauthorized()
      return []
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'No fue posible cargar los hilos.')
    }

    const loadedThreads = data.data?.threads || []
    setThreads(loadedThreads)
    return loadedThreads
  }

  const loadThreadDetail = async (threadId) => {
    const response = await fetch(`${API_BASE_URL}/instructor/forum/threads/${threadId}`, {
      credentials: 'include',
      headers: authHeaders,
    })

    if (response.status === 401) {
      handleUnauthorized()
      return null
    }

    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'No fue posible cargar el detalle del hilo.')
    }

    const thread = data.data?.thread || null
    setSelectedThread(thread)
    setReplyTarget(null)
    return thread
  }

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true)
        const loadedNodes = await loadNodes()
        const firstNode = loadedNodes[0]?.slug || ''
        setSelectedNodeSlug(firstNode)
        const loadedThreads = await loadThreads(firstNode)
        if (loadedThreads.length > 0) {
          await loadThreadDetail(loadedThreads[0].id)
        }
      } catch (error) {
        toast.error(error.message || 'No fue posible cargar el foro por nodos.')
      } finally {
        setLoading(false)
      }
    }

    bootstrap()
  }, [])

  const handleNodeChange = async (nodeSlug) => {
    try {
      setSelectedNodeSlug(nodeSlug)
      setSelectedThread(null)
      const loadedThreads = await loadThreads(nodeSlug)
      if (loadedThreads.length > 0) {
        await loadThreadDetail(loadedThreads[0].id)
      }
    } catch (error) {
      toast.error(error.message || 'No fue posible cambiar de nodo.')
    }
  }

  const handleReply = async (event) => {
    event.preventDefault()
    if (!selectedThread?.id) {
      toast.error('Selecciona un hilo para responder.')
      return
    }

    if (replyTarget?.mode !== 'nested' || !replyTarget?.id) {
      toast.error('Selecciona una respuesta de emprendedor con «Dar retroalimentación».')
      return
    }

    const body = replyDraft.trim()
    if (!body) {
      toast.error('Escribe la retroalimentación antes de enviarla.')
      return
    }

    try {
      setReplying(true)
      const payload = {
        body,
        parent_reply_id: replyTarget.id,
      }

      const response = await fetch(`${API_BASE_URL}/instructor/forum/threads/${selectedThread.id}/replies`, {
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
      toast.success('Retroalimentación publicada correctamente.')
      await loadThreads(selectedNodeSlug)
      await loadThreadDetail(selectedThread.id)
      await loadNodes()
    } catch (error) {
      toast.error(error.message || 'No fue posible responder el hilo.')
    } finally {
      setReplying(false)
    }
  }

  const handlePublishQuestion = async (event) => {
    event.preventDefault()

    if (!selectedNodeSlug) {
      toast.error('Selecciona un nodo antes de publicar una pregunta.')
      return
    }

    const question = questionDraft.trim()
    if (!question) {
      toast.error('Escribe una pregunta antes de publicarla.')
      return
    }

    try {
      setPublishing(true)
      const response = await fetch(`${API_BASE_URL}/instructor/forum/threads`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({
          node_slug: selectedNodeSlug,
          question,
        }),
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
      toast.success('Pregunta publicada por el instructor.')
      await refreshForumState(selectedNodeSlug, data.data?.id || null)
    } catch (error) {
      toast.error(error.message || 'No fue posible publicar la pregunta.')
    } finally {
      setPublishing(false)
    }
  }

  const refreshForumState = async (nodeSlug, preferredThreadId = null) => {
    await loadNodes()
    const loadedThreads = await loadThreads(nodeSlug)
    if (!loadedThreads.length) {
      setSelectedThread(null)
      setReplyDraft('')
      setReplyTarget(null)
      return
    }

    const targetThreadId =
      preferredThreadId && loadedThreads.some((thread) => thread.id === preferredThreadId)
        ? preferredThreadId
        : loadedThreads[0].id

    await loadThreadDetail(targetThreadId)
  }

  const handleDeleteThread = async (thread) => {
    if (!thread?.id) return

    const confirmed = window.confirm(
      '¿Estás seguro de eliminar este hilo completo? También se eliminarán todas sus respuestas.'
    )
    if (!confirmed) return

    try {
      setDeletingThreadId(thread.id)
      const response = await fetch(`${API_BASE_URL}/instructor/forum/threads/${thread.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders,
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'No fue posible eliminar el hilo.')
      }

      const nextThreadId =
        selectedThread?.id === thread.id
          ? null
          : selectedThread?.id

      await refreshForumState(selectedNodeSlug, nextThreadId)
      toast.success('Hilo eliminado correctamente.')
    } catch (error) {
      toast.error(error.message || 'No fue posible eliminar el hilo.')
    } finally {
      setDeletingThreadId(null)
    }
  }

  const handleDeleteReply = async (reply) => {
    if (!reply?.id || !selectedThread?.id) return

    const confirmed = window.confirm('¿Estás seguro de eliminar esta respuesta?')
    if (!confirmed) return

    try {
      setDeletingReplyId(reply.id)
      const response = await fetch(`${API_BASE_URL}/instructor/forum/replies/${reply.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders,
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'No fue posible eliminar la respuesta.')
      }

      await loadNodes()
      await loadThreads(selectedNodeSlug)
      await loadThreadDetail(selectedThread.id)
      toast.success('Respuesta eliminada correctamente.')
    } catch (error) {
      toast.error(error.message || 'No fue posible eliminar la respuesta.')
    } finally {
      setDeletingReplyId(null)
    }
  }

  const formatDate = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('es-CO')
  }

  const formatTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const slugifyFilePart = (value) =>
    String(value || 'nodo')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'nodo'

  const exportNodeData = async (node) => {
    if (!node?.slug) return

    try {
      setExportingNodeSlug(node.slug)
      const response = await fetch(`${API_BASE_URL}/instructor/forum/nodes/${node.slug}/export`, {
        credentials: 'include',
        headers: authHeaders,
      })

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'No fue posible exportar la conversación del nodo.')
      }

      const exportPayload = data.data || {}
      const exportNode = exportPayload.node || node
      const exportThreads = Array.isArray(exportPayload.threads) ? exportPayload.threads : []

      const summaryRows = [
        { Campo: 'Nodo', Valor: exportNode.name || '' },
        { Campo: 'Cabecera', Valor: exportNode.central || '' },
        { Campo: 'Municipios', Valor: Array.isArray(exportNode.municipios) ? exportNode.municipios.join(', ') : '' },
        { Campo: 'Total hilos', Valor: exportNode.threads_count ?? exportThreads.length },
        { Campo: 'Total respuestas', Valor: exportNode.replies_count ?? exportThreads.reduce((sum, thread) => sum + (thread.replies?.length || 0), 0) },
        { Campo: 'Exportado el', Valor: formatDate(exportPayload.exported_at) },
        { Campo: 'Exportado a las', Valor: formatTime(exportPayload.exported_at) },
      ]

      const conversationRows = []
      exportThreads.forEach((thread) => {
        const threadAuthor = thread.author || {}
        const threadDate = thread.created_at || thread.updated_at

        conversationRows.push({
          'Nodo': exportNode.name || '',
          'Cabecera': exportNode.central || '',
          'Hilo ID': thread.id,
          'Estado del hilo': thread.status || '',
          'Estudiante': threadAuthor.nombre || 'Usuario',
          'Municipio estudiante': threadAuthor.municipio || 'Sin municipio',
          'Fecha hilo': formatDate(threadDate),
          'Hora hilo': formatTime(threadDate),
          'Pregunta principal': thread.question || '',
          'Tipo de intervención': 'Pregunta',
          'Autor intervención': threadAuthor.nombre || 'Usuario',
          'Rol autor': threadAuthor.rol || 'usuario',
          'Municipio autor': threadAuthor.municipio || 'Sin municipio',
          'Fecha intervención': formatDate(thread.created_at),
          'Hora intervención': formatTime(thread.created_at),
          'Mensaje': thread.question || '',
          'Total respuestas del hilo': thread.replies_count ?? (thread.replies?.length || 0),
        })

        ;(thread.replies || []).forEach((reply) => {
          const replyAuthor = reply.author || {}
          conversationRows.push({
            'Nodo': exportNode.name || '',
            'Cabecera': exportNode.central || '',
            'Hilo ID': thread.id,
            'Estado del hilo': thread.status || '',
            'Estudiante': threadAuthor.nombre || 'Usuario',
            'Municipio estudiante': threadAuthor.municipio || 'Sin municipio',
            'Fecha hilo': formatDate(threadDate),
            'Hora hilo': formatTime(threadDate),
            'Pregunta principal': thread.question || '',
            'Tipo de intervención': 'Respuesta',
            'Autor intervención': replyAuthor.nombre || 'Usuario',
            'Rol autor': replyAuthor.rol || 'usuario',
            'Municipio autor': replyAuthor.municipio || 'Sin municipio',
            'Fecha intervención': formatDate(reply.created_at),
            'Hora intervención': formatTime(reply.created_at),
            'Mensaje': reply.body || '',
            'Total respuestas del hilo': thread.replies_count ?? (thread.replies?.length || 0),
          })
        })
      })

      const workbook = XLSX.utils.book_new()
      const summarySheet = XLSX.utils.json_to_sheet(summaryRows)
      const conversationSheet = XLSX.utils.json_to_sheet(
        conversationRows.length
          ? conversationRows
          : [{
              'Nodo': exportNode.name || '',
              'Cabecera': exportNode.central || '',
              'Mensaje': 'Este nodo todavía no tiene conversaciones registradas.',
            }]
      )

      summarySheet['!cols'] = [{ wch: 24 }, { wch: 80 }]
      conversationSheet['!cols'] = [
        { wch: 16 },
        { wch: 16 },
        { wch: 10 },
        { wch: 14 },
        { wch: 28 },
        { wch: 22 },
        { wch: 14 },
        { wch: 10 },
        { wch: 42 },
        { wch: 18 },
        { wch: 28 },
        { wch: 14 },
        { wch: 22 },
        { wch: 16 },
        { wch: 10 },
        { wch: 80 },
        { wch: 18 },
      ]

      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')
      XLSX.utils.book_append_sheet(workbook, conversationSheet, 'Conversaciones')

      const exportedAt = new Date()
      const fileDate = `${exportedAt.getFullYear()}-${String(exportedAt.getMonth() + 1).padStart(2, '0')}-${String(exportedAt.getDate()).padStart(2, '0')}`
      const fileName = `foro-${slugifyFilePart(exportNode.name)}-${fileDate}.xlsx`
      const workbookArray = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      saveAs(new Blob([workbookArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName)

      toast.success('Conversación del nodo exportada correctamente.')
    } catch (error) {
      toast.error(error.message || 'No fue posible exportar la conversación del nodo.')
    } finally {
      setExportingNodeSlug('')
    }
  }

  const selectedNode = nodes.find((node) => node.slug === selectedNodeSlug) || null

  const replyTree = useMemo(
    () => nestForumReplies(selectedThread?.replies || []),
    [selectedThread?.replies],
  )

  const renderReplyBranch = (node, depth) => {
    const isStudentReply = isStudentAuthor(node.author)
    const isFeedbackTarget = replyTarget?.mode === 'nested' && replyTarget?.id === node.id

    return (
    <div
      key={node.id}
      className={depth > 0 ? 'mt-3 ml-3 sm:ml-5 pl-3 border-l-2 border-blue-300' : ''}
    >
      <div
        className={`rounded-xl border p-4 ${
          isFeedbackTarget ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
        }`}
      >
        {node.parent_reply_preview && (
          <div className="mb-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600">
            <span className="font-medium text-gray-700">En respuesta a {node.parent_reply_preview.author_nombre}:</span>{' '}
            <span className="italic">{node.parent_reply_preview.body_preview}</span>
          </div>
        )}
        <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={node.author?.rol === 'instructor' ? 'default' : 'outline'}>
              {node.author?.rol || 'usuario'}
            </Badge>
            <span className="text-sm font-medium text-gray-700">{node.author?.nombre || 'Usuario'}</span>
            <span className="text-xs text-gray-500">{new Date(node.created_at).toLocaleString('es-CO')}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isStudentReply && (
              <Button
                type="button"
                variant={isFeedbackTarget ? 'default' : 'outline'}
                size="sm"
                className="h-8"
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
                Dar retroalimentación
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleDeleteReply(node)}
              disabled={deletingReplyId === node.id}
              title="Eliminar respuesta"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{node.body}</p>
      </div>
      {node.children?.length > 0 && (
        <div className="space-y-0">{node.children.map((child) => renderReplyBranch(child, depth + 1))}</div>
      )}
    </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorHeader
        title="Foros por nodo"
        subtitle="Publica preguntas y da retroalimentación directa a cada emprendedor"
        showBackButton={true}
        backUrl="/instructor/dashboard"
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Nodos
                </CardTitle>
                <CardDescription>Selecciona un nodo para revisar sus conversaciones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nodes.map((node) => (
                  <div
                    key={node.slug}
                    className={`w-full rounded-lg border p-4 transition-colors ${
                      selectedNodeSlug === node.slug
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleNodeChange(node.slug)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{node.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Cabecera: {node.central}</p>
                        </div>
                        <Badge variant="outline">{node.threads_count}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>{node.municipios.length} municipios</span>
                        <span>{node.replies_count} respuestas</span>
                      </div>
                    </button>

                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => exportNodeData(node)}
                        disabled={exportingNodeSlug === node.slug}
                      >
                        <Download className="h-4 w-4" />
                        {exportingNodeSlug === node.slug ? 'Exportando...' : 'Exportar Excel'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nueva pregunta</CardTitle>
                <CardDescription>
                  El instructor puede iniciar un hilo en el nodo seleccionado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePublishQuestion} className="space-y-3">
                  <Textarea
                    value={questionDraft}
                    onChange={(event) => setQuestionDraft(event.target.value)}
                    placeholder={
                      selectedNode
                        ? `Escribe una pregunta para el nodo ${selectedNode.name}.`
                        : 'Selecciona un nodo para crear una pregunta.'
                    }
                    rows={5}
                    disabled={!selectedNodeSlug || publishing}
                  />
                  <Button type="submit" disabled={!selectedNodeSlug || publishing}>
                    <Send className="h-4 w-4" />
                    {publishing ? 'Publicando...' : 'Publicar pregunta como instructor'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  {selectedNode ? `Foro ${selectedNode.name}` : 'Foro del nodo'}
                </CardTitle>
                <CardDescription>
                  {selectedNode
                    ? `Vista del nodo ${selectedNode.name}, cabecera ${selectedNode.central}.`
                    : 'Selecciona un nodo para ver los hilos.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {threads.length === 0 && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
                    Este nodo todavía no tiene preguntas publicadas.
                  </div>
                )}

                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`w-full rounded-lg border p-4 transition-colors ${
                      selectedThread?.id === thread.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => loadThreadDetail(thread.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-medium text-gray-900 line-clamp-3">{thread.question}</p>
                          <Badge variant="outline">{thread.replies_count} resp.</Badge>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-3">
                          <span>{thread.author?.nombre || 'Usuario'}</span>
                          <span>{thread.author?.municipio || 'Sin municipio'}</span>
                          <span>{new Date(thread.updated_at || thread.created_at).toLocaleString('es-CO')}</span>
                        </div>
                      </button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteThread(thread)}
                        disabled={deletingThreadId === thread.id}
                        title="Eliminar hilo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareMore className="h-5 w-5 text-blue-600" />
                  {selectedThread ? 'Detalle del hilo' : 'Selecciona una conversación'}
                </CardTitle>
                <CardDescription>
                  {selectedThread
                    ? 'Usa «Dar retroalimentación» en la respuesta de cada emprendedor.'
                    : 'Debes seleccionar un hilo para ver su contenido.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {!selectedThread && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
                    No hay un hilo seleccionado.
                  </div>
                )}

                {selectedThread && (
                  <>
                    <div className="rounded-xl border bg-white p-5">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge>{selectedThread.author?.rol || 'usuario'}</Badge>
                          <Badge variant="outline">{selectedThread.status}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteThread(selectedThread)}
                            disabled={deletingThreadId === selectedThread.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            {deletingThreadId === selectedThread.id ? 'Eliminando...' : 'Eliminar hilo'}
                          </Button>
                        </div>
                      </div>
                      <p className="text-base font-semibold text-gray-900 mb-2">{selectedThread.question}</p>
                      <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                        <span>{selectedThread.author?.nombre || 'Usuario'}</span>
                        <span>{selectedThread.author?.municipio || 'Sin municipio'}</span>
                        <span>{new Date(selectedThread.created_at).toLocaleString('es-CO')}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {replyTree.length ? (
                        replyTree.map((node) => renderReplyBranch(node, 0))
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                          Aún no hay respuestas en este hilo.
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleReply} className="space-y-3">
                      <div className="rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-sm text-gray-700">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>
                            {replyTarget?.mode === 'nested' ? (
                              <>
                                Retroalimentando a <strong>{replyTarget.authorLabel}</strong>
                                {replyTarget.snippet
                                  ? ` «${replyTarget.snippet}${replyTarget.snippet.length >= 100 ? '…' : ''}»`
                                  : ''}
                                .
                              </>
                            ) : (
                              <>Selecciona una respuesta de emprendedor con «Dar retroalimentación» para continuar.</>
                            )}
                          </span>
                          {replyTarget?.mode === 'nested' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyTarget(null)
                                setReplyDraft('')
                              }}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                      <Textarea
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        placeholder={
                          replyTarget?.mode === 'nested'
                            ? 'Escribe la retroalimentación para este emprendedor. Quedará visible debajo de su respuesta.'
                            : 'Primero elige la respuesta del emprendedor a la que vas a retroalimentar.'
                        }
                        rows={4}
                        disabled={replyTarget?.mode !== 'nested'}
                      />
                      <Button
                        type="submit"
                        disabled={replying || replyTarget?.mode !== 'nested'}
                      >
                        <Send className="h-4 w-4" />
                        {replying ? 'Enviando...' : 'Enviar retroalimentación'}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorNodeForumPage
