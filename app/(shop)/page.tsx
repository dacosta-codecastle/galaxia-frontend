import api from '@/lib/axios';
import Link from 'next/link';
import { ArrowUpRight, Truck, ShieldCheck, RefreshCw, ShoppingBag } from 'lucide-react';
import HeroSlider from '@/components/shop/HeroSlider';

export const dynamic = 'force-dynamic';

async function getBanners() {
    try {
        const { data } = await api.get('/shop/banners?page=home');
        return data;
    } catch (error) {
        return {};
    }
}

async function getFeaturedData() {
    try {
        const [products, categories] = await Promise.all([
            api.get('/shop/products?featured=true&limit=8').then(r => r.data.data || []),
            api.get('/shop/categories?featured=true&limit=6').then(r => r.data || [])
        ]);
        return { products, categories };
    } catch {
        return { products: [], categories: [] };
    }
}

export default async function HomePage() {
    const banners = await getBanners();
    const { products, categories } = await getFeaturedData();

    const heroItems = banners.home_hero_slider?.items || [];
    const gridItems = banners.home_featured_secondary?.items || [];
    const promoStrip = banners.home_promo_strip?.items?.[0];

    return (
        <div className="bg-white min-h-screen text-slate-900 font-sans">
            <section className="relative">
                {heroItems.length > 0 ? (
                    <HeroSlider banners={heroItems} settings={{ autoplay: true, loop: true }} />
                ) : (
                    <div className="h-[60vh] bg-slate-50 flex items-center justify-center text-slate-300">
                    </div>
                )}
            </section>

            {gridItems.length > 0 && (
                <section className="py-20 container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gridItems.map((banner: any) => (
                            <Link key={banner.id} href={banner.cta.url || '#'} target={banner.cta.new_tab ? '_blank' : '_self'} className="relative h-[400px] overflow-hidden group block">
                                <img
                                    src={banner.image_url}
                                    alt={banner.alt_text}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                <div className="absolute bottom-8 left-8 text-white">
                                    <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                                    {banner.cta.text && (
                                        <span className="inline-flex items-center text-sm font-bold border-b border-white pb-1">
                                            {banner.cta.text} <ArrowUpRight className="w-4 h-4 ml-1" />
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {promoStrip && (
                <section className="py-10 container mx-auto px-4 mb-10">
                    <Link href={promoStrip.cta.url || '#'} className="relative block w-full rounded-none overflow-hidden group">
                        <div className="relative h-64 md:h-80 bg-black flex items-center justify-center overflow-hidden">
                            <img
                                src={promoStrip.image_url}
                                alt={promoStrip.alt_text}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 filter grayscale"
                            />
                            <div className="relative z-10 text-center px-6 max-w-2xl">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                                    {promoStrip.headline || promoStrip.title}
                                </h2>
                                {promoStrip.cta.text && (
                                    <span className="inline-block bg-white text-black px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                                        {promoStrip.cta.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                </section>
            )}
        </div>
    );
}