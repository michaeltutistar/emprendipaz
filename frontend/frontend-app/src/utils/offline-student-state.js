const MODULE_ORDER = [
  'Proyecto de vida',
  'Descubrimiento de Oportunidades',
  'Modelo de Negocios',
  'Marketing y Comercialización',
  'Marketing Digital',
  'Atención al Cliente',
  'Trabajo en Equipo',
  'Finanzas',
  'Plan de Inversión',
  'Liderazgo'
];

const MODULE_ALIASES = {
  'proyecto de vida': 'Proyecto de vida',
  'descubrimiento de oportunidades': 'Descubrimiento de Oportunidades',
  'modelo de negocios': 'Modelo de Negocios',
  'marketing y comercializacion': 'Marketing y Comercialización',
  'marketing digital': 'Marketing Digital',
  'atencion al cliente': 'Atención al Cliente',
  'atencion al cliente y resolucion de conflictos': 'Atención al Cliente',
  'trabajo en equipo': 'Trabajo en Equipo',
  'finanzas': 'Finanzas',
  'finanzas y gestion empresarial': 'Finanzas',
  'plan de inversion': 'Plan de Inversión',
  'liderazgo': 'Liderazgo'
};

export function normalizeText(value) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function canonicalModuleName(name) {
  const normalized = normalizeText(name);
  return MODULE_ALIASES[normalized] || (name || '').toString().trim();
}

function moduleHasPlanStep(moduleName) {
  return canonicalModuleName(moduleName) !== 'Plan de Inversión';
}

function createDefaultStep(name) {
  return {
    nombre: name,
    porcentaje: 0,
    completado: false
  };
}

function createDefaultModule(name) {
  return {
    modulo: name,
    porcentaje: 0,
    progreso_pasos: [
      createDefaultStep('Unidad 1'),
      createDefaultStep('Unidad 2'),
      createDefaultStep('Unidad 3'),
      createDefaultStep('Plan de Negocio')
    ]
  };
}

function ensureStep(moduleObj, stepName) {
  if (!Array.isArray(moduleObj.progreso_pasos)) {
    moduleObj.progreso_pasos = [];
  }

  let step = moduleObj.progreso_pasos.find(
    (item) => normalizeText(item?.nombre) === normalizeText(stepName)
  );

  if (!step) {
    step = createDefaultStep(stepName);
    moduleObj.progreso_pasos.push(step);
  }

  return step;
}

function cloneModule(moduleObj) {
  return {
    ...moduleObj,
    progreso_pasos: Array.isArray(moduleObj?.progreso_pasos)
      ? moduleObj.progreso_pasos.map((step) => ({ ...step }))
      : []
  };
}

function buildBaseModules(snapshot) {
  const snapshotModules = Array.isArray(snapshot?.modulos) ? snapshot.modulos : [];
  const byCanonicalName = new Map();

  snapshotModules.forEach((moduleObj) => {
    const canonicalName = canonicalModuleName(moduleObj?.modulo);
    if (!canonicalName) return;
    byCanonicalName.set(canonicalName, cloneModule(moduleObj));
  });

  return MODULE_ORDER.map((moduleName) => {
    const existing = byCanonicalName.get(moduleName) || createDefaultModule(moduleName);
    const moduleClone = cloneModule(existing);
    moduleClone.modulo = moduleName;
    ensureStep(moduleClone, 'Unidad 1');
    ensureStep(moduleClone, 'Unidad 2');
    ensureStep(moduleClone, 'Unidad 3');
    ensureStep(moduleClone, 'Plan de Negocio');
    return moduleClone;
  });
}

function getUnitNumberFromItem(item) {
  const pasoNombre = normalizeText(item?.paso_nombre);
  const unidadNombre = normalizeText(item?.unidad_nombre);
  const joined = `${pasoNombre} ${unidadNombre}`.trim();
  const match = joined.match(/unidad\s+(\d)/i);
  return match ? Number(match[1]) : null;
}

function isPlanStep(item) {
  return normalizeText(item?.paso_nombre) === 'plan de negocio';
}

