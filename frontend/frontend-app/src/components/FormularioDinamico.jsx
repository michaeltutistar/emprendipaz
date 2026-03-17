import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Upload, Check, AlertCircle } from 'lucide-react';
import API_BASE_URL from '@/config/api'
const FormularioDinamico = ({ onSubmit, initialData = {} }) => {
  const [campos, setCampos] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFormularioConfig();
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  const loadFormularioConfig = async () => {
    try {
      const [camposRes, documentosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/config/formulario-campos`),
        fetch(`${API_BASE_URL}/config/documentos-config`)
      ]);

      if (camposRes.ok) {
        const camposData = await camposRes.json();
        setCampos(camposData.sort((a, b) => a.orden - b.orden));
        
        // Inicializar formData con valores por defecto
        const initialFormData = {};
        camposData.forEach(campo => {
          if (campo.tipo_campo === 'checkbox') {
            initialFormData[campo.nombre_campo] = false;
          } else if (campo.tipo_campo === 'select' && campo.opciones) {
            const opciones = typeof campo.opciones === 'string' ? JSON.parse(campo.opciones) : campo.opciones;
            initialFormData[campo.nombre_campo] = '';
          } else {
            initialFormData[campo.nombre_campo] = '';
          }
        });
        setFormData(prev => ({ ...initialFormData, ...prev }));
      }

      if (documentosRes.ok) {
        const documentosData = await documentosRes.json();
        setDocumentos(documentosData.sort((a, b) => a.orden - b.orden));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading form config:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Limpiar error si existe
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const handleFileChange = (fieldName, file) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));

    // Limpiar error si existe
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const validateField = (campo) => {
    const value = formData[campo.nombre_campo];
    const fieldErrors = [];

    // Validación de campo obligatorio
    if (campo.es_obligatorio) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        fieldErrors.push(`${campo.etiqueta} es obligatorio`);
      }
    }

    // Validaciones específicas por tipo
    if (value && campo.validaciones) {
      const validaciones = typeof campo.validaciones === 'string' 
        ? JSON.parse(campo.validaciones) 
        : campo.validaciones;

      if (validaciones.minLength && value.length < validaciones.minLength) {
        fieldErrors.push(`Mínimo ${validaciones.minLength} caracteres`);
      }

      if (validaciones.maxLength && value.length > validaciones.maxLength) {
        fieldErrors.push(`Máximo ${validaciones.maxLength} caracteres`);
      }

      if (validaciones.pattern && !new RegExp(validaciones.pattern).test(value)) {
        fieldErrors.push(validaciones.patternMessage || 'Formato inválido');
      }

      if (campo.tipo_campo === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          fieldErrors.push('Email inválido');
        }
      }

      if (campo.tipo_campo === 'number' && value) {
        const numValue = parseFloat(value);
        if (validaciones.min !== undefined && numValue < validaciones.min) {
          fieldErrors.push(`Valor mínimo: ${validaciones.min}`);
        }
        if (validaciones.max !== undefined && numValue > validaciones.max) {
          fieldErrors.push(`Valor máximo: ${validaciones.max}`);
        }
      }
    }

    return fieldErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validar campos del formulario
    campos.forEach(campo => {
      const fieldErrors = validateField(campo);
      if (fieldErrors.length > 0) {
        newErrors[campo.nombre_campo] = fieldErrors;
        isValid = false;
      }
    });

    // Validar documentos
    documentos.forEach(documento => {
      const value = formData[documento.nombre_campo];
      if (documento.es_obligatorio && !value) {
        newErrors[documento.nombre_campo] = [`${documento.nombre_documento} es obligatorio`];
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (campo) => {
    const value = formData[campo.nombre_campo] || '';
    const error = errors[campo.nombre_campo];

    switch (campo.tipo_campo) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={campo.id} className="space-y-2">
            <Label htmlFor={campo.nombre_campo}>
              {campo.etiqueta}
              {campo.es_obligatorio && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={campo.nombre_campo}
              type={campo.tipo_campo}
              value={value}
              onChange={(e) => handleInputChange(campo.nombre_campo, e.target.value)}
              className={error ? 'border-red-500' : ''}
              placeholder={campo.descripcion}
            />
            {error && (
              <div className="text-red-500 text-sm">
                {error.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={campo.id} className="space-y-2">
            <Label htmlFor={campo.nombre_campo}>
              {campo.etiqueta}
              {campo.es_obligatorio && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={campo.nombre_campo}
              value={value}
              onChange={(e) => handleInputChange(campo.nombre_campo, e.target.value)}
              className={error ? 'border-red-500' : ''}
              placeholder={campo.descripcion}
              rows={3}
            />
            {error && (
              <div className="text-red-500 text-sm">
                {error.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'select':
        const opciones = campo.opciones ? 
          (typeof campo.opciones === 'string' ? JSON.parse(campo.opciones) : campo.opciones) 
          : [];
        
        return (
          <div key={campo.id} className="space-y-2">
            <Label htmlFor={campo.nombre_campo}>
              {campo.etiqueta}
              {campo.es_obligatorio && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select 
              value={value} 
              onValueChange={(newValue) => handleInputChange(campo.nombre_campo, newValue)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {opciones.map((opcion, idx) => (
                  <SelectItem key={idx} value={opcion.value || opcion}>
                    {opcion.label || opcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <div className="text-red-500 text-sm">
                {error.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={campo.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={campo.nombre_campo}
                checked={value === true}
                onCheckedChange={(checked) => handleInputChange(campo.nombre_campo, checked)}
              />
              <Label htmlFor={campo.nombre_campo}>
                {campo.etiqueta}
                {campo.es_obligatorio && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {campo.descripcion && (
              <p className="text-sm text-gray-600 ml-6">{campo.descripcion}</p>
            )}
            {error && (
              <div className="text-red-500 text-sm ml-6">
                {error.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={campo.id} className="space-y-2">
            <Label htmlFor={campo.nombre_campo}>
              {campo.etiqueta}
              {campo.es_obligatorio && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={campo.nombre_campo}
              type="date"
              value={value}
              onChange={(e) => handleInputChange(campo.nombre_campo, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <div className="text-red-500 text-sm">
                {error.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div key={campo.id} className="space-y-2">
            <Label htmlFor={campo.nombre_campo}>
              {campo.etiqueta}
              {campo.es_obligatorio && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <input
                id={campo.nombre_campo}
                type="file"
                onChange={(e) => handleFileChange(campo.nombre_campo, e.target.files[0])}
                className="hidden"
                accept={campo.validaciones?.accept || '*/*'}
              />
              <label htmlFor={campo.nombre_campo} className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {value ? value.name : 'Haz clic para subir archivo'}
                </p>
                {campo.descripcion && (
                  <p className="text-xs text-gray-500 mt-1">{campo.descripcion}</p>
                )}
              </label>
            </div>
            {error && (
              <div className="text-red-500 text-sm">
                {error.map((err, idx) => (
                  <div key={idx}>{err}</div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderDocument = (documento) => {
    const value = formData[documento.nombre_campo];
    const error = errors[documento.nombre_campo];
    const formatos = documento.formatos_permitidos ? 
      (typeof documento.formatos_permitidos === 'string' ? 
        JSON.parse(documento.formatos_permitidos) : 
        documento.formatos_permitidos) : [];

    return (
      <div key={documento.id} className="space-y-2">
        <Label htmlFor={documento.nombre_campo}>
          {documento.nombre_documento}
          {documento.es_obligatorio && <span className="text-red-500 ml-1">*</span>}
          {!documento.es_subsanable && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">
              NO SUBSANABLE
            </span>
          )}
        </Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <input
            id={documento.nombre_campo}
            type="file"
            onChange={(e) => handleFileChange(documento.nombre_campo, e.target.files[0])}
            className="hidden"
            accept={formatos.map(f => `.${f}`).join(',')}
          />
          <label htmlFor={documento.nombre_campo} className="cursor-pointer">
            <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {value ? value.name : 'Haz clic para subir documento'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Formatos: {formatos.join(', ')} | Máx: {documento.tamano_maximo_mb}MB
            </p>
            {documento.descripcion && (
              <p className="text-xs text-gray-500 mt-1">{documento.descripcion}</p>
            )}
          </label>
        </div>
        {error && (
          <div className="text-red-500 text-sm">
            {error.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Agrupar campos por sección
  const camposPorSeccion = campos.reduce((acc, campo) => {
    if (!acc[campo.seccion]) {
      acc[campo.seccion] = [];
    }
    acc[campo.seccion].push(campo);
    return acc;
  }, {});

  const secciones = {
    personal: 'Datos Personales',
    emprendimiento: 'Información del Emprendimiento',
    vulnerabilidad: 'Criterios de Vulnerabilidad',
    general: 'Información General'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando formulario...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Renderizar campos por sección */}
      {Object.entries(camposPorSeccion).map(([seccion, camposSeccion]) => (
        <Card key={seccion}>
          <CardHeader>
            <CardTitle>{secciones[seccion] || seccion}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {camposSeccion.map(renderField)}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Documentos */}
      {documentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos Requeridos</CardTitle>
            <CardDescription>
              Sube los documentos solicitados. Los documentos marcados como "NO SUBSANABLE" 
              no pueden ser corregidos después.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentos.map(renderDocument)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de envío */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enviando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Enviar Formulario
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default FormularioDinamico;
