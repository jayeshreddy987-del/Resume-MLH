import React, { useState } from 'react';
import { ResumeAnalysisResult, SkillGapItem } from '../types/resume';
import { AlertCircle, CheckCircle2, HelpCircle, ArrowUpRight } from 'lucide-react';

interface GapAnalysisViewProps {
  result: ResumeAnalysisResult;
  onAddToActionPlan?: (gap: SkillGapItem) => void;
}

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({
  result,
}) => {
  const [filter, setFilter] = useState<'all' | 'missing' | 'under_demonstrated' | 'matched'>('all');

  const gaps = result.gapAnalysis.gaps;

  const filteredGaps = gaps.filter((g) => {
    if (filter === 'all') return true;
    return g.status === filter;
  });

  const missingCriticalCount = gaps.filter(
    (g) => g.status === 'missing' && g.importance === 'critical'
  ).length;

  return (
    <div className="space-y-6">
      {/* Role Target Summary Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="text-xs text-slate-500 mb-1">
              Target Position: <span className="font-semibold text-slate-800">{result.targetRole}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Role Fit & Skill Gap Audit
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Comparison between your resume qualifications and industry hiring filters for {result.targetRole}.
              Closing these gaps directly improves your chances of passing resume screening stages.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div>
              <div className="text-xs text-slate-500 font-medium">Screen Match</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-slate-900">
                {result.gapAnalysis.roleMatchPercentage}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Critical Gaps</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-rose-600">
                {missingCriticalCount}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-xs text-slate-500 font-medium">Matched Skills</div>
              <div className="font-mono text-2xl font-bold tabular-nums text-emerald-600">
                {result.gapAnalysis.matchedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Competencies ({gaps.length})
          </button>
          <button
            onClick={() => setFilter('missing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'missing'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Missing ({gaps.filter((g) => g.status === 'missing').length})
          </button>
          <button
            onClick={() => setFilter('under_demonstrated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'under_demonstrated'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Under-Demonstrated ({gaps.filter((g) => g.status === 'under_demonstrated').length})
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              filter === 'matched'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Matched ({gaps.filter((g) => g.status === 'matched').length})
          </button>
        </div>
      </div>

      {/* Gap Cards List */}
      <div className="space-y-3">
        {filteredGaps.map((item, idx) => {
          const isMissing = item.status === 'missing';
          const isMatched = item.status === 'matched';
          const isUnder = item.status === 'under_demonstrated';

          return (
            <div
              key={idx}
              className={`rounded-xl border p-5 transition-colors ${
                isMissing
                  ? 'border-rose-200 bg-rose-50/20'
                  : isUnder
                  ? 'border-amber-200 bg-amber-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {isMatched ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : isMissing ? (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  ) : (
                    <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.skill}
                  </h3>
                  <div className="text-xs text-slate-500">
                    <span>{item.category}</span>
                    <span aria-hidden="true" className="mx-1.5">·</span>
                    <span className="capitalize">{item.importance} requirement</span>
                  </div>
                </div>

                <div className="text-xs font-medium">
                  {isMatched && (
                    <span className="text-emerald-700">Demonstrated in Resume</span>
                  )}
                  {isMissing && (
                    <span className="text-rose-700 font-semibold">Missing from Resume</span>
                  )}
                  {isUnder && (
                    <span className="text-amber-700">Needs Stronger Evidence</span>
                  )}
                </div>
              </div>

              {/* Rationale */}
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.rationale}
              </p>

              {/* Actionable Improvement Recommendation */}
              <div className="rounded-lg bg-white border border-slate-200/80 p-3 text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-1">
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
                  <span>Actionable Recommendation:</span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-5">
                  {item.actionableTip}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
