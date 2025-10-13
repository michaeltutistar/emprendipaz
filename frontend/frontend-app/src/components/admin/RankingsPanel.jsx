import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Download, Trophy, Medal, Award, User, Calendar, MapPin } from 'lucide-react';

const RankingsPanel = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    cargarRankings();
  }, []);

  const cargarRankings = async () => {
    try {
      const response = await fetch('/api/admin/evaluaciones/rankings', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setRankings(data.rankings);
      } else {
        toast.error('Error al cargar rankings');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    try {
      setExporting(true);
      const response = await fetch('/api/admin/evaluaciones/exportar', {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rankings_evaluaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Archivo exportado exitosamente');
      } else {
        toast.error('Error al exportar archivo');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setExporting(false);
    }
  };

  const getRankingIcon = (position) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{position}</span>;
  };

  const getRankingBadge = (position) => {
    if (position === 1) return <Badge className="bg-yellow-100 text-yellow-800">🥇 1er Lugar</Badge>;
    if (position === 2) return <Badge className="bg-gray-100 text-gray-800">🥈 2do Lugar</Badge>;
    if (position === 3) return <Badge className="bg-amber-100 text-amber-800">🥉 3er Lugar</Badge>;
    return <Badge variant="outline">#{position}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando rankings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rankings de Evaluación</h2>
          <p className="text-gray-600">Resultados consolidados de todas las evaluaciones</p>
        </div>
        <Button 
          onClick={exportarExcel} 
          disabled={exporting}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exportando...' : 'Exportar a Excel'}
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Evaluados</p>
                <p className="text-2xl font-bold">{rankings.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Evaluaciones Completas</p>
                <p className="text-2xl font-bold">
                  {rankings.filter(r => r.evaluacion_completa).length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Puntaje Promedio</p>
                <p className="text-2xl font-bold">
                  {rankings.length > 0 
                    ? (rankings.reduce((sum, r) => sum + r.puntaje_total, 0) / rankings.length).toFixed(1)
                    : '0'
                  }
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Puntaje Máximo</p>
                <p className="text-2xl font-bold">
                  {rankings.length > 0 ? Math.max(...rankings.map(r => r.puntaje_total)) : '0'}
                </p>
              </div>
              <Medal className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Ranking de Postulantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Posición</TableHead>
                  <TableHead>Postulante</TableHead>
                  <TableHead>Municipio</TableHead>
                  <TableHead>Emprendimiento</TableHead>
                  <TableHead className="text-center">Puntaje Total</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Fecha Inscripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((usuario, index) => (
                  <TableRow key={usuario.id} className={index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRankingIcon(index + 1)}
                        {getRankingBadge(index + 1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{usuario.nombre} {usuario.apellido}</p>
                        <p className="text-sm text-gray-600">{usuario.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{usuario.municipio}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{usuario.emprendimiento_nombre || 'Sin nombre'}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {usuario.puntaje_total}
                      </div>
                      <div className="text-sm text-gray-500">puntos</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={usuario.evaluacion_completa ? "default" : "secondary"}
                        className={usuario.evaluacion_completa ? "bg-green-100 text-green-800" : ""}
                      >
                        {usuario.evaluacion_completa ? 'Completa' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(usuario.fecha_inscripcion).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingsPanel;
