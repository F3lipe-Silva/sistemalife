"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Bot, BookOpen, Target, Settings, LogOut, Clock, BarChart3, LayoutDashboard, Menu, Award, Store, Backpack, Swords, UserSquare, Trophy, TowerControl, KeySquare, ChevronUp, ChevronDown, TrendingUp, HandCoins, ScrollText, GitFork, Coins, Gem, Star, Menu as MenuIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { DashboardView } from '@/components/views/core/DashboardView';
import { MetasView } from '@/components/views/core/MetasView';
import MissionsView from '@/components/views/core/MissionsView';
import { SkillsView } from '@/components/views/core/SkillsView';
import { RoutineView } from '@/components/views/core/RoutineView';
import { AIChatView } from '@/components/views/ai/AIChatView';
import { SettingsView } from '@/components/views/player/settings/SettingsView';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { OnboardingGuide } from '@/components/custom/OnboardingGuide';
import { AchievementsView } from '@/components/views/player/AchievementsView';
import ShopView from '@/components/views/player/ShopView';
import { InventoryView } from '@/components/views/player/InventoryView';
import { ClassView } from '@/components/views/player/ClassView';
import { SystemAlert } from '@/components/custom/SystemAlert';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useIsMobile } from '@/hooks/use-mobile';
import TowerView from '@/components/views/gamification/TowerView';
import { LoaderCircle, ShieldBan, WifiOff } from 'lucide-react';
import SkillDungeonView from '@/components/views/gamification/SkillDungeonView';
import { DungeonEventPrompt } from '@/components/custom/DungeonEventPrompt';
import DungeonLobbyView from '@/components/views/gamification/DungeonLobbyView';
import { StoryView } from '@/components/views/core/StoryView';

const PushNotificationPrompt = dynamic(() => import('@/components/custom/PushNotificationPrompt').then(mod => mod.PushNotificationPrompt), { ssr: false });

