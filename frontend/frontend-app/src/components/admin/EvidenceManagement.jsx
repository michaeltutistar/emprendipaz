import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
    FileText, 
    Download, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    Loader2, 
    Eye,
    Users,
    TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

const EvidenceManagement = () => {
    const [evidencias, setEvidencias] = useState([]);
    const [estadisticas, setEstadisticas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para filtros
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    
    // Estados para revisión
    const [evidenciaSeleccionada, setEvidenciaSeleccionada] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [observaciones, setObservaciones] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('');

    useEffect(() => {
        fetchEvidencias();
        fetchEstadisticas();
    }, [filtroTipo, filtroEstado]);

    const fetchEvidencias = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filtroTipo) params.append('tipo', filtroTipo);
            if (filtroEstado) params.append('estado', filtroEstado);
            
            const response = await fetch(`/api/evidencias?${params.toString()}`, { 
                credentials: 'include' 
            });
            
            if (!response.ok) {
                throw new Error('Error al cargar evidencias');
            }
            
            const data = await response.json();
            setEvidencias(data.evidencias || []);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEstadisticas = async () => {
        try {
            const response = await fetch('/api/evidencias/estadisticas', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setEstadisticas(data);
            }
        } catch (err) {
            console.error('Error al cargar estadísticas:', err);
        }
    };

    const handleReview = (evidencia) => {
        setEvidenciaSeleccionada(evidencia);
        setObservaciones(evidencia.observaciones || '');
        setNuevoEstado(evidencia.estado_revision);
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!evidenciaSeleccionada) return;

        try {
            const response = await fetch(`/api/evidencias/${evidenciaSeleccionada.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    estado_revision: nuevoEstado,
                    observaciones: observaciones
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al actualizar evidencia');
            }

            toast.success('Evidencia actualizada exitosamente');
            setShowReviewModal(false);
            fetchEvidencias();
            fetchEstadisticas();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const downloadArchivo = async (evidenciaId, numero) => {
        try {
            const response = await fetch(`/api/evidencias/${evidenciaId}/archivo/${numero}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Error al descargar archivo');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `archivo_${numero}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            toast.error('Error al descargar archivo');
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'pendiente': <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pendiente</Badge>,
            'aprobado': <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>,
            'rechazado': <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>
        };
        return badges[estado] || <Badge variant="secondary">{estado}</Badge>;
    };

    const getTipoLabel = (tipo) => {
        return tipo === 'formal' ? 'Formal' : 'Informal';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Cargando evidencias...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <XCircle className="h-10 w-10 mx-auto mb-2" />
                <p>Error: {error}</p>
                <Button onClick={fetchEvidencias} className="mt-4">Reintentar</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Gestión de Evidencias de Funcionamiento</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="evidencias" className="w-full">
                        <TabsList>
                            <TabsTrigger value="evidencias">Evidencias</TabsTrigger>
                            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="evidencias" className="mt-4">
                            {/* Filtros */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <Label htmlFor="filtro-tipo">Filtrar por tipo:</Label>
                                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos los tipos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos</SelectItem>
                                            <SelectItem value="formal">Formal</SelectItem>
                                            <SelectItem value="informal">Informal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="filtro-estado">Filtrar por estado:</Label>
                                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Todos los estados" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Todos</SelectItem>
                                            <SelectItem value="pendiente">Pendiente</SelectItem>
                                            <SelectItem value="aprobado">Aprobado</SelectItem>
                                            <SelectItem value="rechazado">Rechazado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Tabla de evidencias */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Archivos</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Fecha Subida</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {evidencias.map((evidencia) => (
                                        <TableRow key={evidencia.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{evidencia.usuario?.nombre}</p>
                                                    <p className="text-sm text-gray-500">{evidencia.usuario?.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getTipoLabel(evidencia.tipo)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => downloadArchivo(evidencia.id, 1)}
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        {evidencia.tipo === 'formal' ? 'Matrícula' : 'Redes'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => downloadArchivo(evidencia.id, 2)}
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        {evidencia.tipo === 'formal' ? 'Facturas' : 'Ventas'}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getEstadoBadge(evidencia.estado_revision)}</TableCell>
                                            <TableCell>
                                                {new Date(evidencia.fecha_subida).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReview(evidencia)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Revisar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                        
                        <TabsContent value="estadisticas" className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <FileText className="h-8 w-8 text-blue-500" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-600">Total Evidencias</p>
                                                <p className="text-2xl font-bold">{estadisticas.total || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-8 w-8 text-yellow-500" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                                                <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="h-8 w-8 text-green-500" />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                                                <p className="text-2xl font-bold text-green-600">{estadisticas.aprobadas || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Modal de revisión */}
            {showReviewModal && evidenciaSeleccionada && (
                <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <CardContent className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Revisar Evidencias</h3>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Usuario:</Label>
                                    <p className="font-medium">{evidenciaSeleccionada.usuario?.nombre}</p>
                                </div>
                                <div>
                                    <Label>Tipo:</Label>
                                    <p className="font-medium">{getTipoLabel(evidenciaSeleccionada.tipo)}</p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="estado">Estado de Revisión:</Label>
                                <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pendiente">Pendiente</SelectItem>
                                        <SelectItem value="aprobado">Aprobado</SelectItem>
                                        <SelectItem value="rechazado">Rechazado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="observaciones">Observaciones:</Label>
                                <Textarea
                                    id="observaciones"
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    placeholder="Agrega observaciones sobre la revisión..."
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleSubmitReview} className="bg-blue-600 hover:bg-blue-700">
                                    Guardar Revisión
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowReviewModal(false)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EvidenceManagement;
