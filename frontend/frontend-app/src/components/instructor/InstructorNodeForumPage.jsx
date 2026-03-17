import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Filter, MapPin, MessageSquareMore, Send } from 'lucide-react'

import InstructorHeader from './InstructorHeader'
import API_BASE_URL from '@/config/api'
import { getAuthToken } from '@/utils/auth-storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'

const InstructorNodeForumPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [replying, setReplying] = useState(false)
  const [nodes, setNodes] = useState([])
  const [selectedNodeSlug, setSelectedNodeSlug] = useState('')
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [replyDraft, setReplyDraft] = useState('')

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

    setSelectedThread(data.data?.thread || null)
    return data.data?.thread || null
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

    const body = replyDraft.trim()
    if (!body) {
      toast.error('Escribe una respuesta antes de enviarla.')
      return
    }

    try {
      setReplying(true)
      const response = await fetch(`${API_BASE_URL}/instructor/forum/threads/${selectedThread.id}/replies`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,
        body: JSON.stringify({ body }),
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
      toast.success('Respuesta publicada en el foro.')
      await loadThreads(selectedNodeSlug)
      await loadThreadDetail(selectedThread.id)
      await loadNodes()
    } catch (error) {
      toast.error(error.message || 'No fue posible responder el hilo.')
    } finally {
      setReplying(false)
    }
  }

  const selectedNode = nodes.find((node) => node.slug === selectedNodeSlug) || null

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
        subtitle="Consulta y responde preguntas de todos los territorios"
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
                  <button
                    key={node.slug}
                    type="button"
                    onClick={() => handleNodeChange(node.slug)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      selectedNodeSlug === node.slug
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
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
                ))}
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
                    <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-3">
                      <span>{thread.author?.nombre || 'Usuario'}</span>
                      <span>{thread.author?.municipio || 'Sin municipio'}</span>
                      <span>{new Date(thread.updated_at || thread.created_at).toLocaleString('es-CO')}</span>
                    </div>
                  </button>
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
                    ? 'Responde como instructor para orientar al nodo.'
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
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge>{selectedThread.author?.rol || 'usuario'}</Badge>
                        <Badge variant="outline">{selectedThread.status}</Badge>
                      </div>
                      <p className="text-base font-semibold text-gray-900 mb-2">{selectedThread.question}</p>
                      <div className="text-sm text-gray-500 flex flex-wrap gap-4">
                        <span>{selectedThread.author?.nombre || 'Usuario'}</span>
                        <span>{selectedThread.author?.municipio || 'Sin municipio'}</span>
                        <span>{new Date(selectedThread.created_at).toLocaleString('es-CO')}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedThread.replies?.length ? (
                        selectedThread.replies.map((reply) => (
                          <div key={reply.id} className="rounded-xl border bg-gray-50 p-4">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant={reply.author?.rol === 'instructor' ? 'default' : 'outline'}>
                                {reply.author?.rol || 'usuario'}
                              </Badge>
                              <span className="text-sm font-medium text-gray-700">
                                {reply.author?.nombre || 'Usuario'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.created_at).toLocaleString('es-CO')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
                          Aún no hay respuestas en este hilo.
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleReply} className="space-y-3">
                      <Textarea
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        placeholder="Responde como instructor para orientar o aclarar la conversación del nodo."
                        rows={4}
                      />
                      <Button type="submit" disabled={replying}>
                        <Send className="h-4 w-4" />
                        {replying ? 'Enviando...' : 'Responder como instructor'}
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
