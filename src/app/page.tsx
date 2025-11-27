"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { LoaderCircle, ShieldBan, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { DashboardView } from '@/components/views/core/DashboardView';
import { MetasView } from '@/components/views/core/MetasView';
import MissionsView from '@/components/views/core/MissionsView';
import { SkillsView } from '@/components/views/core/SkillsView';
import { RoutineView } from '@/components/views/core/RoutineView';
import { AIChatView } from '@/components/views/ai/AIChatView';
import { SettingsView } from '@/components/views/player/settings/SettingsView';
import { OnboardingGuide } from '@/components/custom/OnboardingGuide';
import { AchievementsView } from '@/components/views/player/AchievementsView';
import ShopView from '@/components/views/player/ShopView';
import { InventoryView } from '@/components/views/player/InventoryView';
import { ClassView } from '@/components/views/player/ClassView';
import { SystemAlert } from '@/components/custom/SystemAlert';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useIsMobile } from '@/hooks/use-mobile';
import TowerView from '@/components/views/gamification/TowerView';
import SkillDungeonView from '@/components/views/gamification/SkillDungeonView';
import { DungeonEventPrompt } from '@/components/custom/DungeonEventPrompt';
import DungeonLobbyView from '@/components/views/gamification/DungeonLobbyView';
import { TopHeader } from '@/components/layout/TopHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';

const PushNotificationPrompt = dynamic(() => import('@/components/custom/PushNotificationPrompt').then(mod => mod.PushNotificationPrompt), { ssr: false });



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
      'dashboard': <DashboardView />,
      'metas': <MetasView />,
      'missions': <MissionsView />,
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
          <Sidebar />
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
          <MobileNavigation
            onNavigate={handleNavigate}
            isSheetOpen={isSheetOpen}
            onSheetOpenChange={setIsSheetOpen}
          />
        )}
      </div>
    </div>
  );
}
