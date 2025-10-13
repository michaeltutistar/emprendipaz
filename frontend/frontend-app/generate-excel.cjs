const XLSX = require('xlsx');

// Definir los campos del formulario de inscripción
const camposFormulario = [
  // PASO 1: Información básica
  { campo: 'ID', descripcion: 'Identificador único del usuario', obligatorio: 'Sí', paso: 1 },
  { campo: 'Nombre', descripcion: 'Nombre completo del emprendedor', obligatorio: 'Sí', paso: 1 },
  { campo: 'Apellido', descripcion: 'Apellido completo del emprendedor', obligatorio: 'Sí', paso: 1 },
  { campo: 'Email', descripcion: 'Correo electrónico de contacto', obligatorio: 'Sí', paso: 1 },
  { campo: 'Municipio', descripcion: 'Municipio de residencia', obligatorio: 'Sí', paso: 1 },
  { campo: 'Tipo Documento', descripcion: 'CC, CE, TI, etc.', obligatorio: 'Sí', paso: 1 },
  { campo: 'Número Documento', descripcion: 'Número de identificación', obligatorio: 'Sí', paso: 1 },
  { campo: 'Tipo Persona', descripcion: 'Natural o Jurídica', obligatorio: 'Sí', paso: 1 },
  { campo: 'Emprendimiento', descripcion: 'Nombre del emprendimiento', obligatorio: 'Sí', paso: 1 },
  { campo: 'Sector', descripcion: 'Agroindustria, Industria/Comercio, Turismo/Servicios', obligatorio: 'Sí', paso: 1 },
  { campo: 'Estado Cuenta', descripcion: 'Estado de la cuenta del usuario', obligatorio: 'Sí', paso: 1 },
  { campo: 'Fecha Creación', descripcion: 'Fecha de registro en el sistema', obligatorio: 'Sí', paso: 1 },
  
  // PASO 2: Documentación obligatoria
  { campo: 'TDR', descripcion: 'Términos de Referencia firmados', obligatorio: 'Sí', paso: 2 },
  { campo: 'Uso Imagen', descripcion: 'Autorización uso de imagen', obligatorio: 'Sí', paso: 2 },
  { campo: 'Plan Negocio', descripcion: 'Plan de negocio en Excel', obligatorio: 'Sí', paso: 2 },
  { campo: 'Vecindad', descripcion: 'Certificado de vecindad', obligatorio: 'Sí', paso: 2 },
  { campo: 'Video', descripcion: 'Video de presentación del emprendimiento', obligatorio: 'No', paso: 2 },
  
  // PASO 3: Documentación según tipo de persona
  { campo: 'RUT', descripcion: 'Registro Único Tributario', obligatorio: 'Sí', paso: 3 },
  { campo: 'Cédula', descripcion: 'Cédula de ciudadanía (Persona Natural)', obligatorio: 'Condicional', paso: 3 },
  { campo: 'Cédula Representante', descripcion: 'Cédula del representante legal (Persona Jurídica)', obligatorio: 'Condicional', paso: 3 },
  { campo: 'Cert. Existencia', descripcion: 'Certificado de existencia (Persona Jurídica)', obligatorio: 'Condicional', paso: 3 },
  
  // PASO 4: Documentación diferencial (subsanable)
  { campo: 'RUV', descripcion: 'Registro Único de Víctimas', obligatorio: 'No', paso: 4 },
  { campo: 'SISBEN', descripcion: 'Certificado SISBEN', obligatorio: 'No', paso: 4 },
  { campo: 'Grupo Étnico', descripcion: 'Certificado de pertenencia a grupo étnico', obligatorio: 'No', paso: 4 },
  { campo: 'ARN', descripcion: 'Autorización de Recolección de Datos', obligatorio: 'No', paso: 4 },
  { campo: 'Discapacidad', descripcion: 'Certificado de discapacidad', obligatorio: 'No', paso: 4 },
  
  // PASO 5: Documentación de control (obligatoria)
  { campo: 'Fiscales', descripcion: 'Antecedentes fiscales', obligatorio: 'Sí', paso: 5 },
  { campo: 'Disciplinarios', descripcion: 'Antecedentes disciplinarios', obligatorio: 'Sí', paso: 5 },
  { campo: 'Judiciales', descripcion: 'Antecedentes judiciales', obligatorio: 'Sí', paso: 5 },
  { campo: 'REDAM', descripcion: 'Registro de Deudores Alimentarios', obligatorio: 'Sí', paso: 5 },
  { campo: 'Inhab. Sexuales', descripcion: 'Inhabilidades por delitos sexuales', obligatorio: 'Sí', paso: 5 },
  { campo: 'Capacidad Legal', descripcion: 'Declaración de capacidad legal', obligatorio: 'Sí', paso: 5 },
  { campo: 'Estado Control', descripcion: 'Estado del proceso de control', obligatorio: 'Sí', paso: 5 },
  { campo: 'Resultado Certificados', descripcion: 'Resultado de los certificados', obligatorio: 'Sí', paso: 5 },
  
  // PASO 6: Certificación de funcionamiento
  { campo: 'Formalizado', descripcion: 'Emprendimiento formalizado (Sí/No)', obligatorio: 'Sí', paso: 6 },
  { campo: 'Matrícula Mercantil', descripcion: 'Matrícula mercantil (si está formalizado)', obligatorio: 'Condicional', paso: 6 },
  { campo: 'Facturas 6M', descripcion: 'Facturas de los últimos 6 meses', obligatorio: 'Condicional', paso: 6 },
  { campo: 'Publicaciones Redes', descripcion: 'Publicaciones en redes sociales (si es informal)', obligatorio: 'Condicional', paso: 6 },
  { campo: 'Registro Ventas', descripcion: 'Registro de ventas (si es informal)', obligatorio: 'Condicional', paso: 6 },
  
  // PASO 7: Financiación de otras fuentes
  { campo: 'Financiado Estado', descripcion: 'Ha sido financiado por el estado (Sí/No)', obligatorio: 'Sí', paso: 7 },
  { campo: 'Regalías', descripcion: 'Financiado por regalías', obligatorio: 'No', paso: 7 },
  { campo: 'Cámara Comercio', descripcion: 'Financiado por cámara de comercio', obligatorio: 'No', paso: 7 },
  { campo: 'Incubadoras', descripcion: 'Financiado por incubadoras', obligatorio: 'No', paso: 7 },
  { campo: 'Otro Financ.', descripcion: 'Otra fuente de financiación', obligatorio: 'No', paso: 7 },
  
  // PASO 8: Declaraciones y aceptaciones
  { campo: 'Declara Veraz', descripcion: 'Declaración de veracidad', obligatorio: 'Sí', paso: 8 },
  { campo: 'Declara No Beneficiario', descripcion: 'Declaración de no beneficiario', obligatorio: 'Sí', paso: 8 },
  { campo: 'Acepta Términos', descripcion: 'Aceptación de términos y condiciones', obligatorio: 'Sí', paso: 8 },
  
  // Estado del proceso
  { campo: 'Paso Actual', descripcion: 'Paso actual del formulario (1-8)', obligatorio: 'Sí', paso: 'Sistema' },
  { campo: 'Formulario Enviado', descripcion: 'Formulario completado y enviado', obligatorio: 'Sí', paso: 'Sistema' },
  { campo: 'Estado Inscripción', descripcion: 'Estado de la inscripción', obligatorio: 'Sí', paso: 'Sistema' },
  
  // Datos de cursos
  { campo: 'Cursos Asignados', descripcion: 'Número de cursos asignados', obligatorio: 'No', paso: 'Cursos' },
  { campo: 'Cursos Completados', descripcion: 'Número de cursos completados', obligatorio: 'No', paso: 'Cursos' },
  { campo: 'Avance Cursos (%)', descripcion: 'Porcentaje de avance en cursos', obligatorio: 'No', paso: 'Cursos' },
  { campo: 'Fase Actual', descripcion: 'Fase actual del programa', obligatorio: 'No', paso: 'Cursos' },
  
  // Evidencias
  { campo: 'Evidencias Estado', descripcion: 'Estado de las evidencias', obligatorio: 'No', paso: 'Evidencias' },
  { campo: 'Tipo Emprendimiento', descripcion: 'Clasificación del emprendimiento', obligatorio: 'No', paso: 'Evidencias' }
];

