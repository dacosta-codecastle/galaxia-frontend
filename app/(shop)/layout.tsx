import Header from '@/components/shop/Header';
import { getPublicSettings } from '@/lib/public-api';
import Link from 'next/link';
import { Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';

export async function generateMetadata() {
    const settings = await getPublicSettings();
    return {
        title: settings?.seo_title || 'Galaxia Deportes',
        description: settings?.seo_description || 'Tienda de deportes online',
    };
}

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await getPublicSettings();

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-black selection:text-white">

            <Header settings={settings} />

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                        <div className="space-y-4">
                            <h4 className="text-xl font-black tracking-tighter uppercase">{'Galaxia'}</h4>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Elevando tu rendimiento con el mejor equipamiento deportivo. Calidad, estilo y tecnología en cada producto.
                            </p>
                            <div className="flex space-x-4 pt-2">
                                <a href="#" className="hover:text-gray-300 transition"><Instagram className="w-5 h-5" /></a>
                                <a href="#" className="hover:text-gray-300 transition"><Facebook className="w-5 h-5" /></a>
                                <a href="#" className="hover:text-gray-300 transition"><Twitter className="w-5 h-5" /></a>
                            </div>
                        </div>

                        <div>
                            <h5 className="font-bold text-sm uppercase tracking-widest mb-6 text-gray-500">Tienda</h5>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/shop/new" className="hover:text-gray-300 transition">Novedades</Link></li>
                                <li><Link href="/shop/men" className="hover:text-gray-300 transition">Hombre</Link></li>
                                <li><Link href="/shop/women" className="hover:text-gray-300 transition">Mujer</Link></li>
                                <li><Link href="/shop/accessories" className="hover:text-gray-300 transition">Accesorios</Link></li>
                                <li><Link href="/shop/sale" className="hover:text-gray-300 transition">Ofertas</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-bold text-sm uppercase tracking-widest mb-6 text-gray-500">Ayuda</h5>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/help/shipping" className="hover:text-gray-300 transition">Envíos</Link></li>
                                <li><Link href="/help/returns" className="hover:text-gray-300 transition">Cambios y Devoluciones</Link></li>
                                <li><Link href="/help/sizes" className="hover:text-gray-300 transition">Guía de Talles</Link></li>
                                <li><Link href="/help/contact" className="hover:text-gray-300 transition">Contacto</Link></li>
                                <li><Link href="/help/terms" className="hover:text-gray-300 transition">Términos y Condiciones</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-bold text-sm uppercase tracking-widest mb-6 text-gray-500">Suscríbete</h5>
                            <p className="text-sm text-gray-400 mb-4">Recibe noticias y ofertas exclusivas.</p>
                            <form className="flex border-b border-gray-700 pb-2 focus-within:border-white transition-colors">
                                <input
                                    type="email"
                                    placeholder="Tu email"
                                    className="bg-transparent w-full outline-none text-sm placeholder:text-gray-600"
                                />
                                <button type="submit" className="uppercase font-bold text-xs hover:text-gray-300">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                        <p>© 2026 Galaxia. Todos los derechos reservados.</p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <span>VISA</span>
                            <span>MASTERCARD</span>
                            <span>PAYPAL</span>
                            <span>AMEX</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}