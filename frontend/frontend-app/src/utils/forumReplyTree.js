/**
 * Agrupa respuestas del foro en árbol según parent_reply_id (orden cronológico entre hermanos).
 */
export function nestForumReplies(replies) {
  if (!Array.isArray(replies) || replies.length === 0) return []

  const byId = new Map()
  for (const r of replies) {
    byId.set(r.id, { ...r, children: [] })
  }

  const roots = []
  for (const r of replies) {
    const node = byId.get(r.id)
    const pid = r.parent_reply_id
    if (pid != null && byId.has(pid)) {
      byId.get(pid).children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortChildren = (nodes) => {
    nodes.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    for (const n of nodes) {
      sortChildren(n.children)
    }
  }
  sortChildren(roots)
  return roots
}
