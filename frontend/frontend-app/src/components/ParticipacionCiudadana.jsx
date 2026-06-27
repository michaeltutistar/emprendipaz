import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, ArrowLeft } from 'lucide-react'
import emailjs from '@emailjs/browser'

const ParticipacionCiudadana = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    celular: '',
    correo: '',
    municipio: '',
    duda: ''
  })

  const [isSending, setIsSending] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSending) return
    try {
      setIsSending(true)
      emailjs.init('L-mZkum1V3UydsMN0')
      await emailjs.send('service_8383n0g', 'template_j0f8bn4', {
        from_name: formData.nombre,
        from_email: formData.correo,
        cedula: formData.cedula,
        celular: formData.celular,
        municipio: formData.municipio,
        message: formData.duda,
        to_email: 'consorcioprimeronarino@gmail.com',
        reply_to: formData.correo
      })
      alert('¡Gracias por tu consulta! Tu mensaje ha sido enviado correctamente.')
      setFormData({
        nombre: '',
        cedula: '',
        celular: '',
        correo: '',
        municipio: '',
        duda: ''
      })
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      alert('Hubo un error al enviar tu consulta. Por favor, inténtalo nuevamente.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center py-4 space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4 flex-wrap justify-center lg:justify-start">
              <img src="/emprendipaz.png" alt="Emprendipaz" className="h-10 sm:h-12" />
              <img src="/logo-gobernacion.png" alt="Gobernación de Nariño" className="h-10 sm:h-12" />
              <img src="/fundacion.png" alt="Fundación" className="h-10 sm:h-12" />
              <img src="/consorcio.png" alt="Consorcio" className="h-10 sm:h-12" />
            </div>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-yellow-400 via-yellow-300 to-green-500 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-black">
          <h1 className="text-4xl md:text-5xl font-bold">Contáctanos</h1>
          <p className="mt-4 text-lg text-white/90">
            Cuéntanos tus dudas o comentarios sobre el programa Emprendipaz. Nuestro equipo responderá a la brevedad.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 md:p-10">
          <div className="text-center mb-8">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg flex items-center gap-2 mx-auto"
              disabled
            >
              <Mail className="h-5 w-5" />
              ¿Tienes dudas? Escríbenos
            </Button>
            <p className="mt-4 text-neutral-600">
              Completa el formulario y nos pondremos en contacto contigo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre completo *
                </label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu nombre completo"
                />
              </div>
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-neutral-700 mb-1">
                  Cédula *
                </label>
                <Input
                  id="cedula"
                  name="cedula"
                  type="text"
                  required
                  value={formData.cedula}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu número de cédula"
                />
              </div>
              <div>
                <label htmlFor="celular" className="block text-sm font-medium text-neutral-700 mb-1">
                  Celular *
                </label>
                <Input
                  id="celular"
                  name="celular"
                  type="tel"
                  required
                  value={formData.celular}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu número de celular"
                />
              </div>
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-neutral-700 mb-1">
                  Correo electrónico *
                </label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  required
                  value={formData.correo}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu correo electrónico"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="municipio" className="block text-sm font-medium text-neutral-700 mb-1">
                  Municipio *
                </label>
                <Input
                  id="municipio"
                  name="municipio"
                  type="text"
                  required
                  value={formData.municipio}
                  onChange={handleInputChange}
                  placeholder="Ingresa tu municipio"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="duda" className="block text-sm font-medium text-neutral-700 mb-1">
                  Tu duda o consulta *
                </label>
                <textarea
                  id="duda"
                  name="duda"
                  required
                  rows={5}
                  value={formData.duda}
                  onChange={handleInputChange}
                  placeholder="Describe tu duda o consulta aquí..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                disabled={isSending}
              >
                {isSending ? 'Enviando...' : 'Enviar Consulta'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ParticipacionCiudadana



