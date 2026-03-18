import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Key, Eye, EyeOff, Save, Trash2, Plus, Zap } from 'lucide-react';
import Swal from 'sweetalert2';
import { apiKeyManager, ApiKeyInfo, getSelectedModel, setSelectedModel, MODELS, SupportedModels } from '../services/apiKeyManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setLocalSelectedModel] = useState<SupportedModels>('gemini-2.5-flash');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setKeys([...apiKeyManager.getAllKeys()]);
    setLocalSelectedModel(getSelectedModel());
  };

  const handleAddKey = () => {
    if (!newKey.trim()) {
      Swal.fire({ icon: 'warning', title: 'Cảnh báo', text: 'Vui lòng nhập API Key!' });
      return;
    }
    const success = apiKeyManager.addKey(newKey.trim(), newKeyName.trim() || `Key mới ${keys.length + 1}`);
    
    if (!success) {
      Swal.fire({ icon: 'error', title: 'Trùng lặp', text: 'API Key này đã được thêm từ trước!' });
      return;
    }
    
    setNewKey('');
    setNewKeyName('');
    loadData();
  };

  const handleRemoveKey = (keyString: string) => {
    apiKeyManager.removeKey(keyString);
    loadData();
  };

  const handleSave = () => {
    setSelectedModel(selectedModel);
    
    if (keys.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Chưa có API Key nào được lưu. Bạn có thể không tạo được đề thi mới.',
      });
    } else {
      Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã lưu cấu hình!', timer: 1500, showConfirmButton: false });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Cài đặt Nâng cao
                </h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* 1. Chọn Model */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Mô hình AI (Model)
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setLocalSelectedModel(e.target.value as SupportedModels)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow bg-white"
                  >
                    {MODELS.map(m => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Mô hình càng thông minh thì tốc độ có thể xử lý lâu hơn một chút.</p>
                </div>

                <hr className="border-gray-100" />

                {/* 2. Quản lý API Key */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                    <Key className="w-4 h-4 text-blue-500" />
                    Quản lý API Keys
                  </label>
                  
                  {/* Form thêm mới */}
                  <div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 items-start">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" placeholder="Tên gợi nhớ (VD: Key Dữ phòng 1)" 
                        value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary"
                      />
                      <div className="relative">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={newKey} onChange={(e) => setNewKey(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary font-mono"
                          placeholder="AIzaSy..."
                        />
                        <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button onClick={handleAddKey} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center h-full">
                      <Plus className="w-5 h-5" /> Thêm
                    </button>
                  </div>

                  {/* List keys */}
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {keys.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-400 border border-dashed rounded-lg">Chưa có Key nào</div>
                    ) : (
                      keys.map((k, idx) => (
                         <div key={idx} className={`p-3 border rounded-lg flex items-center justify-between ${k.status === 'cooldown' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                           <div>
                             <p className="font-medium text-sm text-gray-800">{k.name}</p>
                             <p className="text-xs text-gray-500 font-mono mt-0.5">{k.key.substring(0, 10)}...{k.key.substring(k.key.length - 4)}</p>
                             <div className="flex items-center gap-2 mt-1.5">
                               <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${k.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {k.status === 'active' ? (
                                    <>
                                       <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Khả dụng
                                    </>
                                 ) : (
                                    <>
                                       <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Cooldown ({k.errorCount} lỗi)
                                    </>
                                 )}
                               </span>
                             </div>
                           </div>
                           <button onClick={() => handleRemoveKey(k.key)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                      ))
                    )}
                  </div>
                  <p className="mt-3 text-[11px] text-gray-500 italic">
                    Hệ thống sẽ thử sử dụng lần lượt các Key có trạng thái "Khả dụng". 
                    Nếu một key báo lỗi nhiều lần (hoặc hết hạn mức limit), nó sẽ tự động bị bỏ qua trong 5 phút.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white gradient-bg rounded-xl hover:opacity-90 flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Lưu & Áp dụng
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
