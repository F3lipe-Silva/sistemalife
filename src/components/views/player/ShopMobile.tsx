"use client";

import React, { memo, useState, useMemo, useRef } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { ShoppingCart, Coins, Gem, Star, Trophy, Search, Menu, ChevronRight, Zap, Sparkles, Filter, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';

const ShopMobileComponent = () => {
    const { profile, persistData } = usePlayerDataContext();
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const handlePurchase = async (item: any) => {
        triggerHapticFeedback('medium');
        
        const balance = item.currency === 'gold' ? (profile.moedas || 0) : (profile.fragmentos || 0);
        
        if (balance < item.price) {
            triggerHapticFeedback('heavy');
            toast({ variant: 'destructive', title: "Saldo Insuficiente", description: "Você não possui recursos suficientes." });
            return;
        }

        try {
            const updatedProfile = { ...profile };
            if (item.currency === 'gold') updatedProfile.moedas -= item.price;
            else updatedProfile.fragmentos -= item.price;

            // Adiciona ao inventário
            const inventory = [...(profile.inventario || [])];
            const existing = inventory.find(i => i.nome === item.name);
            if (existing) existing.quantidade = (existing.quantidade || 1) + 1;
            else inventory.push({ nome: item.name, icone: item.icon, quantidade: 1 });

            updatedProfile.inventario = inventory;
            await persistData('profile', updatedProfile);
            
            toast({ title: "Compra Concluída", description: `${item.name} adicionado à sua bag.` });
        } catch (err) {
            toast({ variant: 'destructive', title: "Erro de Transação", description: "Falha ao processar compra." });
        }
    };

    if (!profile) return null;

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative font-mono">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Coins className="h-3.5 w-3.5 text-yellow-500" />
                            <span className="text-[10px] text-yellow-400 font-bold">{profile.moedas || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Gem className="h-3.5 w-3.5 text-purple-500" />
                            <span className="text-[10px] text-purple-400 font-bold">{profile.fragmentos || 0}</span>
                        </div>
                    </div>
                    <span className="text-[9px] font-bold text-blue-400 tracking-[0.2em] uppercase">Marketplace_Online</span>
                </div>

                <div className="px-4 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] uppercase">
                                SYSTEM <span className="text-blue-400">SHOP</span>
                            </h1>
                            <p className="text-blue-300/60 text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                                RESOURCE_ACQUISITION_TERMINAL
                            </p>
                        </div>
                        <button className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 transition-all shadow-lg" onClick={() => triggerHapticFeedback('medium')}>
                            <ShoppingCart className="h-7 w-7" />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500/50 h-5 w-5" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search items..."
                                className="w-full pl-12 pr-4 h-12 bg-blue-950/20 border border-blue-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono text-xs text-blue-100 placeholder:text-blue-500/30"
                            />
                        </div>
                        <button className="bg-blue-950/20 border-2 border-blue-500/20 rounded-2xl p-3 text-blue-400 shadow-lg active:bg-blue-500/20">
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 bg-black relative">
                <div className="grid grid-cols-1 gap-5 animate-fade-in">
                    {[
                        { name: 'Strength Potion', price: 500, currency: 'gold', icon: '🧪', rarity: 'RARE', desc: 'Permanently increases strength by 1.' },
                        { name: 'Mystery Key', price: 10, currency: 'gem', icon: '🔑', rarity: 'EPIC', desc: 'Unlocks a random secret dungeon.' },
                        { name: 'Hunter Cloak', price: 2500, currency: 'gold', icon: '🧥', rarity: 'LEGENDARY', desc: 'Reduces damage taken in the tower.' }
                    ].map((item, i) => (
                        <div 
                            key={i} 
                            className="relative border-2 border-blue-900/40 rounded-[2.5rem] bg-gradient-to-br from-blue-950/20 to-black p-5 transition-all active:scale-[0.98] shadow-xl overflow-hidden group"
                            onClick={() => triggerHapticFeedback('light')}
                        >
                            <div className="flex gap-5 items-center">
                                <div className="w-20 h-20 rounded-[2rem] bg-blue-500/5 border-2 border-blue-500/20 flex items-center justify-center shadow-inner relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-400/5 animate-pulse" />
                                    <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-transform group-hover:scale-110 duration-500">{item.icon}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <Badge className={cn(
                                            "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg",
                                            item.rarity === 'RARE' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                            item.rarity === 'EPIC' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                        )}>
                                            {item.rarity}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            {item.currency === 'gold' ? <Coins className="h-3 w-3 text-yellow-500" /> : <Gem className="h-3 w-3 text-purple-500" />}
                                            <span className="text-xs font-bold text-white">{item.price}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-cinzel font-bold text-base text-white uppercase tracking-wider truncate">
                                        {item.name}
                                    </h3>
                                    <p className="text-[10px] text-blue-100/40 uppercase tracking-tight line-clamp-2 mt-1 leading-tight">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handlePurchase(item)}
                                className="mt-4 w-full py-3 bg-blue-600/10 border-2 border-blue-500/20 rounded-2xl text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em] active:bg-blue-600 active:text-white transition-all shadow-lg"
                            >
                                PURCHASE_ITEM
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export const ShopMobile = memo(ShopMobileComponent);
