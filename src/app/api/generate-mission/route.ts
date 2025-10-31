import { NextRequest, NextResponse } from 'next/server';
import { generateNextDailyMission } from '@/ai/flows/generate-next-daily-mission';

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
    // Check for specific Genkit/Google AI errors
    if (error.message.includes('API key not valid')) {
        return NextResponse.json({ error: 'Invalid API Key on server.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to generate mission.', details: error.message }, { status: 500 });
  }
}