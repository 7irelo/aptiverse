import React from 'react'
import MetricCard from '../components/MetricCard';
import { Award, BookOpen, Clock, Target } from 'lucide-react';
import { overallStats } from '../constants';

type KeyMetricsGridProps = {};

const KeyMetricsGrid: React.FC<KeyMetricsGridProps> = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<BookOpen className="text-blue-600" />}
          title="Overall Average"
          value={`${overallStats.averageScore}%`}
          trend={overallStats.weeklyTrend}
          description={`Class rank: ${overallStats.classRank}`}
        />
        <MetricCard
          icon={<Target className="text-green-600" />}
          title="Weekly Progress"
          value={`${overallStats.completionRate}%`}
          trend={2}
          description="Goals completed this week"
        />
        <MetricCard
          icon={<Clock className="text-purple-600" />}
          title="Study Time"
          value={`${overallStats.studyHours}h`}
          trend={-3}
          description="Total hours this week"
        />
        <MetricCard
          icon={<Award className="text-orange-600" />}
          title="Achievements"
          value={overallStats.goalsAchieved}
          trend={8}
          description="Monthly goals completed"
        />
      </div>
  )
}

export default KeyMetricsGrid