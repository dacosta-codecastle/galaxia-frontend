'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
    banners: any[];
    settings?: any;
}

export default function HeroSlider({ banners, settings }: HeroSliderProps) {
    const [current, setCurrent] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const mainColor = settings?.main_color || '#000000';

    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, [banners.length]);

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [isHovered, nextSlide]);

    if (!banners || banners.length === 0) return null;

    return (
        <div
            className="relative w-full h-[500px] md:h-[600px] bg-slate-900 overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <picture className="absolute inset-0 w-full h-full">

                        {banner.mobile_url && (
                            <source media="(max-width: 768px)" srcSet={banner.mobile_url} />
                        )}
                        <img
                            src={banner.image_url}
                            alt={banner.alt_text || banner.title}
                            className="w-full h-full object-cover"
                        />
                    </picture>

                    <div className="absolute inset-0 bg-black/30 md:bg-black/20"></div>

                    <div className="absolute inset-0 flex items-center justify-center md:justify-start z-20">
                        <div className="container mx-auto px-4 md:px-12">
                            <div className={`max-w-2xl transition-all duration-700 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                                }`}>
                                {banner.subheadline && (
                                    <span
                                        className="inline-block py-1 px-3 rounded text-white text-xs font-bold mb-4 uppercase tracking-wider shadow-sm backdrop-blur-sm"
                                        style={{ backgroundColor: mainColor }}
                                    >
                                        {banner.subheadline}
                                    </span>
                                )}

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight drop-shadow-lg uppercase">
                                    {banner.headline || banner.title}
                                </h1>

                                {banner.cta?.text && (
                                    <Link
                                        href={banner.cta.url || '#'}
                                        target={banner.cta.new_tab ? '_blank' : '_self'}
                                        className="inline-flex items-center px-8 py-4 rounded-full font-bold transition transform hover:scale-105 shadow-xl bg-white text-slate-900 hover:bg-gray-100"
                                    >
                                        {banner.cta.text} <ArrowRight className="ml-2 w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 border border-white/20"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${idx === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}