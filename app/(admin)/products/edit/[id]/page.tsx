'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import ProductForm from '@/components/admin/products/ProductForm';

export default function EditProductPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/admin/products/${id}`)
           .then(res => setProduct(res.data))
           .catch(() => {}) // El toast lo manejará el componente global o podemos poner uno aquí
           .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-10 text-center">Cargando producto...</div>;
    if (!product) return <div className="p-10 text-center text-red-500">Producto no encontrado</div>;

    return <ProductForm product={product} />;
}