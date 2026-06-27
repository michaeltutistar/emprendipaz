import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import API_BASE_URL from '@/config/api'

const REQUIRED_WIDTH = 1120
const REQUIRED_HEIGHT = 350

const BannerManagement = () => {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [imageName, setImageName] = useState('')
  const [imageError, setImageError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  })

  const bannerCountText = useMemo(() => {
    if (banners.length === 0) return 'No hay banners creados'
    if (banners.length === 1) return '1 banner creado'
    return `${banners.length} banners creados`
  }, [banners.length])

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/landing-banners`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'No se pudieron cargar los banners')
      }
      setBanners(data.banners || [])
    } catch (error) {
      toast.error(error.message || 'Error al cargar banners')
    } finally {
      setLoading(false)
    }
  }

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })

  const validateBannerImage = (file) => new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const isValid = image.width === REQUIRED_WIDTH && image.height === REQUIRED_HEIGHT
      URL.revokeObjectURL(objectUrl)

      if (!isValid) {
        reject(new Error(`La imagen debe medir exactamente ${REQUIRED_WIDTH} x ${REQUIRED_HEIGHT}px.`))
        return
      }

      resolve()
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('El archivo seleccionado no es una imagen válida.'))
    }

    image.src = objectUrl
  })

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0]
    setImageError('')

    if (!file) {
      setImageDataUrl('')
      setImageName('')
      return
    }

    try {
      await validateBannerImage(file)
      const dataUrl = await readFileAsDataUrl(file)
      setImageDataUrl(String(dataUrl || ''))
      setImageName(file.name)
      toast.success('Imagen validada correctamente')
    } catch (error) {
      setImageDataUrl('')
      setImageName('')
      setImageError(error.message)
      event.target.value = ''
      toast.error(error.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Debes ingresar el título del banner')
      return
    }

    if (!formData.body.trim()) {
      toast.error('Debes ingresar el texto del banner')
      return
    }

    if (!imageDataUrl) {
      toast.error(`Debes subir una imagen de ${REQUIRED_WIDTH} x ${REQUIRED_HEIGHT}px`)
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`${API_BASE_URL}/admin/landing-banners`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          body: formData.body.trim(),
          image_filename: imageName,
          image_data_url: imageDataUrl
        })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'No se pudo crear el banner')
      }

      setFormData({ title: '', body: '' })
      setImageDataUrl('')
      setImageName('')
      setImageError('')
      toast.success('Banner creado exitosamente')
      await fetchBanners()
    } catch (error) {
      toast.error(error.message || 'Error al crear banner')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (banner) => {
    const confirmed = window.confirm(`¿Eliminar el banner "${banner.title}"?`)
    if (!confirmed) return

    try {
      setDeletingId(banner.id)
      const response = await fetch(`${API_BASE_URL}/admin/landing-banners/${banner.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'No se pudo eliminar el banner')
      }
      toast.success('Banner eliminado exitosamente')
      await fetchBanners()
    } catch (error) {
      toast.error(error.message || 'Error al eliminar banner')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Banners</CardTitle>
          <CardDescription>
            Crea banners para la landing pública. Los banners nuevos aparecerán desde la cuarta posición, después de los tres banners fijos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="banner-title">Título del banner</Label>
              <Textarea
                id="banner-title"
                rows={3}
                value={formData.title}
                onChange={(event) => setFormData(prev => ({ ...prev, title: event.target.value }))}
                placeholder="Escribe el título del banner"
              />
              <p className="text-xs text-gray-500">
                Se mostrará en negro, en negrita, y respetará saltos de línea si los agregas.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-body">Texto del banner</Label>
              <Textarea
                id="banner-body"
                rows={4}
                value={formData.body}
                onChange={(event) => setFormData(prev => ({ ...prev, body: event.target.value }))}
                placeholder="Escribe el texto descriptivo del banner"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-image">Imagen del banner</Label>
              <Input
                id="banner-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500">
                La imagen debe medir exactamente {REQUIRED_WIDTH} x {REQUIRED_HEIGHT}px.
              </p>
              {imageName && !imageError && (
                <p className="text-sm text-green-700 font-medium">{imageName}</p>
              )}
              {imageError && (
                <p className="text-sm text-red-600">{imageError}</p>
              )}
            </div>

            {imageDataUrl && (
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="mb-3 text-sm font-medium text-gray-700">Vista previa</p>
                <img
                  src={imageDataUrl}
                  alt="Vista previa del banner"
                  className="w-full rounded-md border"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Crear banner'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banners creados</CardTitle>
          <CardDescription>{bannerCountText}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Cargando banners...</p>
          ) : banners.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-gray-500">
              Aún no hay banners personalizados creados.
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.id} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="lg:w-72 shrink-0">
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-full rounded-md border"
                        />
                      ) : (
                        <div className="flex h-32 items-center justify-center rounded-md border bg-gray-50 text-sm text-gray-500">
                          Sin vista previa
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="whitespace-pre-line text-xl font-bold text-gray-900">
                        {banner.title}
                      </h3>
                      <p className="whitespace-pre-line text-sm text-gray-700">
                        {banner.body}
                      </p>
                      <p className="text-xs text-gray-500">
                        Creado el {new Date(banner.created_at).toLocaleString('es-CO')}
                      </p>
                    </div>

                    <div className="flex items-start justify-end">
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(banner)}
                        disabled={deletingId === banner.id}
                      >
                        {deletingId === banner.id ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BannerManagement
