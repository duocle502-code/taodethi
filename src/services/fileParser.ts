import { GoogleGenAI } from '@google/genai';
import { apiKeyManager, getSelectedModel } from './apiKeyManager';

// Chúng ta sử dụng CDN qua index.html để tránh lỗi khi người dùng chưa/chẳng thể cài thư viện qua npm
const getPdfjs = () => {
  // CDN (cdnjs) exposes pdf.js as window.pdfjsLib
  // @ts-ignore
  const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
  if (pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  return pdfjsLib;
};

const getMammoth = () => {
  // @ts-ignore
  return window.mammoth;
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    if (!getPdfjs()) {
      throw new Error('Thư viện đọc PDF chưa sẵn sàng. Vui lòng tải lại trang.');
    }
    return extractTextFromPdf(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    fileName.endsWith('.docx')
  ) {
    if (!getMammoth()) throw new Error('Thư viện đọc Word chưa sẵn sàng. Vui lòng tải lại trang.');
    return extractTextFromDocx(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  } else {
    throw new Error('Định dạng file không được hỗ trợ. Vui lòng chọn PDF, DOCX hoặc TXT.');
  }
};

/**
 * Trích xuất text từ PDF.
 * Bước 1: Thử dùng PDF.js text extraction (nhanh, cho PDF text thuần).
 * Bước 2: Nếu text trả về rỗng/quá ngắn → PDF dạng ảnh → dùng Gemini Vision OCR.
 */
const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = getPdfjs();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Bước 1: Thử trích text bình thường
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    const trimmedText = fullText.trim();

    // Nếu có text đủ dài → trả về
    if (trimmedText.length > 50) {
      return trimmedText;
    }

    // Bước 2: PDF dạng ảnh → Gemini Vision OCR
    console.log('PDF có ít text, chuyển sang OCR bằng Gemini Vision...');
    
    const apiKey = apiKeyManager.getActiveKey();
    if (!apiKey) {
      throw new Error('PDF này là dạng ảnh/scan. Cần API Key Gemini để đọc. Vui lòng thêm API Key trong Cài đặt.');
    }

    return await extractPdfWithVision(pdf, apiKey);
  } catch (error: any) {
    if (error.message.includes('API Key') || error.message.includes('Gemini')) {
      throw error; // Re-throw meaningful errors
    }
    console.error('Lỗi đọc PDF:', error);
    throw new Error('Không thể đọc nội dung file PDF. Vui lòng thử file khác.');
  }
};

/**
 * Render từng trang PDF thành ảnh, gửi lên Gemini Vision để OCR.
 * Tối đa 10 trang để tránh timeout.
 */
const extractPdfWithVision = async (pdf: any, apiKey: string): Promise<string> => {
  const maxPages = Math.min(pdf.numPages, 10);
  const ai = new GoogleGenAI({ apiKey });
  const model = getSelectedModel();

  let allText = '';

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x cho chất lượng tốt

    // Tạo canvas và render trang PDF
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;

    // Chuyển canvas thành base64
    const base64Data = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

    // Gọi Gemini Vision
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Data,
                },
              },
              {
                text: `Đây là hình ảnh trang ${i} của một đề thi/tài liệu giáo dục.
Hãy trích xuất TOÀN BỘ nội dung chữ trong hình ảnh này một cách chính xác.
- Giữ nguyên cấu trúc câu hỏi, đáp án (A, B, C, D).
- Nếu có công thức toán học, hãy viết dưới dạng LaTeX (dùng $...$ cho inline, $$...$$ cho block).
- KHÔNG thêm, bỏ, hay sửa đổi bất kỳ nội dung nào.
- Chỉ trả về nội dung trích xuất, không giải thích thêm.`,
              },
            ],
          },
        ],
      });

      const pageText = response.text || '';
      allText += `--- Trang ${i} ---\n${pageText}\n\n`;
    } catch (err: any) {
      console.error(`Lỗi OCR trang ${i}:`, err);
      allText += `--- Trang ${i} ---\n[Không thể đọc trang này]\n\n`;
    }

    // Cleanup canvas
    canvas.width = 0;
    canvas.height = 0;
  }

  if (pdf.numPages > maxPages) {
    allText += `\n[Lưu ý: Chỉ đọc ${maxPages}/${pdf.numPages} trang đầu tiên để tránh timeout]\n`;
  }

  const trimmed = allText.trim();
  if (!trimmed || trimmed.length < 20) {
    throw new Error('Không thể trích xuất nội dung từ file PDF ảnh này. Vui lòng thử file khác.');
  }

  return trimmed;
};

const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = getMammoth();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  } catch (error: any) {
    console.error('Lỗi đọc DOCX:', error);
    throw new Error('Không thể đọc nội dung file Word. Vui lòng thử file khác.');
  }
};
