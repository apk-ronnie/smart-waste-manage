import { GoogleGenAI, Type } from '@google/genai';
import { Bin } from './db.ts';

export interface AiPriorityItem {
  bin_name: string;
  urgency: 'Immediate' | 'High' | 'Normal' | 'Low';
  reasoning: string;
}

export interface AiInsightsResponse {
  summary: string;
  priorities: AiPriorityItem[];
  source: 'gemini-3.8-flash' | 'rule-based-fallback';
  generatedAt: string;
}

function generateRuleBasedFallback(bins: Bin[]): AiInsightsResponse {
  const overflowBins = bins.filter((b) => b.fill_percentage >= 100);
  const criticalBins = bins.filter((b) => b.fill_percentage >= 80 && b.fill_percentage < 100);
  const fillingBins = bins.filter((b) => b.fill_percentage >= 50 && b.fill_percentage < 80);

  let summary = '';
  if (overflowBins.length > 0) {
    summary = `CRITICAL ALERT: ${overflowBins.length} campus bin(s) have reached 100% capacity (${overflowBins.map((b) => b.bin_name).join(', ')}) with active overflow hazard. Immediate dispatch is required. ${criticalBins.length} additional bin(s) exceed the 80% collection threshold.`;
  } else if (criticalBins.length > 0) {
    summary = `ATTENTION: ${criticalBins.length} bin(s) require scheduled pickup (fill >= 80%). High traffic areas like ${criticalBins[0].location} are approaching peak capacity. Route optimization recommended.`;
  } else if (fillingBins.length > 0) {
    summary = `STATUS NORMAL: No campus dustbins are currently overflowing. ${fillingBins.length} bin(s) are at moderate capacity (50-79%) and should be monitored during the next shift.`;
  } else {
    summary = `OPTIMAL CONDITION: All campus waste receptacles are well within safe operating margins (all under 50% fill). Zero overflows detected.`;
  }

  const priorities: AiPriorityItem[] = [];

  overflowBins.forEach((b) => {
    priorities.push({
      bin_name: b.bin_name,
      urgency: 'Immediate',
      reasoning: `Sensor reports 100% fill level at ${b.location}. High risk of ground litter, health code violations, and pest attraction. Dispatch sanitation team immediately.`,
    });
  });

  criticalBins.forEach((b) => {
    priorities.push({
      bin_name: b.bin_name,
      urgency: 'High',
      reasoning: `Sensor reports ${b.fill_percentage}% fill at ${b.location}. Rapid accumulation expected within the next 1-2 hours of campus activity.`,
    });
  });

  fillingBins.forEach((b) => {
    priorities.push({
      bin_name: b.bin_name,
      urgency: 'Normal',
      reasoning: `Sensor reports ${b.fill_percentage}% fill at ${b.location}. Normal accumulation pattern, monitor on standard patrol.`,
    });
  });

  if (priorities.length === 0) {
    priorities.push({
      bin_name: 'Campus Wide',
      urgency: 'Low',
      reasoning: 'All bins are below 50% capacity. Regular maintenance schedules remain sufficient.',
    });
  }

  return {
    summary,
    priorities,
    source: 'rule-based-fallback',
    generatedAt: new Date().toISOString(),
  };
}

export async function generateWasteInsights(bins: Bin[]): Promise<AiInsightsResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    console.info('GEMINI_API_KEY not configured or placeholder, using rule-based operational fallback.');
    return generateRuleBasedFallback(bins);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const binsSummary = bins.map((b) => ({
      name: b.bin_name,
      location: b.location,
      fill: `${b.fill_percentage}%`,
      status: b.status,
      coordinates: `(${b.coord_x}, ${b.coord_y})`,
    }));

    const systemPrompt =
      'You are an expert AI Campus Waste Management Assistant. Your job is to analyze live dustbin sensor data (fill percentages, locations). You must identify the highest-priority bins, assess overflow risks, and provide a concise, actionable operational summary for facility managers.';

    const userPrompt = `Analyze these campus dustbin readings: ${JSON.stringify(binsSummary)}. Identify the highest-priority bins and provide collection recommendations. Respond strictly in JSON matching this schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Short operational summary.',
            },
            priorities: {
              type: Type.ARRAY,
              description: 'Prioritized list of dustbins needing attention',
              items: {
                type: Type.OBJECT,
                properties: {
                  bin_name: { type: Type.STRING },
                  urgency: {
                    type: Type.STRING,
                    enum: ['Immediate', 'High', 'Normal', 'Low'],
                  },
                  reasoning: { type: Type.STRING },
                },
                required: ['bin_name', 'urgency', 'reasoning'],
              },
            },
          },
          required: ['summary', 'priorities'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary || 'Summary unavailable.',
      priorities: Array.isArray(parsed.priorities) ? parsed.priorities : [],
      source: 'gemini-3.8-flash',
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error querying Gemini API for waste insights, falling back to rule-based engine:', error);
    return generateRuleBasedFallback(bins);
  }
}
