"use client";

import React, { memo, useState, useMemo, useRef } from 'react';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { cn } from '@/lib/utils';
import { Briefcase, Box, Shield, Zap, Search, Menu, Trash2, Sparkles, ChevronRight, Package, Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const InventoryMobileComponent = () => {
    const { profile, useItem } = usePlayerDataContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            const patterns = { light: 50, medium: 100, heavy: 200 };
            navigator.vibrate(patterns[type]);
        }
    };

    const handleUseItem = async () => {
        if (selectedItem) {
            await useItem(selectedItem.nome);
            setSelectedItem(null);
        }
    };

    const items = useMemo(() => {
        return (profile?.inventory || []).filter((i: any) => 
            i.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [profile, searchTerm]);

    if (!profile) return null;

    return (
        <div className="h-screen bg-black overflow-hidden flex flex-col max-w-full relative">
            <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-[0.03] pointer-events-none z-50" />
            
            <header className="bg-black/90 backdrop-blur-2xl border-b border-blue-500/20 flex-shrink-0 z-40" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
                <div className="flex items-center justify-between bg-blue-950/40 border-b border-blue-900/30 py-2.5 px-4">
                    <div className="flex items-center gap-3">
                        <Box className="h-4 w-4 text-blue-400 animate-pulse" />
                        <span className="font-mono text-[10px] text-blue-300 uppercase tracking-[0.2em] font-bold">
                            STORAGE_LOG: <span className="text-white">{items.length} ITEMS</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Coins className="h-3 w-3 text-yellow-500" />
                        <span className="font-mono text-[10px] text-yellow-400 font-bold">{profile.moedas || 0}</span>
                    </div>
                </div>

                <div className="px-4 py-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-cinzel text-white tracking-widest text-2xl font-bold drop-shadow-[0_0_12px_rgba(59,130,246,0.6)] uppercase">
                                PLAYER <span className="text-blue-400">BAG</span>
                            </h1>
                            <p className="text-blue-300/60 font-mono text-[10px] tracking-[0.15em] mt-1 font-bold uppercase">
                                QUANTUM_STORAGE_UNIT
                            </p>
                        </div>
                        <button className="text-blue-400 p-3 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 active:bg-blue-500/20 transition-all shadow-lg">
                            <Package className="h-7 w-7" />
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500/50 h-5 w-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Scan storage contents..."
                            className="w-full pl-12 pr-4 h-14 bg-blue-950/20 border border-blue-500/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-mono text-sm text-blue-100 placeholder:text-blue-500/30"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-32 bg-black relative">
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    {items.length === 0 ? (
                        <div className="col-span-2 text-center py-20 opacity-40 flex flex-col items-center">
                            <Box className="h-16 w-16 text-blue-500 mb-4" />
                            <h3 className="font-cinzel text-xl text-blue-100 uppercase tracking-widest">BAG_EMPTY</h3>
                            <p className="text-xs font-mono mt-2 uppercase">Collect items in dungeons, Hunter.</p>
                        </div>
                    ) : (
                        items.map((item: any, index: number) => (
                            <button 
                                key={item.id || index} 
                                className={cn(
                                    "relative border-2 rounded-[2rem] transition-all duration-300 active:scale-[0.95] overflow-hidden shadow-2xl p-4 flex flex-col items-center text-center",
                                    "bg-gradient-to-br from-blue-950/20 to-black border-blue-900/40"
                                )}
                                onClick={() => {
                                    triggerHapticFeedback('medium');
                                    setSelectedItem(item);
                                }}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-center mb-3 shadow-inner group">
                                    <div className="absolute inset-0 bg-blue-400/5 animate-pulse rounded-2xl" />
                                    <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">{item.icone || '📦'}</span>
                                </div>
                                <h3 className="font-mono font-bold text-xs text-white uppercase tracking-tighter truncate w-full">
                                    {item.nome}
                                </h3>
                                <div className="flex items-center gap-1 mt-2">
                                    <Badge variant="outline" className="text-[8px] font-mono uppercase tracking-widest border-blue-500/20 text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded-full font-bold">
                                        QTY: {item.quantidade || 1}
                                    </Badge>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </main>

            {/* Item Usage Dialog */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-black border-2 border-blue-500/30 rounded-[2.5rem] p-8 w-full max-w-sm text-center relative shadow-2xl">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400" />
                        
                        <div className="w-20 h-20 rounded-[2rem] bg-blue-500/10 border-2 border-blue-500/30 flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl">{selectedItem.icone}</span>
                        </div>
                        
                        <h2 className="font-cinzel text-2xl text-white font-bold tracking-widest mb-2 uppercase">{selectedItem.nome}</h2>
                        <p className="text-xs font-mono text-blue-100/40 uppercase tracking-tight mb-8">Execute protocol: USE_ITEM?</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleUseItem}
                                className="w-full py-4 bg-blue-600 text-white font-mono font-bold rounded-2xl shadow-lg border-2 border-blue-400 active:scale-95 transition-all uppercase tracking-widest"
                            >
                                CONFIRM_USE
                            </button>
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="w-full py-3 text-blue-400/60 font-mono text-[10px] font-bold uppercase tracking-widest"
                            >
                                ABORT_OPERATION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const InventoryMobile = memo(InventoryMobileComponent);
