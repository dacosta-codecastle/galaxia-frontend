'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
    Plus, Pencil, Trash2, Search, Filter,
    MoreHorizontal, ImageOff, Package, Box
} from 'lucide-react';

export default function ProductsListPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);


    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [search, statusFilter]);

    const fetchProducts = async (pageNo: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pageNo.toString());
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);

            const { data } = await api.get(`/admin/products?${params.toString()}`);
            setProducts(data.data);
            setPagination(data);
            setPage(pageNo);
        } catch { toast.error('Error cargando inventario'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar producto? Esta acción es irreversible.')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Producto eliminado');
            fetchProducts(page);
        } catch { toast.error('Error al eliminar'); }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">Publicado</span>;
            case 'draft': return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold border border-gray-200">Borrador</span>;
            case 'archived': return <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold border border-red-100">Archivado</span>;
            default: return status;
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Box className="mr-3 w-6 h-6 text-slate-600" /> Inventario
                    </h1>
                    <p className="text-gray-500 text-sm">Gestiona tu catálogo de productos.</p>
                </div>
                <Link href="/products/create" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-transform active:scale-95">
                    <Plus className="w-4 h-4 mr-2" /> Crear Producto
                </Link>
            </div>


            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por Nombre o SKU..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">Todos los Estados</option>
                        <option value="published">Publicados</option>
                        <option value="draft">Borradores</option>
                        <option value="archived">Archivados</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 w-20">Imagen</th>
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4">Marca / Categorías</th>
                            <th className="px-6 py-4 text-right">Precio</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {loading ? (
                            <tr><td colSpan={6} className="p-10 text-center text-slate-400">Cargando productos...</td></tr>
                        ) : products.length > 0 ? products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition group">
                                <td className="px-6 py-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">

                                        {product.main_image ? (
                                            <img src={`http://localhost:8000/storage/${product.main_image.url}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageOff className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="font-bold text-slate-800">{product.name}</div>
                                    <div className="text-xs text-slate-400 font-mono">SKU: {product.sku}</div>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="text-slate-700 font-medium">{product.brand?.name || 'Sin Marca'}</div>
                                    <div className="flex gap-1 mt-1">
                                        {product.categories?.slice(0, 2).map((c: any) => (
                                            <span key={c.id} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                                                {c.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-right font-mono font-bold text-slate-700">
                                    ${Number(product.price_regular).toFixed(2)}
                                </td>
                                <td className="px-6 py-3 text-center">
                                    {getStatusBadge(product.status)}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/products/edit/${product.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Pencil className="w-4 h-4" /></Link>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={6} className="p-10 text-center text-slate-400">No se encontraron productos.</td></tr>
                        )}
                    </tbody>
                </table>

                {pagination && pagination.last_page > 1 && (
                    <div className="p-4 border-t border-slate-100 flex justify-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => fetchProducts(page - 1)}
                            className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 text-sm text-slate-500">Página {page} de {pagination.last_page}</span>
                        <button
                            disabled={page === pagination.last_page}
                            onClick={() => fetchProducts(page + 1)}
                            className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50 text-sm"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}