import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { home, target, book, hardwareChip, key, menu, grid } from 'ionicons/icons';
import { usePlayerDataContext } from '@/hooks/use-player-data';

interface IonicMobileNavigationProps {
    onNavigate: (page: string) => void;
    onMenuOpen: () => void;
}

export const IonicMobileNavigation = ({ onNavigate, onMenuOpen }: IonicMobileNavigationProps) => {
    const { currentPage } = usePlayerDataContext();

    return (
        <IonTabBar className="fixed bottom-0 w-full z-50 pb-safe bg-card border-t border-border/20">
            <IonTabButton 
                tab="dashboard" 
                selected={currentPage === 'dashboard'} 
                onClick={() => onNavigate('dashboard')}
            >
                <IonIcon icon={home} />
                <IonLabel>Início</IonLabel>
            </IonTabButton>

            <IonTabButton 
                tab="missions" 
                selected={currentPage === 'missions'} 
                onClick={() => onNavigate('missions')}
            >
                <IonIcon icon={target} />
                <IonLabel>Missões</IonLabel>
            </IonTabButton>

            <IonTabButton 
                tab="metas" 
                selected={currentPage === 'metas'} 
                onClick={() => onNavigate('metas')}
            >
                <IonIcon icon={book} />
                <IonLabel>Metas</IonLabel>
            </IonTabButton>

             <IonTabButton 
                tab="dungeon" 
                selected={currentPage === 'dungeon' || currentPage === 'tower'} 
                onClick={() => onNavigate('dungeon')}
            >
                <IonIcon icon={key} />
                <IonLabel>Masmorra</IonLabel>
            </IonTabButton>

            <IonTabButton tab="menu" onClick={onMenuOpen}>
                <IonIcon icon={grid} />
                <IonLabel>Menu</IonLabel>
            </IonTabButton>
        </IonTabBar>
    );
};
