
export const getProfileRank = (level: number) => {
    if (level <= 5) return { rank: 'E', title: 'Novato', color: 'text-gray-400', shadow: 'shadow-gray-500/50', border: 'border-gray-500' };
    if (level <= 10) return { rank: 'D', title: 'Iniciante', color: 'text-green-400', shadow: 'shadow-green-500/50', border: 'border-green-500' };
    if (level <= 20) return { rank: 'C', title: 'Experiente', color: 'text-blue-400', shadow: 'shadow-blue-500/50', border: 'border-blue-500' };
    if (level <= 30) return { rank: 'B', title: 'Elite', color: 'text-purple-400', shadow: 'shadow-purple-500/50', border: 'border-purple-500' };
    if (level <= 50) return { rank: 'A', title: 'Mestre', color: 'text-red-400', shadow: 'shadow-red-500/50', border: 'border-red-500' };
    if (level <= 70) return { rank: 'S', title: 'Grão-Mestre', color: 'text-yellow-400', shadow: 'shadow-yellow-500/50', border: 'border-yellow-500' };
    if (level <= 90) return { rank: 'SS', title: 'Herói', color: 'text-orange-400', shadow: 'shadow-orange-500/50', border: 'border-orange-500' };
    return { rank: 'SSS', title: 'Monarca', color: 'text-cyan-400', shadow: 'shadow-cyan-500/50', border: 'border-cyan-500' };
};
