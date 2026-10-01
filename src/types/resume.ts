export interface PillarScore {
  score: number; // 0 - 100
  label: string;
  status: 'excellent' | 'good' | 'needs_work' | 'critical';
  metrics: { name: string; value: string | number; benchmark: string }[];
  feedback: string;
  keyIssues: string[];
}

export interface SkillItem {
  name: string;
  level: 'strong' | 'intermediate' | 'emerging';
  mentions: number;
  category: string;
}

export interface SkillGapItem {
  skill: string;
  category: string;
  importance: 'critical' | 'preferred' | 'bonus';
  status: 'matched' | 'missing' | 'under_demonstrated';
  rationale: string;
  actionableTip: string;
}

export interface BulletAudit {
  id: string;
  original: string;
  rewritten: string;
  section: string;
  flawTypes: ('lacks_metrics' | 'weak_verb' | 'passive_voice' | 'vague_outcome' | 'too_wordy')[];
  diagnostics: string;
  impactScoreBefore: number;
  impactScoreAfter: number;
  metricsIntroduced: string;
}

export interface ActionChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'Impact' | 'Skills' | 'ATS Format' | 'Brevity';
  priority: 'urgent' | 'high' | 'medium';
  completed: boolean;
}

export interface AtsParseSimulation {
  candidateName: string;
  detectedEmail: string | null;
  detectedPhone: string | null;
  detectedLinkedIn: string | null;
  detectedLocation: string | null;
  detectedExperienceYears: number | null;
  standardSectionsFound: string[];
  missingStandardSections: string[];
  formattingRisks: { risk: string; severity: 'high' | 'medium' | 'low'; fix: string }[];
}

export interface ResumeAnalysisResult {
  candidateName: string;
  targetRole: string;
  overallScore: number; // 0 - 100
  scoreGrade: 'Exceptional' | 'Competitive' | 'Needs Improvement' | 'High Risk';
  executiveSummary: string;
  topStrengths: string[];
  topWeaknesses: string[];
  
  pillars: {
    impact: PillarScore;
    skills: PillarScore;
    atsParseability: PillarScore;
    brevity: PillarScore;
  };

  skills: {
    hardSkills: SkillItem[];
    softSkills: string[];
    byCategory: Record<string, string[]>;
  };

  gapAnalysis: {
    targetRoleTitle: string;
    roleMatchPercentage: number;
    gaps: SkillGapItem[];
    matchedCount: number;
    missingCount: number;
  };

  bulletAudits: BulletAudit[];
  actionPlan: ActionChecklistItem[];
  atsSimulation: AtsParseSimulation;
  analyzedAt: string;
}

export interface SampleResume {
  id: string;
  name: string;
  targetRole: string;
  experienceLevel: string;
  description: string;
  rawText: string;
}
