import React from 'react';
import { ResumeAnalysisResult } from '../types/resume';
import {
  TrendingUp,
  Cpu,
  ShieldCheck,
  AlignLeft,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target
} from 'lucide-react';

interface DashboardOverviewProps {
  result: ResumeAnalysisResult;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  result,
  onNavigateTab,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 border-emerald-200 bg-emerald-50/50';
    if (score >= 70) return 'text-blue-700 border-blue-200 bg-blue-50/50';
    if (score >= 55) return 'text-amber-700 border-amber-200 bg-amber-50/50';
    return 'text-rose-700 border-rose-200 bg-rose-50/50';
  };

  const getPillarIcon = (key: string) => {
    switch (key) {
      case 'impact':
        return <TrendingUp className="h-5 w-5 text-slate-700" />;
      case 'skills':
        return <Cpu className="h-5 w-5 text-slate-700" />;
      case 'atsParseability':
        return <ShieldCheck className="h-5 w-5 text-slate-700" />;
      case 'brevity':
        return <AlignLeft className="h-5 w-5 text-slate-700" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Score Hero Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Candidate: {result.candidateName}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-slate-400" />
                Target: {result.targetRole}
              </span>
              <span aria-hidden="true">·</span>
              <span>Audited: {result.analyzedAt}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Resume Readiness Score
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
              {result.executiveSummary}
            </p>
          </div>

          {/* Primary Score Ring */}
          <div className="flex items-center gap-5 lg:pl-6 shrink-0">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Overall Grade
              </div>
              <div className="text-base font-semibold text-slate-900 mt-0.5">
                {result.scoreGrade}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Target Role Match: {result.gapAnalysis.roleMatchPercentage}%
              </div>
            </div>

            <div
              className={`flex h-20 w-20 flex-col items-center justify-center rounded-xl border ${getScoreColor(
                result.overallScore
              )}`}
            >
              <span className="font-mono text-3xl font-bold tabular-nums">
                {result.overallScore}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-500">
                / 100
              </span>
            </div>
          </div>
        </div>

        {/* Quick action buttons row */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-medium text-slate-900">Core Findings:</span>
            <span>{result.gapAnalysis.missingCount} Missing Skills</span>
            <span aria-hidden="true">·</span>
            <span>{result.bulletAudits.length} Weak Bullets to Fix</span>
            <span aria-hidden="true">·</span>
            <span>{result.actionPlan.length} Action Items</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('rewrites')}
              className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-slate-700 transition-colors"
            >
              <span>Review Bullet Rewrites</span>
              <ArrowRight className="h-3 w-3" />
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => onNavigateTab('gaps')}
              className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-slate-700 transition-colors"
            >
              <span>Explore Skill Gaps</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Evaluation Pillars
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Four weighted dimensions evaluated by recruitment algorithms and technical screeners
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(result.pillars).map(([key, pillar]) => {
            return (
              <div
                key={key}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {getPillarIcon(key)}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-bold tabular-nums text-slate-900">
                        {pillar.score}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/100</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    {pillar.label}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {pillar.feedback}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1.5">
                  {pillar.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-500">{m.name}</span>
                      <span className="font-mono font-medium text-slate-800 tabular-nums">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Critical Vulnerabilities Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Key Strengths Identified
            </h3>
          </div>

          <div className="space-y-3">
            {result.topStrengths.map((str, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-100"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-semibold">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pt-0.5">
                  {str}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vulnerabilities */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Critical Screen Risks & Flaws
            </h3>
          </div>

          <div className="space-y-3">
            {result.topWeaknesses.map((weak, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-100"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-semibold">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pt-0.5">
                  {weak}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
