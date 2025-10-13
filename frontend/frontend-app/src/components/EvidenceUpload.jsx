import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const EvidenceUpload = () => {
    const [tipoEmprendimiento, setTipoEmprendimiento] = useState('');
    const [archivo1, setArchivo1] = useState(null);
    const [archivo2, setArchivo2] = useState(null);
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [evidenciasExistentes, setEvidenciasExistentes] = useState(null);

    useEffect(() => {
        fetchEvidenciasExistentes();
    }, []);

    const fetchEvidenciasExistentes = async () => {
        try {
            const response = await fetch('/api/evidencias/me', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setEvidenciasExistentes(data.evidencias[0] || null);
            }
        } catch (err) {
            console.error('Error al cargar evidencias existentes:', err);
        }
    };

    const handleFileChange = (file, setter) => {
        if (file && file.type === 'application/pdf') {
            setter(file);
        } else {
            toast.error('Solo se permiten archivos PDF');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!tipoEmprendimiento) {
            toast.error('Selecciona el tipo de emprendimiento');
            return;
        }

        if (!archivo1 || !archivo2) {
            toast.error('Se requieren ambos archivos');
            return;
        }

        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('tipo', tipoEmprendimiento);
            formData.append('archivo1', archivo1);
            formData.append('archivo2', archivo2);
            formData.append('observaciones', observaciones);

            const response = await fetch('/api/evidencias', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al subir evidencias');
            }

            toast.success('Evidencias subidas exitosamente');
            fetchEvidenciasExistentes();
            
            // Limpiar formulario
            setTipoEmprendimiento('');
            setArchivo1(null);
            setArchivo2(null);
            setObservaciones('');

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
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

    const getArchivoLabel = (numero) => {
        if (tipoEmprendimiento === 'formal') {
            return numero === 1 ? 'Matrícula Mercantil (PDF)' : 'Facturas de los últimos 6 meses (PDF)';
        } else {
            return numero === 1 ? 'Publicaciones en Redes Sociales (PDF)' : 'Registro de Ventas (PDF)';
        }
    };

    if (evidenciasExistentes) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Mis Evidencias de Funcionamiento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Tipo de Emprendimiento: {evidenciasExistentes.tipo}</p>
                                    <p className="text-sm text-gray-500">
                                        Subido el {new Date(evidenciasExistentes.fecha_subida).toLocaleDateString()}
                                    </p>
                                </div>
                                {getEstadoBadge(evidenciasExistentes.estado_revision)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium mb-2">
                                        {tipoEmprendimiento === 'formal' ? 'Matrícula Mercantil' : 'Publicaciones Redes'}
                                    </h4>
                                    <p className="text-sm text-gray-600">{evidenciasExistentes.archivo1_nombre}</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-medium mb-2">
                                        {tipoEmprendimiento === 'formal' ? 'Facturas' : 'Registro de Ventas'}
                                    </h4>
                                    <p className="text-sm text-gray-600">{evidenciasExistentes.archivo2_nombre}</p>
                                </div>
                            </div>

                            {evidenciasExistentes.observaciones && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium mb-2">Observaciones del Administrador:</h4>
                                    <p className="text-sm text-gray-700">{evidenciasExistentes.observaciones}</p>
                                </div>
                            )}

                            {evidenciasExistentes.estado_revision === 'rechazado' && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start">
                                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                                        <div>
                                            <h4 className="font-medium text-red-900">Evidencias Rechazadas</h4>
                                            <p className="text-sm text-red-700 mt-1">
                                                Tus evidencias han sido rechazadas. Contacta al administrador para más información.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Evidencias de Funcionamiento (6 meses)</CardTitle>
                    <p className="text-gray-600">
                        Sube las evidencias que demuestren el funcionamiento de tu emprendimiento durante los últimos 6 meses.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Pregunta sobre formalización */}
                        <div className="space-y-4">
                            <Label className="text-lg font-medium">
                                ¿Tu emprendimiento está formalizado? (tiene matrícula mercantil)
                            </Label>
                            <Select value={tipoEmprendimiento} onValueChange={setTipoEmprendimiento}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el tipo de emprendimiento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="formal">Sí, está formalizado</SelectItem>
                                    <SelectItem value="informal">No, es informal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Campos de archivos según el tipo */}
                        {tipoEmprendimiento && (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                        {tipoEmprendimiento === 'formal' ? 'Documentos para Emprendimiento Formal' : 'Documentos para Emprendimiento Informal'}
                                    </h4>
                                    <p className="text-sm text-blue-700">
                                        {tipoEmprendimiento === 'formal' 
                                            ? 'Sube tu matrícula mercantil y facturas de los últimos 6 meses'
                                            : 'Sube publicaciones en redes sociales y registro de ventas de los últimos 6 meses'
                                        }
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="archivo1">{getArchivoLabel(1)}</Label>
                                        <Input
                                            id="archivo1"
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e.target.files[0], setArchivo1)}
                                            required
                                        />
                                        {archivo1 && (
                                            <p className="text-sm text-green-600 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {archivo1.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="archivo2">{getArchivoLabel(2)}</Label>
                                        <Input
                                            id="archivo2"
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange(e.target.files[0], setArchivo2)}
                                            required
                                        />
                                        {archivo2 && (
                                            <p className="text-sm text-green-600 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                {archivo2.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="observaciones">Observaciones (opcional)</Label>
                                    <Textarea
                                        id="observaciones"
                                        value={observaciones}
                                        onChange={(e) => setObservaciones(e.target.value)}
                                        placeholder="Agrega cualquier información adicional sobre tus evidencias..."
                                        rows={3}
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Subiendo...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Subir Evidencias
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Información adicional */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Información Importante</h4>
                                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                                        <li>• Solo se permiten archivos PDF</li>
                                        <li>• Los documentos deben ser legibles y actuales</li>
                                        <li>• Las evidencias serán revisadas por el administrador</li>
                                        <li>• Recibirás notificación del resultado de la revisión</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EvidenceUpload;
