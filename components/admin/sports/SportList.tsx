'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Edit2, Trash2, Plus, Star, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/providers/ConfirmDialogProvider';
import { usePermission } from '@/hooks/usePermission';
import { Sport } from '@/types/sport';

export default function SportList() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const confirm = useConfirm();
    const { can } = usePermission();

    const fetchSports = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/sports');
            setSports(data.data);
        } catch {
            toast.error("Error cargando deportes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSports(); }, []);

    const handleDelete = (id: number) => {
        if (!can('delete_sports')) return;
        confirm({
            title: '¿Eliminar deporte?',
            message: 'Esta acción no se puede deshacer.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/sports/${id}`);
                    toast.success('Deporte eliminado');
                    fetchSports();
                } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Error al eliminar');
                }
            }
        });
    };

    const filtered = sports.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Deportes</h1>
                {can('create_sports') && (
                    <Link href="/sports/create" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-slate-800 shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Nuevo Deporte
                    </Link>
                )}
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar deporte..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-slate-900"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-3 w-20">Icono</th>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3 text-center w-24">Destacado</th>
                            <th className="px-6 py-3 text-center w-24">Productos</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin inline text-slate-400" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No se encontraron resultados.</td></tr>
                        ) : (
                            filtered.map(sport => (
                                <tr key={sport.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200">
                                            {sport.icon ? (
                                                <img src={sport.icon} alt={sport.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-slate-400">Sin img</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="font-bold text-slate-800">{sport.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">/{sport.slug}</div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {sport.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mx-auto" />}
                                    </td>
                                    <td className="px-6 py-3 text-center text-sm font-bold text-slate-600">
                                        {sport.products_count}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {can('edit_sports') && (
                                                <Link href={`/sports/${sport.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                            )}
                                            {can('delete_sports') && (
                                                <button onClick={() => handleDelete(sport.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}