'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { User, MapPin, LogOut, Plus, Trash2, Home, Star } from 'lucide-react';
import { CustomerProfile, CustomerAddress } from '@/types/customer';

export default function MyAccountPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: 'Casa',
        address_line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'MX',
        type: 'shipping',
        is_default: false
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [profileRes, addressRes] = await Promise.all([
                    api.get('/shop/me'),
                    api.get('/shop/addresses')
                ]);

                setProfile(profileRes.data.data);
                setAddresses(addressRes.data.data);
            } catch (error) {
                toast.error("Sesión expirada o inválida");
                router.push('/shop/auth');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('shop_token');
        router.push('/shop/auth');
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/shop/addresses', newAddress);
            toast.success("Dirección agregada");

            const res = await api.get('/shop/addresses');
            setAddresses(res.data.data);
            setShowAddressForm(false);
            setNewAddress({ ...newAddress, address_line1: '', city: '', postal_code: '' });
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Error al guardar");
        }
    };

    const handleDeleteAddress = async (id: number) => {
        if (!confirm("¿Borrar dirección?")) return;
        try {
            await api.delete(`/shop/addresses/${id}`);
            setAddresses(addresses.filter(a => a.id !== id));
            toast.success("Dirección eliminada");
        } catch {
            toast.error("Error al eliminar");
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mi Cuenta</h1>
                    <p className="text-slate-500">Bienvenido, {profile?.name}</p>
                </div>
                <button onClick={handleLogout} className="flex items-center text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition">
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" /> Mis Datos
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <label className="text-slate-400 text-xs">Email</label>
                                <p className="font-medium text-slate-800">{profile?.email}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-xs">Teléfono</label>
                                <p className="font-medium text-slate-800">{profile?.phone || 'No registrado'}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-xs">RFC / NIT</label>
                                <p className="font-medium text-slate-800">{profile?.billing?.tax_id || 'No registrado'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" /> Mis Direcciones
                        </h2>
                        <button
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-slate-800"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Nueva Dirección
                        </button>
                    </div>

                    {showAddressForm && (
                        <form onSubmit={handleAddAddress} className="bg-slate-50 p-6 rounded-2xl border border-blue-200 animate-in fade-in slide-in-from-top-4">
                            <h3 className="font-bold text-sm mb-4 text-blue-800">Agregar Nueva Dirección</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input placeholder="Alias (Ej. Casa)" className="p-2 border rounded" required value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} />
                                <input placeholder="Calle y Número" className="p-2 border rounded" required value={newAddress.address_line1} onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })} />
                                <input placeholder="Ciudad" className="p-2 border rounded" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                <input placeholder="Estado" className="p-2 border rounded" required value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                <input placeholder="Código Postal" className="p-2 border rounded" required value={newAddress.postal_code} onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })} />
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={newAddress.is_default} onChange={e => setNewAddress({ ...newAddress, is_default: e.target.checked })} />
                                        <span className="text-sm">Marcar como Predeterminada</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 text-sm text-slate-500">Cancelar</button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Guardar Dirección</button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {addresses.map(addr => (
                            <div key={addr.id} className={`p-4 rounded-xl border flex justify-between items-start transition-all ${addr.is_default ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                <div className="flex gap-4">
                                    <div className={`mt-1 p-2 rounded-full ${addr.is_default ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                        <Home className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-900">{addr.alias}</h4>
                                            {addr.is_default && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Default</span>}
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">{addr.formatted}</p>
                                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">{addr.type}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDeleteAddress(addr.id)} className="text-slate-300 hover:text-red-500 p-2">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {addresses.length === 0 && (
                            <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-xl">
                                No tienes direcciones guardadas.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}