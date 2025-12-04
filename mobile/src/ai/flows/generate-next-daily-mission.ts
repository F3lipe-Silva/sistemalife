
export async function generateNextDailyMission(params: any) {
  return {
    nextMissionName: "Missão Gerada pelo Sistema",
    nextMissionDescription: "O Sistema gerou esta missão automaticamente para testar suas capacidades.",
    xp: 20,
    fragments: 5,
    learningResources: [],
    subTasks: [{ name: "Completar tarefa", target: 1, unit: "vez" }]
  };
}
