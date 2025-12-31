
"use client";

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Bot, Send, LoaderCircle, Mic, MicOff, Terminal, Cpu } from 'lucide-react';
import { generateSystemAdvice } from '@/lib/ai-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useIsMobile } from '@/hooks/use-mobile';

const AIChatViewComponent = () => {
    const { profile, metas, routine, missions, isDataLoaded } = usePlayerDataContext();
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const isInitialMount = useRef(true);
    const speechRecognitionRef = useRef<any>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
          console.warn("Speech recognition not supported in this browser.");
          return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            getSystemResponse(transcript); 
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            let description = `Não foi possível processar o áudio. Erro: ${event.error}`;
            if (event.error === 'network') {
                description = "Falha de rede. O reconhecimento de voz pode não funcionar neste ambiente de desenvolvimento. Tente usar a funcionalidade num ambiente local (localhost).";
            } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                description = "Permissão para o microfone foi negada. Verifique as permissões do seu navegador.";
            }
            toast({
                variant: 'destructive',
                title: 'Erro no Reconhecimento de Voz',
                description: description
            });
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        speechRecognitionRef.current = recognition;

    }, [toast]);


    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }

    useEffect(scrollToBottom, [messages, isLoading]);

    const getSystemResponse = useCallback(async (query: string) => {
        if (!isDataLoaded) return;
        
        const userMessage = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        setIsLoading(true);
        try {
          const result = await generateSystemAdvice({
            userName: profile.nome_utilizador,
            profile: JSON.stringify(profile),
            metas: JSON.stringify(metas),
            routine: JSON.stringify(routine),
            missions: JSON.stringify(missions.filter((m: any) => !m.concluido)),
            query: query,
            personality: profile.user_settings?.ai_personality || 'balanced',
          });
          const aiMessage = { sender: 'ai', text: result.response };
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Erro ao buscar conselho da IA:", error);
            let errorMessage = 'Não foi possível obter uma resposta. O Sistema pode estar sobrecarregado.';
            if (error instanceof Error && (error.message.includes('429') || error.message.includes('Quota'))) {
                errorMessage = 'Quota de IA excedida. Você atingiu o limite de pedidos. Tente novamente mais tarde.';
            }

            toast({
              variant: 'destructive',
              title: 'Erro de comunicação com o sistema',
              description: errorMessage,
            })
            setMessages(prev => [...prev, { sender: 'ai', text: 'Erro de comunicação. Verifique a sua conexão e tente novamente.'}])
        } finally {
          setIsLoading(false);
        }
    }, [isDataLoaded, profile, metas, routine, missions, toast]);
    
    useEffect(() => {
        if (isDataLoaded && isInitialMount.current) {
             getSystemResponse('Forneça uma análise estratégica do meu estado atual.');
             isInitialMount.current = false;
        }
    }, [isDataLoaded, getSystemResponse]);


    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        await getSystemResponse(input);
    };

    const handleMicClick = () => {
        if (!speechRecognitionRef.current) {
             toast({
                variant: 'destructive',
                title: 'Não Suportado',
                description: `O reconhecimento de voz não é suportado neste navegador.`
            });
            return;
        }

        if (isListening) {
            speechRecognitionRef.current.stop();
        } else {
            speechRecognitionRef.current.start();
            setIsListening(true);
        }
    };


    return (
        <div className="h-full flex flex-col bg-black relative overflow-hidden font-mono">
             {/* Background Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] -z-10 pointer-events-none"></div>
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black -z-10 pointer-events-none"></div>

             <div className={cn("flex-shrink-0 z-10 border-b border-blue-900/50 bg-black/80 backdrop-blur-md", isMobile ? "p-3" : "p-4")}>
                <div className="flex items-center gap-3">
                    <div className="p-2 border border-blue-500/30 bg-blue-900/10">
                        <Terminal className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className={cn("font-bold text-white font-cinzel tracking-[0.15em] uppercase drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]", isMobile ? "text-xl" : "text-2xl")}>
                            SYSTEM ARCHITECT
                        </h1>
                        <p className={cn("text-blue-500/50 font-mono text-xs tracking-widest uppercase mt-0.5", isMobile ? "text-[10px]" : "text-xs")}>
                            DIRECT INTERFACE LINK ESTABLISHED
                        </p>
                    </div>
                </div>
            </div>
            
            <ScrollArea className="flex-grow z-10 p-4" ref={scrollAreaRef}>
                 <div className={cn("mx-auto space-y-6 max-w-4xl", isMobile ? "p-0" : "p-2")}>
                    {messages.map((msg, index) => (
                        <div key={index} className={cn("flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.sender === 'user' && 'flex-row-reverse')}>
                            <div className={cn(
                                "flex-shrink-0 w-8 h-8 flex items-center justify-center border",
                                msg.sender === 'ai' ? "border-blue-500 bg-blue-950/30" : "border-gray-500 bg-gray-900/30"
                            )}>
                                {msg.sender === 'ai' ? <Cpu className="h-5 w-5 text-blue-400" /> : <span className="font-mono text-gray-400 font-bold">P1</span>}
                            </div>
                            
                            <div className={cn(
                                "relative max-w-[85%] p-4 border text-sm font-mono leading-relaxed", 
                                msg.sender === 'user' 
                                ? 'bg-gray-900/50 border-gray-700 text-gray-300' 
                                : 'bg-blue-950/20 border-blue-500/30 text-blue-100 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                            )}>
                                {/* Corner Accents for AI messages */}
                                {msg.sender === 'ai' && (
                                    <>
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500" />
                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500" />
                                    </>
                                )}
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className={cn("flex items-start gap-4 animate-pulse")}>
                             <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-blue-500 bg-blue-950/30">
                                <Cpu className="h-5 w-5 text-blue-400" />
                             </div>
                             <div className="p-4 bg-blue-950/10 border border-blue-500/20 w-full max-w-md">
                                 <div className="h-2 w-24 bg-blue-500/30 mb-2" />
                                 <div className="h-2 w-full bg-blue-500/20 mb-1" />
                                 <div className="h-2 w-2/3 bg-blue-500/20" />
                                 <span className="text-[10px] text-blue-500/50 mt-2 block animate-pulse">PROCESSING DATA...</span>
                             </div>
                         </div>
                     )}
                 </div>
            </ScrollArea>

            <div className={cn("flex-shrink-0 z-10 bg-black border-t border-blue-900/50 p-4", isMobile ? "p-3" : "")}>
                <div className={cn("mx-auto max-w-4xl flex items-center gap-2 relative")}>
                    <div className="absolute left-0 w-1 h-full bg-blue-500/50" />
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isDataLoaded ? (isListening ? "LISTENING..." : "ENTER COMMAND...") : "ESTABLISHING CONNECTION..."}
                        className={cn("flex-1 bg-blue-950/10 border-none focus-visible:ring-0 text-blue-100 font-mono placeholder:text-blue-500/30 rounded-none h-12 pl-4", isMobile ? "text-xs" : "text-sm")}
                        disabled={isLoading || !isDataLoaded}
                    />
                    <Button onClick={handleMicClick} variant="ghost" size="icon" disabled={!isDataLoaded || isLoading} className={cn("h-12 w-12 rounded-none border border-blue-900/30 bg-blue-950/20 hover:bg-blue-900/40 hover:text-blue-400 text-blue-500/50", isListening && "text-red-500 border-red-500/50 bg-red-950/20 animate-pulse")}>
                        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button onClick={handleSend} disabled={isLoading || !input.trim() || !isDataLoaded} size="icon" className={cn("h-12 w-12 bg-blue-600 hover:bg-blue-500 text-white rounded-none shadow-[0_0_10px_rgba(37,99,235,0.4)]")}>
                        {isLoading ? <LoaderCircle className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const AIChatView = memo(AIChatViewComponent);
