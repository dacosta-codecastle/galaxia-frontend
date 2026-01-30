'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Edit2, Trash2, Plus, Tag, Palette, List, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirm } from '@/components/providers/ConfirmDialogProvider';
import { usePermission } from '@/hooks/usePermission';
import { useQuery } from '@tanstack/react-query';
import { Attribute, PaginatedResponse } from '@/types';

interface AxiosErrorType {
    response?: { data?: { message?: string } };
    message?: string;
}

export default function AttributeList() {
    const confirm = useConfirm();
    const { can } = usePermission();

    const { data: attributes, isLoading, refetch } = useQuery<Attribute[], AxiosErrorType>({
        queryKey: ['attributes'],
        queryFn: async () => {
            const res = await api.get<PaginatedResponse<Attribute>>('/admin/attributes');
            return Array.isArray(res.data) ? res.data : (res.data as any).data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const handleDelete = (id: number) => {
        if (!can('delete_attributes')) return;
        confirm({
            title: '¿Eliminar atributo?',
            message: 'Esto eliminará todas las variantes asociadas en los productos.',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/attributes/${id}`);
                    toast.success('Atributo eliminado');
                    refetch();
                } catch (error) {
                    const err = error as AxiosErrorType;
                    toast.error(err.response?.data?.message || 'Error al eliminar');
                }
            }
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'color': return <Palette className="w-3.5 h-3.5 text-purple-600" />;
            case 'button': return <Tag className="w-3.5 h-3.5 text-blue-600" />;
            default: return <List className="w-3.5 h-3.5 text-gray-600" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Atributos de Producto</h1>
                {can('create_attributes') && (
                    <Link href="/attributes/create" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-slate-800 shadow-lg active:scale-95 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Nuevo Atributo
                    </Link>
                )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                        <tr>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3 w-40">Tipo</th>
                            <th className="px-6 py-3">Valores</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin inline text-slate-400" /></td></tr>
                        ) : attributes && attributes.length > 0 ? (
                            attributes.map(attr => (
                                <tr key={attr.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-3 font-bold text-slate-800">{attr.name}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2 text-[10px] font-bold bg-white px-2 py-1 rounded-md border border-slate-200 uppercase w-fit shadow-sm">
                                            {getTypeIcon(attr.type)} {attr.type === 'button' ? 'Botón' : attr.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-2 flex-wrap items-center">
                                            {attr.values.slice(0, 6).map(val => (
                                                <div key={val.id} className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-full flex items-center gap-2 group/val relative">

                                                    {attr.type === 'color' && (
                                                        <>
                                                            {(val.swatch_image_url || val.swatch_image) ? (

                                                                <img
                                                                    src={val.swatch_image_url || val.swatch_image}
                                                                    alt={val.value}
                                                                    className="w-5 h-5 rounded-full object-cover border border-slate-300 shadow-sm"
                                                                    title="Textura/Imagen"
                                                                />
                                                            ) : val.secondary_color_hex ? (
                                                                <div
                                                                    className="w-5 h-5 rounded-full border border-slate-300 shadow-sm"
                                                                    style={{
                                                                        background: `linear-gradient(135deg, ${val.color_hex || '#000'} 50%, ${val.secondary_color_hex} 50%)`
                                                                    }}
                                                                    title={`Primario: ${val.color_hex}, Secundario: ${val.secondary_color_hex}`}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="w-5 h-5 rounded-full border border-slate-300 shadow-sm"
                                                                    style={{ backgroundColor: val.color_hex || '#000' }}
                                                                    title={`Color: ${val.color_hex}`}
                                                                />
                                                            )}
                                                        </>
                                                    )}

                                                    <span className="font-medium text-slate-700">{val.value}</span>

                                                    {val.category_codes && val.category_codes.length > 0 && (
                                                        <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold border border-blue-200" title={`Códigos: ${val.category_codes.join(', ')}`}>
                                                            {val.category_codes.length} Cat.
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {attr.values.length > 6 && <span className="text-xs text-slate-400 font-bold">+{attr.values.length - 6} más</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {can('edit_attributes') && (
                                                <Link href={`/attributes/${attr.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                            )}
                                            {can('delete_attributes') && (
                                                <button onClick={() => handleDelete(attr.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">No se encontraron atributos.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}