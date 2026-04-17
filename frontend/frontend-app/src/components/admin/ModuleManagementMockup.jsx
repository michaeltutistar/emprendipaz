import React from 'react'
import { Bold, BookOpen, CheckCircle2, Clock, FileText, ImagePlus, Link2, Plus, Sparkles, Type, Video } from 'lucide-react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

const unidadesMock = [
  {
    id: 1,
    nombre: 'Unidad 1',
    descripcion: 'Introduce el propósito de la unidad, los objetivos de aprendizaje y la experiencia general del estudiante.',
  },
  {
    id: 2,
    nombre: 'Unidad 2',
    descripcion: 'Continúa el desarrollo temático con recursos prácticos, actividades y evaluación de progreso.',
  },
]

function UploadPlaceholder({ icon: Icon, title, description, buttonLabel }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <Icon className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
          <Button type="button" variant="outline" className="bg-white">
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

function EditorToolbarButton({ icon: Icon, label }) {
  return (
    <Button type="button" variant="outline" size="sm" className="h-8 bg-white text-gray-700">
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  )
}

function FieldBlock({ label, children, hint }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
    </div>
  )
}

function RichTextEditorPlaceholder() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
        <EditorToolbarButton icon={ImagePlus} label="Imagen" />
        <EditorToolbarButton icon={Link2} label="Link" />
        <EditorToolbarButton icon={Bold} label="Bold" />
        <Button type="button" variant="outline" size="sm" className="h-8 bg-white text-gray-700">
          <Type className="h-4 w-4" />
          Tamaño de fuente
        </Button>
      </div>
      <Textarea
        rows={9}
        className="min-h-[240px] resize-none rounded-none border-0 shadow-none focus-visible:ring-0"
        placeholder="Escribe la fundamentación de la unidad, inserta referencias visuales y enlaces de apoyo para el estudiante."
      />
    </div>
  )
}

function QuestionBuilder({ title, description }) {
  const answers = [
    'Respuesta A',
    'Respuesta B',
    'Respuesta C',
    'Respuesta D',
  ]

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="bg-white">
          <Plus className="h-4 w-4" />
          Agregar pregunta
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <FieldBlock label="Pregunta">
          <Textarea
            rows={3}
            placeholder="Escribe la pregunta principal y las instrucciones para el estudiante."
          />
        </FieldBlock>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Respuestas</Label>
            <p className="text-xs text-gray-500">Marca la opción correcta</p>
          </div>

          {answers.map((answer, index) => (
            <div key={answer} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <input
                type="radio"
                name={`${title}-correct-answer`}
                checked={index === 0}
                readOnly
                className="h-4 w-4 accent-green-600"
              />
              <Input defaultValue={answer} className="bg-white" />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="bg-white">
            <Plus className="h-4 w-4" />
            Agregar respuesta
          </Button>
          <Button type="button" variant="ghost" className="text-gray-600">
            <CheckCircle2 className="h-4 w-4" />
            Guardar pregunta
          </Button>
        </div>
      </div>
    </div>
  )
}

const ModuleManagementMockup = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Gestión de módulos</h2>
          <p className="max-w-3xl text-sm text-gray-600">
            Administra la configuración base del módulo, sus recursos de apertura y la estructura pedagógica de cada unidad.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="bg-white">
            Vista previa de módulo
          </Button>
          <Button type="button" className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Crear nuevo módulo
          </Button>
        </div>
      </div>

      <Card className="border-green-100 bg-gradient-to-r from-white to-green-50/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            Constructor de módulo
          </CardTitle>
          <CardDescription>
            Estructura sugerida para registrar la identidad, contenidos base y recursos del módulo antes de publicarlo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-700" />
              <h3 className="text-base font-semibold text-gray-900">Información general</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="Nombre de módulo">
                <Input placeholder="Ej. Gestión Comercial para Emprendimientos Locales" />
              </FieldBlock>
              <FieldBlock label="Duración del módulo en horas">
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input className="pl-9" placeholder="Ej. 8 horas" />
                </div>
              </FieldBlock>
            </div>

            <FieldBlock
              label="Descripción del módulo"
              hint="Resumen general del enfoque, propósito formativo y resultado esperado para el estudiante."
            >
              <Textarea
                rows={5}
                placeholder="Describe el contenido del módulo, la transformación esperada y el tipo de actividades que tendrá."
              />
            </FieldBlock>

            <UploadPlaceholder
              icon={ImagePlus}
              title="Imagen de presentación"
              description="Área para cargar la pieza principal que se vería como portada del módulo dentro del flujo del estudiante."
              buttonLabel="Seleccionar imagen"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-700" />
              <h3 className="text-base font-semibold text-gray-900">Recursos de apertura del módulo</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <UploadPlaceholder
                icon={Video}
                title="Video de presentación"
                description="Video inicial para introducir el módulo y orientar la navegación."
                buttonLabel="Cargar video"
              />
              <UploadPlaceholder
                icon={BookOpen}
                title="Glosario"
                description="Recurso de apoyo con términos clave que se mostrarían al estudiante."
                buttonLabel="Agregar glosario"
              />
              <UploadPlaceholder
                icon={FileText}
                title="Bibliografía"
                description="Listado de referencias, lecturas complementarias y materiales de consulta."
                buttonLabel="Agregar bibliografía"
              />
              <UploadPlaceholder
                icon={Video}
                title="Video experto"
                description="Espacio para un video de profundización o acompañamiento experto."
                buttonLabel="Cargar video experto"
              />
            </div>
          </section>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Constructor de unidades</CardTitle>
            <CardDescription>
              Cada unidad replica la estructura esperada para el estudiante: presentación, fundamentación, taller y evaluación.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" className="bg-white">
            <Plus className="mr-2 h-4 w-4" />
            Agregar unidad
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {unidadesMock.map((unidad) => (
            <div key={unidad.id} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{unidad.nombre}</p>
                  <p className="text-xs text-gray-600">{unidad.descripcion}</p>
                </div>
                <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                  Configuración inicial
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FieldBlock label="Nombre de la unidad">
                  <Input placeholder={`Ej. ${unidad.nombre}: introducción al tema`} />
                </FieldBlock>
                <FieldBlock label="Video de presentación">
                  <Input placeholder="URL del video o recurso de apertura" />
                </FieldBlock>
              </div>

              <div className="mt-4 grid gap-4">
                <FieldBlock label="Descripción de la unidad">
                  <Textarea
                    rows={3}
                    placeholder="Resumen de lo que aprenderá el estudiante en esta unidad."
                  />
                </FieldBlock>

                <div className="grid gap-4 xl:grid-cols-2">
                  <FieldBlock label="Fundamentación">
                    <RichTextEditorPlaceholder />
                  </FieldBlock>
                  <FieldBlock label="Taller">
                    <QuestionBuilder
                      title="Banco de preguntas del taller"
                      description="Configura preguntas prácticas y define cuál es la respuesta correcta."
                    />
                  </FieldBlock>
                </div>

                <FieldBlock label="Evaluación">
                  <QuestionBuilder
                    title="Banco de preguntas de evaluación"
                    description="Prepara la evaluación final de la unidad con preguntas y respuestas configurables."
                  />
                </FieldBlock>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="bg-white">
          Cancelar
        </Button>
        <Button
          type="button"
          disabled
          className="bg-gray-300 text-gray-600 hover:bg-gray-300"
        >
          Publicar módulo
        </Button>
      </div>
    </div>
  )
}

export default ModuleManagementMockup
