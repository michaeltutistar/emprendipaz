import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import StudentProfile from './StudentProfile';
import StudentConfig from './StudentConfig';
import StudentDashboardBlocked from './StudentDashboardBlocked';
import StudentDashboardAccess from './StudentDashboardAccess';
import MarketingDigitalPage from './MarketingDigitalPage';
import ProgramacionModuloPage from './ProgramacionModuloPage';
import PresentacionPage from './PresentacionPage';
import DiagnosticoPresenciaDigitalPage from './DiagnosticoPresenciaDigitalPage';
import MetasMarketingDigitalPage from './MetasMarketingDigitalPage';
import EvaluacionMarketingDigitalPage from './EvaluacionMarketingDigitalPage';
import Unidad1DesarrolloPage from './Unidad1DesarrolloPage';
import Unidad1CierrePage from './Unidad1CierrePage';
import Unidad1InicioPage from './Unidad1InicioPage';
import Unidad2InicioPage from './Unidad2InicioPage';
import Unidad2DesarrolloPage from './Unidad2DesarrolloPage';
import Unidad2TallerPage from './Unidad2TallerPage';
import Unidad2CierrePage from './Unidad2CierrePage';
import Unidad3InicioPage from './Unidad3InicioPage';
import Unidad3DesarrolloPage from './Unidad3DesarrolloPage';
import Unidad3TallerPage from './Unidad3TallerPage';
import Unidad3CierrePage from './Unidad3CierrePage';
import PlanNegociosPage from './PlanNegociosPage';
import PresentacionProyectoVidaPage from './PresentacionProyectoVidaPage';
import ProyectoVidaUnidad1InicioPage from './ProyectoVidaUnidad1InicioPage';
import ProyectoVidaUnidad1DesarrolloPage from './ProyectoVidaUnidad1DesarrolloPage';
import ProyectoVidaUnidad1TallerPage from './ProyectoVidaUnidad1TallerPage';
import ProyectoVidaUnidad1CierrePage from './ProyectoVidaUnidad1CierrePage';
import ProyectoVidaUnidad2InicioPage from './ProyectoVidaUnidad2InicioPage';
import ProyectoVidaUnidad2DesarrolloPage from './ProyectoVidaUnidad2DesarrolloPage';
import ProyectoVidaUnidad2TallerPage from './ProyectoVidaUnidad2TallerPage';
import ProyectoVidaUnidad2CierrePage from './ProyectoVidaUnidad2CierrePage';
import ProyectoVidaUnidad3InicioPage from './ProyectoVidaUnidad3InicioPage';
import ProyectoVidaUnidad3DesarrolloPage from './ProyectoVidaUnidad3DesarrolloPage';
import ProyectoVidaUnidad3TallerPage from './ProyectoVidaUnidad3TallerPage';
import ProyectoVidaUnidad3CierrePage from './ProyectoVidaUnidad3CierrePage';
import ModulosPage from './ModulosPage';
import PresentacionMarketingDigitalPage from './PresentacionMarketingDigitalPage';
import MarketingDigitalUnidad1InicioPage from './MarketingDigitalUnidad1InicioPage';
import MarketingDigitalUnidad1DesarrolloPage from './MarketingDigitalUnidad1DesarrolloPage';
import MarketingDigitalUnidad1TallerPage from './MarketingDigitalUnidad1TallerPage';
import MarketingDigitalUnidad1CierrePage from './MarketingDigitalUnidad1CierrePage';
import MarketingDigitalUnidad2InicioPage from './MarketingDigitalUnidad2InicioPage';
import MarketingDigitalUnidad2DesarrolloPage from './MarketingDigitalUnidad2DesarrolloPage';
import MarketingDigitalUnidad2TallerPage from './MarketingDigitalUnidad2TallerPage';
import MarketingDigitalUnidad2CierrePage from './MarketingDigitalUnidad2CierrePage';
import PresentacionTrabajoEquipoPage from './PresentacionTrabajoEquipoPage';
import TrabajoEquipoUnidad1InicioPage from './TrabajoEquipoUnidad1InicioPage';
import TrabajoEquipoUnidad1DesarrolloPage from './TrabajoEquipoUnidad1DesarrolloPage';
import TrabajoEquipoUnidad1TallerPage from './TrabajoEquipoUnidad1TallerPage';
import TrabajoEquipoUnidad1CierrePage from './TrabajoEquipoUnidad1CierrePage';
import TrabajoEquipoUnidad2InicioPage from './TrabajoEquipoUnidad2InicioPage';
import TrabajoEquipoUnidad2DesarrolloPage from './TrabajoEquipoUnidad2DesarrolloPage';
import TrabajoEquipoUnidad2TallerPage from './TrabajoEquipoUnidad2TallerPage';
import TrabajoEquipoUnidad2CierrePage from './TrabajoEquipoUnidad2CierrePage';
import TrabajoEquipoUnidad3InicioPage from './TrabajoEquipoUnidad3InicioPage';
import TrabajoEquipoUnidad3DesarrolloPage from './TrabajoEquipoUnidad3DesarrolloPage';
import TrabajoEquipoUnidad3TallerPage from './TrabajoEquipoUnidad3TallerPage';
import TrabajoEquipoUnidad3CierrePage from './TrabajoEquipoUnidad3CierrePage';
import PlanNegocioTrabajoEquipoPage from './PlanNegocioTrabajoEquipoPage';
import PlanNegocioDescubrimientoPage from './PlanNegocioDescubrimientoPage';
import PlanNegocioModeloNegociosPage from './PlanNegocioModeloNegociosPage';
import PlanNegocioMarketingPage from './PlanNegocioMarketingPage';
import PlanNegocioMarketingDigitalPage from './PlanNegocioMarketingDigitalPage';
import PlanNegocioAtencionClientePage from './PlanNegocioAtencionClientePage';
import PlanNegocioProyectoVidaPage from './PlanNegocioProyectoVidaPage';
import PlanNegocioFinanzasPage from './PlanNegocioFinanzasPage';
import PlanNegocioLiderazgoPage from './PlanNegocioLiderazgoPage';
import MarketingDigitalUnidad3InicioPage from './MarketingDigitalUnidad3InicioPage';
import MarketingDigitalUnidad3DesarrolloPage from './MarketingDigitalUnidad3DesarrolloPage';
import MarketingDigitalUnidad3TallerPage from './MarketingDigitalUnidad3TallerPage';
import MarketingDigitalUnidad3CierrePage from './MarketingDigitalUnidad3CierrePage';
import PresentacionAtencionClientePage from './PresentacionAtencionClientePage';
import AtencionClienteUnidad1InicioPage from './AtencionClienteUnidad1InicioPage';
import AtencionClienteUnidad1DesarrolloPage from './AtencionClienteUnidad1DesarrolloPage';
import AtencionClienteUnidad1TallerPage from './AtencionClienteUnidad1TallerPage';
import AtencionClienteUnidad1CierrePage from './AtencionClienteUnidad1CierrePage';
import AtencionClienteUnidad2InicioPage from './AtencionClienteUnidad2InicioPage';
import AtencionClienteUnidad2DesarrolloPage from './AtencionClienteUnidad2DesarrolloPage';
import AtencionClienteUnidad2TallerPage from './AtencionClienteUnidad2TallerPage';
import AtencionClienteUnidad2CierrePage from './AtencionClienteUnidad2CierrePage';
import AtencionClienteUnidad3InicioPage from './AtencionClienteUnidad3InicioPage';
import AtencionClienteUnidad3DesarrolloPage from './AtencionClienteUnidad3DesarrolloPage';
import AtencionClienteUnidad3TallerPage from './AtencionClienteUnidad3TallerPage';
import AtencionClienteUnidad3CierrePage from './AtencionClienteUnidad3CierrePage';
import PresentacionFinanzasPage from './PresentacionFinanzasPage';
import FinanzasUnidad1InicioPage from './FinanzasUnidad1InicioPage';
import FinanzasUnidad1DesarrolloPage from './FinanzasUnidad1DesarrolloPage';
import FinanzasUnidad1TallerPage from './FinanzasUnidad1TallerPage';
import FinanzasUnidad1CierrePage from './FinanzasUnidad1CierrePage';
import FinanzasUnidad2InicioPage from './FinanzasUnidad2InicioPage';
import FinanzasUnidad2DesarrolloPage from './FinanzasUnidad2DesarrolloPage';
import FinanzasUnidad2TallerPage from './FinanzasUnidad2TallerPage';
import FinanzasUnidad2CierrePage from './FinanzasUnidad2CierrePage';
import FinanzasUnidad3InicioPage from './FinanzasUnidad3InicioPage';
import FinanzasUnidad3DesarrolloPage from './FinanzasUnidad3DesarrolloPage';
import FinanzasUnidad3TallerPage from './FinanzasUnidad3TallerPage';
import FinanzasUnidad3CierrePage from './FinanzasUnidad3CierrePage';
import PresentacionLiderazgoPage from './PresentacionLiderazgoPage';
import PresentacionPlanInversionPage from './PresentacionPlanInversionPage';
import PlanInversionUnidad1InicioPage from './PlanInversionUnidad1InicioPage';
import PlanInversionUnidad1DesarrolloPage from './PlanInversionUnidad1DesarrolloPage';
import PlanInversionUnidad1TallerPage from './PlanInversionUnidad1TallerPage';
import PlanInversionUnidad1CierrePage from './PlanInversionUnidad1CierrePage';
import PlanInversionUnidad2InicioPage from './PlanInversionUnidad2InicioPage';
import PlanInversionUnidad2DesarrolloPage from './PlanInversionUnidad2DesarrolloPage';
import PlanInversionUnidad2TallerPage from './PlanInversionUnidad2TallerPage';
import PlanInversionUnidad2CierrePage from './PlanInversionUnidad2CierrePage';
import PlanInversionUnidad3InicioPage from './PlanInversionUnidad3InicioPage';
import PlanInversionUnidad3DesarrolloPage from './PlanInversionUnidad3DesarrolloPage';
import PlanInversionUnidad3TallerPage from './PlanInversionUnidad3TallerPage';
import PlanInversionUnidad3CierrePage from './PlanInversionUnidad3CierrePage';
import LiderazgoUnidad1InicioPage from './LiderazgoUnidad1InicioPage';
import LiderazgoUnidad1DesarrolloPage from './LiderazgoUnidad1DesarrolloPage';
import LiderazgoUnidad1TallerPage from './LiderazgoUnidad1TallerPage';
import LiderazgoUnidad1CierrePage from './LiderazgoUnidad1CierrePage';
import LiderazgoUnidad2InicioPage from './LiderazgoUnidad2InicioPage';
import LiderazgoUnidad2DesarrolloPage from './LiderazgoUnidad2DesarrolloPage';
import LiderazgoUnidad2TallerPage from './LiderazgoUnidad2TallerPage';
import LiderazgoUnidad2CierrePage from './LiderazgoUnidad2CierrePage';
import LiderazgoUnidad3InicioPage from './LiderazgoUnidad3InicioPage';
import LiderazgoUnidad3DesarrolloPage from './LiderazgoUnidad3DesarrolloPage';
import LiderazgoUnidad3TallerPage from './LiderazgoUnidad3TallerPage';
import LiderazgoUnidad3CierrePage from './LiderazgoUnidad3CierrePage';
import PresentacionModuloPage from './PresentacionModuloPage';
import Unidad1TallerPage from './Unidad1TallerPage';
import PresentacionDescubrimientoPage from './PresentacionDescubrimientoPage';
import PresentacionModeloNegociosPage from './PresentacionModeloNegociosPage';
import StudentNodeForumPage from './StudentNodeForumPage';
import ModeloNegociosUnidad1InicioPage from './ModeloNegociosUnidad1InicioPage';
import ModeloNegociosUnidad1DesarrolloPage from './ModeloNegociosUnidad1DesarrolloPage';
import ModeloNegociosUnidad1TallerPage from './ModeloNegociosUnidad1TallerPage';
import ModeloNegociosUnidad1CierrePage from './ModeloNegociosUnidad1CierrePage';
import ModeloNegociosUnidad2InicioPage from './ModeloNegociosUnidad2InicioPage';
import ModeloNegociosUnidad2DesarrolloPage from './ModeloNegociosUnidad2DesarrolloPage';
import ModeloNegociosUnidad2TallerPage from './ModeloNegociosUnidad2TallerPage';
import ModeloNegociosUnidad2CierrePage from './ModeloNegociosUnidad2CierrePage';
import ModeloNegociosUnidad3InicioPage from './ModeloNegociosUnidad3InicioPage';
import ModeloNegociosUnidad3DesarrolloPage from './ModeloNegociosUnidad3DesarrolloPage';
import ModeloNegociosUnidad3TallerPage from './ModeloNegociosUnidad3TallerPage';
import ModeloNegociosUnidad3CierrePage from './ModeloNegociosUnidad3CierrePage';
import DescubrimientoUnidad1InicioPage from './DescubrimientoUnidad1InicioPage';
import DescubrimientoUnidad1DesarrolloPage from './DescubrimientoUnidad1DesarrolloPage';
import DescubrimientoUnidad1TallerPage from './DescubrimientoUnidad1TallerPage';
import DescubrimientoUnidad1CierrePage from './DescubrimientoUnidad1CierrePage';
import DescubrimientoUnidad2InicioPage from './DescubrimientoUnidad2InicioPage';
import DescubrimientoUnidad2DesarrolloPage from './DescubrimientoUnidad2DesarrolloPage';
import DescubrimientoUnidad2TallerPage from './DescubrimientoUnidad2TallerPage';
import DescubrimientoUnidad2CierrePage from './DescubrimientoUnidad2CierrePage';
import DescubrimientoUnidad3InicioPage from './DescubrimientoUnidad3InicioPage';
import DescubrimientoUnidad3DesarrolloPage from './DescubrimientoUnidad3DesarrolloPage';
import DescubrimientoUnidad3TallerPage from './DescubrimientoUnidad3TallerPage';
import DescubrimientoUnidad3CierrePage from './DescubrimientoUnidad3CierrePage';

