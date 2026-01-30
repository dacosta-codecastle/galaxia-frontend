'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Check, Loader2, ChevronDown } from 'lucide-react';
import api from '@/lib/axios';
import { useDebounce } from '@/hooks/useDebounce';

interface CategoryOption {
    id: number;
    name: string;
    code: number;
}

interface Props {
    selectedCodes: number[];
    onSelectionChange: (codes: number[]) => void;
    placeholder?: string;
}

export function CategorySearch({ selectedCodes, onSelectionChange, placeholder = "Seleccionar Categoría..." }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CategoryOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebounce(query, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchCategories = async (searchTerm: string = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            params.append('only_roots', '1');
            params.append('limit', '20');

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const { data } = await api.get(`/admin/categories?${params.toString()}`);
            setResults(data.data);
        } catch (e) {
            console.error("Error buscando categorías", e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFocus = () => {
        setIsOpen(true);
        if (results.length === 0 && query === '') {
            fetchCategories('');
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories(debouncedQuery);
        }
    }, [debouncedQuery]);

    const toggleSelection = (code: number) => {
        if (selectedCodes.includes(code)) {
            onSelectionChange(selectedCodes.filter(c => c !== code));
        } else {
            onSelectionChange([...selectedCodes, code]);
        }
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>

            <div className="relative group">
                <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg pl-8 pr-8 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-900 outline-none transition-shadow bg-white"
                    placeholder={selectedCodes.length > 0 ? `${selectedCodes.length} categorías seleccionadas` : placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />

                <div className="absolute right-2.5 top-2.5 pointer-events-none">
                    {loading ? (
                        <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                    ) : (
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {results.length > 0 ? (
                        results.map((cat) => {
                            const isSelected = selectedCodes.includes(cat.code);
                            return (
                                <div
                                    key={cat.id}
                                    onClick={() => toggleSelection(cat.code)}
                                    className={`px-3 py-2.5 text-xs cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors
                                        ${isSelected ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}
                                    `}
                                >
                                    <div className="flex flex-col">
                                        <span>{cat.name}</span>
                                        <span className="text-[9px] text-slate-400 font-mono">Cód: {cat.code}</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-4 text-xs text-slate-400 text-center">
                            {loading ? 'Cargando...' : 'No se encontraron categorías principales.'}
                        </div>
                    )}
                </div>
            )}

            {selectedCodes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedCodes.map(code => (
                        <span key={code} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm animate-in zoom-in duration-200">
                            {code}
                            <button
                                type="button"
                                onClick={() => toggleSelection(code)}
                                className="ml-1.5 p-0.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-red-500"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}