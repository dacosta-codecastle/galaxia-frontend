'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, X, Image as ImageIcon, Zap, Filter, Search, Link as LinkIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import PermissionGate from '@/components/auth/PermissionGate';
import { usePermission } from '@/hooks/usePermission';
import { Attribute, ApiResponse } from '@/types';
import { CategorySearch } from '@/components/admin/attributes/CategorySearch';

const schema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    type: z.enum(['select', 'color', 'button']),
    values: z.array(z.object({
        id: z.number().optional(),
        value: z.string().min(1, "Valor requerido"),
        color_hex: z.string().optional(),
        secondary_color_hex: z.string().optional(),
        swatch_image: z.string().optional().nullable(),
        swatch_file: z.any().optional(),
        category_codes: z.array(z.number()).optional(),
    })).min(1, "Agrega al menos un valor"),
});

type FormData = z.infer<typeof schema>;

export default function AttributeForm({ attributeId }: { attributeId?: string }) {
    const router = useRouter();
    const { can } = usePermission();
    const [loading, setLoading] = useState(false);

    const [bulkCategoryCodes, setBulkCategoryCodes] = useState<number[]>([]);
    const [bulkValuesText, setBulkValuesText] = useState('');
    const [viewFilterText, setViewFilterText] = useState('');
    const [viewFilterCategory, setViewFilterCategory] = useState<number[]>([]);

    const hasPermission = attributeId ? can('edit_attributes') : can('create_attributes');
    const requiredPermission = attributeId ? 'edit_attributes' : 'create_attributes';

    const { register, control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { type: 'select', values: [{ value: '', category_codes: [] }] }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'values' });

    const watchType = watch('type');
    const formValues = watch('values');

    useEffect(() => {
        if (attributeId) {
            api.get<ApiResponse<Attribute>>(`/admin/attributes/${attributeId}`).then(({ data }) => {
                const attr = data.data;
                if (!attr) return;

                const values = attr.values.map((v) => ({
                    id: v.id,
                    value: v.value,
                    color_hex: v.color_hex || '',
                    secondary_color_hex: v.secondary_color_hex || '',
                    swatch_image: v.swatch_image_url || v.swatch_image,
                    category_codes: v.category_codes || [],
                }));

                reset({ name: attr.name, type: attr.type, values });
            }).catch(() => toast.error("Error al cargar el atributo"));
        }
    }, [attributeId, reset]);

    const onSubmit = async (data: FormData) => {
        if (!hasPermission) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('type', data.type);

        data.values.forEach((val, index) => {
            if (val.id) formData.append(`values[${index}][id]`, val.id.toString());
            formData.append(`values[${index}][value]`, val.value);

            if (val.color_hex) formData.append(`values[${index}][color_hex]`, val.color_hex);
            if (val.secondary_color_hex) formData.append(`values[${index}][secondary_color_hex]`, val.secondary_color_hex);

            if (val.swatch_file instanceof File) {
                formData.append(`values[${index}][swatch]`, val.swatch_file);
            } else if (val.swatch_image === null) {
                formData.append(`values[${index}][remove_swatch]`, '1');
            }

            const codes = val.category_codes || [];
            if (codes.length > 0) {
                codes.forEach((code, i) => {
                    formData.append(`values[${index}][category_codes][${i}]`, code.toString());
                });
            }
        });

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const url = attributeId ? `/admin/attributes/${attributeId}` : '/admin/attributes';
            if (attributeId) formData.append('_method', 'PUT');

            await api.post(url, formData, config);
            toast.success(attributeId ? 'Atributo actualizado' : 'Atributo creado');
            router.push('/attributes');
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAdd = () => {
        if (!bulkValuesText.trim()) return toast.warning("Escribe valores separados por coma");
        const valuesToAdd = bulkValuesText.split(',').map(s => s.trim()).filter(s => s !== '');

        valuesToAdd.forEach(val => {
            append({
                value: val,
                category_codes: bulkCategoryCodes,
                color_hex: '', secondary_color_hex: ''
            });
        });
        toast.success(`${valuesToAdd.length} valores agregados`);
        setBulkValuesText('');
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setValue(`values.${index}.swatch_file`, file);
            setValue(`values.${index}.swatch_image`, URL.createObjectURL(file));
        }
    };

    const removeImage = (index: number) => {
        setValue(`values.${index}.swatch_file`, undefined);
        setValue(`values.${index}.swatch_image`, null);
    };

    const isRowVisible = (index: number) => {
        const val = formValues?.[index];
        if (!val) return true;
        if (viewFilterText && !val.value.toLowerCase().includes(viewFilterText.toLowerCase())) return false;
        if (viewFilterCategory.length > 0) {
            const rowCodes = val.category_codes || [];
            if (!viewFilterCategory.some(filterCode => rowCodes.includes(filterCode))) return false;
        }
        return true;
    };

    return (
        <PermissionGate permission={requiredPermission}>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto p-6 pb-24">

                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/95 backdrop-blur py-4 z-30 border-b border-slate-100 px-4 -mx-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition"><ArrowLeft className="w-5 h-5" /></button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{attributeId ? 'Editar Atributo' : 'Nuevo Atributo'}</h1>
                            <p className="text-xs text-slate-500 font-medium">{fields.length} valores totales</p>
                        </div>
                    </div>
                    {hasPermission && (
                        <button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center hover:bg-slate-800 shadow-lg active:scale-95 transition-transform">
                            <Save className="w-4 h-4 mr-2" /> {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    <div className="xl:col-span-4 space-y-6">
                        <Card className="p-5 space-y-4 relative z-20">
                            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Configuración General</h3>
                            <Input label="Nombre (Ej: Talla, Color)" registration={register('name')} error={errors.name?.message} disabled={!hasPermission} />
                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1">Tipo Visual</label>
                                <select {...register('type')} disabled={!hasPermission} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-slate-900 outline-none cursor-pointer bg-white">
                                    <option value="select">Lista Desplegable</option>
                                    <option value="button">Botones de Texto (S, M, L)</option>
                                    <option value="color">Muestras de Color / Textura</option>
                                </select>
                            </div>
                        </Card>

                        <Card className="overflow-hidden border-blue-100 shadow-blue-50 relative z-10">
                            <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded text-blue-600"><Zap className="w-4 h-4" /></div>
                                <div><h3 className="font-bold text-blue-900 text-sm">Generador Rápido</h3></div>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">1. Vincular a Categoría (Opcional)</label>
                                    <CategorySearch selectedCodes={bulkCategoryCodes} onSelectionChange={setBulkCategoryCodes} placeholder="Buscar categoría..." />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-blue-600 uppercase mb-1 block">2. Valores (separados por coma)</label>
                                    <textarea
                                        value={bulkValuesText} onChange={(e) => setBulkValuesText(e.target.value)}
                                        placeholder="Ej: XS, S, M, L, XL"
                                        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none h-24 resize-none bg-white"
                                    />
                                </div>
                                <button type="button" onClick={handleBulkAdd} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-md active:scale-95">
                                    Agregar Valores
                                </button>
                            </div>
                        </Card>
                    </div>

                    <div className="xl:col-span-8">
                        <Card className="min-h-[600px] flex flex-col relative border-slate-200 shadow-sm">
                            ]
                            <div className="p-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur flex flex-col sm:flex-row gap-3 items-center justify-between sticky top-0 z-20 rounded-t-xl">
                                <div className="flex items-center gap-2 text-slate-500 px-2">
                                    <Filter className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Filtrar Vista:</span>
                                </div>
                                <div className="flex gap-2 flex-1 w-full sm:w-auto">
                                    <div className="relative flex-1 min-w-[140px]">
                                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                        <input
                                            placeholder="Buscar valor..." value={viewFilterText} onChange={(e) => setViewFilterText(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 bg-white"
                                        />
                                    </div>
                                    <div className="w-48"><CategorySearch selectedCodes={viewFilterCategory} onSelectionChange={setViewFilterCategory} placeholder="Por Categoría..." /></div>
                                    {(viewFilterText || viewFilterCategory.length > 0) && (
                                        <button type="button" onClick={() => { setViewFilterText(''); setViewFilterCategory([]); }} className="px-3 py-2 text-xs bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-600 transition font-medium">Limpiar</button>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[650px] custom-scrollbar relative">
                                {fields.length === 0 && (
                                    <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                        No hay valores definidos.
                                    </div>
                                )}

                                {fields.map((field, index) => {
                                    if (!isRowVisible(index)) return null;

                                    return (
                                        <div
                                            key={field.id}
                                            style={{ zIndex: fields.length - index }}
                                            className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors group relative shadow-sm"
                                        >
                                            <div className="text-slate-300 cursor-grab active:cursor-grabbing px-1 hidden sm:block"><GripVertical className="w-4 h-4" /></div>

                                            <div className="w-full sm:w-1/4 min-w-[120px]">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block pl-1">Valor</label>
                                                <input
                                                    {...register(`values.${index}.value`)}
                                                    disabled={!hasPermission}
                                                    placeholder="Valor"
                                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                                                />
                                                {errors.values?.[index]?.value && <p className="text-[9px] text-red-500 mt-1 pl-1">{errors.values[index]?.value?.message}</p>}
                                            </div>

                                            <div className="flex-1 w-full relative">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block flex items-center gap-1 pl-1">
                                                    <LinkIcon className="w-3 h-3" /> Categorías
                                                </label>
                                                <CategorySearch
                                                    selectedCodes={watch(`values.${index}.category_codes`) || []}
                                                    onSelectionChange={(codes) => setValue(`values.${index}.category_codes`, codes)}
                                                    placeholder="Seleccionar..."
                                                />
                                            </div>

                                            {watchType === 'color' && (
                                                <div className="mt-2 sm:mt-0">
                                                    {watch(`values.${index}.swatch_image`) ? (
                                                        <div className="relative group/img mt-4 sm:mt-0">
                                                            <div
                                                                className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-slate-200 shadow-sm"
                                                                style={{ backgroundImage: `url(${watch(`values.${index}.swatch_image`)})` }}
                                                                title="Usando Imagen"
                                                            />
                                                            <button type="button" onClick={() => removeImage(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:scale-110 transition z-10"><X className="w-3 h-3" /></button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 mt-4 sm:mt-0 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                                            <div className="w-8 h-8 rounded-full border border-slate-300 overflow-hidden relative cursor-pointer hover:scale-105 transition shadow-sm">
                                                                <input type="color" {...register(`values.${index}.color_hex`)} defaultValue={field.color_hex || '#000000'} className="absolute w-[150%] h-[150%] -top-2 -left-2 cursor-pointer border-0 p-0" />
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full border border-slate-300 overflow-hidden relative cursor-pointer hover:scale-105 transition shadow-sm bg-white">
                                                                {watch(`values.${index}.secondary_color_hex`) ? (
                                                                    <>
                                                                        <input type="color" {...register(`values.${index}.secondary_color_hex`)} className="absolute w-[150%] h-[150%] -top-2 -left-2 cursor-pointer border-0 p-0" />
                                                                        <button type="button" onClick={() => setValue(`values.${index}.secondary_color_hex`, '')} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition text-white z-10"><X className="w-3 h-3" /></button>
                                                                    </>
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><input type="color" {...register(`values.${index}.secondary_color_hex`)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" /><Plus className="w-3 h-3" /></div>
                                                                )}
                                                            </div>
                                                            <div className="w-px h-6 bg-slate-200 mx-1"></div>
                                                            <label className="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-slate-200 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition text-slate-400 shadow-sm" title="Subir Imagen">
                                                                <ImageIcon className="w-4 h-4" />
                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(index, e)} />
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button type="button" onClick={() => remove(index)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition mt-3 sm:mt-0 self-end sm:self-center">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center rounded-b-xl">
                                <button type="button" onClick={() => append({ value: '', category_codes: [] })} className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center justify-center w-full py-2 hover:bg-slate-100 rounded-lg transition">
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Añadir Fila Manualmente
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </form>
        </PermissionGate>
    );
}