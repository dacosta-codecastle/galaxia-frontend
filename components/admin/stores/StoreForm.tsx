'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Save, ArrowLeft, Clock, Map } from 'lucide-react';

interface StoreFormProps {
    storeId?: string;
}

const DAYS = [
    { key: 'mon', label: 'Lunes' },
    { key: 'tue', label: 'Martes' },
    { key: 'wed', label: 'Miércoles' },
    { key: 'thu', label: 'Jueves' },
    { key: 'fri', label: 'Viernes' },
    { key: 'sat', label: 'Sábado' },
    { key: 'sun', label: 'Domingo' },
];

export default function StoreForm({ storeId }: StoreFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '', code: '', address: '', city: '', country: 'SV', phone: '',
        latitude: '', longitude: '',
        is_pickup_enabled: true, is_active: true,
        hours_json: {} as Record<string, string>
    });

    const [schedule, setSchedule] = useState<Record<string, { start: string, end: string, closed: boolean }>>({});

    useEffect(() => {
        const initialSchedule: any = {};
        DAYS.forEach(d => initialSchedule[d.key] = { start: '09:00', end: '18:00', closed: false });
        setSchedule(initialSchedule);

        if (storeId) {
            api.get(`/admin/stores/${storeId}`).then(({ data }) => {
                setFormData({
                    ...data,
                    latitude: data.latitude || '',
                    longitude: data.longitude || '',
                    hours_json: data.hours_json || {}
                });

                if (data.hours_json) {
                    const parsedSchedule: any = {};
                    DAYS.forEach(d => {
                        const val = data.hours_json[d.key];
                        if (val && val !== 'CERRADO') {
                            const [start, end] = val.split('-');
                            parsedSchedule[d.key] = { start, end, closed: false };
                        } else {
                            parsedSchedule[d.key] = { start: '09:00', end: '18:00', closed: true };
                        }
                    });
                    setSchedule(parsedSchedule);
                }
            });
        }
    }, [storeId]);

    const handleScheduleChange = (dayKey: string, field: 'start' | 'end' | 'closed', value: any) => {
        setSchedule(prev => ({
            ...prev,
            [dayKey]: { ...prev[dayKey], [field]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const finalHours: Record<string, string> = {};
        Object.keys(schedule).forEach(day => {
            const s = schedule[day];
            finalHours[day] = s.closed ? 'CERRADO' : `${s.start}-${s.end}`;
        });

        const payload = { ...formData, hours_json: finalHours };

        try {
            if (storeId) await api.put(`/admin/stores/${storeId}`, payload);
            else await api.post('/admin/stores', payload);

            toast.success('Sucursal guardada');
            router.push('stores');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 outline-none";
    const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5";

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20 p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition"><ArrowLeft className="w-5 h-5" /></button>
                    <h1 className="text-2xl font-bold text-slate-900">{storeId ? 'Editar Sucursal' : 'Nueva Sucursal'}</h1>
                </div>
                <button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 flex items-center shadow-lg shadow-slate-900/20 disabled:opacity-50 text-sm">
                    <Save className="w-4 h-4 mr-2" /> {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-6 flex items-center"><Map className="w-5 h-5 mr-2 text-blue-600" /> Datos Generales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Nombre Sucursal</label>
                                <input required type="text" className={inputClass} placeholder="Ej: Galaxia Mall Central" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Código Único</label>
                                <input required type="text" className={`${inputClass} font-mono`} placeholder="ST-001" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Teléfono</label>
                                <input type="text" className={inputClass} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Dirección Completa</label>
                                <input required type="text" className={inputClass} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Ciudad</label>
                                <input required type="text" className={inputClass} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>País</label>
                                <select className={inputClass} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}>
                                    <option value="SV">El Salvador</option>
                                    <option value="GT">Guatemala</option>
                                    <option value="HN">Honduras</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 mb-4">Ubicación (Opcional)</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Latitud</label>
                                    <input type="number" step="any" className={inputClass} value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Longitud</label>
                                    <input type="number" step="any" className={inputClass} value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-6 flex items-center"><Clock className="w-5 h-5 mr-2 text-orange-500" /> Horarios</h3>

                        <div className="space-y-3">
                            {DAYS.map(day => {
                                const s = schedule[day.key] || { start: '', end: '', closed: true };
                                return (
                                    <div key={day.key} className="flex items-center justify-between text-sm pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                        <div className="w-20 font-bold text-slate-600">{day.label}</div>
                                        <div className="flex items-center gap-2">
                                            {s.closed ? (
                                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">CERRADO</span>
                                            ) : (
                                                <>
                                                    <input type="time" className="bg-slate-50 border border-slate-200 rounded px-1 text-xs outline-none focus:border-slate-900" value={s.start} onChange={e => handleScheduleChange(day.key, 'start', e.target.value)} />
                                                    <span className="text-slate-400">-</span>
                                                    <input type="time" className="bg-slate-50 border border-slate-200 rounded px-1 text-xs outline-none focus:border-slate-900" value={s.end} onChange={e => handleScheduleChange(day.key, 'end', e.target.value)} />
                                                </>
                                            )}
                                            <input type="checkbox" className="ml-2" checked={!s.closed} onChange={e => handleScheduleChange(day.key, 'closed', !e.target.checked)} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-lg mb-4">Configuración</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-xl hover:bg-slate-50 transition">
                                <span className="font-bold text-sm text-slate-700">Estado Activo</span>
                                <input type="checkbox" className="toggle-checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer p-3 border rounded-xl hover:bg-slate-50 transition">
                                <div>
                                    <span className="block font-bold text-sm text-slate-700">Retiro en Tienda</span>
                                    <span className="block text-xs text-slate-400">Habilitar Click & Collect</span>
                                </div>
                                <input type="checkbox" className="toggle-checkbox" checked={formData.is_pickup_enabled} onChange={e => setFormData({ ...formData, is_pickup_enabled: e.target.checked })} />
                            </label>
                        </div>
                    </div>
                </div>

            </div>
        </form>
    );
}