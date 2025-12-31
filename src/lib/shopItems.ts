
import { LucideIcon } from 'lucide-react';

interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string; // Changed from LucideIcon to string
    category: 'Consumíveis' | 'Cosméticos' | 'Especiais';
    effect?: {
        type: 'xp_boost' | 'streak_recovery' | 'skill_xp_boost' | 'mission_reroll' | 'health_potion' | 'resistance_boost' | 'luck_boost';
        multiplier?: number;
        duration_hours?: number;
        amount?: number;
    }
}


export const allShopItems: ShopItem[] = [
  {
    id: 'potion_health_small',
    name: 'Poção de Vida Pequena',
    description: 'Restaura 30% do seu HP Máximo instantaneamente. Essencial para se recuperar após um debuff de ausência.',
    price: 50,
    icon: 'Heart',
    category: 'Consumíveis',
    effect: { type: 'health_potion', amount: 30 }
  },
  {
    id: 'armor_leather_scout',
    name: 'Armadura de Couro de Batedor',
    description: 'Equipamento leve. Concede +10% de Resistência a Debuffs de ausência.',
    price: 500,
    icon: 'Shield',
    category: 'Especiais',
    effect: { type: 'resistance_boost', multiplier: 0.10 } // Reduz dano de ausência em 10%
  },
  {
    id: 'amulet_system_luck',
    name: 'Amuleto da Sorte do Sistema',
    description: 'Aumenta em 15% a chance de encontrar itens raros e cristais em missões.',
    price: 800,
    icon: 'Star',
    category: 'Especiais',
    effect: { type: 'luck_boost', multiplier: 0.15 }
  },
  {
    id: 'boots_swift_traveler',
    name: 'Botas do Viajante Veloz',
    description: 'Aumenta o ganho de XP de missões diárias em 5%.',
    price: 600,
    icon: 'Zap',
    category: 'Especiais',
    effect: { type: 'xp_boost', multiplier: 1.05 }
  },
  {
    id: 'tower_ticket',
    name: 'Ticket da Torre',
    description: 'Concede uma tentativa para enfrentar um desafio na Torre. Pode comprar 1 por dia.',
    price: 250,
    icon: 'Ticket',
    category: 'Especiais',
  }
];
