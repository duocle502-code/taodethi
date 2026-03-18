import { AppData } from '../types';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface DashboardViewProps {
  data: AppData;
}

export default function DashboardView({ data }: DashboardViewProps) {
  const { progress, subjects, sessions } = data;

  const stats = [
    {
      title: 'Tổng số bài thi',
      value: progress.totalAttempts,
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Điểm trung bình',
      value: progress.averageScore.toFixed(1),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Chuỗi ngày học',
      value: `${progress.streakDays} ngày`,
      icon: CheckCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      title: 'Thời gian học',
      value: `${Math.round(sessions.reduce((acc, s) => acc + s.timeSpent, 0) / 60)} phút`,
      icon: Clock,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tổng Quan Học Tập</h2>
        <div className="text-sm text-gray-500">
          Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"
            >
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ môn học</h3>
          <div className="space-y-4">
            {subjects.map((subject) => {
              const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
              const avgScore = subjectSessions.length > 0 
                ? subjectSessions.reduce((acc, s) => acc + s.score, 0) / subjectSessions.length 
                : 0;
              const progressPercent = Math.min(100, (subjectSessions.length / 10) * 100);

              return (
                <div key={subject.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{subject.name}</span>
                    <span className="text-gray-500">{avgScore > 0 ? `${avgScore.toFixed(1)} điểm` : 'Chưa có điểm'}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weak Topics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Cần cải thiện</h3>
          </div>
          
          {progress.weakTopics.length > 0 ? (
            <ul className="space-y-3">
              {progress.weakTopics.map((topic, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100/50">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-orange-900">{topic}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Tuyệt vời! Bạn không có chủ đề nào yếu.
            </div>
          )}
          
          <button className="w-full mt-6 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            Tạo đề ôn tập ngay
          </button>
        </motion.div>
      </div>
    </div>
  );
}