const StudentRoutes = () => {
  return (
    <Routes>
      {/* Dashboard principal - Control de acceso por estado */}
      <Route path="/dashboard" element={<StudentDashboardAccess />} />
      
      {/* Página de módulos */}
      <Route path="/modulos" element={<ModulosPage />} />
      
      {/* Módulo 5: Marketing Digital */}
      <Route path="/marketing-digital" element={<PresentacionMarketingDigitalPage />} />
      <Route path="/marketing-digital/unidad1" element={<Navigate to="/student/marketing-digital/unidad1/inicio" replace />} />
      <Route path="/marketing-digital/unidad1/inicio" element={<MarketingDigitalUnidad1InicioPage />} />
      <Route path="/marketing-digital/unidad1/desarrollo" element={<MarketingDigitalUnidad1DesarrolloPage />} />
      <Route path="/marketing-digital/unidad1/taller" element={<MarketingDigitalUnidad1TallerPage />} />
      <Route path="/marketing-digital/unidad1/cierre" element={<MarketingDigitalUnidad1CierrePage />} />
      <Route path="/marketing-digital/unidad2" element={<Navigate to="/student/marketing-digital/unidad2/inicio" replace />} />
      <Route path="/marketing-digital/unidad2/inicio" element={<MarketingDigitalUnidad2InicioPage />} />
      <Route path="/marketing-digital/unidad2/desarrollo" element={<MarketingDigitalUnidad2DesarrolloPage />} />
      <Route path="/marketing-digital/unidad2/taller" element={<MarketingDigitalUnidad2TallerPage />} />
      <Route path="/marketing-digital/unidad2/cierre" element={<MarketingDigitalUnidad2CierrePage />} />
      <Route path="/marketing-digital/unidad3" element={<Navigate to="/student/marketing-digital/unidad3/inicio" replace />} />
      <Route path="/marketing-digital/unidad3/inicio" element={<MarketingDigitalUnidad3InicioPage />} />
      <Route path="/marketing-digital/unidad3/desarrollo" element={<MarketingDigitalUnidad3DesarrolloPage />} />
      <Route path="/marketing-digital/unidad3/taller" element={<MarketingDigitalUnidad3TallerPage />} />
      <Route path="/marketing-digital/unidad3/cierre" element={<MarketingDigitalUnidad3CierrePage />} />
      <Route path="/marketing-digital/plan-negocio" element={<PlanNegocioMarketingDigitalPage />} />
      
      {/* Módulo 6: Atención al Cliente y Resolución de Conflictos */}
      <Route path="/atencion-cliente" element={<PresentacionAtencionClientePage />} />
      <Route path="/atencion-cliente/unidad1" element={<Navigate to="/student/atencion-cliente/unidad1/inicio" replace />} />
      <Route path="/atencion-cliente/unidad1/inicio" element={<AtencionClienteUnidad1InicioPage />} />
      <Route path="/atencion-cliente/unidad1/desarrollo" element={<AtencionClienteUnidad1DesarrolloPage />} />
      <Route path="/atencion-cliente/unidad1/taller" element={<AtencionClienteUnidad1TallerPage />} />
      <Route path="/atencion-cliente/unidad1/cierre" element={<AtencionClienteUnidad1CierrePage />} />
      <Route path="/atencion-cliente/unidad2" element={<Navigate to="/student/atencion-cliente/unidad2/inicio" replace />} />
      <Route path="/atencion-cliente/unidad2/inicio" element={<AtencionClienteUnidad2InicioPage />} />
      <Route path="/atencion-cliente/unidad2/desarrollo" element={<AtencionClienteUnidad2DesarrolloPage />} />
      <Route path="/atencion-cliente/unidad2/taller" element={<AtencionClienteUnidad2TallerPage />} />
      <Route path="/atencion-cliente/unidad2/cierre" element={<AtencionClienteUnidad2CierrePage />} />
      <Route path="/atencion-cliente/unidad3" element={<Navigate to="/student/atencion-cliente/unidad3/inicio" replace />} />
      <Route path="/atencion-cliente/unidad3/inicio" element={<AtencionClienteUnidad3InicioPage />} />
      <Route path="/atencion-cliente/unidad3/desarrollo" element={<AtencionClienteUnidad3DesarrolloPage />} />
      <Route path="/atencion-cliente/unidad3/taller" element={<AtencionClienteUnidad3TallerPage />} />
      <Route path="/atencion-cliente/unidad3/cierre" element={<AtencionClienteUnidad3CierrePage />} />
      <Route path="/atencion-cliente/plan-negocio" element={<PlanNegocioAtencionClientePage />} />
      
      {/* Módulo 7: Trabajo en Equipo */}
      <Route path="/trabajo-equipo" element={<PresentacionTrabajoEquipoPage />} />
      <Route path="/trabajo-equipo/unidad1" element={<Navigate to="/student/trabajo-equipo/unidad1/inicio" replace />} />
      <Route path="/trabajo-equipo/unidad1/inicio" element={<TrabajoEquipoUnidad1InicioPage />} />
      <Route path="/trabajo-equipo/unidad1/desarrollo" element={<TrabajoEquipoUnidad1DesarrolloPage />} />
      <Route path="/trabajo-equipo/unidad1/taller" element={<TrabajoEquipoUnidad1TallerPage />} />
      <Route path="/trabajo-equipo/unidad1/cierre" element={<TrabajoEquipoUnidad1CierrePage />} />
      <Route path="/trabajo-equipo/unidad2" element={<Navigate to="/student/trabajo-equipo/unidad2/inicio" replace />} />
      <Route path="/trabajo-equipo/unidad2/inicio" element={<TrabajoEquipoUnidad2InicioPage />} />
      <Route path="/trabajo-equipo/unidad2/desarrollo" element={<TrabajoEquipoUnidad2DesarrolloPage />} />
      <Route path="/trabajo-equipo/unidad2/taller" element={<TrabajoEquipoUnidad2TallerPage />} />
      <Route path="/trabajo-equipo/unidad2/cierre" element={<TrabajoEquipoUnidad2CierrePage />} />
      <Route path="/trabajo-equipo/unidad3" element={<Navigate to="/student/trabajo-equipo/unidad3/inicio" replace />} />
      <Route path="/trabajo-equipo/unidad3/inicio" element={<TrabajoEquipoUnidad3InicioPage />} />
      <Route path="/trabajo-equipo/unidad3/desarrollo" element={<TrabajoEquipoUnidad3DesarrolloPage />} />
      <Route path="/trabajo-equipo/unidad3/taller" element={<TrabajoEquipoUnidad3TallerPage />} />
      <Route path="/trabajo-equipo/unidad3/cierre" element={<TrabajoEquipoUnidad3CierrePage />} />
      <Route path="/trabajo-equipo/plan-negocio" element={<PlanNegocioTrabajoEquipoPage />} />
      
      {/* Módulo 8: Finanzas y Gestión Empresarial */}
      <Route path="/finanzas" element={<PresentacionFinanzasPage />} />
      <Route path="/finanzas/unidad1" element={<Navigate to="/student/finanzas/unidad1/inicio" replace />} />
      <Route path="/finanzas/unidad1/inicio" element={<FinanzasUnidad1InicioPage />} />
      <Route path="/finanzas/unidad1/desarrollo" element={<FinanzasUnidad1DesarrolloPage />} />
      <Route path="/finanzas/unidad1/taller" element={<FinanzasUnidad1TallerPage />} />
      <Route path="/finanzas/unidad1/cierre" element={<FinanzasUnidad1CierrePage />} />
      <Route path="/finanzas/unidad2" element={<Navigate to="/student/finanzas/unidad2/inicio" replace />} />
      <Route path="/finanzas/unidad2/inicio" element={<FinanzasUnidad2InicioPage />} />
      <Route path="/finanzas/unidad2/desarrollo" element={<FinanzasUnidad2DesarrolloPage />} />
      <Route path="/finanzas/unidad2/taller" element={<FinanzasUnidad2TallerPage />} />
      <Route path="/finanzas/unidad2/cierre" element={<FinanzasUnidad2CierrePage />} />
      <Route path="/finanzas/unidad3" element={<Navigate to="/student/finanzas/unidad3/inicio" replace />} />
      <Route path="/finanzas/unidad3/inicio" element={<FinanzasUnidad3InicioPage />} />
      <Route path="/finanzas/unidad3/desarrollo" element={<FinanzasUnidad3DesarrolloPage />} />
      <Route path="/finanzas/unidad3/taller" element={<FinanzasUnidad3TallerPage />} />
      <Route path="/finanzas/unidad3/cierre" element={<FinanzasUnidad3CierrePage />} />
      <Route path="/finanzas/plan-negocio" element={<PlanNegocioFinanzasPage />} />
      
      {/* Módulo 9: Plan de Inversión */}
      <Route path="/plan-inversion" element={<PresentacionPlanInversionPage />} />
      <Route path="/plan-inversion/unidad1" element={<Navigate to="/student/plan-inversion/unidad1/inicio" replace />} />
      <Route path="/plan-inversion/unidad1/inicio" element={<PlanInversionUnidad1InicioPage />} />
      <Route path="/plan-inversion/unidad1/desarrollo" element={<PlanInversionUnidad1DesarrolloPage />} />
      <Route path="/plan-inversion/unidad1/taller" element={<PlanInversionUnidad1TallerPage />} />
      <Route path="/plan-inversion/unidad1/cierre" element={<PlanInversionUnidad1CierrePage />} />
      <Route path="/plan-inversion/unidad2" element={<Navigate to="/student/plan-inversion/unidad2/inicio" replace />} />
      <Route path="/plan-inversion/unidad2/inicio" element={<PlanInversionUnidad2InicioPage />} />
      <Route path="/plan-inversion/unidad2/desarrollo" element={<PlanInversionUnidad2DesarrolloPage />} />
      <Route path="/plan-inversion/unidad2/taller" element={<PlanInversionUnidad2TallerPage />} />
      <Route path="/plan-inversion/unidad2/cierre" element={<PlanInversionUnidad2CierrePage />} />
      <Route path="/plan-inversion/unidad3" element={<Navigate to="/student/plan-inversion/unidad3/inicio" replace />} />
      <Route path="/plan-inversion/unidad3/inicio" element={<PlanInversionUnidad3InicioPage />} />
      <Route path="/plan-inversion/unidad3/desarrollo" element={<PlanInversionUnidad3DesarrolloPage />} />
      <Route path="/plan-inversion/unidad3/taller" element={<PlanInversionUnidad3TallerPage />} />
      <Route path="/plan-inversion/unidad3/cierre" element={<PlanInversionUnidad3CierrePage />} />
      
      {/* Módulo 10: Liderazgo */}
      <Route path="/liderazgo" element={<PresentacionLiderazgoPage />} />
      <Route path="/liderazgo/unidad1" element={<Navigate to="/student/liderazgo/unidad1/inicio" replace />} />
      <Route path="/liderazgo/unidad1/inicio" element={<LiderazgoUnidad1InicioPage />} />
      <Route path="/liderazgo/unidad1/desarrollo" element={<LiderazgoUnidad1DesarrolloPage />} />
      <Route path="/liderazgo/unidad1/taller" element={<LiderazgoUnidad1TallerPage />} />
      <Route path="/liderazgo/unidad1/cierre" element={<LiderazgoUnidad1CierrePage />} />
      <Route path="/liderazgo/unidad2" element={<Navigate to="/student/liderazgo/unidad2/inicio" replace />} />
      <Route path="/liderazgo/unidad2/inicio" element={<LiderazgoUnidad2InicioPage />} />
      <Route path="/liderazgo/unidad2/desarrollo" element={<LiderazgoUnidad2DesarrolloPage />} />
      <Route path="/liderazgo/unidad2/taller" element={<LiderazgoUnidad2TallerPage />} />
      <Route path="/liderazgo/unidad2/cierre" element={<LiderazgoUnidad2CierrePage />} />
      <Route path="/liderazgo/unidad3" element={<Navigate to="/student/liderazgo/unidad3/inicio" replace />} />
      <Route path="/liderazgo/unidad3/inicio" element={<LiderazgoUnidad3InicioPage />} />
      <Route path="/liderazgo/unidad3/desarrollo" element={<LiderazgoUnidad3DesarrolloPage />} />
      <Route path="/liderazgo/unidad3/taller" element={<LiderazgoUnidad3TallerPage />} />
      <Route path="/liderazgo/unidad3/cierre" element={<LiderazgoUnidad3CierrePage />} />
      <Route path="/liderazgo/plan-negocio" element={<PlanNegocioLiderazgoPage />} />
      
      {/* Módulo 4: Marketing y Comercialización */}
      <Route path="/presentacion-modulo" element={<PresentacionModuloPage />} />
      <Route path="/presentacion-modulo/plan-negocio" element={<PlanNegocioMarketingPage />} />
      <Route path="/unidad1" element={<Navigate to="/student/unidad1/inicio" replace />} />
      <Route path="/unidad1/inicio" element={<Unidad1InicioPage />} />
      <Route path="/unidad1/desarrollo" element={<Unidad1DesarrolloPage />} />
      <Route path="/unidad1/taller" element={<Unidad1TallerPage />} />
      <Route path="/unidad1/cierre" element={<Unidad1CierrePage />} />
      <Route path="/unidad1/evaluacion" element={<Unidad1CierrePage />} />
      <Route path="/unidad2/inicio" element={<Unidad2InicioPage />} />
      <Route path="/unidad2/desarrollo" element={<Unidad2DesarrolloPage />} />
      <Route path="/unidad2/taller" element={<Unidad2TallerPage />} />
      <Route path="/unidad2/cierre" element={<Unidad2CierrePage />} />
      <Route path="/unidad3" element={<Navigate to="/student/unidad3/inicio" replace />} />
      <Route path="/unidad3/inicio" element={<Unidad3InicioPage />} />
      <Route path="/unidad3/desarrollo" element={<Unidad3DesarrolloPage />} />
      <Route path="/unidad3/taller" element={<Unidad3TallerPage />} />
      <Route path="/unidad3/cierre" element={<Unidad3CierrePage />} />
      
      {/* Módulo 1: Proyecto de vida */}
      <Route path="/proyecto-vida" element={<PresentacionProyectoVidaPage />} />
      <Route path="/proyecto-vida/unidad1" element={<Navigate to="/student/proyecto-vida/unidad1/inicio" replace />} />
      <Route path="/proyecto-vida/unidad1/inicio" element={<ProyectoVidaUnidad1InicioPage />} />
      <Route path="/proyecto-vida/unidad1/desarrollo" element={<ProyectoVidaUnidad1DesarrolloPage />} />
      <Route path="/proyecto-vida/unidad1/taller" element={<ProyectoVidaUnidad1TallerPage />} />
      <Route path="/proyecto-vida/unidad1/cierre" element={<ProyectoVidaUnidad1CierrePage />} />
      <Route path="/proyecto-vida/unidad2" element={<Navigate to="/student/proyecto-vida/unidad2/inicio" replace />} />
      <Route path="/proyecto-vida/unidad2/inicio" element={<ProyectoVidaUnidad2InicioPage />} />
      <Route path="/proyecto-vida/unidad2/desarrollo" element={<ProyectoVidaUnidad2DesarrolloPage />} />
      <Route path="/proyecto-vida/unidad2/taller" element={<ProyectoVidaUnidad2TallerPage />} />
      <Route path="/proyecto-vida/unidad2/cierre" element={<ProyectoVidaUnidad2CierrePage />} />
      <Route path="/proyecto-vida/unidad3" element={<Navigate to="/student/proyecto-vida/unidad3/inicio" replace />} />
      <Route path="/proyecto-vida/unidad3/inicio" element={<ProyectoVidaUnidad3InicioPage />} />
      <Route path="/proyecto-vida/unidad3/desarrollo" element={<ProyectoVidaUnidad3DesarrolloPage />} />
      <Route path="/proyecto-vida/unidad3/taller" element={<ProyectoVidaUnidad3TallerPage />} />
      <Route path="/proyecto-vida/unidad3/cierre" element={<ProyectoVidaUnidad3CierrePage />} />
      <Route path="/proyecto-vida/plan-negocio" element={<PlanNegocioProyectoVidaPage />} />
      
      {/* Módulo 2: Descubrimiento de Oportunidades */}
      <Route path="/descubrimiento-oportunidades" element={<PresentacionDescubrimientoPage />} />
      <Route path="/descubrimiento-oportunidades/unidad1" element={<Navigate to="/student/descubrimiento-oportunidades/unidad1/inicio" replace />} />
      <Route path="/descubrimiento-oportunidades/unidad1/inicio" element={<DescubrimientoUnidad1InicioPage />} />
      <Route path="/descubrimiento-oportunidades/unidad1/desarrollo" element={<DescubrimientoUnidad1DesarrolloPage />} />
      <Route path="/descubrimiento-oportunidades/unidad1/taller" element={<DescubrimientoUnidad1TallerPage />} />
      <Route path="/descubrimiento-oportunidades/unidad1/cierre" element={<DescubrimientoUnidad1CierrePage />} />
      <Route path="/descubrimiento-oportunidades/unidad2" element={<Navigate to="/student/descubrimiento-oportunidades/unidad2/inicio" replace />} />
      <Route path="/descubrimiento-oportunidades/unidad2/inicio" element={<DescubrimientoUnidad2InicioPage />} />
      <Route path="/descubrimiento-oportunidades/unidad2/desarrollo" element={<DescubrimientoUnidad2DesarrolloPage />} />
      <Route path="/descubrimiento-oportunidades/unidad2/taller" element={<DescubrimientoUnidad2TallerPage />} />
      <Route path="/descubrimiento-oportunidades/unidad2/cierre" element={<DescubrimientoUnidad2CierrePage />} />
      <Route path="/descubrimiento-oportunidades/unidad3" element={<Navigate to="/student/descubrimiento-oportunidades/unidad3/inicio" replace />} />
      <Route path="/descubrimiento-oportunidades/unidad3/inicio" element={<DescubrimientoUnidad3InicioPage />} />
      <Route path="/descubrimiento-oportunidades/unidad3/desarrollo" element={<DescubrimientoUnidad3DesarrolloPage />} />
      <Route path="/descubrimiento-oportunidades/unidad3/taller" element={<DescubrimientoUnidad3TallerPage />} />
      <Route path="/descubrimiento-oportunidades/unidad3/cierre" element={<DescubrimientoUnidad3CierrePage />} />
      <Route path="/descubrimiento-oportunidades/plan-negocio" element={<PlanNegocioDescubrimientoPage />} />
      
      {/* Módulo 3: Modelo de Negocios */}
      <Route path="/modelo-negocios" element={<PresentacionModeloNegociosPage />} />
      <Route path="/modelo-negocios/unidad1" element={<Navigate to="/student/modelo-negocios/unidad1/inicio" replace />} />
      <Route path="/modelo-negocios/unidad1/inicio" element={<ModeloNegociosUnidad1InicioPage />} />
      <Route path="/modelo-negocios/unidad1/desarrollo" element={<ModeloNegociosUnidad1DesarrolloPage />} />
      <Route path="/modelo-negocios/unidad1/taller" element={<ModeloNegociosUnidad1TallerPage />} />
      <Route path="/modelo-negocios/unidad1/cierre" element={<ModeloNegociosUnidad1CierrePage />} />
      <Route path="/modelo-negocios/unidad2" element={<Navigate to="/student/modelo-negocios/unidad2/inicio" replace />} />
      <Route path="/modelo-negocios/unidad2/inicio" element={<ModeloNegociosUnidad2InicioPage />} />
      <Route path="/modelo-negocios/unidad2/desarrollo" element={<ModeloNegociosUnidad2DesarrolloPage />} />
      <Route path="/modelo-negocios/unidad2/taller" element={<ModeloNegociosUnidad2TallerPage />} />
      <Route path="/modelo-negocios/unidad2/cierre" element={<ModeloNegociosUnidad2CierrePage />} />
      <Route path="/modelo-negocios/unidad3" element={<Navigate to="/student/modelo-negocios/unidad3/inicio" replace />} />
      <Route path="/modelo-negocios/unidad3/inicio" element={<ModeloNegociosUnidad3InicioPage />} />
      <Route path="/modelo-negocios/unidad3/desarrollo" element={<ModeloNegociosUnidad3DesarrolloPage />} />
      <Route path="/modelo-negocios/unidad3/taller" element={<ModeloNegociosUnidad3TallerPage />} />
      <Route path="/modelo-negocios/unidad3/cierre" element={<ModeloNegociosUnidad3CierrePage />} />
      <Route path="/modelo-negocios/plan-negocio" element={<PlanNegocioModeloNegociosPage />} />
      
      {/* Módulos específicos */}
      <Route path="/marketing-digital" element={<MarketingDigitalPage />} />
      <Route path="/programacion-modulo" element={<ProgramacionModuloPage />} />
      <Route path="/presentacion" element={<PresentacionPage />} />
      <Route path="/diagnostico-presencia-digital" element={<DiagnosticoPresenciaDigitalPage />} />
      <Route path="/diagnostico-presencia-digital/inicio" element={<Unidad1InicioPage />} />
      <Route path="/diagnostico-presencia-digital/desarrollo" element={<Unidad1DesarrolloPage />} />
      <Route path="/diagnostico-presencia-digital/cierre" element={<Unidad1CierrePage />} />
      <Route path="/metas-marketing-digital" element={<Navigate to="/student/metas-marketing-digital/inicio" replace />} />
      <Route path="/metas-marketing-digital/inicio" element={<Unidad2InicioPage />} />
      <Route path="/metas-marketing-digital/desarrollo" element={<Unidad2DesarrolloPage />} />
      <Route path="/metas-marketing-digital/cierre" element={<Unidad2CierrePage />} />
      <Route path="/estrategias-marketing-digital" element={<Navigate to="/student/unidad3/inicio" replace />} />
      <Route path="/estrategias-marketing-digital/desarrollo" element={<Navigate to="/student/unidad3/desarrollo" replace />} />
      <Route path="/estrategias-marketing-digital/cierre" element={<Navigate to="/student/unidad3/cierre" replace />} />
      <Route path="/evaluacion" element={<EvaluacionMarketingDigitalPage />} />
      <Route path="/plan-negocios" element={<PlanNegociosPage />} />
      <Route path="/plan-negocio" element={<PlanNegociosPage />} />
      
      {/* Perfil y configuración */}
      <Route path="/perfil" element={<StudentProfile />} />
      <Route path="/configuracion" element={<StudentConfig />} />
      <Route path="/foro" element={<StudentNodeForumPage />} />
      
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
};

export default StudentRoutes; 