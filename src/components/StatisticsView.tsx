import { AppData } from '../types';
import { motion } from 'motion/react';
import { BarChart2, PieChart, TrendingUp, Activity } from 'lucide-react';

interface StatisticsViewProps {
  data: AppData;
}

export default function StatisticsView({ data }: StatisticsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Thống Kê & Phân Tích</h2>
        <div className="flex gap-2">
          <select className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white">
            <option>Tất cả môn học</option>
            {data.subjects.map(s => <option key={s.id}>{s.name}</option>)}
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Năm nay</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Độ phân hóa câu hỏi</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {/* Placeholder for chart */}
            {[40, 70, 45, 90, 65, 85, 55].map((height, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-blue-100 rounded-t-md relative overflow-hidden group-hover:bg-blue-200 transition-colors"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-md" style={{ height: `${height * 0.8}%` }}></div>
                </div>
                <span className="text-xs text-gray-500">Đề {i+1}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ mức độ tư duy</h3>
          </div>
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48 rounded-full border-8 border-gray-100 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 50% 100%)' }}></div>
              <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0 100%, 0 50%)' }}></div>
              <div className="absolute inset-0 rounded-full border-8 border-orange-500" style={{ clipPath: 'polygon(50% 50%, 0 50%, 0 0, 50% 0)' }}></div>
              <div className="absolute inset-0 rounded-full border-8 border-purple-500" style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0)' }}></div>
              <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                <span className="text-2xl font-bold text-gray-900">100%</span>
                <span className="text-xs text-gray-500">Tổng quan</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-xs font-medium">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Nhận biết</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div>Thông hiểu</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-orange-500"></div>Vận dụng</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500"></div>Vận dụng cao</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
