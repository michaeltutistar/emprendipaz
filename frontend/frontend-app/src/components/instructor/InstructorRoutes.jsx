import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InstructorDashboard from '../InstructorDashboard';
import ContentUpload from './ContentUpload';
import ModuleManager from './ModuleManager';
import ContentScheduler from './ContentScheduler';
import CourseManager from './CourseManager';
import StudentProgress from './StudentProgress';

const InstructorRoutes = () => {
  return (
    <Routes>
      {/* Dashboard principal */}
      <Route path="/dashboard" element={<InstructorDashboard />} />
      
      {/* Gestión de contenido */}
      <Route path="/contenido/*" element={<ContentUpload />} />
      <Route path="/contenido/video" element={<ContentUpload />} />
      <Route path="/contenido/documento" element={<ContentUpload />} />
      
      {/* Gestión de módulos */}
      <Route path="/modulos" element={<ModuleManager />} />
      
      {/* Programación de contenido */}
      <Route path="/programacion" element={<ContentScheduler />} />
      
      {/* Gestión de cursos */}
      <Route path="/curso/*" element={<CourseManager />} />
      <Route path="/curso/nuevo" element={<CourseManager />} />
      <Route path="/curso/:cursoId" element={<CourseManager />} />
      <Route path="/curso/:cursoId/editar" element={<CourseManager />} />
      
      {/* Progreso de estudiantes */}
      <Route path="/estudiantes/:cursoId" element={<StudentProgress />} />
      
      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default InstructorRoutes; 