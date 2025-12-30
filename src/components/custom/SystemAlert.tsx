
"use client";

import { useState, useEffect } from 'react';
import { Bot, X, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SystemAlertProps {
  message: string;
  position: { top: string; left: string; };
  onDismiss: () => void;
}

export const SystemAlert = ({ message, position, onDismiss }: SystemAlertProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setIsVisible(true);

    // Auto-dismiss after some time
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 12000); // 12 seconds

    return () => clearTimeout(dismissTimer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Allow time for fade-out animation before calling onDismiss
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-500 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
      style={{ top: position.top, left: position.left, transform: 'translateX(-50%)' }}
    >
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-blue-500/30 rounded-sm blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
        
        <div className="relative bg-blue-950/90 border border-blue-500/60 text-blue-100 shadow-[0_0_20px_rgba(37,99,235,0.2)] backdrop-blur-xl min-w-[300px] max-w-sm overflow-hidden">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-400"></div>

            <div className="flex items-center justify-between px-3 py-1.5 bg-blue-900/40 border-b border-blue-500/30">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-3 w-3 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-blue-300 uppercase tracking-widest">SYSTEM NOTIFICATION</span>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-blue-400/50 hover:text-white transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>

            <div className="p-4 flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <Bot className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-xs font-mono leading-relaxed text-blue-100/90">
                    {message}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
