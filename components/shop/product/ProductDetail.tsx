'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Truck, ShieldCheck, Ruler, ChevronDown, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailProps {
    product: any;
}

export default function ProductDetail({ product }: ProductDetailProps) {

    const [selectedImage, setSelectedImage] = useState<string>(
        product.main_image ? `http://localhost:8000/storage/${product.main_image.url}` : ''
    );

    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [currentVariant, setCurrentVariant] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (!product.variants?.length) return;

        const match = product.variants.find((v: any) => {
            const attrs = v.attributes_json || {};
            return Object.entries(selectedAttributes).every(([key, val]) => attrs[key] === val);
        });

        setCurrentVariant(match || null);

        if (match && match.images && match.images.length > 0) {
            setSelectedImage(`http://localhost:8000/storage/${match.images[0].url}`);
        }
    }, [selectedAttributes, product.variants]);

    const handleAttributeSelect = (attrName: string, value: string) => {
        setSelectedAttributes(prev => ({ ...prev, [attrName]: value }));
    };

    const handleAddToCart = () => {
        const requiredAttrs = product.attributes?.map((a: any) => a.name) || [];
        const missing = requiredAttrs.filter((a: any) => !selectedAttributes[a]);

        if (missing.length > 0) {
            toast.error(`Por favor selecciona: ${missing.join(', ')}`);
            return;
        }

        if (currentVariant && currentVariant.stock_quantity < 1) {
            toast.error('Variante sin stock');
            return;
        }

        toast.success(`Agregado al carrito: ${product.name} (${Object.values(selectedAttributes).join('/')})`);
    };

    const price = currentVariant ? currentVariant.price_regular : product.price_regular;
    const salePrice = currentVariant ? currentVariant.price_sale : product.price_sale;

    return (
        <div className="container mx-auto px-4 py-10 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                <div className="space-y-4">

                    <div className="aspect-[4/5] bg-gray-50 overflow-hidden relative border border-gray-100 group">
                        {selectedImage ? (
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">Sin imagen</div>
                        )}
                        {salePrice && <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">Oferta</span>}
                    </div>

                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-5 gap-4">
                            {product.images.map((img: any) => {
                                const url = `http://localhost:8000/storage/${img.url}`;
                                return (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(url)}
                                        className={`aspect-square bg-gray-50 border overflow-hidden transition-all ${selectedImage === url ? 'border-black opacity-100 ring-1 ring-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex flex-col">

                    <div className="mb-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{product.brand?.name || 'Galaxia'}</span>
                        <h1 className="text-3xl md:text-4xl font-black text-black mt-2 uppercase leading-tight tracking-tight">{product.name}</h1>
                        <p className="text-sm text-gray-500 mt-2">{product.sku}</p>
                    </div>

                    <div className="mb-8 pb-8 border-b border-gray-100">
                        {salePrice ? (
                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl font-bold text-black">${salePrice}</span>
                                <span className="text-lg text-gray-400 line-through">${price}</span>
                                <span className="text-xs text-red-600 font-bold border border-red-200 bg-red-50 px-2 py-1 uppercase">Save {Math.round(((price - salePrice) / price) * 100)}%</span>
                            </div>
                        ) : (
                            <span className="text-3xl font-bold text-black">${price}</span>
                        )}
                    </div>

                    {product.attributes && product.attributes.map((attr: any) => (
                        <div key={attr.id} className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-black uppercase tracking-wide">{attr.name}: <span className="text-gray-500 font-normal capitalize">{selectedAttributes[attr.name]}</span></span>
                                {attr.name.toLowerCase() === 'talla' && (
                                    <button className="flex items-center text-xs text-gray-500 underline hover:text-black transition">
                                        <Ruler className="w-3 h-3 mr-1" /> Guía de Talles
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {attr.values.map((val: any) => {
                                    const isSelected = selectedAttributes[attr.name] === val.value;
                                    return (
                                        <button
                                            key={val.id}
                                            onClick={() => handleAttributeSelect(attr.name, val.value)}
                                            className={`
                                                min-w-[3rem] px-4 py-3 text-sm border transition-all duration-200
                                                ${isSelected
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-gray-200 text-gray-700 hover:border-black'
                                                }
                                            `}
                                        >
                                            {val.value}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-4 mb-8">
                        <div className="flex items-center border border-gray-300 w-32 justify-between px-4">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl font-medium hover:text-gray-500">-</button>
                            <span className="text-sm font-bold">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="text-xl font-medium hover:text-gray-500">+</button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={currentVariant && currentVariant.stock_quantity < 1}
                            className={`flex-1 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm py-4 px-8 transition-all
                                ${currentVariant && currentVariant.stock_quantity < 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-black text-white hover:bg-gray-900 shadow-lg'
                                }
                            `}
                        >
                            {currentVariant && currentVariant.stock_quantity < 1 ? 'Sin Stock' : (
                                <>
                                    <ShoppingBag className="w-5 h-5" /> Agregar al Carrito
                                </>
                            )}
                        </button>

                        <button className="w-14 border border-gray-300 flex items-center justify-center hover:border-black transition-colors text-gray-400 hover:text-red-500">
                            <Heart className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="border-t border-gray-100 divide-y divide-gray-100">

                        <details className="group">
                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-4 text-sm uppercase tracking-wide group-hover:text-gray-600 transition">
                                <span>Descripción</span>
                                <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4" /></span>
                            </summary>
                            <div className="text-gray-600 text-sm leading-relaxed pb-4 animate-in fade-in">
                                {product.description || 'Sin descripción disponible.'}
                            </div>
                        </details>

                        <details className="group">
                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-4 text-sm uppercase tracking-wide group-hover:text-gray-600 transition">
                                <span className="flex items-center gap-2"><Truck className="w-4 h-4" /> Envío y Entrega</span>
                                <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4" /></span>
                            </summary>
                            <div className="text-gray-600 text-sm leading-relaxed pb-4">
                                <p>Envío estándar gratuito en pedidos superiores a $100.</p>
                                <p className="mt-2">Entrega estimada: 3-5 días laborables.</p>
                            </div>
                        </details>

                        <details className="group">
                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none py-4 text-sm uppercase tracking-wide group-hover:text-gray-600 transition">
                                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Garantía y Devoluciones</span>
                                <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4" /></span>
                            </summary>
                            <div className="text-gray-600 text-sm leading-relaxed pb-4">
                                <p>Devoluciones gratuitas dentro de los 30 días posteriores a la compra. El producto debe estar en su estado original.</p>
                            </div>
                        </details>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Share2 className="w-4 h-4" /> Compartir Producto
                    </div>

                </div>
            </div>
        </div>
    );
}