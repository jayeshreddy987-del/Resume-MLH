import React from 'react';
import { ResumeAnalysisResult } from '../types/resume';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Calendar,
  FileCheck
} from 'lucide-react';

interface AtsScannerViewProps {
  result: ResumeAnalysisResult;
}

export const AtsScannerView: React.FC<AtsScannerViewProps> = ({ result }) => {
  const { atsSimulation, pillars } = result;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Applicant Tracking System (ATS) Parser Simulation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          How enterprise parsers (Workday, Greenhouse, Lever, Taleo) extract your contact details, sections, and qualifications
        </p>
      </div>

      {/* Main Parser View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Extracted Candidate Entities */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Parsed Identity & Contact
            </h3>
            <span className="text-xs font-mono font-medium text-emerald-700">
              {atsSimulation.detectedEmail && atsSimulation.detectedPhone ? 'Verified' : 'Incomplete'}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Full Name</span>
              <span className="font-semibold text-slate-800 text-sm">
                {atsSimulation.candidateName || 'Not Detected'}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block mb-0.5">Email Address</span>
                {atsSimulation.detectedEmail ? (
                  <span className="font-mono text-slate-800 font-medium">
                    {atsSimulation.detectedEmail}
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium">Missing - Add to header</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block mb-0.5">Phone Number</span>
                {atsSimulation.detectedPhone ? (
                  <span className="font-mono text-slate-800 font-medium">
                    {atsSimulation.detectedPhone}
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">Missing</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Linkedin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block mb-0.5">LinkedIn Profile</span>
                {atsSimulation.detectedLinkedIn ? (
                  <span className="font-mono text-slate-800 font-medium truncate block max-w-[200px]">
                    {atsSimulation.detectedLinkedIn}
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">Missing link</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block mb-0.5">Location</span>
                <span className="text-slate-800 font-medium">
                  {atsSimulation.detectedLocation || 'Detected from context'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block mb-0.5">Estimated Career Scope</span>
                <span className="text-slate-800 font-medium">
                  {atsSimulation.detectedExperienceYears
                    ? `${atsSimulation.detectedExperienceYears}+ years relevant experience`
                    : 'Unspecified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right: Section Hierarchy & Formatting Risks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Heading Audit */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Standard Section Recognition
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Parsers look for exact standard headings to catalog your background into correct database tables.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {['EXPERIENCE', 'EDUCATION', 'SKILLS', 'SUMMARY', 'PROJECTS', 'CERTIFICATIONS'].map(
                (sec) => {
                  const isFound = atsSimulation.standardSectionsFound.includes(sec);
                  return (
                    <div
                      key={sec}
                      className={`flex items-center gap-2 p-3 rounded-lg border ${
                        isFound
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                          : 'border-slate-200 bg-slate-50/60 text-slate-400'
                      }`}
                    >
                      {isFound ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span className="font-semibold text-[11px] truncate">{sec}</span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Formatting Risks & Remediation */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Formatting Risks & Parsing Violations
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Score: {pillars.atsParseability.score} / 100
              </span>
            </div>

            {atsSimulation.formattingRisks.length > 0 ? (
              <div className="space-y-3">
                {atsSimulation.formattingRisks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/30 text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-semibold text-amber-900">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>{risk.risk}</span>
                      <span className="text-[10px] text-amber-700 uppercase font-mono">
                        · {risk.severity} severity
                      </span>
                    </div>
                    <p className="text-slate-600 pl-5 leading-relaxed">
                      <span className="font-medium text-slate-800">Remediation: </span>
                      {risk.fix}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-800">
                <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold">Clean Machine Parseability</div>
                  <p className="mt-0.5 text-emerald-700">
                    No critical formatting violations found. Parsers can cleanly read your resume without dropping sections.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
