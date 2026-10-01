import React from 'react';
import { FileText, Download, PlusCircle } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAnalysis: () => void;
  onExport: () => void;
  hasResume: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onNewAnalysis,
  onExport,
  hasResume,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skill Matrix' },
    { id: 'gaps', label: 'Gap Analysis' },
    { id: 'rewrites', label: 'Bullet Rewrites' },
    { id: 'ats', label: 'ATS Audit' },
    { id: 'action-plan', label: 'Action Plan' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Resume Analyzer
          </span>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1.5 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-[19px] h-0.5 bg-slate-900" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action buttons */}
        <div className="flex items-center gap-2.5">
          {hasResume && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap shrink-0"
              title="Export Full Audit Report"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Report</span>
            </button>
          )}

          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-2xs whitespace-nowrap shrink-0"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-2 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
