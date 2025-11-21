
"use client";

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Bot, Send, LoaderCircle, Mic, MicOff, User, Sparkles, Target, Zap, Trash2 } from 'lucide-react';
import { generateSystemAdvice } from '@/ai/flows/generate-personalized-advice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { useIsMobile } from '@/hooks/use-mobile';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIChatViewComponent = () => {
    const { profile, metas, routine, missions, isDataLoaded, setCurrentPage } = usePlayerDataContext();
    const [messages, setMessages] = useState<{ sender: string; text: string; actions?: { label: string; action: string }[] }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isListening, setIsListening] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
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
            setInputValue(transcript);
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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleActionClick = (action: string, label: string) => {
        if (action.startsWith('navigate:')) {
            const path = action.split(':')[1];
            // Remove leading slash if present, as setCurrentPage expects 'metas', 'missions', etc.
            const page = path.replace(/^\//, '');

            if (page) {
                setCurrentPage(page);
                toast({ title: "Navegação", description: `Navegando para ${label}...` });
            } else {
                toast({ variant: 'destructive', title: "Erro de Navegação", description: `Caminho inválido: ${path}` });
            }
        } else if (action.startsWith('fill_input:')) {
            const text = action.split(':')[1];
            setInputValue(text);
        } else {
            handleSend(label);
        }
    };

    const getSystemResponse = useCallback(async (query: string) => {
        if (!isDataLoaded) return;

        const userMessage = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

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

            const aiMessage = {
                sender: 'ai',
                text: result.response,
                actions: result.suggestedActions
            };
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
            setMessages(prev => [...prev, { sender: 'ai', text: 'Erro de comunicação. Verifique a sua conexão e tente novamente.' }])
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


    const handleSend = async (text?: string) => {
        const messageToSend = text || inputValue;
        if (!messageToSend.trim() || isLoading) return;
        await getSystemResponse(messageToSend);
    };

    const toggleListening = () => {
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearMessages = () => {
        setMessages([]);
        toast({ title: "Memória Limpa", description: "O histórico do chat foi apagado." });
    };

    return (
        <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm">
            {/* Header */}
            <div className={cn("flex items-center justify-between border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10", isMobile ? "p-3" : "p-4")}>
                <div className="flex items-center gap-3">
                    <div className={cn("rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20", isMobile ? "w-8 h-8" : "w-10 h-10")}>
                        <Bot className={cn("text-cyan-400", isMobile ? "w-4 h-4" : "w-6 h-6")} />
                    </div>
                    <div>
                        <h2 className={cn("font-bold text-foreground font-cinzel tracking-wider flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
                            SISTEMA
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        </h2>
                        <p className={cn("text-muted-foreground", isMobile ? "text-[10px]" : "text-xs")}>Online • Nível {profile?.nivel || 1}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearMessages} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className={cn("", isMobile ? "w-4 h-4" : "w-5 h-5")} />
                </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className={cn("space-y-6", isMobile ? "pb-20" : "pb-4")}>
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 opacity-50 animate-in fade-in duration-1000">
                            <div className="w-20 h-20 rounded-full bg-cyan-500/5 flex items-center justify-center border border-cyan-500/10 mb-4">
                                <Bot className="w-10 h-10 text-cyan-500/40" />
                            </div>
                            <p className="text-muted-foreground max-w-xs text-sm">
                                "Saudações, Caçador. Estou pronto para analisar o seu progresso e definir a próxima estratégia."
                            </p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={index} className={cn("flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-300", msg.sender === 'user' ? 'items-end' : 'items-start')}>
                            <div className={cn("flex items-start gap-3", msg.sender === 'user' && 'flex-row-reverse')}>
                                {msg.sender === 'ai' && (
                                    <div className={cn("flex-shrink-0 rounded-full bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center mt-1", isMobile ? "w-8 h-8" : "w-10 h-10")}>
                                        <Bot className={cn("text-cyan-400", isMobile ? "w-4 h-4" : "w-5 h-5")} />
                                    </div>
                                )}
                                {msg.sender === 'user' && (
                                    <div className={cn("flex-shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mt-1", isMobile ? "w-8 h-8" : "w-10 h-10")}>
                                        <User className={cn("text-primary", isMobile ? "w-4 h-4" : "w-5 h-5")} />
                                    </div>
                                )}

                                <div className={cn(
                                    "rounded-2xl relative group transition-all duration-200",
                                    msg.sender === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-lg shadow-primary/5'
                                        : 'bg-card border border-border/50 text-card-foreground rounded-tl-sm shadow-sm',
                                    isMobile ? "p-3 text-sm max-w-[85%]" : "p-5 text-base max-w-2xl"
                                )}>
                                    {msg.sender === 'ai' ? (
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-cyan-400 prose-strong:text-cyan-300 prose-ul:my-2 prose-li:my-0.5">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap font-sans leading-relaxed">{msg.text}</p>
                                    )}

                                    <span className={cn(
                                        "text-[10px] absolute bottom-1 opacity-0 group-hover:opacity-70 transition-opacity",
                                        msg.sender === 'user' ? "right-2 text-primary-foreground/60" : "left-4 text-muted-foreground"
                                    )}>
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Suggested Actions */}
                            {msg.sender === 'ai' && msg.actions && msg.actions.length > 0 && (
                                <div className="flex flex-wrap gap-2 ml-12 mt-1">
                                    {msg.actions.map((action, idx) => (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
                                            onClick={() => handleActionClick(action.action, action.label)}
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex items-start gap-3 animate-in fade-in duration-300">
                            <div className={cn("flex-shrink-0 rounded-full bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-center mt-1", isMobile ? "w-8 h-8" : "w-10 h-10")}>
                                <Bot className={cn("text-cyan-400", isMobile ? "w-4 h-4" : "w-5 h-5")} />
                            </div>
                            <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 shadow-sm">
                                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Quick Actions & Input Area */}
            <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50 space-y-3">
                {/* Quick Actions */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
                    <Button variant="outline" size="sm" className="rounded-full border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400 text-xs whitespace-nowrap" onClick={() => handleSend("Qual é a minha próxima missão prioritária?")}>
                        <Target className="w-3 h-3 mr-1.5" /> Próxima Missão
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-400 text-xs whitespace-nowrap" onClick={() => handleSend("Analise o meu progresso atual e sugira melhorias.")}>
                        <Sparkles className="w-3 h-3 mr-1.5" /> Analisar Progresso
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-400 text-xs whitespace-nowrap" onClick={() => handleSend("Estou desmotivado. Preciso de um incentivo do Sistema.")}>
                        <Zap className="w-3 h-3 mr-1.5" /> Motivação
                    </Button>
                </div>

                {/* Input */}
                <div className="relative flex items-end gap-2">
                    <div className="relative flex-1">
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite sua mensagem para o Sistema..."
                            className={cn(
                                "min-h-[50px] max-h-[150px] pr-10 resize-none rounded-xl border-border/50 focus:border-cyan-500/50 focus:ring-cyan-500/20 bg-secondary/50",
                                isMobile ? "text-sm py-3" : "text-base py-3"
                            )}
                            rows={1}
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn("absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary", isListening && "text-red-500 animate-pulse")}
                            onClick={toggleListening}
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </Button>
                    </div>
                    <Button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isLoading}
                        size="icon"
                        className={cn("rounded-xl h-[50px] w-[50px] shadow-lg shadow-cyan-500/20 transition-all duration-300", inputValue.trim() ? "bg-cyan-600 hover:bg-cyan-500" : "bg-muted text-muted-foreground")}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const AIChatView = memo(AIChatViewComponent);
