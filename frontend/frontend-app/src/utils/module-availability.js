import API_BASE_URL from '@/config/api';
import { getAuthToken } from '@/utils/auth-storage';
import { canonicalModuleName } from '@/utils/offline-student-state';

function toBooleanMap(unidades = {}) {
  return {
    1: unidades['1'] === true || unidades[1] === true,
    2: unidades['2'] === true || unidades[2] === true,
    3: unidades['3'] === true || unidades[3] === true
  };
}

export function buildModuleAvailabilityFallback({
  moduleAvailable = true,
  unidad1Completada = false,
  unidad2Completada = false
} = {}) {
  return {
    moduloDisponible: moduleAvailable,
    unidadesDisponibles: {
      1: moduleAvailable,
      2: moduleAvailable && unidad1Completada,
      3: moduleAvailable && unidad2Completada
    },
    unidadesCargadas: true
  };
}

export async function fetchModuleAvailability(moduleName) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/student/modulos-disponibles`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!data?.success || !data?.modulos || typeof data.modulos !== 'object') {
    return null;
  }

  const targetCanonicalName = canonicalModuleName(moduleName);
  const moduleKey = Object.keys(data.modulos).find(
    (key) => canonicalModuleName(key) === targetCanonicalName
  );

  if (!moduleKey || !data.modulos[moduleKey]) return null;

  const moduloInfo = data.modulos[moduleKey];

  return {
    moduloDisponible: moduloInfo.disponible === true,
    unidadesDisponibles: toBooleanMap(moduloInfo.unidades || {}),
    unidadesCargadas: true
  };
}
