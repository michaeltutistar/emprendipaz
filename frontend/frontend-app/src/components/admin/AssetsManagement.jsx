import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Plus, Edit, Trash2, Package, Users, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AssetsManagement = () => {
    const [activos, setActivos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [asignaciones, setAsignaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para formularios
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [editingActivo, setEditingActivo] = useState(null);
    
    // Formulario de creación/edición
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        valor_estimado: '',
        activo: true
    });
    
    // Formulario de asignación
    const [assignData, setAssignData] = useState({
        activo_id: '',
        user_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [activosRes, usuariosRes, asignacionesRes] = await Promise.all([
                fetch('/api/activos', { credentials: 'include' }),
                fetch('/api/admin/users', { credentials: 'include' }),
                fetch('/api/activos/1/usuarios', { credentials: 'include' }).catch(() => null) // Ejemplo, se puede mejorar
            ]);

            if (!activosRes.ok) throw new Error('Error al cargar activos');
            if (!usuariosRes.ok) throw new Error('Error al cargar usuarios');

            const activosData = await activosRes.json();
            const usuariosData = await usuariosRes.json();

            setActivos(activosData.activos || []);
            setUsuarios(usuariosData.users || []);
            setAsignaciones([]); // Se puede implementar después
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateActivo = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/activos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al crear activo');
            }

            toast.success('Activo creado exitosamente');
            setShowCreateForm(false);
            setFormData({ nombre: '', descripcion: '', categoria: '', valor_estimado: '', activo: true });
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleUpdateActivo = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/activos/${editingActivo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al actualizar activo');
            }

            toast.success('Activo actualizado exitosamente');
            setEditingActivo(null);
            setFormData({ nombre: '', descripcion: '', categoria: '', activo: true });
            fetchData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleAssignActivo = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/activos/${assignData.activo_id}/asignar/${assignData.user_id}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al asignar activo');
            }

            toast.success('Activo asignado exitosamente');
            setShowAssignForm(false);
            setAssignData({ activo_id: '', user_id: '' });
            fetchData();
        } catch (err) {
            toast.error(err.message);
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
                <XCircle className="h-10 w-10 mx-auto mb-2" />
                <p>Error: {error}</p>
                <Button onClick={fetchData} className="mt-4">Reintentar</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Gestión de Activos</CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Activo
                        </Button>
                        <Button onClick={() => setShowAssignForm(true)} variant="outline">
                            <Users className="h-4 w-4 mr-2" />
                            Asignar Activo
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="activos" className="w-full">
                        <TabsList>
                            <TabsTrigger value="activos">Activos</TabsTrigger>
                            <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="activos" className="mt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activos.map((activo) => (
                                        <TableRow key={activo.id}>
                                            <TableCell className="font-medium">{activo.nombre}</TableCell>
                                            <TableCell>{activo.categoria}</TableCell>
                                            <TableCell>{formatCurrency(activo.valor_estimado || 0)}</TableCell>
                                            <TableCell>
                                                {activo.activo ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800">Activo</Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-red-100 text-red-800">Inactivo</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingActivo(activo);
                                                            setFormData({
                                                                nombre: activo.nombre,
                                                                descripcion: activo.descripcion || '',
                                                                categoria: activo.categoria,
                                                                valor_estimado: activo.valor_estimado || '',
                                                                activo: activo.activo
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                        
                        <TabsContent value="asignaciones" className="mt-4">
                            <p className="text-gray-500">Funcionalidad de asignaciones en desarrollo...</p>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Modal de Crear/Editar Activo */}
            {(showCreateForm || editingActivo) && (
                <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <CardContent className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingActivo ? 'Editar Activo' : 'Crear Nuevo Activo'}
                        </h3>
                        <form onSubmit={editingActivo ? handleUpdateActivo : handleCreateActivo} className="space-y-4">
                            <div>
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="categoria">Categoría *</Label>
                                <Input
                                    id="categoria"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="valor_estimado">Valor Estimado</Label>
                                <Input
                                    id="valor_estimado"
                                    type="number"
                                    value={formData.valor_estimado}
                                    onChange={(e) => setFormData({ ...formData, valor_estimado: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="activo"
                                    checked={formData.activo}
                                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                />
                                <Label htmlFor="activo">Activo</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    {editingActivo ? 'Actualizar' : 'Crear'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setEditingActivo(null);
                                        setFormData({ nombre: '', descripcion: '', categoria: '', valor_estimado: '', activo: true });
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Modal de Asignar Activo */}
            {showAssignForm && (
                <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <CardContent className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Asignar Activo a Usuario</h3>
                        <form onSubmit={handleAssignActivo} className="space-y-4">
                            <div>
                                <Label htmlFor="activo_id">Activo *</Label>
                                <Select value={assignData.activo_id} onValueChange={(value) => setAssignData({ ...assignData, activo_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar activo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activos.filter(a => a.activo).map((activo) => (
                                            <SelectItem key={activo.id} value={activo.id.toString()}>
                                                {activo.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="user_id">Usuario *</Label>
                                <Select value={assignData.user_id} onValueChange={(value) => setAssignData({ ...assignData, user_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar usuario" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {usuarios.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.nombre} {user.apellido} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    Asignar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowAssignForm(false);
                                        setAssignData({ activo_id: '', user_id: '' });
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AssetsManagement;
