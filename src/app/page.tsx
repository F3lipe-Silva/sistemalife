"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { LoaderCircle, ShieldBan, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { DashboardView } from '@/components/views/core/DashboardView';
import { DashboardMobile } from '@/components/views/core/DashboardMobile';
import { MissionsMobile } from '@/components/views/core/MissionsMobile';
import { default as MissionsView } from '@/components/views/core/MissionsView';
import { MetasView } from '@/components/views/core/MetasView';
import { MetasMobile } from '@/components/views/core/MetasMobile';
import { SkillsView } from '@/components/views/core/SkillsView';
import { SkillsMobile } from '@/components/views/core/SkillsMobile';
import { AIChatView } from '@/components/views/ai/AIChatView';
import { AIChatMobile } from '@/components/views/ai/AIChatMobile';
import { SettingsView } from '@/components/views/player/settings/SettingsView';
import { SettingsMobile } from '@/components/views/player/settings/SettingsMobile';
import { OnboardingGuide } from '@/components/custom/OnboardingGuide';
import { AchievementsView } from '@/components/views/player/AchievementsView';
import { AchievementsMobile } from '@/components/views/player/AchievementsMobile';
import ShopView from '@/components/views/player/ShopView';
import { ShopMobile } from '@/components/views/player/ShopMobile';
import { InventoryView } from '@/components/views/player/InventoryView';
import { InventoryMobile } from '@/components/views/player/InventoryMobile';
import { ClassView } from '@/components/views/player/ClassView';
import { ClassMobile } from '@/components/views/player/ClassMobile';
import { SystemAlert } from '@/components/custom/SystemAlert';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useIsMobile } from '@/hooks/use-mobile';
import TowerView from '@/components/views/gamification/TowerView';
import { TowerMobile } from '@/components/views/gamification/TowerMobile';
import SkillDungeonView from '@/components/views/gamification/SkillDungeonView';
import { DungeonMobile } from '@/components/views/gamification/DungeonMobile';
import { DungeonEventPrompt } from '@/components/custom/DungeonEventPrompt';
import DungeonLobbyView from '@/components/views/gamification/DungeonLobbyView';
import { TopHeader } from '@/components/layout/TopHeader';
import { Sidebar } from '@/components/layout/Sidebar';
// import { MobileNavigation } from '@/components/layout/MobileNavigation'; // We will remove this usage
import { IonicMobileNavigation } from '@/components/layout/IonicMobileNavigation';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu as MenuIcon } from 'lucide-react';

const PushNotificationPrompt = dynamic(() => import('@/components/custom/PushNotificationPrompt').then(mod => mod.PushNotificationPrompt), { ssr: false });



import { useRouter } from 'next/navigation';

