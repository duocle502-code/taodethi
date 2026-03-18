import { useState } from 'react';
import { AppData, Subject } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Calculator, Atom, FlaskConical, Dna, Languages, FileText, Plus, Edit2, Trash2, X, Save, Globe, Music, Palette, Map } from 'lucide-react';
import Swal from 'sweetalert2';

interface SubjectsViewProps {
  data: AppData;
  onSaveData: (data: AppData) => void;
}

const iconMap: Record<string, any> = {
  calculator: Calculator,
  atom: Atom,
  flask: FlaskConical,
  dna: Dna,
  language: Languages,
  book: BookOpen,
  globe: Globe,
  music: Music,
  palette: Palette,
  map: Map,
  file: FileText,
};

const availableIcons = [
  { id: 'calculator', label: 'Toán', icon: Calculator },
  { id: 'atom', label: 'Lý', icon: Atom },
  { id: 'flask', label: 'Hóa', icon: FlaskConical },
  { id: 'dna', label: 'Sinh', icon: Dna },
  { id: 'language', label: 'Ngôn ngữ', icon: Languages },
  { id: 'book', label: 'Sách', icon: BookOpen },
  { id: 'globe', label: 'Địa lý', icon: Globe },
  { id: 'music', label: 'Âm nhạc', icon: Music },
  { id: 'palette', label: 'Mỹ thuật', icon: Palette },
  { id: 'map', label: 'Lịch sử', icon: Map },
  { id: 'file', label: 'Khác', icon: FileText },
];

export default function SubjectsView({ data, onSaveData }: SubjectsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('book');

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormIcon('book');
    setShowModal(true);
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    setFormName(subject.name);
    setFormIcon(subject.icon);
    setShowModal(true);
  };

  const handleSave = () => {
    const name = formName.trim();
    if (!name) {
      Swal.fire({ icon: 'warning', title: 'Thiếu thông tin', text: 'Vui lòng nhập tên môn học.', confirmButtonColor: '#4A90E2' });
      return;
    }

    let newSubjects: Subject[];

    if (editing) {
      // Sửa
      newSubjects = data.subjects.map(s =>
        s.id === editing.id ? { ...s, name, icon: formIcon } : s
      );
    } else {
      // Thêm mới
      const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
      newSubjects = [...data.subjects, { id, name, icon: formIcon, questionsCount: 0 }];
    }

    onSaveData({ ...data, subjects: newSubjects });
    setShowModal(false);
    Swal.fire({ icon: 'success', title: editing ? 'Đã cập nhật!' : 'Đã thêm!', timer: 1200, showConfirmButton: false });
  };

  const handleDelete = (subject: Subject) => {
    Swal.fire({
      title: `Xóa môn "${subject.name}"?`,
      text: 'Thao tác này không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const newSubjects = data.subjects.filter(s => s.id !== subject.id);
        onSaveData({ ...data, subjects: newSubjects });
        Swal.fire({ icon: 'success', title: 'Đã xóa!', timer: 1000, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Môn Học</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Thêm môn học
        </button>
      </div>

      {data.subjects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Chưa có môn học nào.</p>
          <p className="text-sm mt-1">Bấm "Thêm môn học" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.subjects.map((subject, index) => {
            const Icon = iconMap[subject.icon] || FileText;
            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative"
              >
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(subject)}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    {subject.questionsCount} câu hỏi
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{subject.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Ngân hàng câu hỏi đa dạng các mức độ.</p>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, subject.questionsCount / 2)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tiến độ xây dựng</span>
                  <span>{Math.min(100, subject.questionsCount / 2)}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden border border-gray-100"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-900">
                  {editing ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Tên môn học */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên môn học</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="VD: Toán Học, Vật Lý, Lịch Sử..."
                    autoFocus
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50/50 focus:bg-white transition-all text-sm outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                </div>

                {/* Chọn icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biểu tượng</label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableIcons.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = formIcon === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setFormIcon(item.id)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}
                          title={item.label}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editing ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
