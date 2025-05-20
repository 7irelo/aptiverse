import SubjectCard from "../components/SubjectCard";
import { subjects } from "../constants";

type SubjectsProgressProps = {};

const SubjectsProgress: React.FC<SubjectsProgressProps> = () => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4 md:gap-0">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Subject Performance</h2>
                    <span className="text-sm text-slate-500">NSC Curriculum Progress & Focus Areas</span>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600">View Detailed Report</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subject, index) => (
                    <SubjectCard key={index} subject={subject} />
                ))}
            </div>
        </div>
    )
}

export default SubjectsProgress