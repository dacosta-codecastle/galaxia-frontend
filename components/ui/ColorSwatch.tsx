interface Props {
    color?: string | null;
    secondary?: string | null;
    image?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ColorSwatch({ color, secondary, image, size = 'md', className = '' }: Props) {

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const baseClass = `${sizeClasses[size]} rounded-full border border-slate-200 shadow-sm shrink-0 ${className}`;

    if (image) {
        return (
            <div
                className={`${baseClass} bg-cover bg-center bg-no-repeat`}
                style={{ backgroundImage: `url(${image})` }}
                title="Textura / Multicolor"
            />
        );
    }

    if (!color) return <div className={`${baseClass} bg-slate-100`}></div>;

    if (secondary) {
        return (
            <div
                className={baseClass}
                style={{ background: `linear-gradient(135deg, ${color} 50%, ${secondary} 50%)` }}
                title={`${color} + ${secondary}`}
            />
        );
    }

    return (
        <div
            className={baseClass}
            style={{ backgroundColor: color }}
            title={color}
        />
    );
}