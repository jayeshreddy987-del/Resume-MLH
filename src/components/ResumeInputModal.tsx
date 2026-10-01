import React, { useState } from 'react';
import { SAMPLE_RESUMES, PRESET_TARGET_ROLES } from '../data/sampleResumes';
import { UploadCloud, FileText, Sparkles, X, Briefcase, Check, ArrowRight } from 'lucide-react';

interface ResumeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyze: (resumeText: string, targetRole: string, jobDescription?: string) => Promise<void>;
  isLoading: boolean;
}

export const ResumeInputModal: React.FC<ResumeInputModalProps> = ({
  isOpen,
  onClose,
  onAnalyze,
  isLoading,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'paste' | 'upload' | 'samples'>('samples');
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full-Stack Engineer');
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('alex-rivera-swe');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSampleSelect = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const sample = SAMPLE_RESUMES.find((s) => s.id === sampleId);
    if (sample) {
      setResumeText(sample.rawText);
      setTargetRole(sample.targetRole);
      setIsCustomRole(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setFileName(file.name);

    if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDFs, we can extract plain text or read text representation
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // In browser, if plain text is not parseable directly, we notify user or use text preview
        // Many resumes have text readable via reader or fallback
        if (result && result.length > 50) {
          // Attempt basic extraction or prompt
          setResumeText(result);
        }
      };
      reader.readAsText(file);
    } else {
      setFileError('Supported formats: .txt, .md, .pdf (text-based). For best results, you can also paste the text directly.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = isCustomRole && customRole.trim() ? customRole.trim() : targetRole;
    let textToAnalyze = resumeText.trim();

    if (!textToAnalyze && activeInputTab === 'samples') {
      const sample = SAMPLE_RESUMES.find((s) => s.id === selectedSampleId);
      if (sample) textToAnalyze = sample.rawText;
    }

    if (!textToAnalyze || textToAnalyze.length < 30) {
      setFileError('Please provide at least 30 characters of resume content.');
      return;
    }

    await onAnalyze(textToAnalyze, finalRole, showJdInput ? jobDescription : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Configure Resume Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a pre-loaded resume or provide your own to generate an in-depth ATS evaluation
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Selector Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveInputTab('samples');
                if (!resumeText) handleSampleSelect(selectedSampleId);
              }}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-medium transition-colors border-t border-x ${
                activeInputTab === 'samples'
                  ? 'border-slate-200 bg-white text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Instant Samples (Recommended)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveInputTab('paste')}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-medium transition-colors border-t border-x ${
                activeInputTab === 'paste'
                  ? 'border-slate-200 bg-white text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Paste Text</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveInputTab('upload')}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-xs font-medium transition-colors border-t border-x ${
                activeInputTab === 'upload'
                  ? 'border-slate-200 bg-white text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Target Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                Target Job Role
              </span>
              <button
                type="button"
                onClick={() => setIsCustomRole(!isCustomRole)}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                {isCustomRole ? 'Choose from presets' : '+ Enter custom title'}
              </button>
            </label>

            {isCustomRole ? (
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g., Staff Distributed Systems Architect"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            ) : (
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              >
                {PRESET_TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Optional Job Description Accordion */}
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setShowJdInput(!showJdInput)}
              className="flex items-center justify-between w-full text-xs font-medium text-slate-700 hover:text-slate-900"
            >
              <span>Target Job Description (Optional)</span>
              <span className="text-xs text-slate-400">
                {showJdInput ? 'Hide' : '+ Add specific JD to compare against'}
              </span>
            </button>
            {showJdInput && (
              <div className="mt-3">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description or role requirements here to get pinpoint keyword gap scoring..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            )}
          </div>

          {/* Tab 1: Samples */}
          {activeInputTab === 'samples' && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-700">
                Choose a Sample Profile to Test
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SAMPLE_RESUMES.map((sample) => {
                  const isSelected = selectedSampleId === sample.id;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSampleSelect(sample.id)}
                      className={`text-left rounded-lg border p-3.5 transition-all relative ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {sample.name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {sample.experienceLevel}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-600 mb-1.5">
                        Targeting: {sample.targetRole}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {sample.description}
                      </p>
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-slate-900">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Paste Text */}
          {activeInputTab === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Resume Plain Text
                </label>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {resumeText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your complete resume here including contact details, experience, skills, and education..."
                rows={12}
                className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs leading-relaxed text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </div>
          )}

          {/* Tab 3: Upload Document */}
          {activeInputTab === 'upload' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center hover:bg-slate-100 transition-colors">
                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-800">
                  Drag and drop or select your resume file
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports .txt, .md, .pdf (text-extractable)
                </p>
                <label className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer">
                  <span>Browse File</span>
                  <input
                    type="file"
                    accept=".txt,.md,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {fileName && (
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-800">{fileName}</span>
                  </div>
                  <span className="text-xs text-slate-500">File Loaded</span>
                </div>
              )}

              {fileError && (
                <p className="text-xs text-rose-600">{fileError}</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors shadow-2xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Running ATS Audit...</span>
              </>
            ) : (
              <>
                <span>Analyze Resume</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
