import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    meta: any;
    onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
    if (!meta || meta.last_page <= 1) return null;

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <div className="text-xs text-slate-500 font-medium">
                Mostrando <span className="font-bold text-slate-900">{meta.from}</span> a <span className="font-bold text-slate-900">{meta.to}</span> de <span className="font-bold text-slate-900">{meta.total}</span> resultados
            </div>
            <div className="flex gap-2">
                <button
                    disabled={meta.current_page === 1}
                    onClick={() => onPageChange(meta.current_page - 1)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
                    Página {meta.current_page} de {meta.last_page}
                </span>
                <button
                    disabled={meta.current_page === meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}