export default function App() {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const {
    isDataLoaded,
    questNotification, systemAlert, showOnboarding,
    setQuestNotification, setSystemAlert, setShowOnboarding, persistData, profile,
    activeDungeonEvent, setCurrentPage, currentPage, clearDungeonSession
  } = usePlayerDataContext();


  const isMobile = useIsMobile();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Command Palette Keyboard Shortcut (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Redirecionamento para login se não autenticado
  useEffect(() => {
    if (authState === 'unauthenticated') {
      console.log('🔄 Usuário não autenticado, redirecionando para login...');
      router.push('/login');
    }
  }, [authState, router]);

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




  const getPageTitle = (page: string) => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'metas': 'Metas',
      'missions': 'Missões',
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
      'dashboard': isMobile ? <DashboardMobile /> : <DashboardView />,
      'metas': isMobile ? <MetasMobile /> : <MetasView />,
      'missions': isMobile ? <MissionsMobile /> : <MissionsView />,
      'skills': isMobile ? <SkillsMobile /> : <SkillsView onEnterDungeon={handleEnterDungeon} />,
      'class': isMobile ? <ClassMobile /> : <ClassView />,
      'achievements': isMobile ? <AchievementsMobile /> : <AchievementsView />,
      'shop': isMobile ? <ShopMobile /> : <ShopView />,
      'inventory': isMobile ? <InventoryMobile /> : <InventoryView />,
      'ai-chat': isMobile ? <AIChatMobile /> : <AIChatView />,
      'settings': isMobile ? <SettingsMobile /> : <SettingsView />,
      'tower': isMobile ? <TowerView /> : <TowerView />,
      'tower-lobby': <TowerMobile />,
      'dungeon': profile?.dungeon_session ? <SkillDungeonView onExit={() => handleNavigate('dungeon')} /> : (isMobile ? <DungeonMobile /> : <DungeonLobbyView onNavigateToSkills={() => handleNavigate('skills')} />),
    };

    const isNativeView = isMobile && ['dashboard', 'missions', 'metas', 'skills', 'class', 'achievements', 'shop', 'inventory', 'ai-chat', 'settings', 'tower', 'tower-lobby', 'dungeon'].includes(currentPage);

    return (
      <div 
        key={currentPage} 
        className={cn(
          "animate-fade-in-scale min-h-full",
          !isNativeView && "p-4 md:p-6",
          isNativeView && "h-full"
        )}
      >
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
    <>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Native App Container with Safe Areas */}
      <div
        className="h-screen bg-background text-foreground flex font-sans overflow-hidden"
      >
        {!isMobile && (
          <aside className={cn(
            "bg-card border-r border-border/50 flex flex-col shadow-xl z-20 transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "w-20" : "w-72"
          )}>
            <Sidebar
              collapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </aside>
        )}

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {!(isMobile && ['dashboard', 'missions', 'metas', 'skills', 'class', 'achievements', 'shop', 'inventory', 'ai-chat', 'settings', 'tower', 'dungeon', 'tower-lobby'].includes(currentPage)) && (
            <TopHeader
              title={getPageTitle(currentPage)}
              profile={profile}
              isMobile={isMobile}
              onOpenCommand={() => setCommandOpen(true)}
            />
          )}

          <main
            className={cn(
              "flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth",
              isMobile && !['dashboard', 'missions', 'metas', 'skills', 'class', 'achievements', 'shop', 'inventory', 'ai-chat', 'settings', 'tower', 'dungeon', 'tower-lobby'].includes(currentPage) && "pb-28",
              isMobile && ['dashboard', 'missions', 'metas', 'skills', 'class', 'achievements', 'shop', 'inventory', 'ai-chat', 'settings', 'tower', 'dungeon', 'tower-lobby'].includes(currentPage) && "pb-0 overflow-hidden"
            )}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => onTouchEnd(false)}
            style={{
              WebkitOverflowScrolling: 'touch', // Native iOS scroll behavior
              scrollBehavior: 'smooth'
            }}
          >
            {renderContent()}
          </main>

          {/* Enhanced Mobile Bottom Navigation */}
          {isMobile && (
            <>
              <IonicMobileNavigation
                onNavigate={handleNavigate}
                onMenuOpen={() => setIsSheetOpen(true)}
              />

              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetContent
                    side="bottom"
                    className="md:h-[85vh] h-[92vh] rounded-t-[24px] px-0 bg-card/95 backdrop-blur-xl border-t-2 border-primary/20"
                    style={{
                      paddingBottom: 'env(safe-area-inset-bottom)',
                      borderRadius: '24px 24px 0 0'
                    }}
                  >
                       <SheetHeader className="px-6 mb-4 text-left">
                          <SheetTitle className="font-cinzel text-2xl text-gradient tracking-wider flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                  <MenuIcon className="h-4 w-4 text-primary" />
                              </div>
                              MENU DO SISTEMA
                          </SheetTitle>
                          <SheetDescription className="text-muted-foreground/80">Acesse todas as funcionalidades do sistema.</SheetDescription>
                      </SheetHeader>
                      <div
                        className="h-full overflow-y-auto pb-safe"
                        style={{
                          paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)',
                          WebkitOverflowScrolling: 'touch'
                        }}
                      >
                          <Sidebar inSheet={true} onNavigate={(page) => handleNavigate(page)} />
                      </div>
                  </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </>
  );
}
