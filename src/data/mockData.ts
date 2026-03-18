import { AppData } from '../types';

export const initialData: AppData = {
  subjects: [
    { id: 'toan', name: 'Toán Học', icon: 'calculator', questionsCount: 150 },
    { id: 'ly', name: 'Vật Lý', icon: 'atom', questionsCount: 120 },
    { id: 'hoa', name: 'Hóa Học', icon: 'flask', questionsCount: 100 },
    { id: 'sinh', name: 'Sinh Học', icon: 'dna', questionsCount: 80 },
    { id: 'anh', name: 'Tiếng Anh', icon: 'language', questionsCount: 200 },
    { id: 'van', name: 'Ngữ Văn', icon: 'book', questionsCount: 50 },
  ],
  questions: [
    {
      id: 'q1',
      subjectId: 'toan',
      content: 'Đạo hàm của hàm số y = x^3 là gì?',
      type: 'multiple_choice',
      options: ['3x^2', 'x^2', '3x', 'x^3'],
      correctAnswer: 0,
      explanation: 'Áp dụng công thức đạo hàm cơ bản: (x^n)\' = n*x^(n-1). Với n=3, ta có (x^3)\' = 3x^2.',
      difficulty: 'nhan_biet',
      tags: ['giai_tich', 'dao_ham'],
    },
    {
      id: 'q2',
      subjectId: 'toan',
      content: 'Nghiệm của phương trình 2x - 4 = 0 là?',
      type: 'multiple_choice',
      options: ['x = 1', 'x = 2', 'x = -2', 'x = 4'],
      correctAnswer: 1,
      explanation: '2x - 4 = 0 <=> 2x = 4 <=> x = 2.',
      difficulty: 'nhan_biet',
      tags: ['dai_so', 'phuong_trinh'],
    },
    {
      id: 'q3',
      subjectId: 'ly',
      content: 'Đơn vị của lực trong hệ SI là gì?',
      type: 'multiple_choice',
      options: ['Joule (J)', 'Watt (W)', 'Newton (N)', 'Pascal (Pa)'],
      correctAnswer: 2,
      explanation: 'Newton (N) là đơn vị đo lực trong hệ đo lường quốc tế SI.',
      difficulty: 'nhan_biet',
      tags: ['co_hoc', 'luc'],
    },
    {
      id: 'q4',
      subjectId: 'anh',
      content: 'She _____ to the store yesterday.',
      type: 'multiple_choice',
      options: ['go', 'goes', 'went', 'going'],
      correctAnswer: 2,
      explanation: 'Dấu hiệu "yesterday" chỉ thì quá khứ đơn. Động từ "go" chuyển sang quá khứ là "went".',
      difficulty: 'thong_hieu',
      tags: ['grammar', 'past_tense'],
    }
  ],
  sessions: [
    {
      id: 's1',
      subjectId: 'toan',
      score: 8.5,
      totalQuestions: 10,
      correctAnswers: 8,
      timeSpent: 450,
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 's2',
      subjectId: 'anh',
      score: 9.0,
      totalQuestions: 20,
      correctAnswers: 18,
      timeSpent: 900,
      date: new Date().toISOString(),
    }
  ],
  progress: {
    totalAttempts: 15,
    averageScore: 7.8,
    streakDays: 3,
    weakTopics: ['Hình học không gian', 'Câu điều kiện loại 3'],
  },
  settings: {
    theme: 'light',
    soundEnabled: true,
    autoSave: true,
  }
};

export const getAppData = (): AppData => {
  const stored = localStorage.getItem('appData');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored app data', e);
    }
  }
  return initialData;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem('appData', JSON.stringify(data));
};
