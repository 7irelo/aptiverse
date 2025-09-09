export interface Subject {
  name: string;
  progress: number;
  target: number;
  color: string;
  averageScore: number;
  nextAssessment?: string;
  focusArea: string;
}

export interface OverallStats {
  averageScore: number;
  completionRate: number;
  studyHours: number;
  goalsAchieved: number;
  weeklyTrend: number;
  emotionalWellness: number;
  attendance: string;
  classRank: string;
  streak: number;
}

export interface RecentActivity {
  subject: string;
  activity: string;
  time: string;
  score: number;
  type: 'assignment' | 'test' | 'quiz' | 'project';
}

export interface UpcomingDeadline {
  subject: string;
  task: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  preparationTime: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

