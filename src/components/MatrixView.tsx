import { AppData } from '../types';
import { motion } from 'motion/react';
import { Layers, Plus, Save } from 'lucide-react';

interface MatrixViewProps {
  data: AppData;
}

export default function MatrixView({ data }: MatrixViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Ma Trận Kiến Thức</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm chủ đề
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            Lưu ma trận
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ma trận đề thi môn Toán</h3>
              <p className="text-sm text-gray-500">Phân bổ kiến thức theo 4 mức độ tư duy</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Chủ đề / Đơn vị kiến thức</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Nhận biết</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Thông hiểu</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Vận dụng</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Vận dụng cao</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Tổng số câu</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">1. Hàm số và đồ thị</td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={4} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={3} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={2} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={1} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center font-bold text-blue-600">10</td>
              </tr>
              <tr className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">2. Khối đa diện</td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={2} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={2} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={1} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={0} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center font-bold text-blue-600">5</td>
              </tr>
              <tr className="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">3. Mũ và Logarit</td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={3} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={3} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={2} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center"><input type="number" defaultValue={1} className="w-16 text-center border border-gray-300 rounded-md p-1" /></td>
                <td className="px-6 py-4 text-center font-bold text-blue-600">9</td>
              </tr>
              <tr className="bg-gray-50 font-bold text-gray-900">
                <td className="px-6 py-4">TỔNG CỘNG</td>
                <td className="px-6 py-4 text-center">9</td>
                <td className="px-6 py-4 text-center">8</td>
                <td className="px-6 py-4 text-center">5</td>
                <td className="px-6 py-4 text-center">2</td>
                <td className="px-6 py-4 text-center text-blue-600 text-lg">24</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
