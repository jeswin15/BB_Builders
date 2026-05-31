import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Lightbulb, Activity, Layers } from 'lucide-react';

export default function Analytics() {
  const insights = [
    {
      title: 'Project Delay Risk',
      description: 'Tower A foundation is proceeding 15% slower than estimated due to minor material delivery delays.',
      impact: 'Negative',
      type: 'Risk',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
    {
      title: 'Budget Optimization Opportunity',
      description: 'Recent bulk purchases of Cement 53G saved 8% compared to standard rates. Consider applying this to steel procurement.',
      impact: 'Positive',
      type: 'Optimization',
      icon: Lightbulb,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      title: 'Workforce Allocation',
      description: 'Downtown Commercial site has a 20% surplus in masonry workers this week based on milestone requirements.',
      impact: 'Neutral',
      type: 'Operations',
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Insights & Analytics</h1>
          <p className="text-slate-500 mt-1">High-level project analytics and machine learning driven recommendations.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <BarChart3 size={18} />
          <span>Generate New Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Layers className="text-blue-600" /> Executive Summary
            </h2>
            <div className="space-y-4">
              {insights.map((insight, idx) => {
                const Icon = insight.icon;
                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${insight.bg} ${insight.color}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{insight.title}</h3>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${insight.impact === 'Positive' ? 'bg-emerald-100 text-emerald-700' : insight.impact === 'Negative' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'}`}>
                          {insight.impact}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Overall Health Score</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-5xl font-black text-emerald-600">84</span>
              <span className="text-slate-500 font-medium mb-1">/ 100</span>
            </div>
            <p className="text-sm text-slate-600">Projects are generally on track. Financials are strong, but some operational friction exists at the Downtown site.</p>
            
            <div className="mt-6 space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">Schedule Variance</span>
                  <span className="text-amber-600 font-semibold">-4%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">Cost Variance</span>
                  <span className="text-emerald-600 font-semibold">+8%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
