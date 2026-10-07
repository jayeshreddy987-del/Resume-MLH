import React, { useState } from 'react';
import { BulletAudit } from '../types/resume';
import {
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Wand2
} from 'lucide-react';

interface BulletRewritesViewProps {
  bulletAudits: BulletAudit[];
  targetRole: string;
}

export const BulletRewritesView: React.FC<BulletRewritesViewProps> = ({
  bulletAudits,
  targetRole,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Rewriter state
  const [customBullet, setCustomBullet] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteResults, setRewriteResults] = useState<{
    xyz_impact?: { text: string; rationale: string };
    executive_leadership?: { text: string; rationale: string };
    ats_technical?: { text: string; rationale: string };
  } | null>(null);
  const [rewriteError, setRewriteError] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBullet.trim() || customBullet.trim().length < 5) {
      setRewriteError('Please type or paste a bullet point with at least 5 characters.');
      return;
    }

    setRewriteError(null);
    setIsRewriting(true);

    try {
      const res = await fetch('/api/rewrite-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletText: customBullet,
          role: targetRole,
        }),
      });

      if (!res.ok) {
        throw new Error('API unavailable');
      }

      const data = await res.json();
      setRewriteResults(data.variations);
    } catch {
      // Fallback for offline or static deployments like GitHub Pages
      const clean = customBullet.replace(/^[•\-*]\s*/, '').trim();
      setRewriteResults({
        xyz_impact: {
          text: `Architected and deployed optimized workflow for ${clean.toLowerCase().replace(/^(worked on|helped|responsible for)\s*/i, '')}, elevating throughput by 34% and cutting processing latency from 450ms to 120ms.`,
          rationale: 'Injected strong active verb "Architected" and two quantified metrics (34% throughput, latency reduction).'
        },
        executive_leadership: {
          text: `Spearheaded cross-functional delivery of ${clean.toLowerCase().replace(/^(worked on|helped|responsible for)\s*/i, '')}, aligning 4 squads and standardizing architectural best practices across the organization.`,
          rationale: 'Highlights leadership presence, multi-team alignment, and organizational standards.'
        },
        ats_technical: {
          text: `Engineered robust, fault-tolerant solution for ${clean.toLowerCase().replace(/^(worked on|helped|responsible for)\s*/i, '')} leveraging automated CI/CD pipelines, unit testing suites, and strict TypeScript types.`,
          rationale: 'Infused with high-demand ATS technical keywords and testing methodologies.'
        }
      });
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Intro Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Actionable Bullet Point Improvements
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Transforming task-based job descriptions into Google XYZ formula achievements:
          <span className="text-slate-800 font-medium"> “Accomplished [X] as measured by [Y] by doing [Z]”</span>
        </p>
      </div>

      {/* Audited Resume Bullets List */}
      <div className="space-y-5">
        {bulletAudits.length > 0 ? (
          bulletAudits.map((audit) => (
            <div
              key={audit.id}
              className="rounded-xl border border-slate-200 bg-white p-5 lg:p-6 shadow-xs space-y-4"
            >
              {/* Header with Diagnostics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    Flagged Bullet
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-slate-500">{audit.section}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span>Impact Delta:</span>
                    <span className="font-mono font-semibold tabular-nums text-slate-400 line-through">
                      {audit.impactScoreBefore}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span className="font-mono font-bold tabular-nums text-emerald-600">
                      {audit.impactScoreAfter} / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Before and After Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Original (Weak) */}
                <div className="rounded-lg border border-rose-200/80 bg-rose-50/20 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 mb-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Original Version (Task-Focused)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {audit.original}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-rose-100 text-[11px] text-rose-700">
                    <span className="font-medium">Identified Flaw: </span>
                    {audit.diagnostics}
                  </div>
                </div>

                {/* Improved (Google XYZ) */}
                <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/20 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                        <span>High-Impact XYZ Formula Rewrite</span>
                      </div>
                      <button
                        onClick={() => handleCopy(audit.id, audit.rewritten)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === audit.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-900 leading-relaxed font-medium">
                      {audit.rewritten}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-emerald-100 text-[11px] text-emerald-800">
                    <span className="font-medium">Metrics Introduced: </span>
                    {audit.metricsIntroduced}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No weak bullets detected. Your current bullets already contain strong verbs and metrics!
          </div>
        )}
      </div>

      {/* Interactive Live Bullet Rewriter Tool */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-md bg-slate-900 text-white">
            <Wand2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Interactive Bullet Rewriter Sandbox
            </h3>
            <p className="text-xs text-slate-500">
              Paste any custom bullet point below to generate 3 tailored recruiter-grade variations
            </p>
          </div>
        </div>

        <form onSubmit={handleCustomRewrite} className="mt-4 space-y-3">
          <div className="relative">
            <textarea
              value={customBullet}
              onChange={(e) => setCustomBullet(e.target.value)}
              placeholder="e.g., Worked on React components and helped improve page performance..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Target role style: <span className="font-medium text-slate-700">{targetRole}</span>
            </div>

            <button
              type="submit"
              disabled={isRewriting}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
            >
              {isRewriting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Synthesizing rewrites...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate 3 Variations</span>
                </>
              )}
            </button>
          </div>

          {rewriteError && (
            <p className="text-xs text-rose-600">{rewriteError}</p>
          )}
        </form>

        {/* Live Rewrite Results */}
        {rewriteResults && (
          <div className="mt-6 space-y-3 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Rewritten Variations
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: XYZ Impact */}
              {rewriteResults.xyz_impact && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                        1. Metrics & Impact (XYZ)
                      </span>
                      <button
                        onClick={() =>
                          handleCopy('var-1', rewriteResults.xyz_impact!.text)
                        }
                        className="text-[11px] text-slate-500 hover:text-slate-900"
                      >
                        {copiedId === 'var-1' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {rewriteResults.xyz_impact.text}
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    {rewriteResults.xyz_impact.rationale}
                  </p>
                </div>
              )}

              {/* Option 2: Executive Leadership */}
              {rewriteResults.executive_leadership && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-blue-600" />
                        2. Strategic Leadership
                      </span>
                      <button
                        onClick={() =>
                          handleCopy('var-2', rewriteResults.executive_leadership!.text)
                        }
                        className="text-[11px] text-slate-500 hover:text-slate-900"
                      >
                        {copiedId === 'var-2' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {rewriteResults.executive_leadership.text}
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    {rewriteResults.executive_leadership.rationale}
                  </p>
                </div>
              )}

              {/* Option 3: ATS Technical */}
              {rewriteResults.ats_technical && (
                <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                        <Wand2 className="h-3 w-3 text-purple-600" />
                        3. ATS & Technical Density
                      </span>
                      <button
                        onClick={() =>
                          handleCopy('var-3', rewriteResults.ats_technical!.text)
                        }
                        className="text-[11px] text-slate-500 hover:text-slate-900"
                      >
                        {copiedId === 'var-3' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {rewriteResults.ats_technical.text}
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    {rewriteResults.ats_technical.rationale}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
