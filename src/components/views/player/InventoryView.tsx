
"use client";

import { useState, memo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Backpack, Gem, Zap, Shield, BookOpen, Repeat, Shirt, Heart, Archive, Box } from 'lucide-react';
import { allShopItems } from '@/lib/shopItems';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define iconMap similar to ShopView
const iconMap: { [key: string]: React.ElementType } = {
    Zap,
    Shield,
    BookOpen,
    Repeat,
    Shirt,
    Heart,
};

const InventoryViewComponent = () => {
    const { profile, persistData } = usePlayerDataContext();
    const { toast } = useToast();
    const isMobile = useIsMobile();

    if (!profile) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <Backpack className="w-16 h-16 text-blue-500/50 mb-4 animate-bounce" />
                    <div className="h-4 bg-blue-900/20 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-blue-900/20 rounded w-48"></div>
                </div>
            </div>
        );
    }

    const inventoryItems = (profile.inventory || []).map((invItem: any) => {
        const details = allShopItems.find(shopItem => shopItem.id === invItem.itemId);
        return { ...invItem, ...details };
    });
    
     const handleEquipItem = (itemToEquip: any) => {
        if (!itemToEquip || itemToEquip.category !== 'Cosméticos') return;

        const updatedProfile = {
            ...profile,
            inventory: (profile.inventory || []).filter((invItem: any) => invItem.instanceId !== itemToEquip.instanceId),
            equipped_items: [
                ...(profile.equipped_items || []),
                {
                    itemId: itemToEquip.id,
                    name: itemToEquip.name,
                    instanceId: itemToEquip.instanceId
                }
            ]
        };

        persistData('profile', updatedProfile);
        toast({
            title: "ITEM EQUIPPED",
            description: `${itemToEquip.name} active.`,
        });
    };

    const handleUseItem = (item: any) => {
        if (!item || !item.effect) return;

        let updatedProfile = { ...profile };
        const now = new Date();

        updatedProfile.active_effects = (updatedProfile.active_effects || []).filter((eff: any) => 
            new Date(eff.expires_at).getTime() > now.getTime()
        );

        switch (item.effect.type) {
            case 'xp_boost':
                const expires_at_xp = new Date(now.getTime() + item.effect.duration_hours * 60 * 60 * 1000).toISOString();
                updatedProfile.active_effects.push({
                    itemId: item.id,
                    type: 'xp_boost',
                    multiplier: item.effect.multiplier,
                    expires_at: expires_at_xp,
                });
                toast({
                    title: `SYSTEM BOOST: ${item.name}`,
                    description: `XP Gain x${item.effect.multiplier} for 1 hour.`,
                });
                break;
            case 'streak_recovery':
                 updatedProfile.active_effects.push({
                    itemId: item.id,
                    type: 'streak_recovery',
                    expires_at: new Date(now.setFullYear(now.getFullYear() + 1)).toISOString(), 
                });
                 toast({
                    title: `SYSTEM PROTECTION: ${item.name}`,
                    description: `Streak loss prevention active.`,
                });
                break;
            case 'health_potion':
                const currentHP = updatedProfile.estatisticas.constituicao;
                const maxHP = 100; // Assuming max HP is 100
                const restoredHP = Math.min(maxHP, currentHP + item.effect.amount);
                updatedProfile.estatisticas.constituicao = restoredHP;
                toast({
                    title: `RECOVERY: ${item.name}`,
                    description: `Restored ${item.effect.amount} HP. Current HP: ${restoredHP}/${maxHP}.`,
                });
                break;
            default:
                toast({ title: 'ITEM ERROR', description: 'Effect not implemented.' });
                return;
        }

        updatedProfile.inventory = (updatedProfile.inventory || []).filter((invItem: any) => invItem.instanceId !== item.instanceId);
        
        persistData('profile', updatedProfile);
    };


    return (
        <div className={cn("h-full overflow-y-auto relative", isMobile ? "p-2" : "p-4 md:p-6")}>
             {/* Background Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10"></div>

            {/* Header */}
            <div className={cn("flex items-center gap-4 mb-6 border-b border-blue-900/30 pb-4")}>
                <div className="p-3 bg-blue-900/10 border border-blue-500/30">
                    <Archive className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                    <h1 className={cn(
                        "font-black text-white font-cinzel tracking-[0.1em] uppercase drop-shadow-md",
                        isMobile ? "text-xl" : "text-3xl"
                    )}>
                        DIMENSIONAL STORAGE
                    </h1>
                    <p className={cn("text-blue-400/60 font-mono text-xs tracking-widest uppercase mt-1")}>
                        ITEM MANAGEMENT INTERFACE
                    </p>
                </div>
            </div>

            {inventoryItems.length > 0 ? (
                <div className={cn(
                    "grid gap-3", 
                    isMobile 
                        ? "grid-cols-2" 
                        : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                )}>
                    {inventoryItems.map((item: any) => {
                        const Icon = iconMap[item.icon] || Box;
                        const purchaseDate = new Date(item.purchaseDate);
                        const timeAgo = formatDistanceToNowStrict(purchaseDate, { addSuffix: true, locale: ptBR });
                        const isEffectActive = profile.active_effects?.some((eff: any) => eff.itemId === item.id);
                        const isCosmetic = item.category === 'Cosméticos';
                        const isEquipped = profile.equipped_items?.some((eq: any) => eq.itemId === item.id);

                        return (
                            <TooltipProvider key={item.instanceId}>
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className={cn(
                                                "relative aspect-square bg-black/60 border hover:bg-blue-900/10 transition-all cursor-pointer group flex flex-col items-center justify-center p-2",
                                                isEffectActive ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "border-blue-900/30 hover:border-blue-500/50",
                                                isEquipped && "border-yellow-500/50 bg-yellow-900/5"
                                            )}
                                            onClick={() => isCosmetic ? handleEquipItem(item) : handleUseItem(item)}
                                        >
                                            {isEquipped && <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                                            
                                            <Icon className={cn(
                                                "h-8 w-8 mb-2 transition-all duration-300 group-hover:scale-110",
                                                isEquipped ? "text-yellow-400" : "text-blue-400"
                                            )}/>
                                            
                                            <span className="text-[10px] text-center font-mono text-gray-400 uppercase leading-tight line-clamp-2 w-full px-1">
                                                {item.name}
                                            </span>

                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-black/95 border border-blue-500/50 p-0 w-64 shadow-xl">
                                        <div className="p-3 border-b border-blue-900/30">
                                            <h4 className="font-bold text-white font-mono uppercase text-sm">{item.name}</h4>
                                            <span className="text-[10px] text-blue-400 font-mono uppercase">{item.category || 'ITEM'}</span>
                                        </div>
                                        <div className="p-3 bg-blue-950/10">
                                            <p className="text-xs text-gray-300 font-mono leading-relaxed mb-3">{item.description}</p>
                                            <div className="text-[10px] text-gray-500 font-mono uppercase">
                                                ACQUIRED: {timeAgo}
                                            </div>
                                        </div>
                                        <div className="p-2 border-t border-blue-900/30 bg-black/80 text-center">
                                            <span className={cn(
                                                "text-xs font-bold font-mono uppercase tracking-wider",
                                                isCosmetic ? "text-yellow-500" : "text-blue-500"
                                            )}>
                                                {isEquipped ? "[ EQUIPPED ]" : isCosmetic ? "[ CLICK TO EQUIP ]" : "[ CLICK TO USE ]"}
                                            </span>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                    
                    {/* Empty Slots Filler */}
                    {Array.from({ length: Math.max(0, 12 - inventoryItems.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square bg-black/20 border border-blue-900/10 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-900/10 rounded-full"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={cn(
                    "flex flex-col items-center justify-center text-center text-muted-foreground border border-blue-900/30 border-dashed bg-blue-950/5 h-64",
                )}>
                    <Box className="h-12 w-12 text-blue-500/20 mb-4" />
                    <p className="font-mono font-bold text-blue-400/50 uppercase tracking-widest text-sm">STORAGE VOID</p>
                    <p className="mt-1 text-[10px] text-blue-300/30 font-mono uppercase">NO ITEMS DETECTED IN DIMENSIONAL POCKET</p>
                </div>
            )}
        </div>
    );
};

export const InventoryView = memo(InventoryViewComponent);
