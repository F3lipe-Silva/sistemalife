"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePlayerDataContext } from '@/hooks/use-player-data';
import { Download, Upload, AlertTriangle, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function DataBackupTab() {
    const { profile, handleImportData, isDataLoaded } = usePlayerDataContext();
    const { toast } = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const isMobile = useIsMobile();

    const handleExportData = () => {
        try {
            const allData = (isDataLoaded && profile) ? {
                profile,
                metas: (window as any).playerDataContext?.metas,
                missions: (window as any).playerDataContext?.missions,
                skills: (window as any).playerDataContext?.skills,
                routine: (window as any).playerDataContext?.routine,
                routineTemplates: (window as any).playerDataContext?.routineTemplates,
                export_date: new Date().toISOString(),
            } : null;

            if (!allData || !allData.metas || !allData.missions || !allData.skills) {
                toast({ variant: "destructive", title: "Erro na Exportação", description: "Os dados do jogador ainda não foram carregados." });
                return;
            }

            const jsonString = JSON.stringify(allData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.download = `sistemavida_backup_${profile.nome_utilizador}_${date}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            toast({
                title: "Exportação Concluída!",
                description: "O seu backup de dados foi descarregado com sucesso.",
            });

        } catch (error) {
            console.error("Erro ao exportar dados:", error);
            toast({
                variant: "destructive",
                title: "Erro na Exportação",
                description: "Não foi possível gerar o seu ficheiro de backup.",
            });
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.type === 'application/json') {
                setSelectedFile(file);
            } else {
                toast({ variant: 'destructive', title: 'Ficheiro Inválido', description: 'Por favor, selecione um ficheiro .json válido.'});
                setSelectedFile(null);
            }
        }
    };
    
    const onImportConfirm = async () => {
        if (!selectedFile) return;
        setIsImporting(true);
        try {
            await handleImportData(selectedFile);
            // A página deve recarregar automaticamente após a importação bem-sucedida.
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Erro na Importação', description: error.message });
            setIsImporting(false);
        }
    };

    return (
        <div className={cn("space-y-6", isMobile && "space-y-4")}>
            <div className="bg-black/60 border border-blue-900/30 p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500/50" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500/50" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500/50" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500/50" />

                <div className="mb-6 border-b border-blue-900/30 pb-2">
                    <h3 className={cn("font-bold font-cinzel text-white uppercase tracking-widest flex items-center gap-2", isMobile ? "text-base" : "text-lg")}>
                        DATA ARCHIVES
                    </h3>
                    <p className={cn("font-mono text-blue-400/50 text-xs", isMobile ? "text-[10px]" : "")}>MANAGE SYSTEM MEMORY BANKS</p>
                </div>

                <div className={cn("space-y-6", isMobile && "space-y-4")}>
                     <div className={cn(
                        "flex items-start justify-between gap-4 border border-blue-900/20 bg-blue-950/5 p-4",
                        isMobile ? "flex-col p-3 gap-3" : "flex-row"
                     )}>
                        <div className={isMobile ? "space-y-1" : ""}>
                            <p className={cn("font-bold text-white font-mono uppercase tracking-wide", isMobile ? "text-sm" : "")}>EXPORT SYSTEM DATA</p>
                            <p className={cn("text-gray-500 font-mono text-xs", isMobile ? "text-[10px]" : "text-xs")}>
                                CREATE JSON BACKUP OF CURRENT PROGRESS STATE.
                            </p>
                        </div>
                        <Button onClick={handleExportData} className={cn("bg-blue-600 hover:bg-blue-500 text-white rounded-none font-mono text-xs uppercase tracking-widest h-9", isMobile ? "w-full" : "w-auto")} disabled={!isDataLoaded}>
                            <Download className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                            DOWNLOAD ARCHIVE
                        </Button>
                    </div>
                    
                    <Separator className="bg-blue-900/30" />

                    <div className={cn(
                        "flex flex-col gap-4 border border-red-500/20 bg-red-950/5 p-4",
                        isMobile ? "p-3 gap-3" : "p-4"
                    )}>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                                 <AlertTriangle className={cn("text-red-500", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                                <p className={cn("font-bold text-red-500 font-mono uppercase tracking-wide", isMobile ? "text-sm" : "")}>OVERWRITE PROTOCOL</p>
                            </div>
                            <p className={cn("text-red-400/60 font-mono text-xs", isMobile ? "text-[10px]" : "text-xs")}>
                                WARNING: IMPORTING DATA WILL PERMANENTLY ERASE CURRENT SESSION.
                            </p>
                        </div>

                        <div className={cn(
                            "flex items-center gap-4",
                            isMobile ? "flex-col gap-3" : "flex-row"
                        )}>
                             <Input 
                                type="file" 
                                accept=".json"
                                onChange={handleFileSelect}
                                className={cn(
                                    "flex-grow bg-black/40 border-red-900/30 text-red-200 font-mono text-xs h-10 rounded-none file:bg-red-900/20 file:text-red-400 file:border-0 file:mr-4 file:py-2 file:px-4 hover:file:bg-red-900/40 cursor-pointer",
                                    isMobile ? "text-[10px] h-9 file:py-1 file:px-2 file:text-[10px]" : ""
                                )}
                                disabled={isImporting}
                            />
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className={cn("bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-900/40 hover:text-white rounded-none font-mono text-xs uppercase tracking-widest h-10", isMobile ? "w-full h-9" : "w-auto")} disabled={!selectedFile || isImporting}>
                                        {isImporting ? <LoaderCircle className={cn("animate-spin mr-2", isMobile ? "h-3 w-3" : "")} /> : <Upload className={cn("mr-2", isMobile ? "h-3 w-3" : "h-4 w-4")} />}
                                        {isImporting ? "IMPORTING..." : "INITIATE OVERWRITE"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-black/95 border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(220,38,38,0.05)_10px,rgba(220,38,38,0.05)_20px)] pointer-events-none" />
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-500 font-mono uppercase tracking-widest">CRITICAL WARNING</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400 font-mono text-xs">
                                            This action will trigger a complete system rewrite using data from <span className="text-white font-bold">{selectedFile?.name}</span>. Current progress will be lost forever.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className={isMobile ? "flex-col gap-2" : ""}>
                                        <AlertDialogCancel disabled={isImporting} className="bg-transparent border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-none font-mono text-xs uppercase tracking-widest">
                                            ABORT
                                        </AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={onImportConfirm} 
                                            disabled={isImporting} 
                                            className="bg-red-600 hover:bg-red-500 text-white rounded-none font-mono text-xs uppercase tracking-widest border border-red-400"
                                        >
                                            CONFIRM OVERWRITE
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}