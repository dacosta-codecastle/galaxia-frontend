'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Edit, Trash2, UserPlus, Search, Shield, Phone, Clock, Filter, AlertCircle, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { useConfirm } from '@/components/providers/ConfirmDialogProvider';
import { useRoles } from '@/hooks/useRoles';
import { useDebounce } from '@/hooks/useDebounce';
import Can from '@/components/auth/Can';

export default function UserList() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const confirm = useConfirm();
    const { data: roles } = useRoles();

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, roleFilter, statusFilter]);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users', page, debouncedSearch, roleFilter, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);

            const res = await api.get(`/admin/users?${params.toString()}`);
            return res.data;
        },
        retry: 1,
        placeholderData: (prev) => prev
    });

    const handleDelete = (id: number) => {
        confirm({
            title: '¿Eliminar Usuario?',
            message: 'Esta acción es irreversible.',
            variant: 'danger',
            confirmText: 'Sí, Eliminar',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/users/${id}`);
                    toast.success('Usuario eliminado');
                    refetch();
                } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Error al eliminar');
                }
            }
        });
    };

    if (isLoading && !data) return <div className="p-20 text-center text-slate-400">Cargando usuarios...</div>;

    if (isError) return (
        <div className="p-10 text-center text-red-500 bg-red-50 rounded-xl border border-red-100 m-6">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-bold">Error al cargar usuarios</p>
            <p className="text-sm opacity-80">{(error as any)?.response?.data?.message || (error as Error).message}</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-bold transition">Reintentar</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
                    <p className="text-sm text-slate-500">Gestión de personal y accesos.</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                            type="text" placeholder="Buscar..."
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 transition"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative min-w-[140px]">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <select
                            className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 bg-white appearance-none cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="">Todos los Roles</option>
                            {roles?.map((r: any) => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative min-w-[140px]">
                        <div className={`absolute left-3 top-3 w-3 h-3 rounded-full ${statusFilter === 'active' ? 'bg-green-500' : statusFilter === 'disabled' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                        <select
                            className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 bg-white appearance-none cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Todos los Estados</option>
                            <option value="active">Activos</option>
                            <option value="disabled">Deshabilitados</option>
                        </select>
                    </div>

                    <Can permission="create_users">
                        <Link href="/users/create" className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-slate-800 shadow-lg transition">
                            <UserPlus className="w-4 h-4 mr-2" /> Nuevo
                        </Link>
                    </Can>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4">Teléfono</th>
                                <th className="px-6 py-4">Último Acceso</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data?.data?.length > 0 ? (
                                data.data.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition">

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.image_url ? (
                                                    <img src={user.image_url} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Shield className="w-3 h-3 text-slate-400" />
                                                <span className="capitalize font-medium text-slate-700">
                                                    {user.role || 'Sin Rol'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.phone ? (
                                                <div className="flex items-center gap-1.5 text-slate-600 font-mono text-xs">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {user.phone.toString().replace(/^503/, '').replace(/(\d{4})(\d{4})/, '$1-$2')}
                                                </div>
                                            ) : <span className="text-slate-300 italic">--</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Nunca'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.status === 'active' ?
                                                <Badge variant="success">Activo</Badge> :
                                                <Badge variant="danger">Deshabilitado</Badge>
                                            }
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">

                                                <Can permission="edit_users" fallback={

                                                    <span className="p-1.5 text-slate-200"><Lock className="w-4 h-4" /></span>
                                                }>
                                                    <Link href={`/users/${user.id}`} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition">
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Can>

                                                <Can permission="delete_users">
                                                    <button onClick={() => handleDelete(user.id)} className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </Can>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">
                                        No se encontraron resultados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={data} onPageChange={setPage} />
            </Card>
        </div>
    );
}