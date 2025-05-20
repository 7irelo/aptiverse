import { TrendingUp, Zap } from 'lucide-react';
import { overallStats } from '../constants';
import { getGreeting } from '../utils';

type WelcomeSectionProps = {
    firstName?: string;
};

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ firstName }) => {
    return (
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4 md:gap-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">{getGreeting()}{!!firstName && `, ${firstName}`}!</h1>
                    <p className="text-slate-500 text-lg mb-4">Here's your learning overview for today</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-sm font-semibold">
                    <Zap size={16} className="text-yellow-500" />
                    <span>{overallStats.streak} day streak</span>
                </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-5 py-3 rounded-lg text-sm font-medium">
                <TrendingUp size={16} />
                <span>Performance up {overallStats.weeklyTrend}% this week • {overallStats.attendance} attendance</span>
            </div>
        </div>
    )
}

export default WelcomeSection