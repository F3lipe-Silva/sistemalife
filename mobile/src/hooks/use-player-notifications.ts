
import { useState } from 'react';

// Stubbed notification logic for React Native
// In a real app, this would use expo-notifications

export function usePlayerNotifications({ profile, user }: any) {
    const [questNotification, setQuestNotification] = useState<any>(null);
    const [systemAlert, setSystemAlert] = useState<any>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);

    const checkNotificationPreference = (type: string) => {
        // Mock preference check
        return true;
    };

    const handleShowLevelUpNotification = (newLevel: number, newTitle: string, newRank: string) => {
        setQuestNotification({
            title: 'NÍVEL AUMENTADO!',
            description: 'Você alcançou um novo patamar de poder.',
            goals: [
                { name: '- NOVO NÍVEL', progress: `[${newLevel}]` },
                { name: '- NOVO TÍTULO', progress: `[${newTitle}]` },
                { name: '- NOVO RANK', progress: `[${newRank}]` },
            ],
            caution: 'Continue a sua jornada para desbloquear todo o seu potencial.'
        });
    };

    const handleShowNewEpicMissionNotification = (newEpicMissionName: string, newEpicMissionDescription: string) => {
        setQuestNotification({
            title: 'NOVA MISSÃO ÉPICA',
            description: 'Um novo desafio épico o aguarda.',
            goals: [
                { name: '- NOME', progress: `[${newEpicMissionName}]` },
                { name: '- OBJETIVO', progress: `[${newEpicMissionDescription}]` },
            ],
            caution: 'Prepare-se para o que vem a seguir.'
        });
    };

    const handleShowSkillUpNotification = (skillName: string, newLevel: number, statBonuses: string[]) => {
        const goals = [
            { name: `- HABILIDADE`, progress: `[${skillName}]` },
            { name: `- NOVO NÍVEL`, progress: `[${newLevel}]` },
        ];
        if (statBonuses && statBonuses.length > 0) {
            goals.push({ name: '- BÓNUS DE ATRIBUTO', progress: `[${statBonuses.join(', ')}]` });
        }
        setQuestNotification({
            title: 'HABILIDADE AUMENTADA!',
            description: 'A sua dedicação foi recompensada.',
            goals,
            caution: 'A maestria é uma jornada sem fim.'
        });
    };

    const handleShowSkillDecayNotification = (decayedSkillsInfo: { name: string; xpLost: number }[]) => {
        setQuestNotification({
            title: 'CORRUPÇÃO DETETADA',
            description: 'Inatividade prolongada corrompeu o seu progresso.',
            goals: decayedSkillsInfo.map(info => ({ name: `- HABILIDADE`, progress: `[${info.name}] (-${info.xpLost} XP)` })),
            caution: 'A prática constante é a chave para a maestria.'
        });
    };

    const handleShowSkillAtRiskNotification = (atRiskSkills: { name: string; daysInactive: number }[]) => {
        setQuestNotification({
            title: 'ALERTA DO SISTEMA',
            description: 'As seguintes habilidades estão em risco de corrupção.',
            goals: atRiskSkills.map(info => ({ name: `- HABILIDADE`, progress: `[${info.name}] (${info.daysInactive} dias inativa)` })),
            caution: 'Pratique estas habilidades para evitar a perda de progresso.'
        });
    };

    const handleShowDailyBriefingNotification = (briefingMissions: { epicMissionName: string; nome: string }[]) => {
        if (!checkNotificationPreference('daily_briefing')) return;
        if (!briefingMissions || briefingMissions.length === 0) return;
        const goals = briefingMissions.map(mission => ({
            name: `- [${mission.epicMissionName}]`,
            progress: mission.nome
        }));
        setQuestNotification({
            title: 'BRIEFING DIÁRIO',
            description: 'Os seus objetivos para hoje foram identificados.',
            goals,
            caution: 'O sucesso é a soma de pequenos esforços.'
        });
    };

    const handleShowGoalCompletedNotification = (goalName: string) => {
        if (!checkNotificationPreference('goal_completed')) return;
        setQuestNotification({
            title: 'META CONCLUÍDA!',
            description: 'Parabéns, Caçador! Você completou um dos seus maiores objetivos.',
            goals: [{ name: '- CONQUISTA', progress: `[${goalName}]` }],
            caution: 'Um novo horizonte de desafios aguarda.'
        });
    };

    const handleShowAchievementUnlockedNotification = (achievementName: string) => {
        setQuestNotification({
            title: 'CONQUISTA DESBLOQUEADA!',
            description: 'O seu esforço foi reconhecido pelo Sistema.',
            goals: [{ name: '- CONQUISTA', progress: `[${achievementName}]` }],
            caution: 'Continue a sua jornada para desbloquear todos os segredos.'
        });
    };

    const handleShowStreakBonusNotification = (streak: number, xp: number, fragments: number) => {
        setQuestNotification({
            title: `SEQUÊNCIA DE ${streak} DIAS!`,
            description: 'A sua consistência foi recompensada com um bónus!',
            goals: [
                { name: '- BÓNUS DE XP', progress: `+${xp}` },
                { name: '- BÓNUS DE FRAGMENTOS', progress: `+${fragments}` }
            ],
            caution: 'Continue assim para ganhar recompensas ainda maiores.'
        });
    };

    // Stub
    const enablePushNotifications = async () => true;
    const disablePushNotifications = async () => true;

    return {
        questNotification, setQuestNotification,
        systemAlert, setSystemAlert,
        showOnboarding, setShowOnboarding,
        handleShowLevelUpNotification,
        handleShowNewEpicMissionNotification,
        handleShowSkillUpNotification,
        handleShowSkillDecayNotification,
        handleShowSkillAtRiskNotification,
        handleShowDailyBriefingNotification,
        handleShowGoalCompletedNotification,
        handleShowAchievementUnlockedNotification,
        handleShowStreakBonusNotification,
        pushNotificationSupported: false,
        pushNotificationEnabled,
        enablePushNotifications,
        disablePushNotifications
    };
}
