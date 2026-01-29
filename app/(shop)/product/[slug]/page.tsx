import { notFound } from 'next/navigation';
import api from '@/lib/axios';
import ProductDetail from '@/components/shop/product/ProductDetail';

interface Props {
    params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
    try {
        const { data } = await api.get(`/shop/products/${slug}`);
        return data.data || data;
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;

    const product = await getProduct(slug);
    if (!product) return { title: 'Producto no encontrado' };

    return {
        title: `${product.name} | Galaxia`,
        description: product.short_description || product.description,
        openGraph: {
            images: product.main_image ? [product.main_image.url] : [],
        },
    };
}

export default async function ProductPage({ params }: Props) {

    const { slug } = await params;

    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen">
            <ProductDetail product={product} />
        </div>
    );
}