const TopHeader = ({ title, profile, isMobile }: { title: string, profile: any, isMobile: boolean }) => {
  if (!profile) return null;

  return (
    <header className={cn(
      "border-b border-border/50 bg-card/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-30",
      isMobile ? "h-12 px-3" : "h-16 px-4"
    )}>
      <div className="flex items-center gap-3">
        {isMobile ? (
           <div className="md:hidden">
             <span className="font-cinzel font-bold text-base text-primary tracking-wider">{title}</span>
           </div>
        ) : (
           <h1 className="font-cinzel font-bold text-xl text-primary tracking-wider">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-1 text-yellow-500" title="Ouro">
          <Coins className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
          <span className="font-bold text-sm">{profile.gold}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-400" title="Cristais">
          <Gem className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
          <span className="font-bold text-sm">{profile.gems || 0}</span>
        </div>
        <div className="flex items-center gap-1 text-purple-400" title="Nível">
          <Star className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
          <span className="font-bold text-sm">Lvl {profile.level}</span>
        </div>
      </div>
    </header>
  );
};

export default function App() {
  const { authState, logout } = useAuth();
  const { 
      isDataLoaded,
      questNotification, systemAlert, showOnboarding,
      setQuestNotification, setSystemAlert, setShowOnboarding, persistData, profile,
      activeDungeonEvent, setCurrentPage, currentPage, clearDungeonSession
   } = usePlayerDataContext();


  const isMobile = useIsMobile();
    
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Redirecionamento para login se não autenticado
  useEffect(() => {
    if (authState === 'unauthenticated') {
      console.log('🔄 Usuário não autenticado, redirecionando para login...');
      window.location.href = '/login';
    }
  }, [authState]);
  
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const touchEndRef = useRef<{ x: number, y: number } | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null;
    touchStartRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY };
  };

  const onTouchEnd = (fromSheet: boolean = false) => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distanceX = touchStartRef.current.x - touchEndRef.current.x;
    const distanceY = touchStartRef.current.y - touchEndRef.current.y;
    
    if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > minSwipeDistance) {
        const isLeftSwipe = distanceX > 0;
        const isRightSwipe = distanceX < 0;

        if (isRightSwipe && !fromSheet && touchStartRef.current.x < 50 && isMobile) { 
            setIsSheetOpen(true);
        }

        if (isLeftSwipe && fromSheet && isMobile) {
            setIsSheetOpen(false);
        }
    }
    
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (isMobile) setIsSheetOpen(false);
  };

  const handleEnterDungeon = () => {
    setCurrentPage('dungeon');
  }
  

  const NavItem = ({ icon: Icon, label, page, inSheet = false, className = "" }: { 
    icon: React.ComponentType<{ className?: string }>, 
    label: string, 
    page: string, 
    inSheet?: boolean, 
    className?: string 
  }) => {
    const handleNav = () => {
        handleNavigate(page);
    };
    
    return (
        <button
          onClick={handleNav}
          className={cn(
            'w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors duration-200',
            currentPage === page ? 'bg-primary/20 text-primary font-bold' : 'text-gray-400 hover:bg-secondary hover:text-white'
          )}
        >
          <Icon className="h-5 w-5" />
          <span className={cn("font-medium", className)}>{label}</span>
        </button>
    );
  };
  
  const NavContent = ({inSheet = false}) => {
    return (
        <div className="h-full flex flex-col py-4">
          {!inSheet && <div className="font-cinzel text-3xl font-bold text-primary text-center mb-8 tracking-widest px-4">SISTEMA</div>}
          
          <div className="flex-grow overflow-y-auto space-y-1 px-2 scrollbar-hide">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2 px-4">Principal</div>
              <NavItem icon={LayoutDashboard} label="Dashboard" page="dashboard" inSheet={inSheet}/>
              <NavItem icon={BookOpen} label="Metas" page="metas" inSheet={inSheet} />
              <NavItem icon={Target} label="Missões" page="missions" inSheet={inSheet}/>
              <NavItem icon={ScrollText} label="História" page="story" inSheet={inSheet}/>
              
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Aventura</div>
              <NavItem icon={TowerControl} label="Torre" page="tower" inSheet={inSheet}/>
              <NavItem icon={KeySquare} label="Masmorra" page="dungeon" inSheet={inSheet}/>
              
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Personagem</div>
              <NavItem icon={BarChart3} label="Habilidades" page="skills" inSheet={inSheet}/>
              <NavItem icon={UserSquare} label="Classe" page="class" inSheet={inSheet}/>
              <NavItem icon={Clock} label="Rotina" page="routine" inSheet={inSheet}/>
              <NavItem icon={Award} label="Conquistas" page="achievements" inSheet={inSheet} />
              
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Economia</div>
              <NavItem icon={Store} label="Loja" page="shop" inSheet={inSheet} />
              <NavItem icon={Backpack} label="Inventário" page="inventory" inSheet={inSheet} />

              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Sistema</div>
              <NavItem icon={Bot} label="Arquiteto" page="ai-chat" inSheet={inSheet} className="font-cinzel font-bold tracking-wider" />
              <NavItem icon={Settings} label="Configurações" page="settings" inSheet={inSheet}/>
          </div>

          <div className="mt-auto px-2 pt-4 border-t border-border/50">
              <button 
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-gray-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Terminar Sessão</span>
              </button>
          </div>
        </div>
    );
  };

  const NavButton = ({ icon: Icon, label, page, isActive }: { 
    icon: React.ComponentType<{ className?: string }>, 
    label: string, 
    page: string,
    isActive?: boolean
  }) => {
    return (
      <button
        onClick={() => handleNavigate(page)}
        className={cn(
          'flex flex-col items-center justify-center p-3 md:p-2 rounded-xl transition-all duration-200 flex-1',
          isActive 
            ? 'text-primary bg-primary/10 scale-105' 
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
        )}
      >
        <Icon className={cn("h-6 w-6 mb-1", isActive && "fill-current")} />
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  const DropdownNavButton = React.forwardRef<
    HTMLButtonElement,
    {
      icon: React.ComponentType<{ className?: string }>,
      label: string,
      'data-state'?: 'open' | 'closed'
    }
  >(({ icon: Icon, label, ...props }, ref) => {
    const isOpen = props['data-state'] === 'open';
    return (
      <button
        ref={ref}
        {...props}
        className={cn(
          'flex flex-col items-center justify-center p-1 rounded-lg transition-colors flex-shrink-0',
          isOpen ? 'text-primary' : 'text-gray-400'
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs mt-1 whitespace-nowrap">{label}</span>
        {isOpen ? <ChevronUp className="h-3 w-3 mt-1" /> : <ChevronDown className="h-3 w-3 mt-1" />}
      </button>
    );
  });
  DropdownNavButton.displayName = 'DropdownNavButton';

  const DropdownMenu = ({
    children,
    className = ''
  }: {
    children: React.ReactNode,
    className?: string
  }) => {
    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          side="top"
          align="center"
          sideOffset={12}
          className={cn(
            'w-max bg-card/95 border border-border/50 rounded-lg shadow-lg z-50',
            className
          )}
        >
          <div className="py-2">
            {children}
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    );
  };

  const getPageTitle = (page: string) => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'metas': 'Metas',
      'missions': 'Missões',
      'story': 'História',
      'tower': 'Torre do Destino',
      'dungeon': 'Masmorra',
      'skills': 'Habilidades',
      'class': 'Classe',
      'routine': 'Rotina',
      'achievements': 'Conquistas',
      'shop': 'Loja',
      'inventory': 'Inventário',
      'ai-chat': 'Arquiteto',
      'settings': 'Configurações',
    };
    return titles[page] || 'SystemLife';
  };

  const renderContent = () => {
    if (!isDataLoaded) {
      return null
    }

    const views: Record<string, React.ReactNode> = {
      'dashboard': <DashboardView />,
      'metas': <MetasView />,
      'missions': <MissionsView />,
      'story': <StoryView />,
      'skills': <SkillsView onEnterDungeon={handleEnterDungeon} />,
      'class': <ClassView />,
      'routine': <RoutineView />,
      'achievements': <AchievementsView />,
      'shop': <ShopView />,
      'inventory': <InventoryView />,
      'ai-chat': <AIChatView />,
      'settings': <SettingsView />,
      'tower': <TowerView />,
      'dungeon': profile?.dungeon_session ? <SkillDungeonView onExit={() => handleNavigate('dungeon')} /> : <DungeonLobbyView onNavigateToSkills={() => handleNavigate('skills')} />,
    };

    return (
      <div key={currentPage} className="animate-in fade-in-50 duration-500 h-full p-4 md:p-6">
        {views[currentPage] || <DashboardView />}
      </div>
    )
  };
  
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <div className="flex flex-col items-center space-y-4">
          <LoaderCircle className="animate-spin h-10 w-10" />
          <span className="text-xl font-cinzel tracking-wider">A VALIDAR SESSÃO...</span>
          <span className="text-sm text-gray-400">Conectando ao Firebase...</span>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <div className="flex flex-col items-center space-y-4">
          <ShieldBan className="h-10 w-10" />
          <span className="text-xl font-cinzel tracking-wider">REDIRECIONANDO...</span>
          <span className="text-sm text-gray-400">Acesso negado. Redirecionando para login...</span>
        </div>
      </div>
    );
  }
  
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary">
        <div className="flex flex-col items-center space-y-4">
          <LoaderCircle className="animate-spin h-10 w-10" />
          <span className="text-xl font-cinzel tracking-wider">A CARREGAR DADOS DO JOGADOR...</span>
          <span className="text-sm text-gray-400">Sincronizando com o Firestore...</span>
        </div>
      </div>
    );
  }

  if (profile?._isOfflineMode) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center text-yellow-400">
            <div className="flex flex-col items-center space-y-4 text-center p-8">
              <WifiOff className="h-12 w-12" />
              <h1 className="text-2xl font-cinzel tracking-wider">MODO OFFLINE</h1>
              <p className="text-yellow-200/80 max-w-md">Não foi possível conectar ao Firebase. A aplicação está a correr com dados de demonstração. As suas alterações não serão guardadas. Verifique a sua conexão com a internet e atualize a página.</p>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
      {!isMobile && (
        <aside className="w-72 bg-card border-r border-border/50 flex flex-col shadow-xl z-20">
          <NavContent />
        </aside>
      )}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopHeader 
            title={getPageTitle(currentPage)} 
            profile={profile} 
            isMobile={isMobile} 
        />

        <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth",
            isMobile && "pb-40" // Extra padding for bottom nav (increased to avoid overlap)
          )}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => onTouchEnd(false)}
        >
          {renderContent()}
        </main>
        
        {/* Mobile Bottom Navigation - Modern App Style */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 pb-safe pt-2 px-4 z-40 md:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.3)]">
            <div className="flex justify-around items-center max-w-md mx-auto">
              <NavButton icon={LayoutDashboard} label="Início" page="dashboard" isActive={currentPage === 'dashboard'} />
              <NavButton icon={ScrollText} label="História" page="story" isActive={currentPage === 'story'} />
              <NavButton icon={Target} label="Missões" page="missions" isActive={currentPage === 'missions'} />
              <NavButton icon={BookOpen} label="Metas" page="metas" isActive={currentPage === 'metas'} />
              <NavButton icon={TowerControl} label="Torre" page="tower" isActive={currentPage === 'tower'} />
              <NavButton icon={KeySquare} label="Masmorra" page="dungeon" isActive={currentPage === 'dungeon'} />
              
              {/* More Menu */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <button
                        className={cn(
                        'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200',
                        isSheetOpen 
                            ? 'text-primary bg-primary/10' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )}
                    >
                        <MenuIcon className="h-6 w-6 mb-1" />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="md:h-[85vh] h-[92vh] rounded-t-[20px] px-0">
                    <SheetHeader className="px-6 mb-4 text-left">
                        <SheetTitle className="font-cinzel text-2xl text-primary tracking-wider">MENU DO SISTEMA</SheetTitle>
                        <SheetDescription>Acesse todas as funcionalidades do sistema.</SheetDescription>
                    </SheetHeader>
                    <div className="h-full overflow-y-auto pb-20">
                        <NavContent inSheet={true} />
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
