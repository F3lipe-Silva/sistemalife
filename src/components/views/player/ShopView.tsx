
"use client";

import { useState, memo, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem, LoaderCircle, Sparkles, Zap, Shield, BookOpen, Repeat, RefreshCw, Ticket, Heart, Shirt, KeySquare, ShoppingBag, Coins } from 'lucide-react';
import { allShopItems } from '@/lib/shopItems';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { generateShopItems } from '@/lib/ai-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isToday, parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

const iconMap: { [key: string]: React.ElementType } = {
    Zap,
    Shield,
    BookOpen,
    Repeat,
    Ticket,
    Heart,
    Shirt,
    KeySquare,
};

const getRarityColor = (price: number) => {
    if (price >= 1000) return { border: 'border-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/20' }; // Legendary
    if (price >= 500) return { border: 'border-purple-500', text: 'text-purple-500', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/20' }; // Epic
    if (price >= 100) return { border: 'border-blue-500', text: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20' }; // Rare
    return { border: 'border-gray-500', text: 'text-gray-400', bg: 'bg-gray-500/10', glow: 'shadow-none' }; // Common
};

const ShopViewComponent = () => {
    const { profile, missions, skills, persistData, isDataLoaded } = usePlayerDataContext();
    const { toast } = useToast();
    const [isBuying, setIsBuying] = useState<string | null>(null);
    const [isGeneratingItems, setIsGeneratingItems] = useState(false);
    const isMobile = useIsMobile();

    const fetchShopItems = useCallback(async (forceRefresh = false) => {
        if (!isDataLoaded || !profile) return;

        const lastGenerated = profile.shop_last_generated_at;
        const itemsExist = profile.recommended_shop_items && profile.recommended_shop_items.length > 0;

        if (itemsExist && lastGenerated && isToday(parseISO(lastGenerated)) && !forceRefresh) {
            console.log("Using cached shop items.");
            return;
        }
        
        setIsGeneratingItems(true);
        try {
            const activeMissions = missions.filter((m: { concluido: any; }) => !m.concluido);
            const serializableShopItems = allShopItems.map(({ icon, ...rest }) => rest);

            const result = await generateShopItems({
                profile: JSON.stringify(profile),
                skills: JSON.stringify(skills),
                activeMissions: JSON.stringify(activeMissions),
                allItems: serializableShopItems,
            });
            
            const updatedProfile = {
                ...profile,
                recommended_shop_items: result.recommendedItems || [],
                shop_last_generated_at: new Date().toISOString(),
            };
            await persistData('profile', updatedProfile);

            if (forceRefresh) {
                 toast({ title: "SHOP REFRESHED", description: "New inventory acquired." });
            }

        } catch (error) {
            console.error("Failed to generate shop items:", error);
            toast({
                variant: 'destructive',
                title: "CONNECTION ERROR",
                description: "Merchant unavailable. Loading standard stock."
            });
            const fallbackItems = {
                ...profile,
                recommended_shop_items: allShopItems.slice(0, 3),
                shop_last_generated_at: new Date().toISOString(),
            }
             await persistData('profile', fallbackItems);
        } finally {
            setIsGeneratingItems(false);
        }
    }, [isDataLoaded, profile, missions, skills, toast, persistData]);
    
    useEffect(() => {
        fetchShopItems();
    }, [isDataLoaded]);


    const handleBuyItem = (item: any) => {
        if (!profile || isBuying) return;

        if ((profile.fragmentos || 0) < item.price) {
            toast({
                variant: 'destructive',
                title: 'INSUFFICIENT FUNDS',
                description: `Need ${item.price - (profile.fragmentos || 0)} more fragments.`,
            });
            return;
        }

        setIsBuying(item.id);
        
        setTimeout(() => {
            const newInventoryItem = {
                itemId: item.id,
                purchaseDate: new Date().toISOString(),
                instanceId: `${item.id}_${Date.now()}`
            };
            
            let updatedProfile = { ...profile };

            if (item.id === 'tower_ticket') {
                 updatedProfile.tower_progress = {
                    ...updatedProfile.tower_progress!,
                    tower_tickets: (updatedProfile.tower_progress?.tower_tickets || 0) + 1
                };
            } else {
                 updatedProfile.inventory = [...(profile.inventory || []), newInventoryItem];
            }

            updatedProfile.fragmentos = (updatedProfile.fragmentos || 0) - item.price;
            
            persistData('profile', updatedProfile);

            toast({
                title: 'TRANSACTION COMPLETE',
                description: `Acquired: ${item.name}`,
            });
            setIsBuying(null);
        }, 500);

    };

    if (!profile) {
        return (
            <div className="p-4 md:p-6 h-full flex items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }
    
    const shopItems = profile.recommended_shop_items || [];
    
    const renderShopContent = () => {
        if (isGeneratingItems) {
            return (
                <div className={cn(
                    "grid gap-4", 
                    isMobile 
                        ? "grid-cols-1 sm:grid-cols-2" 
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                )}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={cn("bg-black/40 border border-blue-900/30 h-48 animate-pulse flex items-center justify-center")}>
                            <LoaderCircle className="h-8 w-8 text-blue-900 animate-spin" />
                        </div>
                    ))}
                </div>
            );
        }

        if (shopItems.length === 0) {
            return (
                 <div className={cn("flex flex-col items-center justify-center text-center text-muted-foreground border border-blue-900/30 border-dashed bg-blue-950/10", isMobile ? "h-48 p-4" : "h-64 p-8")}>
                    <ShoppingBag className={cn("text-blue-500/30 mb-4", isMobile ? "h-8 w-8" : "h-12 w-12")} />
                    <p className={cn("font-mono font-bold text-blue-400 uppercase tracking-widest", isMobile ? "text-sm" : "text-base")}>STOCK DEPLETED</p>
                    <p className={cn("mt-1 text-blue-300/50 font-mono text-xs", isMobile ? "text-[10px]" : "text-xs")}>Merchant is restocking. Check back later.</p>
                </div>
            )
        }

        return (
             <div className={cn(
                "grid gap-4", 
                isMobile 
                    ? "grid-cols-1 sm:grid-cols-2" 
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            )}>
                {shopItems.map((item: any) => {
                    const itemDetails = allShopItems.find(i => i.id === item.id);
                    if (!itemDetails) return null;

                    const Icon = iconMap[itemDetails.icon];
                    const canAfford = (profile.fragmentos || 0) >= item.price;
                    const rarity = getRarityColor(item.price);
                    
                    return (
                        <div 
                            key={item.id}
                            className={cn(
                                "relative group border bg-black/60 transition-all duration-300 overflow-hidden flex flex-col",
                                rarity.border,
                                canAfford ? 'hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]' : 'opacity-70 grayscale-[0.5]',
                                isMobile ? 'p-3' : 'p-4'
                            )}
                        >
                            <div className="flex flex-row items-start gap-4 mb-3">
                                 <div className={cn(
                                     "flex items-center justify-center flex-shrink-0 border bg-black",
                                     rarity.border,
                                     isMobile ? "w-12 h-12" : "w-16 h-16"
                                 )}>
                                    <Icon className={cn("text-white", isMobile ? "w-6 h-6" : "w-8 h-8")}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn("font-bold text-white font-mono uppercase truncate", rarity.text, isMobile ? "text-sm" : "text-base")}>
                                        {item.name}
                                    </h3>
                                    <p className={cn("text-gray-400 font-mono text-xs mt-1 line-clamp-2", isMobile ? "text-[10px]" : "text-xs")}>
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            
                            {item.reasoning && (
                                <div className="mb-3 px-2 py-1 bg-blue-900/20 border-l-2 border-blue-500 text-[10px] text-blue-300 font-mono italic">
                                    "{item.reasoning}"
                                </div>
                            )}

                            <div className="mt-auto pt-3 border-t border-gray-800">
                                <Button 
                                    className={cn(
                                        "w-full rounded-none font-mono text-xs uppercase tracking-wider h-9",
                                        canAfford 
                                            ? "bg-blue-600 hover:bg-blue-500 text-white" 
                                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                    )} 
                                    onClick={() => handleBuyItem(item)}
                                    disabled={!canAfford || isBuying === item.id}
                                >
                                    {isBuying === item.id ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Gem className="h-3 w-3" />
                                            {item.price}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )
    }

    return (
        <div className={cn("h-full overflow-y-auto relative", isMobile ? "p-2" : "p-4 md:p-6")}>
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10"></div>

            <div className={cn("flex flex-col gap-4 mb-6 border-b border-blue-900/30 pb-4", isMobile ? "sm:flex-row sm:items-center sm:justify-between" : "sm:flex-row sm:items-center sm:justify-between")}>
                <div>
                    <h1 className={cn("font-black text-white font-cinzel tracking-[0.1em] drop-shadow-md uppercase", isMobile ? "text-2xl" : "text-3xl")}>
                        SYSTEM SHOP
                    </h1>
                    <p className={cn("text-blue-400/60 font-mono text-xs tracking-widest uppercase mt-1")}>
                        ACQUIRE UPGRADES & CONSUMABLES
                    </p>
                </div>
                <div className={cn("flex items-center gap-3", isMobile ? "justify-between w-full" : "")}>
                     <div className={cn("flex items-center gap-2 bg-black/60 border border-yellow-500/30 px-3 py-1.5", isMobile ? "flex-1 justify-center" : "")}>
                        <Gem className={cn("text-yellow-500", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                        <span className={cn("font-mono font-bold text-white", isMobile ? "text-lg" : "text-xl")}>{profile.fragmentos || 0}</span>
                    </div>
                     <Button variant="outline" size="icon" onClick={() => fetchShopItems(true)} disabled={isGeneratingItems} className={cn("border-blue-500/30 text-blue-400 hover:bg-blue-900/20 hover:text-white rounded-none", isMobile ? "h-10 w-10" : "")}>
                        <RefreshCw className={cn("h-4 w-4", isGeneratingItems && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {renderShopContent()}
        </div>
    );
};

export default memo(ShopViewComponent);
