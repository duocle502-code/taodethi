import { useState, useEffect, useCallback, useRef } from 'react';
import { AppData } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { callGeminiAI } from '../services/geminiService';
import { apiKeyManager } from '../services/apiKeyManager';
import { extractTextFromFile } from '../services/fileParser';
import Swal from 'sweetalert2';
import { Loader2, FileText, Download, CheckSquare, BrainCircuit, Save, Trash2, Paperclip, RefreshCw, Sparkles } from 'lucide-react';
import { MathMarkdown } from './MathMarkdown';

interface GeneratorViewProps {
  data: AppData;
  onSaveData: (data: AppData) => void;
}

const SESSION_SAVE_KEY = 'generator_session_data';

type GenerateMode = 'new' | 'similar';

export default function GeneratorView({ data, onSaveData }: GeneratorViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('mixed');
  const [generateMode, setGenerateMode] = useState<GenerateMode>('new');
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<string | null>(null);
  
  // Session Restore State
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [pendingSession, setPendingSession] = useState<any>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load kiểm tra có session cũ không
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.topic || parsed.generatedExam) {
          setPendingSession(parsed);
          setShowRestoreModal(true);
        }
      }
    } catch (e) {
      localStorage.removeItem(SESSION_SAVE_KEY);
    }
  }, []);

  // Auto-save logic (debounced)
  const saveSession = useCallback(() => {
    if (!topic && !generatedExam) return;
    try {
      const sessionData = {
        selectedSubject,
        topic,
        difficulty,
        questionCount,
        generatedExam,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(SESSION_SAVE_KEY, JSON.stringify(sessionData));
      setLastSaved(new Date().toLocaleTimeString('vi-VN'));
    } catch (e) {
      console.warn('Không thể lưu phiên:', e);
    }
  }, [selectedSubject, topic, difficulty, questionCount, generatedExam]);

  useEffect(() => {
    if (isGenerating) return; // Không lưu lúc đang sinh
    const timer = setTimeout(() => saveSession(), 3000);
    return () => clearTimeout(timer);
  }, [saveSession, isGenerating]);

  // Hành động khôi phục
  const restoreSession = () => {
    if (!pendingSession) return;
    setSelectedSubject(pendingSession.selectedSubject || '');
    setTopic(pendingSession.topic || '');
    setDifficulty(pendingSession.difficulty || 'mixed');
    setQuestionCount(pendingSession.questionCount || 10);
    setGeneratedExam(pendingSession.generatedExam || null);
    setShowRestoreModal(false);
    setPendingSession(null);
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_SAVE_KEY);
    setLastSaved(null);
    setShowRestoreModal(false);
    setPendingSession(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const text = await extractTextFromFile(file);
      if (text) {
        setTopic(prev => prev ? `${prev}\n\n[Nội dung từ file ${file.name}]\n${text}` : text);
        Swal.fire({
          icon: 'success',
          title: 'Đọc file thành công!',
          text: `Đã nhập nội dung từ file ${file.name}`,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error('File rỗng hoặc không có văn bản.');
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi đọc file',
        text: error.message || 'Có lỗi xảy ra khi xử lý file này',
        confirmButtonColor: '#4A90E2'
      });
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!apiKeyManager.getActiveKey()) {
      Swal.fire({
        icon: 'error',
        title: 'Thiếu API Key',
        text: 'Vui lòng cài đặt API Key trong phần Cài đặt nâng cao (biểu tượng răng cưa) trước khi tạo đề!',
        confirmButtonColor: '#4A90E2'
      });
      return;
    }

    if (!selectedSubject || !topic.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng chọn môn học và nhập chủ đề/ma trận kiến thức!',
        confirmButtonColor: '#4A90E2'
      });
      return;
    }

    setIsGenerating(true);

    const subjectName = data.subjects.find(s => s.id === selectedSubject)?.name || '';
    
    const mathRules = `\n**QUY TẮC ĐỊNH DẠNG CÔNG THỨC TOÁN HỌC (BẮT BUỘC):**\n- Mọi công thức toán học PHẢI được bọc trong ký hiệu LaTeX.\n- Công thức inline: dùng $...$ , ví dụ: $x^2 + 1$, $\\frac{a}{b}$, $\\sqrt{2}$.\n- Công thức block: dùng $$...$$\n- KHÔNG viết công thức toán dạng text thuần. LUÔN dùng $..$\n\n**QUY TẮC VẼ HÌNH HÌNH HỌC (BẮT BUỘC với câu hỏi hình học):**\n- Với câu hỏi hình học, PHẢI kèm hình minh họa bằng SVG.\n- Đặt code SVG trong block \`\`\`svg ... \`\`\` .\n- SVG phải có viewBox, width="300", height="250", nền trắng.\n- Dùng stroke="#4A90E2" cho nét vẽ, fill="none", stroke-width="2".\n- Ghi nhãn đỉnh/cạnh/góc bằng <text> font-size="14" fill="#1e293b".\n- Ví dụ tam giác ABC:\n\`\`\`svg\n<svg viewBox="0 0 300 250" width="300" height="250" xmlns="http://www.w3.org/2000/svg">\n  <polygon points="150,30 50,220 250,220" fill="none" stroke="#4A90E2" stroke-width="2"/>\n  <text x="145" y="20" font-size="14" fill="#1e293b" text-anchor="middle">A</text>\n  <text x="40" y="240" font-size="14" fill="#1e293b" text-anchor="middle">B</text>\n  <text x="260" y="240" font-size="14" fill="#1e293b" text-anchor="middle">C</text>\n</svg>\n\`\`\`\n- Với câu KHÔNG liên quan hình học, KHÔNG vẽ hình.`;

    let prompt: string;

    if (generateMode === 'similar') {
      // Chế độ sinh đề tương tự
      prompt = `Bạn là một chuyên gia giáo dục và ra đề thi xuất sắc tại Việt Nam.

**NHIỆM VỤ:** Phân tích đề thi mẫu dưới đây, sau đó TẠO MỘT ĐỀ THI MỚI HOÀN TOÀN với các câu hỏi TƯƠNG TỰ về:
- Cùng mức độ khó (Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao)
- Cùng dạng bài (cùng chủ đề, cùng kiểu câu hỏi)
- Cùng cấu trúc (số câu hỏi, cách trình bày)
- Nhưng NỘI DUNG và SỐ LIỆU phải KHÁC HOÀN TOÀN (thay đổi số, thay đổi tình huống, thay đổi dữ kiện)

Số lượng câu hỏi cần sinh: ${questionCount}.
${mathRules}

**ĐỀ THI MẪU ĐỂ THAM KHẢO:**
---
${topic}
---

Yêu cầu định dạng đầu ra (Markdown):
# ĐỀ THI MÔN ${subjectName.toUpperCase()} (ĐỀ TƯƠNG TỰ)
**Dựa trên đề mẫu** | **Số câu:** ${questionCount}
**Thời gian làm bài:** ${Math.round(questionCount * 1.5)} phút

---
## PHẦN ĐỀ THI
(Liệt kê câu hỏi mới tương tự, mỗi câu có 4 đáp án A, B, C, D)

---
## PHẦN ĐÁP ÁN VÀ GIẢI THÍCH CHI TIẾT
(Cung cấp bảng đáp án và giải thích chi tiết)

**LƯU Ý QUAN TRỌNG:** Câu hỏi mới phải KHÁC nội dung đề mẫu nhưng CÙNG mức độ và dạng bài. Không copy lại câu hỏi gốc.`;
    } else {
      // Chế độ soạn đề mới
      prompt = `Bạn là một chuyên gia giáo dục và ra đề thi xuất sắc tại Việt Nam.\nHãy tạo một bộ đề thi trắc nghiệm môn ${subjectName} với chủ đề/ma trận kiến thức sau: "${topic}".\nSố lượng câu hỏi: ${questionCount}.\nĐộ khó: ${difficulty === 'mixed' ? 'Trộn lẫn các mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)' : difficulty}.\n${mathRules}\n\nYêu cầu định dạng đầu ra (Markdown):\n# ĐỀ THI MÔN ${subjectName.toUpperCase()}\n**Chủ đề:** ${topic}\n**Thời gian làm bài:** ${Math.round(questionCount * 1.5)} phút\n\n---\n## PHẦN ĐỀ THI\n(Liệt kê các câu hỏi từ 1 đến ${questionCount}, mỗi câu có 4 đáp án A, B, C, D)\n\n---\n## PHẦN ĐÁP ÁN VÀ GIẢI THÍCH CHI TIẾT\n(Cung cấp bảng đáp án và giải thích chi tiết cho từng câu hỏi)\n\nHãy đảm bảo câu hỏi chính xác, khoa học, không có lỗi sai kiến thức và bám sát chương trình giáo dục phổ thông của Việt Nam.`;
    }

    try {
      const result = await callGeminiAI(prompt);
      if (result) {
        setGeneratedExam(result);
        Swal.fire({ icon: 'success', title: 'Thành công!', timer: 1500, showConfirmButton: false });
        // Bắt buộc lưu ngay sau khi có output
        setTimeout(saveSession, 100); 
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi sinh đề',
        text: error.message || 'Hệ thống đã thử mọi API Key khả dụng nhưng đều gặp lỗi.',
        confirmButtonColor: '#4A90E2'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Tạo Đề Thi Bằng AI</h2>
        
        {/* Session Status & Actions */}
        <div className="flex items-center gap-2">
          {lastSaved && <span className="text-xs text-green-600 font-medium mr-2">Đã lưu: {lastSaved}</span>}
          <button onClick={saveSession} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors">
            <Save size={14} /> Lưu tạm
          </button>
          <button onClick={() => { if(confirm('Bạn có chắc muốn xóa bản lưu này không?')) { clearSession(); setGeneratedExam(''); setTopic(''); } }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-1 space-y-5"
        >
          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setGenerateMode('new')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                generateMode === 'new'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Soạn đề mới
            </button>
            <button
              onClick={() => setGenerateMode('similar')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                generateMode === 'similar'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Đề tương tự
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
            <select
              value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white"
            >
              <option value="">-- Chọn môn học --</option>
              {data.subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-gray-700">
                {generateMode === 'similar' ? 'Dán đề thi mẫu vào đây' : 'Chủ đề / Yêu cầu chi tiết'}
              </label>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtracting}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {isExtracting ? <Loader2 size={12} className="animate-spin" /> : <Paperclip size={12} />}
                Đính kèm file
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".txt,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                onChange={handleFileUpload}
              />
            </div>
            <textarea
              value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder={generateMode === 'similar'
                ? 'Dán nội dung đề thi mẫu vào đây, hoặc ĐÍNH KÈM file PDF/Word ở trên. AI sẽ phân tích và tạo đề tương tự cùng mức độ.'
                : 'VD: Đạo hàm và ứng dụng (3 câu nhận biết, 2 câu vận dụng cao)...  Hoặc ĐÍNH KÈM file ma trận bằng tính năng bên trên.'
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary min-h-[120px] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số câu hỏi</label>
              <input
                type="number" min="1" max="50"
                value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
              <select
                 value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                 className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary bg-white"
              >
                <option value="mixed">Trộn lẫn</option>
                <option value="Nhận biết">Cơ bản</option>
                <option value="Thông hiểu">Thông hiểu</option>
                <option value="Vận dụng">Vận dụng</option>
                <option value="Vận dụng cao">Nâng cao</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate} disabled={isGenerating || isExtracting}
            className="w-full py-3 px-4 gradient-bg text-white font-medium rounded-xl hover:opacity-90 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isGenerating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {generateMode === 'similar' ? 'Đang phân tích đề mẫu...' : 'Đang soạn đề...'}</>
            ) : generateMode === 'similar' ? (
              <><RefreshCw className="w-5 h-5" /> Sinh Đề Tương Tự</>
            ) : (
              <><BrainCircuit className="w-5 h-5" /> Soạn Đề Mới</>
            )}
          </button>
        </motion.div>

        {/* Result */}
        <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
           className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 min-h-[500px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Nội dung biên soạn
            </h3>
            {generatedExam && !isGenerating && (
              <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" /> Xuất Word/PDF
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
               {isGenerating ? (
                 <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 py-20">
                   <div className="relative">
                     <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                     <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                   </div>
                   <p className="font-medium animate-pulse text-blue-600">Trí tuệ nhân tạo đang phân tích ma trận kiến thức...</p>
                 </div>
               ) : generatedExam ? (
                 <div className="prose prose-blue max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-p:text-gray-700">
                   <MathMarkdown content={generatedExam} />
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-20">
                   <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                     <CheckSquare className="w-8 h-8 text-gray-300" />
                   </div>
                   <p>Điền thông tin và nhấn "Soạn Đề Mới" để bắt đầu</p>
                 </div>
               )}
          </div>
        </motion.div>
      </div>

      {/* Restore Session Modal */}
      {showRestoreModal && pendingSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-sky-500 p-5 text-white">
              <h3 className="text-base font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Bản nháp chưa hoàn thành</h3>
              <p className="text-xs text-blue-100 mt-1">Hệ thống tìm thấy một bài làm dở dang trướ đó.</p>
            </div>
            <div className="p-5 bg-gray-50">
              <div className="text-sm text-gray-600 mb-5 bg-white p-3 border border-gray-200 rounded-lg">
                <span className="font-medium">Chủ đề:</span> {pendingSession.topic?.substring(0, 40) || 'Không có mô tả'}...
                <br />
                <span className="font-medium text-xs text-gray-400 mt-1 block">
                  Lưu lúc: {new Date(pendingSession.savedAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={clearSession} className="flex-1 py-2 rounded-xl text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 transition-colors">
                  Bỏ qua
                </button>
                <button onClick={restoreSession} className="flex-1 py-2 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors">
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
