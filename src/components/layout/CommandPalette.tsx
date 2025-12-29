"use client"

import * as React from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  BookOpen,
  Target,
  TowerControl,
  KeySquare,
  BarChart3,
  UserSquare,
  Clock,
  Award,
  Store,
  Backpack,
  Bot,
  Settings,
  Search,
  Sparkles,
} from "lucide-react"
import { usePlayerDataContext } from "@/hooks/use-player-data"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { setCurrentPage } = usePlayerDataContext()

  const navigate = (page: string) => {
    setCurrentPage(page)
    onOpenChange(false)
  }

  const pages = [
    {
      group: "Principal",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", page: "dashboard", keywords: ["home", "inicio", "principal"] },
        { icon: BookOpen, label: "Metas", page: "metas", keywords: ["objetivos", "goals", "targets"] },
        { icon: Target, label: "Missões", page: "missions", keywords: ["quests", "tasks", "tarefas"] },
      ],
    },
    {
      group: "Aventura",
      items: [
        { icon: TowerControl, label: "Torre do Destino", page: "tower", keywords: ["tower", "challenge", "desafio"] },
        { icon: KeySquare, label: "Masmorra", page: "dungeon", keywords: ["dungeon", "batalha", "battle"] },
      ],
    },
    {
      group: "Personagem",
      items: [
        { icon: BarChart3, label: "Habilidades", page: "skills", keywords: ["skills", "abilities", "poderes"] },
        { icon: UserSquare, label: "Classe", page: "class", keywords: ["class", "role", "papel"] },
        { icon: Clock, label: "Rotina", page: "routine", keywords: ["routine", "habits", "habitos"] },
        { icon: Award, label: "Conquistas", page: "achievements", keywords: ["achievements", "trofeus", "trophies"] },
      ],
    },
    {
      group: "Economia",
      items: [
        { icon: Store, label: "Loja", page: "shop", keywords: ["shop", "store", "compras"] },
        { icon: Backpack, label: "Inventário", page: "inventory", keywords: ["inventory", "items", "itens"] },
      ],
    },
    {
      group: "Sistema",
      items: [
        { icon: Bot, label: "Arquiteto IA", page: "ai-chat", keywords: ["ai", "chat", "assistant", "ajuda"] },
        { icon: Settings, label: "Configurações", page: "settings", keywords: ["settings", "config", "opcoes"] },
      ],
    },
  ]

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Procurar páginas, ações..." />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>
          </div>
        </CommandEmpty>
        
        {pages.map((group, idx) => (
          <React.Fragment key={group.group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group.group}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.page}
                  value={`${item.label} ${item.keywords.join(" ")}`}
                  onSelect={() => navigate(item.page)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <item.icon className="h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
      
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
        <Sparkles className="h-3 w-3" />
        <span>Dica: Use Ctrl+K para abrir rapidamente</span>
      </div>
    </CommandDialog>
  )
}