function markQueuedProgress(moduleObj, items = [], evaluationItems = []) {
  const requiresPlanStep = moduleHasPlanStep(moduleObj?.modulo);
  const units = {
    1: { steps: new Set(), completed: false },
    2: { steps: new Set(), completed: false },
    3: { steps: new Set(), completed: false }
  };
  let planCompleted = false;

  items.forEach((item) => {
    if (isPlanStep(item)) {
      planCompleted = true;
      return;
    }

    const unitNumber = getUnitNumberFromItem(item);
    if (!unitNumber || !units[unitNumber]) return;

    const stepKey = normalizeText(item?.paso_nombre) || `unidad-${unitNumber}`;
    units[unitNumber].steps.add(stepKey);
    if (/evaluacion/i.test(normalizeText(item?.paso_nombre))) {
      units[unitNumber].completed = true;
    }
  });

  evaluationItems.forEach((item) => {
    const unitNumber = getUnitNumberFromItem(item);
    if (!unitNumber || !units[unitNumber]) return;

    units[unitNumber].steps.add(`evaluacion:${normalizeText(item?.paso_nombre)}`);
    if (item?.todas_correctas === true) {
      units[unitNumber].completed = true;
    }
  });

  [1, 2, 3].forEach((unitNumber) => {
    const step = ensureStep(moduleObj, `Unidad ${unitNumber}`);
    const currentPct = Number(step?.porcentaje || 0);
    const queuedStepCount = units[unitNumber].steps.size;
    const inferredPct = queuedStepCount > 0
      ? Math.min(100, Math.max(25, Math.round((queuedStepCount / 4) * 100)))
      : 0;

    if (units[unitNumber].completed) {
      step.porcentaje = 100;
      step.completado = true;
    } else if (queuedStepCount > 0) {
      step.porcentaje = Math.max(currentPct, inferredPct);
    }
  });

  const planStep = ensureStep(moduleObj, 'Plan de Negocio');
  if (planCompleted) {
    planStep.porcentaje = 100;
    planStep.completado = true;
  }

  const stepU1 = ensureStep(moduleObj, 'Unidad 1');
  const stepU2 = ensureStep(moduleObj, 'Unidad 2');
  const stepU3 = ensureStep(moduleObj, 'Unidad 3');
  const moduleProgress = [
    Number(stepU1?.porcentaje || 0) >= 100 ? 100 : 0,
    Number(stepU2?.porcentaje || 0) >= 100 ? 100 : 0,
    Number(stepU3?.porcentaje || 0) >= 100 ? 100 : 0
  ];

  if (requiresPlanStep) {
    moduleProgress.push(Number(planStep?.porcentaje || 0) >= 100 ? 100 : 0);
  }

  moduleObj.porcentaje = Math.max(
    Number(moduleObj?.porcentaje || 0),
    Math.round(moduleProgress.reduce((acc, value) => acc + value, 0) / moduleProgress.length)
  );
}

export function buildOfflineMiProgreso(snapshot, progressItems = [], evaluationItems = []) {
  const modules = buildBaseModules(snapshot);
  const progressByModule = new Map();
  const evaluationsByModule = new Map();

  progressItems.forEach((item) => {
    const canonicalName = canonicalModuleName(item?.modulo_nombre);
    if (!canonicalName) return;
    if (!progressByModule.has(canonicalName)) progressByModule.set(canonicalName, []);
    progressByModule.get(canonicalName).push(item);
  });

  evaluationItems.forEach((item) => {
    const canonicalName = canonicalModuleName(item?.modulo_nombre);
    if (!canonicalName) return;
    if (!evaluationsByModule.has(canonicalName)) evaluationsByModule.set(canonicalName, []);
    evaluationsByModule.get(canonicalName).push(item);
  });

  modules.forEach((moduleObj) => {
    const canonicalName = canonicalModuleName(moduleObj?.modulo);
    markQueuedProgress(
      moduleObj,
      progressByModule.get(canonicalName) || [],
      evaluationsByModule.get(canonicalName) || []
    );
  });

  return {
    success: snapshot?.success ?? true,
    ...(snapshot && typeof snapshot === 'object' ? snapshot : {}),
    modulos: modules
  };
}

