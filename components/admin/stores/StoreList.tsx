'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Store as StoreIcon, MapPin, Edit, Trash2, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function StoreList() {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/stores').then(({ data }) => {
            setStores(data);
            setLoading(false);
        });
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar sucursal?')) return;
        try {
            await api.delete(`/admin/stores/${id}`);
            setStores(prev => prev.filter(s => s.id !== id));
            toast.success('Eliminado');
        } catch { toast.error('Error'); }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Sucursales</h1>
                    <p className="text-sm text-slate-500">Gestión de puntos de venta físicos.</p>
                </div>
                <Link href="stores/create" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center shadow-lg shadow-slate-900/20">
                    <StoreIcon className="w-4 h-4 mr-2" /> Nueva Sucursal
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                    <div key={store.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">

                        <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${store.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>

                        <div className="flex items-start mb-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mr-4 text-slate-700">
                                <StoreIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{store.name}</h3>
                                <p className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">{store.code}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-start text-sm text-slate-600">
                                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-400 shrink-0" />
                                <span className="line-clamp-2">{store.address}, {store.city}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-6">
                            {store.is_pickup_enabled ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase border border-blue-100">
                                    <ShoppingBag className="w-3 h-3 mr-1" /> Retiro en Tienda
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-[10px] font-bold uppercase border border-slate-100">
                                    No permite retiro
                                </span>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`stores/${store.id}`} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition">
                                <Edit className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(store.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {stores.length === 0 && !loading && (
                    <Link href="stores/create" className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-600 transition h-64">
                        <StoreIcon className="w-8 h-8 mb-2" />
                        <span className="font-bold text-sm">Crear primera sucursal</span>
                    </Link>
                )}
            </div>
        </div>
    );
}