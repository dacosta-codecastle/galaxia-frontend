import { UseFormRegisterReturn } from "react-hook-form";

interface PhoneInputProps {
    registration: UseFormRegisterReturn;
    error?: string;
    label?: string;
    disabled?: boolean;
}

export const PhoneInput = ({ registration, error, label = "Teléfono", disabled = false }: PhoneInputProps) => {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                {label}
            </label>
            <div className="relative">
                <span className={`absolute left-3 top-3 text-sm font-bold ${disabled ? 'text-slate-400' : 'text-slate-500'}`}>
                    +503
                </span>
                <input
                    type="tel"
                    disabled={disabled}
                    {...registration}
                    placeholder="0000-0000"
                    className={`w-full border rounded-lg pl-14 pr-4 py-2.5 text-sm font-medium outline-none transition
                        ${error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-slate-900'}
                        ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'} 
                    `}
                />
            </div>
            {error && <p className="text-red-500 text-[10px] mt-1 font-bold">{error}</p>}
        </div>
    );
};