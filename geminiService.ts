
import { GoogleGenAI, Type } from "@google/genai";
import { DailyEncouragement } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function fetchDailyEncouragement(): Promise<DailyEncouragement> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "오늘 성경 통독을 하는 사람들을 위한 격려의 메시지와 짧은 성경 구절을 하나 골라줘. JSON 형식으로 답해줘.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verse: { type: Type.STRING, description: '성경 구절 본문' },
            reference: { type: Type.STRING, description: '구절 출처 (예: 창세기 1:1)' },
            message: { type: Type.STRING, description: '따뜻한 격려의 메시지' },
          },
          required: ['verse', 'reference', 'message'],
        },
      },
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error fetching encouragement:", error);
    return {
      verse: "내가 네게 명령한 것이 아니냐 강하고 담대하라",
      reference: "여호수아 1:9",
      message: "오늘도 말씀과 함께하는 당신을 응원합니다!"
    };
  }
}
