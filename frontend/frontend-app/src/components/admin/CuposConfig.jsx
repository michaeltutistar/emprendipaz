import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CuposConfig = () => {
  const [modo, setModo] = useState('abierto')
  const [cupoGlobal, setCupoGlobal] = useState('')
  const [convocatoria, setConvocatoria] = useState('2025')
  const [items, setItems] = useState([])
  const [globalEstado, setGlobalEstado] = useState(null)
  const [subregiones, setSubregiones] = useState([])
  const [muniEstado, setMuniEstado] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('porcentaje') // municipio | subregion | porcentaje | disponibles
  const [sortDir, setSortDir] = useState('desc') // asc | desc
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const loadData = async () => {
    try {
      const cfgRes = await fetch('/api/admin/cupos/config', { credentials: 'include' })
      if (cfgRes.ok) {
        const cfg = await cfgRes.json()
        setModo(cfg.modo || 'abierto')
        setConvocatoria(cfg.convocatoria || '2025')
        setCupoGlobal(cfg.cupo_global_max ?? '')
      }
      const muniRes = await fetch('/api/admin/cupos/municipios', { credentials: 'include' })
      if (muniRes.ok) {
        const data = await muniRes.json()
        setItems(data)
      }
      const estRes = await fetch('/api/admin/cupos/estado', { credentials: 'include' })
      if (estRes.ok) {
        const est = await estRes.json()
        setGlobalEstado(est.global)
        setSubregiones(est.subregiones)
        setMuniEstado(est.municipios)
      }
    } catch (e) {}
  }

  useEffect(() => { loadData() }, [])

  const saveConfig = async () => {
    setLoading(true)
    setMsg('')
    try {
      const body = { modo, convocatoria }
      if (cupoGlobal !== '') body.cupo_global_max = Number(cupoGlobal)
      const res = await fetch('/api/admin/cupos/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Error guardando configuración')
      setMsg('Configuración guardada')
    } catch (e) {
      setMsg('Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const saveMunicipios = async () => {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/cupos/municipios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items })
      })
      if (!res.ok) throw new Error('Error guardando municipios')
      setMsg('Cupos por municipio guardados')
    } catch (e) {
      setMsg('Error al guardar municipios')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = (idx, value) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, cupo_max: value } : it))
  }

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

  const displayedRows = (() => {
    // Unir estado (confirmados, lista_espera, disponibles) con cupo editable
    const bySlug = new Map(items.map((it, idx) => [it.municipio_slug, { ...it, idx }]))
    const rows = muniEstado.map(r => {
      const edit = bySlug.get(r.municipio)
      const cupoMax = edit ? Number(edit.cupo_max) : Number(r.cupo_max)
      const confirmados = Number(r.confirmados)
      const disponibles = Math.max(0, cupoMax - confirmados)
      const porcentaje = cupoMax > 0 ? Math.round((confirmados / cupoMax) * 10000) / 100 : 0
      return {
        municipio: r.municipio,
        subregion: r.subregion,
        cupo_max: cupoMax,
        confirmados,
        lista_espera: Number(r.lista_espera),
        disponibles,
        porcentaje,
        idx: edit ? edit.idx : -1,
      }
    })
      .filter(r => (r.municipio + ' ' + r.subregion).toLowerCase().includes(search.toLowerCase()))

    const cmp = (a, b, key) => {
      if (a[key] < b[key]) return -1
      if (a[key] > b[key]) return 1
      return 0
    }
    rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b, sortBy) : cmp(b, a, sortBy)))
    return rows
  })()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Cupos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {globalEstado && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
                <span>Global: {globalEstado.confirmados}/{globalEstado.cupo_max} (disp. {globalEstado.disponibles})</span>
                <span>{globalEstado.porcentaje}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                <div className={`h-2 ${globalEstado.porcentaje >= 100 ? 'bg-red-500' : globalEstado.porcentaje >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${globalEstado.porcentaje}%` }} />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Modo</Label>
              <select className="w-full border rounded px-3 py-2" value={modo} onChange={e => setModo(e.target.value)}>
                <option value="abierto">Abierto (sin bloqueo)</option>
                <option value="bloqueado">Bloqueado (con lista de espera)</option>
              </select>
            </div>
            <div>
              <Label>Cupo Global</Label>
              <Input type="number" min="0" value={cupoGlobal} onChange={e => setCupoGlobal(e.target.value)} placeholder="(vacío = ilimitado)" />
            </div>
            <div>
              <Label>Convocatoria</Label>
              <Input value={convocatoria} onChange={e => setConvocatoria(e.target.value)} />
            </div>
          </div>
          <Button onClick={saveConfig} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Configuración'}</Button>
          {msg && <p className="text-sm text-gray-600">{msg}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cupos por Municipio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-64">
              <Input placeholder="Buscar municipio o subregión" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="text-sm text-gray-600">Orden: 
              <button className="ml-2 underline" onClick={() => toggleSort('porcentaje')}>% Ocupación</button>
              <button className="ml-2 underline" onClick={() => toggleSort('disponibles')}>Disponibles</button>
              <button className="ml-2 underline" onClick={() => toggleSort('municipio')}>Municipio</button>
            </div>
          </div>
          {subregiones.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {subregiones.map(sr => (
                <div key={sr.subregion} className="border rounded p-3 text-sm">
                  <div className="flex items-center justify-between mb-1 font-medium">
                    <span>{sr.subregion}</span>
                    <span>{sr.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                    <div className={`h-2 ${sr.porcentaje >= 100 ? 'bg-red-500' : sr.porcentaje >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${sr.porcentaje}%` }} />
                  </div>
                  <div className="mt-1 text-gray-600">{sr.confirmados}/{sr.cupo_max} (disp. {sr.disponibles})</div>
                </div>
              ))}
            </div>
          )}
          <div className="max-h-96 overflow-y-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-2">Subregión</th>
                  <th className="text-left p-2">Municipio</th>
                  <th className="text-left p-2">Cupo</th>
                  <th className="text-left p-2">Confirmados</th>
                  <th className="text-left p-2">Lista espera</th>
                  <th className="text-left p-2">Disponibles</th>
                  <th className="text-left p-2">% y estado</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((r) => (
                  <tr key={r.municipio} className="border-t">
                    <td className="p-2">{r.subregion}</td>
                    <td className="p-2">{r.municipio}</td>
                    <td className="p-2 w-32">
                      {r.idx >= 0 ? (
                        <Input type="number" min="0" value={items[r.idx].cupo_max} onChange={e => updateItem(r.idx, Number(e.target.value))} />
                      ) : (
                        r.cupo_max
                      )}
                    </td>
                    <td className="p-2">{r.confirmados}</td>
                    <td className="p-2">{r.lista_espera}</td>
                    <td className="p-2">{r.disponibles}</td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        <div className={`h-3 w-3 rounded-full ${r.porcentaje >= 100 ? 'bg-red-500' : r.porcentaje >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span>{r.porcentaje}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={saveMunicipios} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cupos por Municipio'}</Button>
          <a href="/api/admin/cupos/estado/export" className="inline-block ml-3 text-sm text-green-700 underline">Exportar Excel</a>
        </CardContent>
      </Card>
    </div>
  )
}

export default CuposConfig