function getUnitCompleted(moduleObj, unitNumber) {
  const step = Array.isArray(moduleObj?.progreso_pasos)
    ? moduleObj.progreso_pasos.find((item) => normalizeText(item?.nombre) === normalizeText(`Unidad ${unitNumber}`))
    : null;
  const pct = Number(step?.porcentaje || 0);
  return step?.completado === true || pct >= 100;
}

function findExistingModuleKey(modulesMap, canonicalName) {
  const keys = Object.keys(modulesMap || {});
  return keys.find((key) => canonicalModuleName(key) === canonicalName) || canonicalName;
}

export function buildOfflineModulosDisponibles(snapshot, miProgreso) {
  const base = {
    success: snapshot?.success ?? true,
    ...(snapshot && typeof snapshot === 'object' ? snapshot : {}),
    modulos: { ...(snapshot?.modulos || {}) }
  };

  const modules = Array.isArray(miProgreso?.modulos) ? miProgreso.modulos : buildBaseModules(null);
  const completionByModule = new Map();

  MODULE_ORDER.forEach((moduleName) => {
    const moduleObj = modules.find((item) => canonicalModuleName(item?.modulo) === moduleName);
    const requiresPlanStep = moduleHasPlanStep(moduleName);
    const unit1Completed = getUnitCompleted(moduleObj, 1);
    const unit2Completed = getUnitCompleted(moduleObj, 2);
    const unit3Completed = getUnitCompleted(moduleObj, 3);
    const planStep = Array.isArray(moduleObj?.progreso_pasos)
      ? moduleObj.progreso_pasos.find((item) => normalizeText(item?.nombre) === normalizeText('Plan de Negocio'))
      : null;
    const planCompleted = planStep?.completado === true || Number(planStep?.porcentaje || 0) >= 100;
    const pct = Number(moduleObj?.porcentaje || 0);

    completionByModule.set(
      moduleName,
      pct >= 100 || (
        unit1Completed &&
        unit2Completed &&
        unit3Completed &&
        (!requiresPlanStep || planCompleted)
      )
    );
  });

  MODULE_ORDER.forEach((moduleName, index) => {
    const moduleObj = modules.find((item) => canonicalModuleName(item?.modulo) === moduleName);
    const moduleKey = findExistingModuleKey(base.modulos, moduleName);
    const previousModule = MODULE_ORDER[index - 1];
    const moduleAvailable = index === 0 || completionByModule.get(previousModule) === true;

    base.modulos[moduleKey] = {
      ...(base.modulos[moduleKey] || {}),
      disponible: moduleAvailable,
      unidades: {
        ...((base.modulos[moduleKey] && base.modulos[moduleKey].unidades) || {}),
        1: moduleAvailable,
        2: moduleAvailable && getUnitCompleted(moduleObj, 1),
        3: moduleAvailable && getUnitCompleted(moduleObj, 2)
      }
    };
  });

  return base;
}

export function getModuleProgressSummary(miProgreso, moduleName) {
  const canonicalName = canonicalModuleName(moduleName);
  const modules = Array.isArray(miProgreso?.modulos) ? miProgreso.modulos : [];
  const moduleObj = modules.find((item) => canonicalModuleName(item?.modulo) === canonicalName);

  const getStep = (unitNumber) => {
    const step = Array.isArray(moduleObj?.progreso_pasos)
      ? moduleObj.progreso_pasos.find((item) => normalizeText(item?.nombre) === normalizeText(`Unidad ${unitNumber}`))
      : null;
    const pct = Number(step?.porcentaje || 0);
    return {
      porcentaje: Math.max(0, Math.min(100, Math.round(pct))),
      completada: step?.completado === true || pct >= 100
    };
  };

  const unidad1 = getStep(1);
  const unidad2 = getStep(2);
  const unidad3 = getStep(3);

  return {
    unidad1Completada: unidad1.completada,
    unidad2Completada: unidad2.completada,
    unidad3Completada: unidad3.completada,
    progresoUnidad1: unidad1.porcentaje,
    progresoUnidad2: unidad2.porcentaje,
    progresoUnidad3: unidad3.porcentaje
  };
}

export { MODULE_ORDER };
