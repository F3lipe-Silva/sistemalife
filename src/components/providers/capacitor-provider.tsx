'use client';

import React, { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // --- Status Bar Configuration ---
    const setupStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
      } catch (e) {
        console.warn('StatusBar not available', e);
      }
    };

    // --- Network Monitoring ---
    const setupNetwork = async () => {
      Network.addListener('networkStatusChange', status => {
        if (!status.connected) {
          toast({
            variant: 'destructive',
            title: 'SYSTEM_OFFLINE',
            description: 'Neural link lost. Changes will be cached locally.',
          });
          Haptics.impact({ style: ImpactStyle.Heavy });
        } else {
          toast({
            title: 'SYSTEM_ONLINE',
            description: 'Neural link re-established.',
          });
          Haptics.notification({ type: 'SUCCESS' as any });
        }
      });
    };

    // --- Keyboard Handling ---
    const setupKeyboard = () => {
      if (Capacitor.getPlatform() === 'ios') {
        Keyboard.setAccessoryBarVisible({ isVisible: false });
      }
    };

    // --- Initialization ---
    const init = async () => {
      await setupStatusBar();
      await setupNetwork();
      setupKeyboard();
      
      // Hide splash screen after system initialization
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 500);
    };

    init();

    // Clean up listeners
    return () => {
      Network.removeAllListeners();
    };
  }, [toast]);

  return <>{children}</>;
}
