import { GoogleGenAI } from '@google/genai';
import { apiKeyManager, getSelectedModel } from './apiKeyManager';

export const callGeminiAI = async (prompt: string, customModel?: string, isRetryFlag: boolean = false): Promise<string | null> => {
  const currentKey = apiKeyManager.getActiveKey();
  
  if (!currentKey) {
    throw new Error('Không tìm thấy API Key khả dụng. Vui lòng vào Cài đặt để thêm API Key Google Gemini!');
  }

  const modelToUse = customModel || getSelectedModel();

  try {
    const ai = new GoogleGenAI({ apiKey: currentKey });
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || '';
  } catch (error: any) {
    console.error(`Gemini API Error (Model: ${modelToUse}):`, error);
    
    // Check for rate limit / quota exceeded (429) errors
    if (error?.status === 429 || error?.message?.includes('RATE_LIMIT') || error?.message?.includes('QUOTA_EXCEEDED')) {
      if (!isRetryFlag) {
         // Thử mark error và xoay key
         const rotation = apiKeyManager.markKeyError(currentKey, true);
         if (rotation.success && rotation.newKey) {
            console.log(`Fallback thành công sang key: ${rotation.newKey.substring(0,10)}...`);
            // Gọi lại chính hàm này với key mới (qua cờ isRetryFlag để tránh lặp vô tận)
            return callGeminiAI(prompt, modelToUse, true);
         }
      }
    }
    
    // Nếu là lỗi phân tích cú pháp JSON hay lỗi thông thường khác, hoặc hết key để retry
    throw new Error(error.message || 'Lỗi kết nối API');
  }
};
