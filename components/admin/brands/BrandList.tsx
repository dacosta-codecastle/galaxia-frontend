'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Edit2, Trash2, Plus, Star, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/providers/ConfirmDialogProvider';
import { usePermission } from '@/hooks/usePermission';
import { Brand } from '@/types/brand';

export default function BrandList() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const confirm = useConfirm();
    const { can } = usePermission();

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/brands');
            setBrands(data.data);
        } catch {
            toast.error("Error cargando marcas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    const handleDelete = (id: number) => {
        if (!can('delete_brands')) return;
        confirm({
            title: '¿Eliminar marca?',
            message: 'Esta acción borrará la marca si no tiene productos.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/brands/${id}`);
                    toast.success('Marca eliminada');
                    fetchBrands();
                } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Error al eliminar');
                }
            }
        });
    };

    const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Marcas</h1>
                {can('create_brands') && (
                    <Link href="/brands/create" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-slate-800 shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Nueva Marca
                    </Link>
                )}
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar marca..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 ring-slate-900"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-3 w-20">Logo</th>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3 text-center w-24">Destacada</th>
                            <th className="px-6 py-3 text-center w-24">Productos</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin inline text-slate-400" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-500">No se encontraron marcas.</td></tr>
                        ) : (
                            filtered.map(brand => (
                                <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3">
                                        <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-[10px] text-slate-400">Sin logo</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="font-bold text-slate-800">{brand.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">/{brand.slug}</div>
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {brand.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mx-auto" />}
                                    </td>
                                    <td className="px-6 py-3 text-center text-sm font-bold text-slate-600">
                                        {brand.products_count}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            {can('edit_brands') && (
                                                <Link href={`/brands/${brand.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                            )}
                                            {can('delete_brands') && (
                                                <button onClick={() => handleDelete(brand.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
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