// Crear workbook
const wb = XLSX.utils.book_new();

// Hoja 1: Campos del formulario
const ws1 = XLSX.utils.json_to_sheet(camposFormulario);
XLSX.utils.book_append_sheet(wb, ws1, "Campos Formulario");

// Hoja 2: Plantilla para datos
const headers = camposFormulario.map(campo => campo.campo);
const templateData = [headers]; // Solo encabezados
const ws2 = XLSX.utils.aoa_to_sheet(templateData);
XLSX.utils.book_append_sheet(wb, ws2, "Plantilla Datos");

// Hoja 3: Instrucciones
const instrucciones = [
  ['INSTRUCCIONES PARA USO DE LA PLANTILLA'],
  [''],
  ['1. Hoja "Campos Formulario": Contiene la descripción de todos los campos'],
  ['2. Hoja "Plantilla Datos": Use esta hoja para ingresar los datos de los usuarios'],
  ['3. Campos Obligatorios: Deben completarse obligatoriamente'],
  ['4. Campos Condicionales: Se requieren según el tipo de persona o emprendimiento'],
  ['5. Campos Opcionales: Pueden dejarse en blanco'],
  [''],
  ['PASOS DEL FORMULARIO:'],
  ['Paso 1: Información básica del emprendedor'],
  ['Paso 2: Documentación obligatoria'],
  ['Paso 3: Documentación según tipo de persona'],
  ['Paso 4: Documentación diferencial (subsanable)'],
  ['Paso 5: Documentación de control'],
  ['Paso 6: Certificación de funcionamiento'],
  ['Paso 7: Financiación de otras fuentes'],
  ['Paso 8: Declaraciones y aceptaciones'],
  [''],
  ['NOTAS IMPORTANTES:'],
  ['- Los campos marcados como "Sí" son obligatorios'],
  ['- Los campos "Condicional" dependen de otros datos'],
  ['- Los campos "No" son opcionales'],
  ['- Use formato de fecha: YYYY-MM-DD'],
  ['- Para campos booleanos use: Sí/No o True/False'],
  [''],
  ['ESTADOS DE DOCUMENTOS:'],
  ['- ✔️ = Documento entregado y aprobado'],
  ['- ❌ = Documento faltante o rechazado'],
  ['- ⚠️ = Documento pendiente de revisión'],
  ['- ⏳ = Documento en proceso'],
  [''],
  ['SECTORES ECONÓMICOS:'],
  ['- agroindustria: Sector agroindustrial'],
  ['- industria_comercio: Industria y comercio'],
  ['- turismo_servicios: Turismo y servicios'],
  [''],
  ['TIPOS DE PERSONA:'],
  ['- natural: Persona natural'],
  ['- juridica: Persona jurídica'],
  [''],
  ['ESTADOS DE INSCRIPCIÓN:'],
  ['- en_progreso: Formulario en proceso de llenado'],
  ['- completada: Formulario completado'],
  ['- enviada: Formulario enviado para revisión'],
  ['- rechazada: Formulario rechazado'],
  ['- aprobada: Formulario aprobado']
];

const ws3 = XLSX.utils.aoa_to_sheet(instrucciones);
XLSX.utils.book_append_sheet(wb, ws3, "Instrucciones");

// Generar archivo
const fileName = `public/Plantilla_Formulario_EmprendiPaz_${new Date().toISOString().split('T')[0]}.xlsx`;
XLSX.writeFile(wb, fileName);

console.log(`✅ Archivo Excel generado exitosamente: ${fileName}`);
console.log(`📊 Contiene ${camposFormulario.length} campos del formulario`);
console.log(`📋 3 hojas: Campos, Plantilla e Instrucciones`);
console.log(`🌐 Disponible en: https://emprendimiento-narino.com/Plantilla_Formulario_EmprendiPaz_${new Date().toISOString().split('T')[0]}.xlsx`);
