'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search, ShoppingBag, User, Menu, X, ArrowRight
} from 'lucide-react';

interface HeaderProps {
    settings: any;
}

export default function Header({ settings }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const Logo = () => (
        <Link href="/" className="flex items-center gap-2 group">
            {settings?.logo_url ? (
                <img
                    src={settings.logo_url}
                    alt={settings.site_name || 'Logo'}
                    className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
                />
            ) : (
                <span className="text-xl md:text-2xl font-black tracking-tighter uppercase">
                    {settings?.site_name || 'GALAXIA'}
                </span>
            )}
        </Link>
    );

    return (
        <>

            <header className={`sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/90 backdrop-blur-md border-gray-200 shadow-sm py-3' : 'bg-white border-transparent py-5'}`}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-4 md:hidden flex-1">
                            <button onClick={() => setIsMobileMenuOpen(true)}>
                                <Menu className="w-6 h-6 stroke-1" />
                            </button>
                            <Search className="w-5 h-5 stroke-1" />
                        </div>

                        <div className="flex-1 md:flex-none flex justify-center md:justify-start">
                            <Logo />
                        </div>

                        <nav className="hidden md:flex items-center gap-8 justify-center flex-1">
                            {['Novedades', 'Hombre', 'Mujer', 'Accesorios', 'Ofertas'].map((item) => (
                                <Link
                                    key={item}
                                    href={`/category/${item.toLowerCase()}`}
                                    className="text-sm font-medium text-gray-600 hover:text-black hover:underline underline-offset-4 transition-colors uppercase tracking-wide"
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center justify-end gap-5 flex-1 md:flex-none">
                            <div className="hidden md:block relative group">
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="pl-8 pr-2 py-1 text-sm border-b border-transparent focus:border-black outline-none bg-transparent w-24 focus:w-48 transition-all placeholder:text-gray-400"
                                />
                                <Search className="w-4 h-4 absolute left-0 top-1.5 text-gray-500" />
                            </div>

                            <Link href="/account" className="hidden md:block hover:opacity-70 transition">
                                <User className="w-6 h-6 stroke-1" />
                            </Link>

                            <Link href="/cart" className="relative hover:opacity-70 transition">
                                <ShoppingBag className="w-6 h-6 stroke-1" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>

                <div className={`absolute left-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                    <div className="p-5 flex justify-between items-center border-b border-gray-100">
                        <span className="font-bold text-lg uppercase">Menú</span>
                        <button onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="w-6 h-6 stroke-1" />
                        </button>
                    </div>

                    <div className="flex flex-col p-5 gap-6">
                        {['Novedades', 'Hombre', 'Mujer', 'Accesorios', 'Ofertas'].map((item) => (
                            <Link
                                key={item}
                                href={`/category/${item.toLowerCase()}`}
                                className="text-lg font-medium flex justify-between items-center group"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item}
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </Link>
                        ))}
                    </div>

                    <div className="absolute bottom-0 w-full p-5 bg-gray-50 border-t border-gray-100">
                        <Link href="/account" className="flex items-center gap-3 mb-4 text-sm font-medium">
                            <User className="w-5 h-5" /> Mi Cuenta
                        </Link>
                        <div className="text-xs text-gray-400">
                            © 2026 {settings?.site_name}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}