import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Report } from './DashboardClient';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

export default function DashboardStats({ reports }: { reports: Report[] }) {
  // Aggregate data for category chart
  const categoryCounts = reports.reduce((acc, report) => {
    const cat = report.ai_category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5

  // Aggregate data for severity pie chart
  const severityData = [
    { name: 'Critical (>80)', value: reports.filter(r => r.ai_severity > 80).length, color: '#EA580C' },
    { name: 'Standard (31-80)', value: reports.filter(r => r.ai_severity > 30 && r.ai_severity <= 80).length, color: '#F59E0B' },
    { name: 'Low (0-30)', value: reports.filter(r => r.ai_severity <= 30).length, color: '#14B8A6' },
  ].filter(d => d.value > 0);

  if (reports.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-slate-800 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="text-teal-600 w-4 h-4" /> Top Issue Categories
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#14B8A6' : '#3B82F6'} opacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-slate-800 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <PieChartIcon className="text-purple-600 w-4 h-4" /> Severity Breakdown
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                itemStyle={{ color: '#1e293b' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#475569' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
