'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface Option {
    id: number;
    label: string;
    code: number;
}

interface Props {
    options: Option[];
    value?: string; // ID en string
    onChange: (value: string) => void;
    label: string;
    disabled?: boolean;
    placeholder?: string;
}

export function SearchableSelect({ options, value, onChange, label, disabled = false, placeholder = "Seleccionar..." }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Encontrar la opción seleccionada actualmente
    const selectedOption = options.find(op => op.id.toString() === value);

    // Filtrar opciones (Máximo 50 resultados para no laggear el DOM)
    const filteredOptions = options.filter(op =>
        op.label.toLowerCase().includes(search.toLowerCase()) ||
        op.code.toString().includes(search)
    ).slice(0, 50);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="text-xs font-bold text-slate-700 block mb-1">{label}</label>

            {/* TRIGGER BUTTON */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full border rounded-lg px-3 py-2 text-sm flex justify-between items-center bg-white transition-all ${isOpen ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200'
                    } ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'hover:border-slate-400'}`}
            >
                <span className={`truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-900'}`}>
                    {selectedOption
                        ? `[${selectedOption.code}] ${selectedOption.label}`
                        : placeholder}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            </button>

            {/* DROPDOWN MENU */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input inside Dropdown */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar categoría..."
                                className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-2 top-2 p-0.5 hover:bg-slate-200 rounded">
                                    <X className="w-3 h-3 text-slate-400" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1">
                        {/* Opción para quitar selección (Raíz) */}
                        <div
                            onClick={() => { onChange(''); setIsOpen(false); }}
                            className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-md cursor-pointer italic border-b border-slate-50 mb-1"
                        >
                            -- Sin Padre (Categoría Raíz) --
                        </div>

                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-slate-400">
                                No hay resultados para "{search}"
                            </div>
                        ) : (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    onClick={() => {
                                        onChange(option.id.toString());
                                        setIsOpen(false);
                                        setSearch(''); // Reset search
                                    }}
                                    className={`px-3 py-2 text-sm rounded-md cursor-pointer flex justify-between items-center ${value === option.id.toString()
                                            ? 'bg-slate-900 text-white font-bold'
                                            : 'text-slate-700 hover:bg-slate-100'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span>{option.label}</span>
                                        <span className={`text-[10px] ${value === option.id.toString() ? 'text-slate-300' : 'text-slate-400'}`}>
                                            Código: {option.code}
                                        </span>
                                    </div>
                                    {value === option.id.toString() && <Check className="w-4 h-4" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}