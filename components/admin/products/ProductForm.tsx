'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
    Save, X, ImagePlus, Layers, Box, Tag,
    Settings, ArrowLeft, Trash2, Settings2, AlertCircle, Check
} from 'lucide-react';

const inputClass = "w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none placeholder:text-slate-400 transition-all shadow-sm hover:border-slate-400 disabled:bg-slate-100 disabled:text-slate-500";
const labelClass = "block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5";
const tabButtonClass = (active: boolean) => `w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-white text-slate-900 shadow-md border border-slate-100 ring-1 ring-slate-900/5' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`;

interface ProductFormProps {
    product?: any;
}

export default function ProductForm({ product }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [sports, setSports] = useState<any[]>([]);
    const [attributes, setAttributes] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '', sku: '', slug: '', description: '', short_description: '',
        brand_id: '', status: 'draft',
        price_regular: 0, price_sale: 0,
        is_featured: false,
        categories: [] as number[],
        sports: [] as number[],
        seo_title: '', seo_description: '',
        robots_index: true, robots_follow: true
    });

    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [selectedMediaIds, setSelectedMediaIds] = useState<number[]>([]);

    const [variantConfig, setVariantConfig] = useState<Record<string, number[]>>({});
    const [variants, setVariants] = useState<any[]>([]);

    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentVariantId, setCurrentVariantId] = useState<number | null>(null);
    const [tempSelectedImages, setTempSelectedImages] = useState<number[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [b, c, s, a] = await Promise.all([
                    api.get('/admin/brands'),
                    api.get('/admin/categories'),
                    api.get('/admin/sports'),
                    api.get('/admin/attributes')
                ]);
                setBrands(b.data);
                setCategories(c.data);
                setSports(s.data);
                setAttributes(a.data);
            } catch { toast.error('Error cargando datos del sistema'); }
        };
        loadData();

        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku,
                slug: product.slug,
                description: product.description || '',
                short_description: product.short_description || '',
                brand_id: product.brand_id || '',
                status: product.status,
                price_regular: product.price_regular,
                price_sale: product.price_sale || 0,
                is_featured: Boolean(product.is_featured),
                categories: product.categories.map((c: any) => c.id),
                sports: product.sports.map((s: any) => s.id),
                seo_title: product.seo_title || '',
                seo_description: product.seo_description || '',
                robots_index: Boolean(product.robots_index),
                robots_follow: Boolean(product.robots_follow)
            });
            setExistingImages(product.images || []);

            const preparedVariants = (product.variants || []).map((v: any) => ({
                ...v,
                image_ids: v.images ? v.images.map((img: any) => img.id) : []
            }));
            setVariants(preparedVariants);
        }
    }, [product]);

    const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

    const toggleArraySelection = (field: 'categories' | 'sports', id: number) => {
        setFormData(prev => {
            const list = prev[field];
            return list.includes(id) ? { ...prev, [field]: list.filter(i => i !== id) } : { ...prev, [field]: [...list, id] };
        });
    };

    const toggleMediaSelection = (id: number) => {
        setSelectedMediaIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleMassDeleteImages = async () => {
        if (selectedMediaIds.length === 0) return;
        if (!confirm(`¿Estás seguro de eliminar ${selectedMediaIds.length} imágenes?`)) return;

        setLoading(true);
        try {
            await api.delete('/admin/product-images/mass-destroy', { data: { ids: selectedMediaIds } });
            setExistingImages(prev => prev.filter(img => !selectedMediaIds.includes(img.id)));
            setSelectedMediaIds([]);
            toast.success('Imágenes eliminadas');
        } catch { toast.error('Error al eliminar imágenes'); }
        finally { setLoading(false); }
    };

    const openImageModal = (variantId: number) => {
        const variant = variants.find(v => v.id === variantId);
        if (!variant) return;
        setCurrentVariantId(variantId);
        setTempSelectedImages(variant.image_ids || []);
        setIsImageModalOpen(true);
    };

    const toggleTempImage = (imageId: number) => {
        setTempSelectedImages(prev => prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]);
    };

    const saveVariantImages = async () => {
        if (currentVariantId === null) return;

        // Optimismo UI
        setVariants(prev => prev.map(v => v.id === currentVariantId ? { ...v, image_ids: tempSelectedImages } : v));

        try {
            await api.put(`/admin/variants/${currentVariantId}/images`, { image_ids: tempSelectedImages });
            toast.success('Imágenes vinculadas');
        } catch { toast.error('Error al guardar vinculación'); }
        finally { setIsImageModalOpen(false); }
    };

    const toggleVariantConfig = (attrId: number, valId: number) => {
        setVariantConfig(prev => {
            const current = prev[attrId] || [];
            return current.includes(valId) ? { ...prev, [attrId]: current.filter(v => v !== valId) } : { ...prev, [attrId]: [...current, valId] };
        });
    };

    const handleGenerateVariants = async () => {
        if (!product?.id) return toast.error('Guarda el producto antes de generar');
        const hasSelection = Object.values(variantConfig).some(arr => arr.length > 0);
        if (!hasSelection) return toast.error('Selecciona atributos primero');

        setLoading(true);
        try {
            const { data } = await api.post(`/admin/products/${product.id}/variants/generate`, { selection: variantConfig });
            toast.success(data.message);
            const newVariants = data.variants.map((v: any) => ({ ...v, image_ids: [] }));
            setVariants(newVariants);
            setVariantConfig({});
        } catch (error: any) { toast.error(error.response?.data?.message || 'Error'); }
        finally { setLoading(false); }
    };

    const updateVariantField = async (variantId: number, field: string, value: any) => {
        setVariants(prev => prev.map(v => v.id === variantId ? { ...v, [field]: value } : v));
        try { await api.put(`/admin/variants/${variantId}`, { [field]: value }); } catch { toast.error('Error guardando variante'); }
    };

    const deleteVariant = async (id: number) => {
        if (!confirm('¿Eliminar variante?')) return;
        try {
            await api.delete(`/admin/variants/${id}`);
            setVariants(prev => prev.filter(v => v.id !== id));
            toast.success('Variante eliminada');
        } catch { toast.error('Error'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) value.forEach(v => payload.append(`${key}[]`, String(v)));
            else payload.append(key, String(value));
        });
        images.forEach(file => payload.append('new_images[]', file));
        if (product) payload.append('_method', 'PUT');

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (product) await api.post(`/admin/products/${product.id}`, payload, config);
            else await api.post('/admin/products', payload, config);

            toast.success('Producto guardado correctamente');
            if (!product) router.push('/admin/products');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error al guardar';
            const vErrors = error.response?.data?.errors;
            if (vErrors?.['new_images.0']) toast.error(`Error en imagen: ${vErrors['new_images.0'][0]}`);
            else toast.error(msg);
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-20">

            <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50/95 backdrop-blur z-20 py-4 border-b border-gray-200">
                <div className="flex items-center">
                    <button type="button" onClick={() => router.back()} className="mr-4 p-2 hover:bg-white rounded-full transition shadow-sm border border-transparent hover:border-gray-200"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{product ? 'Editar Producto' : 'Nuevo Producto'}</h1>
                        <p className="text-sm text-slate-500 font-mono">{product?.sku || 'Borrador'}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => router.back()} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-white rounded-xl text-sm transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 flex items-center shadow-lg shadow-slate-900/20 disabled:opacity-50 transition-transform active:scale-95 text-sm">
                        <Save className="w-4 h-4 mr-2" /> {loading ? 'Guardando...' : 'Guardar Producto'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                <div className="lg:w-64 flex-shrink-0 space-y-2 sticky top-28 h-fit">
                    {[
                        { id: 'general', label: 'General', icon: Box },
                        { id: 'organization', label: 'Organización', icon: Layers },
                        { id: 'media', label: 'Multimedia', icon: ImagePlus },
                        { id: 'variants', label: 'Variantes', icon: Tag },
                        { id: 'seo', label: 'SEO & Meta', icon: Settings },
                    ].map((tab) => (
                        <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={tabButtonClass(activeTab === tab.id)}>
                            <tab.icon className={`w-4 h-4 mr-3 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>


                <div className="flex-1 space-y-6">


                    <div className={activeTab === 'general' ? 'block space-y-6 animate-in' : 'hidden'}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg mb-6 text-slate-800 flex items-center"><Settings2 className="w-5 h-5 mr-2 text-slate-400" /> Información Básica</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Nombre del Producto</label>
                                    <input required type="text" className={inputClass} placeholder="Ej: Nike Air Zoom Pegasus 39" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>SKU (Código Único)</label>
                                    <input required type="text" className={`${inputClass} font-mono`} placeholder="NIKE-PEG-39" value={formData.sku} onChange={e => handleChange('sku', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Estado</label>
                                    <select className={inputClass} value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                                        <option value="draft">Borrador (Oculto)</option>
                                        <option value="published">Publicado (Visible)</option>
                                        <option value="archived">Archivado</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Descripción Corta</label>
                                    <textarea className={inputClass} rows={3} placeholder="Resumen breve para listados..." value={formData.short_description} onChange={e => handleChange('short_description', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Descripción Detallada</label>
                                    <textarea className={inputClass} rows={6} placeholder="Detalles completos del producto..." value={formData.description} onChange={e => handleChange('description', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg mb-6 text-slate-800">Precios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Precio Regular</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-2.5 text-slate-500 font-bold">$</span>
                                        <input type="number" step="0.01" className={`${inputClass} pl-8`} value={formData.price_regular} onChange={e => handleChange('price_regular', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Precio Oferta (Opcional)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-2.5 text-slate-500 font-bold">$</span>
                                        <input type="number" step="0.01" className={`${inputClass} pl-8`} value={formData.price_sale} onChange={e => handleChange('price_sale', e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex items-center pt-4">
                                    <label className="flex items-center cursor-pointer group">
                                        <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 transition-colors" checked={formData.is_featured} onChange={e => handleChange('is_featured', e.target.checked)} />
                                        <span className="ml-3 text-sm font-bold text-slate-700 group-hover:text-slate-900">Marcar como Destacado</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className={activeTab === 'organization' ? 'block space-y-6 animate-in' : 'hidden'}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label className={labelClass}>Marca</label>
                                    <select className={inputClass} value={formData.brand_id} onChange={e => handleChange('brand_id', e.target.value)}>
                                        <option value="">-- Seleccionar Marca --</option>
                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Deportes Relacionados</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {sports.map(sport => (
                                            <button key={sport.id} type="button" onClick={() => toggleArraySelection('sports', sport.id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.sports.includes(sport.id) ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                                                {sport.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Categorías</label>
                                    <div className="border border-slate-200 rounded-xl p-4 max-h-80 overflow-y-auto bg-slate-50 custom-scrollbar">
                                        {categories.map(cat => (
                                            <label key={cat.id} className="flex items-center py-2 px-3 cursor-pointer hover:bg-white hover:shadow-sm rounded-lg transition-all mb-1">
                                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900" checked={formData.categories.includes(cat.id)} onChange={() => toggleArraySelection('categories', cat.id)} />
                                                <span className={`text-sm ml-3 ${cat.parent_id ? 'text-slate-600 pl-4 border-l-2 border-slate-200' : 'font-bold text-slate-900'}`}>
                                                    {cat.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={activeTab === 'media' ? 'block animate-in' : 'hidden'}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">

                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer relative group mb-8">
                                <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => { if (e.target.files) setImages([...images, ...Array.from(e.target.files)]); }} />
                                <div className="flex flex-col items-center group-hover:scale-105 transition-transform">
                                    <div className="p-4 bg-white rounded-full shadow-sm mb-3"><ImagePlus className="w-8 h-8 text-slate-400" /></div>
                                    <p className="font-bold text-slate-700 text-lg">Arrastra imágenes o haz clic</p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">JPG, PNG, WEBP (Max 20MB)</p>
                                </div>
                            </div>

                            {selectedMediaIds.length > 0 && (
                                <div className="flex items-center justify-between bg-red-50 border border-red-100 p-4 rounded-xl mb-6 animate-in fade-in slide-in-from-top-2">
                                    <span className="text-red-800 font-bold text-sm flex items-center">
                                        <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs mr-2">{selectedMediaIds.length}</span>
                                        imágenes seleccionadas
                                    </span>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setSelectedMediaIds([])} className="px-3 py-1.5 text-slate-600 text-xs font-bold hover:bg-white rounded-lg">Cancelar</button>
                                        <button type="button" onClick={handleMassDeleteImages} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 shadow-sm flex items-center">
                                            <Trash2 className="w-3 h-3 mr-1.5" /> Eliminar Selección
                                        </button>
                                    </div>
                                </div>
                            )}


                            {(images.length > 0 || existingImages.length > 0) && (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

                                    {existingImages.map((img) => {
                                        const isSelected = selectedMediaIds.includes(img.id);
                                        return (
                                            <div key={img.id} onClick={() => toggleMediaSelection(img.id)}
                                                className={`relative group aspect-square bg-white rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-200 hover:border-blue-400'}`}>
                                                <img src={`http://localhost:8000/storage/${img.url}`} className="w-full h-full object-cover" />
                                                <div className={`absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-red-500 border-red-500' : 'bg-white/80 border-slate-300'}`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {images.map((file, idx) => (
                                        <div key={idx} className="relative group aspect-square bg-white rounded-xl overflow-hidden border-2 border-dashed border-blue-300 opacity-75">
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                                            <div className="absolute bottom-0 w-full bg-blue-600 text-white text-[9px] p-1 text-center font-bold">Por subir</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className={activeTab === 'variants' ? 'block space-y-6 animate-in' : 'hidden'}>
                        {!product ? (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-8 rounded-2xl text-center flex flex-col items-center">
                                <AlertCircle className="w-10 h-10 mb-3 text-amber-500" />
                                <h3 className="font-bold text-lg">Guarda el producto primero</h3>
                                <p className="text-sm opacity-80 mt-1">El generador de variantes necesita un producto base creado.</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center"><Settings className="w-5 h-5 mr-2 text-blue-600" /> Generador de Combinaciones</h3>
                                    <div className="space-y-6 mb-8">
                                        {attributes.map(attr => (
                                            <div key={attr.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{attr.name}</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {attr.values.map((val: any) => {
                                                        const isSelected = variantConfig[attr.id]?.includes(val.id);
                                                        return (
                                                            <button key={val.id} type="button" onClick={() => toggleVariantConfig(attr.id, val.id)}
                                                                className={`px-4 py-2 text-sm rounded-lg border font-bold transition-all ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 transform scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                                                                {val.value}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end bg-slate-50 -m-8 mt-0 p-4 rounded-b-2xl border-t border-slate-100">
                                        <button type="button" onClick={handleGenerateVariants} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95">
                                            Generar Variantes Seleccionadas
                                        </button>
                                    </div>
                                </div>

                                {variants.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 w-32">Imágenes</th>
                                                    <th className="px-6 py-4">Combinación</th>
                                                    <th className="px-6 py-4">SKU</th>
                                                    <th className="px-6 py-4 w-32">Precio</th>
                                                    <th className="px-6 py-4 w-32">Stock</th>
                                                    <th className="px-6 py-4 w-20 text-right"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-sm">
                                                {variants.map((variant) => (
                                                    <tr key={variant.id} className="hover:bg-slate-50 transition">


                                                        <td className="px-6 py-3">
                                                            <div onClick={() => openImageModal(variant.id)}
                                                                className="cursor-pointer group flex items-center gap-2 hover:bg-slate-100 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200">

                                                                <div className="flex -space-x-2 overflow-hidden">
                                                                    {(variant.image_ids && variant.image_ids.length > 0) ? (
                                                                        variant.image_ids.slice(0, 3).map((imgId: number) => {
                                                                            const imgObj = existingImages.find(e => e.id === imgId);
                                                                            if (!imgObj) return null;
                                                                            return (
                                                                                <div key={imgId} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative">
                                                                                    <img src={`http://localhost:8000/storage/${imgObj.url}`} className="w-full h-full object-cover" />
                                                                                </div>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                                                                            <ImagePlus className="w-4 h-4" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">
                                                                    {(variant.image_ids?.length || 0) > 0 ? `${variant.image_ids.length}` : '+'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-3">
                                                            <div className="flex gap-2">
                                                                {Object.entries(variant.attributes_json || {}).map(([key, val]: any) => (
                                                                    <span key={key} className="inline-flex items-center px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-sm">
                                                                        <span className="text-slate-400 font-normal mr-1">{key}:</span> {val}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3 font-mono text-slate-600 text-xs font-bold">{variant.variant_sku}</td>
                                                        <td className="px-6 py-3">
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">$</span>
                                                                <input type="number" className="w-full pl-6 pr-2 py-1.5 border border-slate-200 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                    value={variant.price_regular} onChange={e => updateVariantField(variant.id, 'price_regular', e.target.value)} />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-3">
                                                            <input type="number" className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                                value={variant.stock_quantity} onChange={e => updateVariantField(variant.id, 'stock_quantity', e.target.value)} />
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <button type="button" onClick={() => deleteVariant(variant.id)} className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className={activeTab === 'seo' ? 'block space-y-6 animate-in' : 'hidden'}>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg mb-6 text-slate-800">Motor de Búsqueda (Google)</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className={labelClass}>Título SEO (Meta Title)</label>
                                    <input type="text" className={inputClass} placeholder="Título que aparecerá en Google" value={formData.seo_title} onChange={e => handleChange('seo_title', e.target.value)} />
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Recomendado: 60 caracteres max.</p>
                                </div>
                                <div>
                                    <label className={labelClass}>Descripción SEO</label>
                                    <textarea className={inputClass} rows={3} placeholder="Resumen atractivo para los resultados de búsqueda..." value={formData.seo_description} onChange={e => handleChange('seo_description', e.target.value)} />
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Recomendado: 160 caracteres max.</p>
                                </div>
                                <div className="flex gap-8 pt-4 border-t border-slate-100">
                                    <label className="flex items-center cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-600" checked={formData.robots_index} onChange={e => handleChange('robots_index', e.target.checked)} />
                                        <span className="ml-2 text-sm font-bold text-slate-700 group-hover:text-slate-900">Indexar (Index)</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-600" checked={formData.robots_follow} onChange={e => handleChange('robots_follow', e.target.checked)} />
                                        <span className="ml-2 text-sm font-bold text-slate-700 group-hover:text-slate-900">Seguir Enlaces (Follow)</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isImageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Seleccionar imágenes para la variante</h3>
                            <button type="button" onClick={() => setIsImageModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            {existingImages.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    No hay imágenes subidas en el producto.
                                    <br />Ve a la pestaña "Multimedia" primero.
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {existingImages.map(img => {
                                        const isSelected = tempSelectedImages.includes(img.id);
                                        return (
                                            <div key={img.id} onClick={() => toggleTempImage(img.id)}
                                                className={`aspect-square rounded-xl border-2 cursor-pointer overflow-hidden relative transition-all group ${isSelected ? 'border-blue-600 ring-2 ring-blue-100 scale-95' : 'border-slate-200 hover:border-slate-400'}`}>
                                                <img src={`http://localhost:8000/storage/${img.url}`} className="w-full h-full object-cover" />
                                                <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-white/80 text-transparent border border-slate-300'}`}>
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-slate-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsImageModalOpen(false)}
                                className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition">
                                Cancelar
                            </button>
                            <button type="button" onClick={saveVariantImages}
                                className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                Guardar Selección ({tempSelectedImages.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}