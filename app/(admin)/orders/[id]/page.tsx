import OrderDetail from "@/components/admin/orders/OrderDetail";

interface Props {
    params: Promise<{ id: string }>;
}

export const metadata = {
    title: 'Detalle de Pedido | Galaxia Admin',
};

export default async function OrderDetailPage({ params }: Props) {

    const { id } = await params;

    return <OrderDetail orderId={id} />;
}