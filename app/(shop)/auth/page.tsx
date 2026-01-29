'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';

export default function ShopAuthPage() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = isRegister ? '/shop/register' : '/shop/login';
            const payload = isRegister
                ? { name, email, password, password_confirmation: password }
                : { email, password };

            const { data } = await api.post(endpoint, payload);

            localStorage.setItem('shop_token', data.token);

            toast.success(isRegister ? 'Cuenta creada' : 'Bienvenido');

            router.push('/shop/account');

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-8 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">Acceso a Clientes (Tienda)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nombre</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 mt-1"
                                value={name} onChange={e => setName(e.target.value)} required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            value={email} onChange={e => setEmail(e.target.value)} required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                        <input
                            type="password"
                            className="w-full border rounded-lg px-3 py-2 mt-1"
                            value={password} onChange={e => setPassword(e.target.value)} required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Procesando...' : (isRegister ? 'Registrarse' : 'Entrar')}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-blue-600 hover:underline font-medium"
                    >
                        {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>
            </Card>
        </div>
    );
}