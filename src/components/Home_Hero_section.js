"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function Home_Hero_section() {
    const [hero, setHero] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/hero")
            .then(res => res.json())
            .then(data => setHero(data.hero));
    }, []);

    useEffect(() => {
        if (!hero?.media?.length) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % hero.media.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [hero]);

    const prev = () => setCurrentIndex(i => (i - 1 + hero.media.length) % hero.media.length);
    const next = () => setCurrentIndex(i => (i + 1) % hero.media.length);

    if (!hero) return (
        <div className="w-full h-[500px] bg-blue-700 flex items-center justify-center text-white text-2xl">
            Loading...
        </div>
    );

    return (
        <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
            {hero.media.map((item, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"}`}>
                    <img src={item.url} alt={hero.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            ))}

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">{hero.title}</h1>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                        onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-3 bg-yellow-400 text-blue-900 font-bold rounded-full hover:bg-yellow-300 transition-all flex items-center gap-2"
                    >
                        Donate Now <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => router.push("/howitswork")}
                        className="px-8 py-3 border-2 border-white rounded-full hover:bg-white/10 transition-all"
                    >
                        How It Works
                    </button>
                </div>
            </div>

            {hero.media.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {hero.media.map((_, index) => (
                            <button key={index} onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-6" : "bg-white/50"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}