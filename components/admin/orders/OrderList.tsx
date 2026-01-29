'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Package, Search, Calendar, DollarSign, User, Truck, ShoppingBag } from 'lucide-react';

export default function OrderList() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/orders').then(({ data }) => {
            setOrders(data.data);
            setLoading(false);
        });
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-slate-900 text-white';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'cancelled': return 'bg-red-50 text-red-600';
            default: return 'bg-yellow-50 text-yellow-700';
        }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Pedidos</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Pedido</th>
                            <th className="px-6 py-4">Cliente</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Método</th>
                            <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50 transition cursor-pointer group">
                                <td className="px-6 py-4">
                                    <Link href={`/admin/orders/${order.id}`} className="block">
                                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {order.order_number}
                                        </span>
                                        <div className="flex items-center text-xs text-slate-500 mt-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2 text-slate-400" />
                                        {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Invitado'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold uppercase text-slate-600">{order.payment_method}</span>
                                        <span className="flex items-center text-[10px] text-slate-500">
                                            {order.shipping_type === 'pickup' ? <ShoppingBag className="w-3 h-3 mr-1" /> : <Truck className="w-3 h-3 mr-1" />}
                                            {order.shipping_type === 'pickup' ? 'Retiro' : 'Envío'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                                    {formatCurrency(order.grand_total)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}