import React, { useState } from 'react';
import { ResumeAnalysisResult } from '../types/resume';
import { X, Copy, Check, Download, Printer, Archive } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ResumeAnalysisResult;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownReport = () => {
    return `# Resume Audit & Improvement Report: ${result.candidateName}
**Target Role:** ${result.targetRole}  
**Overall Readiness Score:** ${result.overallScore} / 100 (${result.scoreGrade})  
**Date of Audit:** ${result.analyzedAt}  

---

## Executive Summary
${result.executiveSummary}

### Key Strengths:
${result.topStrengths.map((s) => `- ${s}`).join('\n')}

### Critical Screen Risks:
${result.topWeaknesses.map((w) => `- ${w}`).join('\n')}

---

## Evaluation Pillars
- **Impact & Quantification:** ${result.pillars.impact.score}/100 — ${result.pillars.impact.feedback}
- **Skills & Keyword Alignment:** ${result.pillars.skills.score}/100 — ${result.pillars.skills.feedback}
- **ATS Parseability & Layout:** ${result.pillars.atsParseability.score}/100 — ${result.pillars.atsParseability.feedback}
- **Brevity & Style:** ${result.pillars.brevity.score}/100 — ${result.pillars.brevity.feedback}

---

## Skill Gap Analysis for ${result.targetRole}
**Target Role Screen Match:** ${result.gapAnalysis.roleMatchPercentage}%  
**Matched Skills:** ${result.gapAnalysis.matchedCount}  
**Missing Key Skills:** ${result.gapAnalysis.missingCount}  

### Detailed Gap Items:
${result.gapAnalysis.gaps
  .map(
    (g) =>
      `### ${g.skill} (${g.importance.toUpperCase()} - ${g.status.toUpperCase()})\n- **Rationale:** ${g.rationale}\n- **Recommendation:** ${g.actionableTip}`
  )
  .join('\n\n')}

---

## High-Impact Bullet Point Rewrites (Google XYZ Formula)
${result.bulletAudits
  .map(
    (b, i) =>
      `### Bullet #${i + 1}
**Original (Weak):** ${b.original}  
**Improved:** ${b.rewritten}  
**Impact Score Delta:** ${b.impactScoreBefore} -> ${b.impactScoreAfter}  
**Metrics Introduced:** ${b.metricsIntroduced}`
  )
  .join('\n\n')}

---

## Prioritized Action Plan
${result.actionPlan
  .map(
    (a, i) =>
      `${i + 1}. [ ] **${a.title}** (${a.priority.toUpperCase()})\n   ${a.description}`
  )
  .join('\n')}
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const report = generateMarkdownReport();
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Resume_Audit_${result.candidateName.replace(/\s+/g, '_')}.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Export Resume Audit Report
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Download or copy your complete analysis, skill gaps, and bullet rewrites
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="rounded-lg border border-slate-200 bg-white p-5 font-mono text-xs text-slate-800 space-y-4 whitespace-pre-wrap leading-relaxed">
            {generateMarkdownReport()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/download-zip"
              download="resume-analyzer.zip"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Archive className="h-3.5 w-3.5 text-slate-600" />
              <span>Download Project .ZIP</span>
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print View</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .MD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
