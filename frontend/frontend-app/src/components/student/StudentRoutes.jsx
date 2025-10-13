import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import CourseManager from './CourseManager';
import CourseContent from './CourseContent';
import StudentProfile from './StudentProfile';
import StudentConfig from './StudentConfig';
import StudentDashboardBlocked from './StudentDashboardBlocked';
import StudentDashboardAccess from './StudentDashboardAccess';

const StudentRoutes = () => {
  return (
    <Routes>
      {/* Dashboard principal - Control de acceso por estado */}
      <Route path="/dashboard" element={<StudentDashboardAccess />} />
      
      {/* Gestión de cursos */}
      <Route path="/cursos" element={<CourseManager />} />
      <Route path="/curso/:cursoId" element={<CourseContent />} />
      <Route path="/curso/:cursoId/progreso" element={<CourseContent />} />
      <Route path="/curso/:cursoId/certificado" element={<CourseContent />} />
      
      {/* Perfil y configuración */}
      <Route path="/perfil" element={<StudentProfile />} />
      <Route path="/configuracion" element={<StudentConfig />} />
      
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default StudentRoutes; 