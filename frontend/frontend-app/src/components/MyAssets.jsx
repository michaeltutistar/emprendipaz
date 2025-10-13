import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Package, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MyAssets = () => {
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [estadisticas, setEstadisticas] = useState({});

    useEffect(() => {
        fetchActivos();
    }, []);

    const fetchActivos = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/usuarios/me/activos', { credentials: 'include' });
            if (!response.ok) {
                throw new Error('Error al cargar activos');
            }
            const data = await response.json();
            setActivos(data.activos || []);
            setEstadisticas(data.estadisticas || {});
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'pendiente': <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>,
            'entregado': <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Entregado</Badge>,
            'rechazado': <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>
        };
        return badges[estado] || <Badge variant="secondary">{estado}</Badge>;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-CO');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="ml-2 text-gray-600">Cargando activos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                <p>Error: {error}</p>
                <Button onClick={fetchActivos} className="mt-4">Reintentar</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Resumen de Activos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-blue-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Total Activos</p>
                                <p className="text-2xl font-bold">{estadisticas.total || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Entregados</p>
                                <p className="text-2xl font-bold text-green-600">{estadisticas.entregados || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-yellow-500" />
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
                            <XCircle className="h-8 w-8 text-red-500" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Rechazados</p>
                                <p className="text-2xl font-bold text-red-600">{estadisticas.rechazados || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Activos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Mis Activos Asignados</CardTitle>
                </CardHeader>
                <CardContent>
                    {activos.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No tienes activos asignados aún.</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Los activos se asignan cuando estés en la fase de "Entrega de Activos".
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Activo</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha Asignación</TableHead>
                                    <TableHead>Fecha Entrega</TableHead>
                                    <TableHead>Observaciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activos.map((activo) => (
                                    <TableRow key={activo.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{activo.activo?.nombre}</p>
                                                <p className="text-sm text-gray-500">{activo.activo?.descripcion}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{activo.activo?.categoria}</TableCell>
                                        <TableCell>{formatCurrency(activo.activo?.valor_estimado || 0)}</TableCell>
                                        <TableCell>{getEstadoBadge(activo.estado)}</TableCell>
                                        <TableCell>{formatDate(activo.fecha_asignacion)}</TableCell>
                                        <TableCell>{formatDate(activo.fecha_entrega)}</TableCell>
                                        <TableCell>
                                            {activo.observaciones ? (
                                                <div className="max-w-xs">
                                                    <p className="text-sm text-gray-600 truncate" title={activo.observaciones}>
                                                        {activo.observaciones}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Sin observaciones</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Información sobre el proceso */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                            <h4 className="font-semibold text-blue-900">Información sobre la Entrega de Activos</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                Los activos se entregan cuando tu emprendimiento esté en la fase de "Entrega de Activos". 
                                El estado de cada activo se actualiza automáticamente según el proceso de entrega.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MyAssets;
