import React from 'react';
import { 
  BookOpen, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Play, 
  Eye, 
  ChevronRight 
} from 'lucide-react';

// --- Types ---

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

interface TableRowData {
  id: number;
  type: 'Course' | 'Room' | 'Constraint';
  name: string;
  addedBy: string;
  date: string;
}

// --- Sub-Components ---

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, colorClass }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-6 flex items-start justify-between hover:border-slate-300 transition-colors duration-200">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      {icon}
    </div>
  </div>
);

// --- Main Component ---

const Dashboard: React.FC = () => {
  // Dummy data for the table
  const recentEntities: TableRowData[] = [
    { id: 1, type: 'Course', name: 'CSC 401 - Advanced Algorithms', addedBy: 'Dr. A. Smith', date: 'Oct 24, 2023' },
    { id: 2, type: 'Room', name: 'Lecture Theater 1 (LT-01)', addedBy: 'Admin', date: 'Oct 23, 2023' },
    { id: 3, type: 'Constraint', name: 'No Friday Afternoons', addedBy: 'Prof. Johnson', date: 'Oct 22, 2023' },
    { id: 4, type: 'Course', name: 'MATH 202 - Linear Algebra', addedBy: 'Dept. Head', date: 'Oct 21, 2023' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      
      {/* 1. Page Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">System status, algorithm metrics, and quick actions.</p>
      </header>

      {/* 2. Top Row: System Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Courses" 
          value="142 Active" 
          icon={<BookOpen className="w-6 h-6 text-blue-600" />} 
          colorClass="bg-blue-50"
        />
        <MetricCard 
          title="Total Rooms" 
          value="24 Available" 
          icon={<Building2 className="w-6 h-6 text-blue-600" />} 
          colorClass="bg-blue-50"
        />
        <MetricCard 
          title="Active Constraints" 
          value="8 Rules Enforced" 
          icon={<ShieldCheck className="w-6 h-6 text-blue-600" />} 
          colorClass="bg-blue-50"
        />
        <MetricCard 
          title="Last Fitness Score" 
          value="98.5%" 
          icon={<Activity className="w-6 h-6 text-blue-600" />} 
          colorClass="bg-blue-50"
        />
      </div>

      {/* 3. Middle Row: Timetable Generation Hub */}
      <section className="bg-white border border-slate-200 rounded-lg p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Left Side: Status */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Generation Status</h2>
              <p className="text-slate-500 text-sm mt-1">
                Last generation completed 2 hours ago using <span className="font-mono text-slate-700 bg-slate-100 px-1 rounded">Genetic Algorithm v2.1</span>.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600">Execution Time: <span className="font-mono font-medium text-slate-900">4m 12s</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-600">Conflicts: <span className="font-mono font-medium text-green-700">0</span></span>
              </div>
            </div>
          </div>

          {/* Right Side: Action Callout */}
          <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
              <Play className="w-4 h-4 fill-current" />
              Generate New Timetable
            </button>
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200">
              <Eye className="w-4 h-4" />
              View Last Results
            </button>
          </div>
        </div>
      </section>

      {/* 4. Bottom Row: Quick Glance Table */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Recently Added Entities</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Name / Code</th>
                <th className="px-6 py-3">Added By</th>
                <th className="px-6 py-3">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentEntities.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${row.type === 'Course' ? 'bg-blue-100 text-blue-800' : 
                        row.type === 'Room' ? 'bg-slate-100 text-slate-800' : 
                        'bg-orange-100 text-orange-800'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                  <td className="px-6 py-4 text-slate-500">{row.addedBy}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;