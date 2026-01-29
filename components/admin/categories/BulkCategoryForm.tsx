'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { ArrowLeft, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import PermissionGate from '@/components/auth/PermissionGate';

export default function BulkCategoryForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [parents, setParents] = useState<any[]>([]);

    const [parentId, setParentId] = useState('');
    const [rawNames, setRawNames] = useState('');

    const namesList = rawNames.split('\n').filter(n => n.trim() !== '');

    useEffect(() => {
        const fetchParents = async () => {
            try {
                const { data } = await api.get('/admin/categories');
                setParents(data.data.map((p: any) => ({
                    id: p.id,
                    label: p.name,
                    code: p.code
                })));
            } catch {
                toast.error('Error cargando lista de categorías');
            }
        };
        fetchParents();
    }, []);

    const handleSubmit = async () => {
        if (namesList.length === 0) {
            toast.error('La lista está vacía');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                parent_id: parentId || null,
                names: rawNames
            };

            const response = await api.post('/admin/categories/bulk', payload);
            toast.success(response.data.message);
            router.push('/categories');
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error en carga masiva');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-slate-200">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-blue-600" /> Carga Masiva de Categorías
                    </h1>
                    <p className="text-sm text-slate-500">Copia desde Excel y crea múltiples subcategorías en un solo paso.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 space-y-8 shadow-md">

                        <div className="relative z-20 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-slate-900 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">1</span>
                                <label className="text-sm font-bold text-slate-900">Selecciona la Categoría Padre</label>
                            </div>

                            <SearchableSelect
                                label=""
                                placeholder="Buscar padre (ej: Ropa Masculino)..."
                                options={parents}
                                value={parentId}
                                onChange={setParentId}
                            />

                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-xs text-slate-500 flex gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-blue-500" />
                                {parentId
                                    ? <span>Las nuevas categorías serán <strong>hijas</strong> de la selección. Los códigos continuarán la secuencia de ese grupo.</span>
                                    : <span>Las categorías se crearán en la <strong>raíz</strong> (Nivel principal).</span>}
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-slate-900 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">2</span>
                                <label className="text-sm font-bold text-slate-900">Pega la lista de nombres</label>
                            </div>

                            <div className="relative">
                                <textarea
                                    className="w-full h-80 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none font-mono text-sm leading-relaxed shadow-inner"
                                    placeholder={`Bermudas\nCamisetas\nPantalones\nCalcetines\n...`}
                                    value={rawNames}
                                    onChange={(e) => setRawNames(e.target.value)}
                                ></textarea>

                                <div className="absolute bottom-4 right-4 text-xs font-bold text-slate-500 bg-white/90 px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-sm">
                                    {namesList.length} items
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 pl-1">Un nombre por línea. No incluyas códigos ni símbolos.</p>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-0 overflow-hidden border-0 shadow-lg bg-slate-900 text-white">
                        <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-400" /> Resumen
                            </h3>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Destino (Padre)</span>
                                <span className="font-bold text-white truncate max-w-[150px] text-right">
                                    {parentId ? parents.find(p => p.id.toString() === parentId)?.label : 'Raíz (Principal)'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">Cantidad a crear</span>
                                <span className="font-bold text-3xl">{namesList.length}</span>
                            </div>

                            <div className="pt-4 border-t border-slate-700">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || namesList.length === 0}
                                    className="w-full bg-white text-slate-900 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">Procesando...</span>
                                    ) : (
                                        'Crear Categorías'
                                    )}
                                </button>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                        <h4 className="font-bold text-xs text-yellow-800 uppercase mb-2">Nota Importante</h4>
                        <p className="text-xs text-yellow-700 leading-relaxed">
                            El sistema generará automáticamente los códigos numéricos basándose en la secuencia del padre seleccionado. <br /><br />
                            Revisa la ortografía antes de guardar, ya que deshacer una carga masiva requiere borrar uno por uno.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}