import { NextRequest, NextResponse } from 'next/server';
import { generateNextDailyMission } from '@/lib/ai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const {
      rankedMissionName,
      metaName,
      goalDeadline,
      history,
      userLevel,
      feedback,
    } = body;

    if (!rankedMissionName || !metaName || userLevel === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await generateNextDailyMission({
      rankedMissionName,
      metaName,
      goalDeadline,
      history,
      userLevel,
      feedback,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/generate-mission:', error);
    
    // Check for specific errors
    if (error.message?.includes('API key not valid')) {
        return NextResponse.json({ error: 'Chave de API inválida no servidor.' }, { status: 500 });
    }
    
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
        return NextResponse.json({ error: 'Limite de uso da IA atingido. Tente novamente em alguns minutos.' }, { status: 429 });
    }
    
    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        return NextResponse.json({ error: 'Serviço de IA temporariamente indisponível. Tente novamente.' }, { status: 503 });
    }
    
    if (error.message?.includes('no valid subtasks')) {
        return NextResponse.json({ error: 'Falha ao gerar missão válida. Tente novamente ou crie uma missão manual.' }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Falha ao gerar missão.', details: error.message }, { status: 500 });
  }
}