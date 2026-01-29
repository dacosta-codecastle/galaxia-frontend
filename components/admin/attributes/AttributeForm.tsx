'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import PermissionGate from '@/components/auth/PermissionGate';
import { usePermission } from '@/hooks/usePermission';

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
    })).min(1, "Agrega al menos un valor"),
});

type FormData = z.infer<typeof schema>;

export default function AttributeForm({ attributeId }: { attributeId?: string }) {
    const router = useRouter();
    const { can } = usePermission();
    const [loading, setLoading] = useState(false);

    const hasPermission = attributeId ? can('edit_attributes') : can('create_attributes');
    const requiredPermission = attributeId ? 'edit_attributes' : 'create_attributes';

    const { register, control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { type: 'select', values: [{ value: '' }] }
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'values' });
    const watchType = watch('type');

    useEffect(() => {
        if (attributeId) {
            api.get(`/admin/attributes/${attributeId}`).then(({ data }) => {
                const attr = data.data;
                const values = attr.values.map((v: any) => ({
                    id: v.id,
                    value: v.value,
                    color_hex: v.color_hex || '',
                    secondary_color_hex: v.secondary_color_hex || '',
                    swatch_image: v.swatch_image,
                }));
                reset({ ...attr, values });
            }).catch(() => toast.error("Error al cargar"));
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
            }
        });

        const config = { headers: { 'Content-Type': 'multipart/form-data' } };

        try {
            if (attributeId) {
                formData.append('_method', 'PUT');
                await api.post(`/admin/attributes/${attributeId}`, formData, config);
                toast.success('Atributo actualizado');
            } else {
                await api.post('/admin/attributes', formData, config);
                toast.success('Atributo creado');
            }
            router.push('/attributes');
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setValue(`values.${index}.swatch_file`, file);

            const previewUrl = URL.createObjectURL(file);
            setValue(`values.${index}.swatch_image`, previewUrl);

            setValue(`values.${index}.color_hex`, '');
            setValue(`values.${index}.secondary_color_hex`, '');
        }
    };

    const removeImage = (index: number) => {
        setValue(`values.${index}.swatch_file`, null);
        setValue(`values.${index}.swatch_image`, null);
    };

    return (
        <PermissionGate permission={requiredPermission}>
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto p-6 pb-20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition"><ArrowLeft className="w-5 h-5" /></button>
                        <h1 className="text-2xl font-bold text-slate-900">{attributeId ? 'Editar Atributo' : 'Nuevo Atributo'}</h1>
                    </div>
                    {hasPermission && (
                        <button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center hover:bg-slate-800 disabled:opacity-50 shadow-lg active:scale-95 transition-transform">
                            <Save className="w-4 h-4 mr-2" /> {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Nombre (Ej: Talla, Color)" registration={register('name')} error={errors.name?.message} disabled={!hasPermission} />

                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Selección</label>
                            <select {...register('type')} disabled={!hasPermission} className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 ring-slate-900 outline-none">
                                <option value="select">Lista Desplegable (Select)</option>
                                <option value="button">Botones (Tallas S, M, L)</option>
                                <option value="color">Muestras de Color</option>
                            </select>
                            <p className="text-[10px] text-slate-400 mt-1">Define cómo seleccionará el cliente esta opción en la tienda.</p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Valores del Atributo</h3>
                            {hasPermission && (
                                <button type="button" onClick={() => append({ value: '' })} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold flex items-center shadow-md active:scale-95 transition">
                                    <Plus className="w-3 h-3 mr-1" /> Agregar Valor
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-3 items-center animate-in slide-in-from-left-2 fade-in duration-200 bg-slate-50/50 p-2 rounded-xl border border-transparent hover:border-slate-200 transition-colors">
                                    <div className="text-slate-300 cursor-grab active:cursor-grabbing px-1"><GripVertical className="w-4 h-4" /></div>

                                    <div className="flex-1">
                                        <input
                                            {...register(`values.${index}.value`)}
                                            disabled={!hasPermission}
                                            placeholder={watchType === 'color' ? "Ej: Rojo Fuego, Camuflaje..." : "Ej: XL, 42, Algodón..."}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 ring-slate-100 bg-white transition-all"
                                        />
                                        {errors.values?.[index]?.value && <p className="text-xs text-red-500 mt-1">{errors.values[index]?.value?.message}</p>}
                                    </div>

                                    {watchType === 'color' && (
                                        <div className="flex gap-2 items-center bg-white border border-slate-200 rounded-lg p-1">

                                            {watch(`values.${index}.swatch_image`) ? (
                                                <div className="flex items-center gap-2 px-1">
                                                    <div
                                                        className="w-8 h-8 rounded-full bg-cover bg-center border border-slate-200 shadow-sm"
                                                        style={{ backgroundImage: `url(${watch(`values.${index}.swatch_image`)})` }}
                                                        title="Imagen activa"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-bold text-slate-700 uppercase">Imagen</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="text-[9px] text-red-500 hover:underline flex items-center"
                                                        >
                                                            <X className="w-2 h-2 mr-0.5" /> Quitar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 relative cursor-pointer group">
                                                        <input
                                                            type="color"
                                                            {...register(`values.${index}.color_hex`)}
                                                            value={watch(`values.${index}.color_hex`) || '#000000'}
                                                            disabled={!hasPermission}
                                                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 cursor-pointer border-0"
                                                        />
                                                        {!watch(`values.${index}.color_hex`) && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-[8px] text-slate-400 pointer-events-none group-hover:bg-slate-200">PRI</div>
                                                        )}
                                                    </div>

                                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 relative cursor-pointer group">
                                                        <input
                                                            type="color"
                                                            {...register(`values.${index}.secondary_color_hex`)}
                                                            value={watch(`values.${index}.secondary_color_hex`) || '#000000'}
                                                            disabled={!hasPermission}
                                                            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 cursor-pointer border-0"
                                                        />
                                                        {!watch(`values.${index}.secondary_color_hex`) && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-[8px] text-slate-300 pointer-events-none group-hover:bg-slate-100">+2</div>
                                                        )}
                                                        {watch(`values.${index}.secondary_color_hex`) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setValue(`values.${index}.secondary_color_hex`, '')}
                                                                className="absolute top-0 right-0 bg-black/50 text-white w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="w-px h-6 bg-slate-100 mx-1"></div>

                                                    <label className="cursor-pointer p-1.5 hover:bg-slate-50 rounded-md transition-colors group relative" title="Usar imagen (Multicolor)">
                                                        <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            disabled={!hasPermission}
                                                            onChange={(e) => handleFileChange(index, e)}
                                                        />
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {hasPermission && (
                                        <button type="button" onClick={() => remove(index)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.values && <p className="text-xs text-red-500 mt-4 text-center font-bold bg-red-50 p-2 rounded">{errors.values.message}</p>}

                        {fields.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl mt-2">
                                No hay valores definidos. Haz clic en "Agregar Valor".
                            </div>
                        )}
                    </Card>
                </div>
            </form>
        </PermissionGate>
    );
}