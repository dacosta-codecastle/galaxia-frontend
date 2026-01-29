'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { ArrowLeft, Printer, Truck, MapPin, User, CreditCard, Package } from 'lucide-react';

export default function OrderDetail({ orderId }: { orderId: string }) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/admin/orders/${orderId}`).then(({ data }) => {
            setOrder(data);
            setLoading(false);
        });
    }, [orderId]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            await api.put(`/admin/orders/${orderId}`, { status: newStatus });
            setOrder((prev: any) => ({ ...prev, status: newStatus }));
            toast.success(`Pedido marcado como ${newStatus}`);
        } catch { toast.error('Error actualizando estado'); }
    };

    if (loading) return <div className="p-10 text-center">Cargando pedido...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">{order.order_number}</h1>
                        <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold flex items-center hover:bg-slate-50">
                        <Printer className="w-4 h-4 mr-2" /> Imprimir
                    </button>

                    <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold border-none outline-none cursor-pointer hover:bg-slate-800"
                    >
                        <option value="pending">Pendiente</option>
                        <option value="processing">Procesando</option>
                        <option value="shipped">Enviado</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                            <Package className="w-5 h-5 text-slate-400" />
                            <h3 className="font-bold text-slate-800">Detalle de Productos</h3>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-3">Producto</th>
                                    <th className="px-6 py-3 text-center">Cant.</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {order.items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{item.product_name}</p>
                                            <p className="text-xs text-slate-500 font-mono mb-1">{item.sku}</p>
                                            {item.variant_attributes_json && (
                                                <div className="flex gap-1">
                                                    {Object.values(item.variant_attributes_json).map((attr: any, i) => (
                                                        <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 font-bold uppercase">{attr}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium">{item.qty}</td>
                                        <td className="px-6 py-4 text-right font-bold">${item.line_total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="bg-slate-50 p-6 flex flex-col items-end gap-2 text-sm">
                            <div className="flex justify-between w-48 text-slate-500">
                                <span>Subtotal</span>
                                <span>${order.subtotal}</span>
                            </div>
                            <div className="flex justify-between w-48 text-slate-500">
                                <span>Envío</span>
                                <span>${order.shipping_total}</span>
                            </div>
                            <div className="flex justify-between w-48 text-slate-500">
                                <span>Impuestos</span>
                                <span>${order.tax_total}</span>
                            </div>
                            <div className="flex justify-between w-48 font-black text-lg text-slate-900 pt-2 border-t border-slate-200 mt-2">
                                <span>Total</span>
                                <span>${order.grand_total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /> Cliente</h3>
                        {order.customer ? (
                            <div className="text-sm">
                                <p className="font-bold text-blue-600">{order.customer.first_name} {order.customer.last_name}</p>
                                <p className="text-slate-500">{order.customer.email}</p>
                                <p className="text-slate-500">{order.customer.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">Cliente Invitado (Guest)</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-slate-400" /> Entrega</h3>
                        {order.shipping_type === 'pickup' ? (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <span className="text-xs font-bold text-blue-700 uppercase block mb-1">Retiro en Tienda</span>
                                <p className="text-sm font-bold text-slate-800">{order.store?.name}</p>
                                <p className="text-xs text-slate-500">{order.store?.address}</p>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-600">
                                <p className="font-bold text-slate-900 mb-1">Dirección de Envío:</p>
                                {order.shipping_address_json ? (
                                    <>
                                        <p>{order.shipping_address_json.address_line1}</p>
                                        <p>{order.shipping_address_json.city}, {order.shipping_address_json.state}</p>
                                        <p>{order.shipping_address_json.country}</p>
                                    </>
                                ) : <p className="text-red-500">Datos no disponibles</p>}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-slate-400" /> Pago</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-500 uppercase font-bold">{order.payment_method}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {order.payment_status}
                            </span>
                        </div>
                        {order.payment && (
                            <p className="text-xs text-slate-400 font-mono break-all">ID: {order.payment.provider_payment_id || 'N/A'}</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}