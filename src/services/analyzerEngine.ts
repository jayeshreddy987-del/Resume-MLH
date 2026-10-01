import type {
  ResumeAnalysisResult,
  PillarScore,
  SkillItem,
  SkillGapItem,
  BulletAudit,
  ActionChecklistItem,
  AtsParseSimulation
} from '../types/resume.ts';

const WEAK_VERB_PATTERNS = [
  { regex: /\b(responsible for|responsibilities included)\b/gi, label: 'Passive "Responsible for"', advice: 'Replace with an active ownership verb (e.g., Spearheaded, Orchestrated, Designed).' },
  { regex: /\b(worked on|worked with)\b/gi, label: 'Vague "Worked on"', advice: 'Specify your exact contribution: Built, Architected, Refactored, Delivered.' },
  { regex: /\b(helped|assisted|aided)\b/gi, label: 'Subordinate "Helped/Assisted"', advice: 'Clarify your individual impact: Co-engineered, Facilitated, Implemented.' },
  { regex: /\b(handled|dealt with)\b/gi, label: 'Unmeasured "Handled"', advice: 'Show scale: Administered, Resolved, Orchestrated, Streamlined.' },
  { regex: /\b(attended|participated in)\b/gi, label: 'Passive "Attended"', advice: 'Highlight leadership: Guided sprint rituals, Facilitated retrospectives.' }
];

const STRONG_VERBS = [
  'architected', 'spearheaded', 'orchestrated', 'engineered', 'optimized',
  'streamlined', 'automated', 'delivered', 'formulated', 'accelerated',
  'championed', 'deployed', 'designed', 'implemented', 'scaled',
  'reduced', 'increased', 'generated', 'modernized', 'benchmarked',
  'pioneered', 'restructured', 'audited', 'mentored', 'authored'
];

const KNOWN_SKILLS_CATALOG: Record<string, { category: string; importanceMap?: Record<string, 'critical' | 'preferred'> }> = {
  // Languages
  'typescript': { category: 'Languages' },
  'javascript': { category: 'Languages' },
  'python': { category: 'Languages' },
  'golang': { category: 'Languages' },
  'java': { category: 'Languages' },
  'c++': { category: 'Languages' },
  'c#': { category: 'Languages' },
  'ruby': { category: 'Languages' },
  'rust': { category: 'Languages' },
  'sql': { category: 'Languages' },
  'bash': { category: 'Languages' },
  'html5': { category: 'Languages' },
  'css3': { category: 'Languages' },

  // Frameworks & Libraries
  'react': { category: 'Frameworks & Libraries' },
  'next.js': { category: 'Frameworks & Libraries' },
  'vue': { category: 'Frameworks & Libraries' },
  'angular': { category: 'Frameworks & Libraries' },
  'node.js': { category: 'Frameworks & Libraries' },
  'express': { category: 'Frameworks & Libraries' },
  'tailwind css': { category: 'Frameworks & Libraries' },
  'redux': { category: 'Frameworks & Libraries' },
  'graphql': { category: 'Frameworks & Libraries' },
  'fastapi': { category: 'Frameworks & Libraries' },
  'pytorch': { category: 'Frameworks & Libraries' },
  'tensorflow': { category: 'Frameworks & Libraries' },
  'hugging face': { category: 'Frameworks & Libraries' },
  'langchain': { category: 'Frameworks & Libraries' },
  'scikit-learn': { category: 'Frameworks & Libraries' },

  // Databases & Storage
  'postgresql': { category: 'Databases & Storage' },
  'mysql': { category: 'Databases & Storage' },
  'mongodb': { category: 'Databases & Storage' },
  'redis': { category: 'Databases & Storage' },
  'elasticsearch': { category: 'Databases & Storage' },
  'pinecone': { category: 'Databases & Storage' },
  'snowflake': { category: 'Databases & Storage' },
  'dynamodb': { category: 'Databases & Storage' },

  // Cloud & DevOps
  'docker': { category: 'Cloud & DevOps' },
  'kubernetes': { category: 'Cloud & DevOps' },
  'aws': { category: 'Cloud & DevOps' },
  'gcp': { category: 'Cloud & DevOps' },
  'azure': { category: 'Cloud & DevOps' },
  'terraform': { category: 'Cloud & DevOps' },
  'ci/cd': { category: 'Cloud & DevOps' },
  'github actions': { category: 'Cloud & DevOps' },
  'microservices': { category: 'Cloud & DevOps' },
  'rest api': { category: 'Cloud & DevOps' },

  // Product & Analytics
  'amplitude': { category: 'Product & Analytics' },
  'mixpanel': { category: 'Product & Analytics' },
  'jira': { category: 'Product & Analytics' },
  'figma': { category: 'Product & Analytics' },
  'a/b testing': { category: 'Product & Analytics' },
  'product discovery': { category: 'Product & Analytics' },
  'user research': { category: 'Product & Analytics' },
  'agile': { category: 'Product & Analytics' },
  'scrum': { category: 'Product & Analytics' }
};

const ROLE_BENCHMARKS: Record<string, {
  coreSkills: { name: string; importance: 'critical' | 'preferred'; tip: string }[];
  expectedImpactRate: number; // percentage of bullets with numbers
  keywords: string[];
}> = {
  'Senior Full-Stack Engineer': {
    coreSkills: [
      { name: 'TypeScript', importance: 'critical', tip: 'Essential for modern full-stack architectures. Highlight strict typing and end-to-end contracts.' },
      { name: 'React', importance: 'critical', tip: 'Highlight state architecture, server components, and performance profiling.' },
      { name: 'Node.js', importance: 'critical', tip: 'Demonstrate asynchronous throughput and microservice resilience.' },
      { name: 'PostgreSQL', importance: 'critical', tip: 'Specify query optimization, indexing strategy, and schema migrations.' },
      { name: 'Docker', importance: 'preferred', tip: 'Demonstrate containerized staging and production parity.' },
      { name: 'Kubernetes', importance: 'preferred', tip: 'Highlight deployment orchestration, health probes, and cluster scaling.' },
      { name: 'AWS', importance: 'critical', tip: 'Recruiters expect direct infrastructure ownership (ECS, S3, RDS, Lambda).' },
      { name: 'CI/CD', importance: 'preferred', tip: 'Emphasize automated test suites and zero-downtime deployment pipelines.' },
      { name: 'System Architecture', importance: 'critical', tip: 'Demonstrate high-level design decisions and scalability trade-offs.' }
    ],
    expectedImpactRate: 40,
    keywords: ['scalability', 'distributed', 'microservices', 'latency', 'high availability', 'security']
  },
  'Lead Product Manager': {
    coreSkills: [
      { name: 'Product Discovery', importance: 'critical', tip: 'Quantify user research interviews, customer problem validation, and assumption testing.' },
      { name: 'Roadmap Planning', importance: 'critical', tip: 'Show prioritization frameworks (RICE, MoSCoW) and strategic alignment.' },
      { name: 'A/B Testing', importance: 'critical', tip: 'Detail hypothesis formulation, statistical significance, and cohort conversion lifts.' },
      { name: 'SQL', importance: 'preferred', tip: 'Highlight autonomous data exploration rather than relying purely on analysts.' },
      { name: 'Mixpanel', importance: 'preferred', tip: 'Show funnel telemetry, retention curve audits, and cohort segmentation.' },
      { name: 'GTM Strategy', importance: 'critical', tip: 'Demonstrate cross-functional launches with sales, marketing, and customer success.' },
      { name: 'AI / LLM Integration', importance: 'preferred', tip: 'Modern PM roles prioritize candidates with LLM evaluation and AI UX experience.' }
    ],
    expectedImpactRate: 50,
    keywords: ['retention', 'revenue', 'okrs', 'churn', 'adoption', 'stakeholder', 'ltv', 'cac']
  },
  'Senior Machine Learning Engineer': {
    coreSkills: [
      { name: 'PyTorch', importance: 'critical', tip: 'Highlight model architectures, custom loss functions, and distributed training.' },
      { name: 'Python', importance: 'critical', tip: 'Demonstrate idiomatic vectorization and low-latency inference wrappers.' },
      { name: 'MLOps', importance: 'critical', tip: 'Recruiters need proof of production deployment, model drift monitoring, and registry (MLflow).' },
      { name: 'Docker', importance: 'critical', tip: 'Containerizing inference servers with GPU hardware pass-through.' },
      { name: 'Kubernetes', importance: 'preferred', tip: 'Show serving scaled inference clusters with autoscaling based on GPU utilization.' },
      { name: 'Transformers', importance: 'critical', tip: 'Detail fine-tuning (LoRA/QLoRA), tokenization, and latency profiling.' },
      { name: 'Vector Databases', importance: 'preferred', tip: 'Specify chunking algorithms, hybrid search, and reranking benchmarks.' }
    ],
    expectedImpactRate: 45,
    keywords: ['inference', 'latency', 'accuracy', 'f1-score', 'quantization', 'distributed', 'gpu']
  },
  'Frontend Developer': {
    coreSkills: [
      { name: 'JavaScript', importance: 'critical', tip: 'Emphasize deep understanding of DOM, event loop, and asynchronous patterns.' },
      { name: 'TypeScript', importance: 'critical', tip: 'Most hiring teams now mandate TypeScript for all frontend hires.' },
      { name: 'React', importance: 'critical', tip: 'Demonstrate custom hooks, memoization, and modern state management.' },
      { name: 'Tailwind CSS', importance: 'preferred', tip: 'Clean responsive layouts, accessibility compliance, and design token usage.' },
      { name: 'Testing (Jest/Playwright)', importance: 'critical', tip: 'Frontend candidates stand out when demonstrating automated unit and E2E testing.' },
      { name: 'Web Performance (Core Web Vitals)', importance: 'preferred', tip: 'Quantify reductions in LCP, FID, and CLS scores.' }
    ],
    expectedImpactRate: 30,
    keywords: ['responsive', 'accessibility', 'components', 'performance', 'bundle size']
  }
};

export function analyzeResumeHeuristically(rawText: string, targetRole: string = 'Senior Full-Stack Engineer'): ResumeAnalysisResult {
  const text = rawText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Contact Information Extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedInMatch = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9-_]+)/i);
  const githubMatch = text.match(/(github\.com\/[a-zA-Z0-9-_]+)/i);
  const locationMatch = text.match(/\b([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\b/);

  // Candidate Name (heuristic: first non-empty line)
  const candidateName = lines.length > 0 ? lines[0].replace(/[^a-zA-Z\s]/g, '').trim() : 'Candidate';

  // 2. Sections Detection
  const standardSections = ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'SUMMARY', 'PROJECTS', 'CERTIFICATIONS'];
  const detectedSections: string[] = [];
  const missingSections: string[] = [];

  const lowerText = text.toLowerCase();
  standardSections.forEach(sec => {
    const regex = new RegExp(`\\b${sec.toLowerCase()}\\b|\\b${sec.toLowerCase()}:`, 'i');
    if (regex.test(lowerText)) {
      detectedSections.push(sec);
    } else {
      missingSections.push(sec);
    }
  });

  // 3. Bullets Extraction
  const bulletLines = lines.filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l));
  const effectiveBullets = bulletLines.length > 0 ? bulletLines : lines.filter(l => l.length > 40 && !l.toUpperCase().includes('EXPERIENCE') && !l.toUpperCase().includes('EDUCATION'));

  // 4. Metric & Impact Audits
  const metricRegex = /(\d+%\b|\$\d+[\d,.]*|\b\d+x\b|\b\d+\s*(users|clients|customers|networks|hospitals|engineers|teams|days|months|ms|seconds|minutes)\b|\b\d+\.\d+[MKk]?\b|\b\d+[kKmM]\b)/gi;
  let bulletsWithMetrics = 0;
  let bulletsWithWeakVerbs = 0;
  const bulletAudits: BulletAudit[] = [];

  effectiveBullets.forEach((bullet, idx) => {
    const cleanBullet = bullet.replace(/^[•\-*]\s*/, '').trim();
    const hasMetric = metricRegex.test(cleanBullet);
    if (hasMetric) bulletsWithMetrics++;

    const flawTypes: ('lacks_metrics' | 'weak_verb' | 'passive_voice' | 'vague_outcome' | 'too_wordy')[] = [];
    let flawDetails: string[] = [];

    // Check weak verbs
    WEAK_VERB_PATTERNS.forEach(pattern => {
      if (pattern.regex.test(cleanBullet)) {
        flawTypes.push('weak_verb');
        flawDetails.push(pattern.label);
      }
    });

    if (!hasMetric) {
      flawTypes.push('lacks_metrics');
      flawDetails.push('Lacks measurable metric/outcome');
    }

    if (cleanBullet.length > 180) {
      flawTypes.push('too_wordy');
      flawDetails.push('Exceeds optimal 1-2 line scannability');
    }

    if (flawTypes.length > 0) {
      bulletsWithWeakVerbs++;
      
      // Generate intelligent rewrite using Google XYZ framework
      let rewritten = cleanBullet;
      let metricNote = '';

      if (cleanBullet.toLowerCase().includes('responsible for leading') || cleanBullet.toLowerCase().includes('worked on leading')) {
        rewritten = cleanBullet.replace(/responsible for leading.*?(development|project)/i, 'Spearheaded end-to-end architecture and frontend development')
          + ', accelerating sprint release velocity by 35% across 4 cross-functional squads.';
        metricNote = '+35% release velocity, quantified team scope';
      } else if (cleanBullet.toLowerCase().includes('worked on migrating') || cleanBullet.toLowerCase().includes('migrated')) {
        rewritten = 'Architected and executed migration of legacy monolith to containerized microservices, reducing API p99 latency by 45% and cutting AWS infrastructure costs by $18K/yr.';
        metricNote = '45% p99 latency reduction, $18K cloud savings';
      } else if (cleanBullet.toLowerCase().includes('helped') || cleanBullet.toLowerCase().includes('assisted')) {
        rewritten = cleanBullet.replace(/helped.*?(with|to)/i, 'Instituted automated code review standards and CI/CD pipelines, decreasing production bug regressions by 28% for a team of 8 engineers.');
        metricNote = '28% regression decrease, explicit team size';
      } else if (cleanBullet.toLowerCase().includes('handled') || cleanBullet.toLowerCase().includes('fixed')) {
        rewritten = cleanBullet.replace(/handled database queries/i, 'Optimized complex SQL execution plans and indexing strategies, decreasing query execution times by 62% across 500K daily active records.');
        metricNote = '62% query speedup, 500K records scale';
      } else if (cleanBullet.toLowerCase().includes('built') || cleanBullet.toLowerCase().includes('worked on')) {
        rewritten = 'Engineered responsive core interfaces with modular component architecture, improving Core Web Vitals (LCP) from 3.8s to 1.2s and elevating conversion by 14%.';
        metricNote = 'Core Web Vitals LCP from 3.8s to 1.2s, +14% conversion';
      } else {
        rewritten = `Spearheaded ${cleanBullet.replace(/^[A-Z][a-z]+\s/, '')}, driving a 24% operational efficiency boost and saving 15 engineering hours weekly.`;
        metricNote = '+24% operational efficiency, 15 engineering hours saved weekly';
      }

      if (bulletAudits.length < 5) {
        bulletAudits.push({
          id: `audit-${idx}`,
          original: cleanBullet,
          rewritten,
          section: 'Experience',
          flawTypes,
          diagnostics: flawDetails.join(' · ') || 'Unquantified task description',
          impactScoreBefore: Math.max(35, Math.min(65, 50 - flawTypes.length * 10)),
          impactScoreAfter: 92,
          metricsIntroduced: metricNote || 'Quantified business outcome using XYZ formula'
        });
      }
    }
  });

  // 5. Skills Extraction
  const foundSkills: SkillItem[] = [];
  const categorizedSkills: Record<string, string[]> = {};

  Object.entries(KNOWN_SKILLS_CATALOG).forEach(([skillName, meta]) => {
    const escaped = skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      foundSkills.push({
        name: skillName.charAt(0).toUpperCase() + skillName.slice(1),
        category: meta.category,
        mentions: matches.length,
        level: matches.length >= 3 ? 'strong' : matches.length === 2 ? 'intermediate' : 'emerging'
      });

      if (!categorizedSkills[meta.category]) categorizedSkills[meta.category] = [];
      categorizedSkills[meta.category].push(skillName.charAt(0).toUpperCase() + skillName.slice(1));
    }
  });

  // Soft Skills
  const potentialSoftSkills = [
    'Cross-functional Leadership', 'Stakeholder Management', 'Mentorship & Code Reviews',
    'System Architecture', 'Agile / Scrum Execution', 'Root Cause Analysis', 'Product Strategy'
  ];
  const detectedSoftSkills: string[] = [];
  potentialSoftSkills.forEach(ss => {
    if (new RegExp(ss.split(' ')[0], 'i').test(text)) {
      detectedSoftSkills.push(ss);
    }
  });
  if (detectedSoftSkills.length === 0) {
    detectedSoftSkills.push('Cross-functional Collaboration', 'Technical Communication');
  }

  // 6. Role Benchmark & Gap Analysis
  const roleConfig = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS['Senior Full-Stack Engineer'];
  const gaps: SkillGapItem[] = [];
  let matchedCount = 0;
  let missingCount = 0;

  roleConfig.coreSkills.forEach(req => {
    const isPresent = foundSkills.some(s => s.name.toLowerCase() === req.name.toLowerCase()) ||
      lowerText.includes(req.name.toLowerCase());

    if (isPresent) {
      matchedCount++;
      gaps.push({
        skill: req.name,
        category: 'Core Competency',
        importance: req.importance,
        status: 'matched',
        rationale: `Directly detected in your skills list and work history. Strong alignment with ${targetRole} screening filters.`,
        actionableTip: 'Ensure this skill is connected to a quantified project outcome, not just a standalone keyword.'
      });
    } else {
      missingCount++;
      gaps.push({
        skill: req.name,
        category: 'Missing Requirement',
        importance: req.importance,
        status: req.importance === 'critical' ? 'missing' : 'under_demonstrated',
        rationale: req.importance === 'critical'
          ? `High-priority filter for ${targetRole} roles. Applicant tracking algorithms and technical recruiters specifically index this skill.`
          : `Commonly requested secondary skill for ${targetRole} positions.`,
        actionableTip: req.tip
      });
    }
  });

  const totalReqs = roleConfig.coreSkills.length;
  const roleMatchPercentage = Math.round((matchedCount / (totalReqs || 1)) * 100);

  // 7. Calculate Pillar Scores
  const totalBullets = Math.max(1, effectiveBullets.length);
  const metricRatio = bulletsWithMetrics / totalBullets;
  const impactScore = Math.min(100, Math.round(metricRatio * 70 + (effectiveBullets.length > 5 ? 25 : 15)));

  const skillsScore = Math.min(100, Math.round((foundSkills.length / 15) * 40 + (roleMatchPercentage * 0.6)));

  let atsScore = 95;
  const formattingRisks: { risk: string; severity: 'high' | 'medium' | 'low'; fix: string }[] = [];

  if (!emailMatch) {
    atsScore -= 20;
    formattingRisks.push({ risk: 'Missing or malformed email address', severity: 'high', fix: 'Add a standard email address in the contact header.' });
  }
  if (!phoneMatch) {
    atsScore -= 10;
    formattingRisks.push({ risk: 'No standard phone number found', severity: 'medium', fix: 'Add your direct phone number for recruiter phone screens.' });
  }
  if (!linkedInMatch) {
    atsScore -= 10;
    formattingRisks.push({ risk: 'No LinkedIn profile URL detected', severity: 'medium', fix: 'Add your customized LinkedIn public handle.' });
  }
  if (missingSections.includes('EXPERIENCE')) {
    atsScore -= 20;
    formattingRisks.push({ risk: 'Missing standard "EXPERIENCE" heading', severity: 'high', fix: 'Ensure heading reads exactly "EXPERIENCE" or "WORK EXPERIENCE".' });
  }
  if (missingSections.includes('EDUCATION')) {
    atsScore -= 10;
    formattingRisks.push({ risk: 'Missing "EDUCATION" section', severity: 'medium', fix: 'Include degree, institution, and graduation year.' });
  }
  if (wordCount < 200) {
    atsScore -= 15;
    formattingRisks.push({ risk: 'Resume text is unusually brief (<200 words)', severity: 'high', fix: 'Expand your experience bullet points with technical specifics and impact.' });
  }

  let brevityScore = 85;
  if (wordCount > 900) {
    brevityScore -= 20;
  } else if (wordCount < 250) {
    brevityScore -= 25;
  }

  const overallScore = Math.round((impactScore * 0.35) + (skillsScore * 0.25) + (atsScore * 0.25) + (brevityScore * 0.15));

  let scoreGrade: 'Exceptional' | 'Competitive' | 'Needs Improvement' | 'High Risk' = 'Needs Improvement';
  if (overallScore >= 88) scoreGrade = 'Exceptional';
  else if (overallScore >= 75) scoreGrade = 'Competitive';
  else if (overallScore >= 55) scoreGrade = 'Needs Improvement';
  else scoreGrade = 'High Risk';

  // 8. Action Plan items
  const actionPlan: ActionChecklistItem[] = [
    {
      id: 'act-1',
      title: 'Inject Measurable Metrics into Experience Bullets',
      description: `Only ${bulletsWithMetrics} of ${totalBullets} bullets currently contain quantifiable results. Add numbers (% latency cut, $ revenue generated, team size led, users served).`,
      category: 'Impact',
      priority: metricRatio < 0.4 ? 'urgent' : 'high',
      completed: false
    },
    {
      id: 'act-2',
      title: `Close Critical Skill Gap: ${gaps.find(g => g.status === 'missing')?.skill || 'Cloud Architecture'}`,
      description: `Add demonstrated project experience for ${gaps.find(g => g.status === 'missing')?.skill || 'Cloud/DevOps'} to satisfy ATS algorithmic keyword filters for ${targetRole}.`,
      category: 'Skills',
      priority: 'urgent',
      completed: false
    },
    {
      id: 'act-3',
      title: 'Replace Passive Action Verbs with Power Ownership Verbs',
      description: 'Replace instances of "responsible for", "assisted", and "worked on" with power verbs such as Architected, Spearheaded, Optimized, and Automated.',
      category: 'Impact',
      priority: 'high',
      completed: false
    },
    {
      id: 'act-4',
      title: 'Standardize Section Headings for ATS Parsing',
      description: 'Ensure traditional all-caps headings (PROFESSIONAL EXPERIENCE, EDUCATION, TECHNICAL SKILLS) so automated ATS parsers don’t drop key sections.',
      category: 'ATS Format',
      priority: missingSections.length > 0 ? 'urgent' : 'medium',
      completed: false
    },
    {
      id: 'act-5',
      title: 'Optimize Resume Word Count & Scannability',
      description: `Current word count is ${wordCount} words (ideal benchmark: 450–750 words for 1-page; 750–1200 for 2-pages). Keep bullet points between 1.5 and 2 lines maximum.`,
      category: 'Brevity',
      priority: 'medium',
      completed: false
    }
  ];

  return {
    candidateName: candidateName || 'Candidate Profile',
    targetRole,
    overallScore,
    scoreGrade,
    executiveSummary: `Your resume demonstrates solid foundational domain proficiency, but is currently held back by ${bulletsWithMetrics === 0 ? 'a total absence of quantifiable business metrics' : 'an uneven density of measured outcomes'} and ${missingCount} missing keywords critical for ${targetRole} positions. Converting task-based bullets into Google XYZ impact achievements and incorporating the recommended technical proficiencies will substantially increase your interview callback rate.`,
    topStrengths: [
      `Clean technical skill indexing (${foundSkills.length} hard technologies identified)`,
      detectedSections.includes('EXPERIENCE') ? 'Clearly structured chronological work experience history' : 'Readable layout typography',
      emailMatch ? 'Well-placed direct recruiter contact information' : 'Compact information architecture'
    ],
    topWeaknesses: [
      `${totalBullets - bulletsWithMetrics} of ${totalBullets} bullets lack measurable outcome metrics ($, %, latency, scale)`,
      missingCount > 0 ? `Missing ${missingCount} core skills heavily weighted for ${targetRole} (e.g., ${gaps.filter(g => g.status === 'missing').map(g => g.skill).slice(0, 3).join(', ')})` : 'Under-demonstrated technical ownership depth',
      bulletsWithWeakVerbs > 0 ? 'Passive verbs detected ("responsible for", "helped", "worked on") that dilute executive presence' : 'Inconsistent bullet length distribution'
    ],
    pillars: {
      impact: {
        score: impactScore,
        label: 'Impact & Quantification',
        status: impactScore >= 80 ? 'excellent' : impactScore >= 65 ? 'good' : impactScore >= 45 ? 'needs_work' : 'critical',
        metrics: [
          { name: 'Quantified Bullets', value: `${bulletsWithMetrics} / ${totalBullets}`, benchmark: '> 50% of bullets' },
          { name: 'Power Verbs', value: `${Math.max(1, totalBullets - bulletsWithWeakVerbs)} / ${totalBullets}`, benchmark: '> 85% active verbs' },
          { name: 'Impact Metric Ratio', value: `${Math.round(metricRatio * 100)}%`, benchmark: '50%+' }
        ],
        feedback: metricRatio >= 0.5
          ? 'Strong job quantification! Your bullets demonstrate tangible business metrics that immediately distinguish you from passive applicants.'
          : 'Most bullets read as job duty task descriptions rather than measurable achievements. Reframe with the Google formula: "Accomplished [X] as measured by [Y] by doing [Z]".',
        keyIssues: [
          'Unquantified responsibility statements',
          'Vague outcomes without statistical or financial backing'
        ]
      },
      skills: {
        score: skillsScore,
        label: 'Skills & Keyword Alignment',
        status: skillsScore >= 80 ? 'excellent' : skillsScore >= 65 ? 'good' : skillsScore >= 45 ? 'needs_work' : 'critical',
        metrics: [
          { name: 'Hard Skills Found', value: foundSkills.length, benchmark: '12 – 20 skills' },
          { name: 'Target Role Match', value: `${roleMatchPercentage}%`, benchmark: '75%+' },
          { name: 'Critical Gaps', value: gaps.filter(g => g.status === 'missing' && g.importance === 'critical').length, benchmark: '0 missing' }
        ],
        feedback: roleMatchPercentage >= 75
          ? `High alignment with ${targetRole} requirements. Your core toolchain closely matches standard recruiter search queries.`
          : `Significant keyword gaps detected against the industry profile for ${targetRole}. Recruiters filtering applicant pools will deprioritize this profile without key matches.`,
        keyIssues: gaps.filter(g => g.status === 'missing').map(g => `Missing keyword: ${g.skill}`)
      },
      atsParseability: {
        score: atsScore,
        label: 'ATS Parseability & Layout',
        status: atsScore >= 85 ? 'excellent' : atsScore >= 70 ? 'good' : 'needs_work',
        metrics: [
          { name: 'Standard Headings', value: `${detectedSections.length} / ${standardSections.length}`, benchmark: '4+ core headings' },
          { name: 'Contact Fields', value: `${[emailMatch, phoneMatch, linkedInMatch].filter(Boolean).length} / 3`, benchmark: '3 detected' },
          { name: 'Parse Risks', value: formattingRisks.length, benchmark: '0 risks' }
        ],
        feedback: atsScore >= 85
          ? 'Clean, machine-readable structure that applicant tracking parsers (Workday, Greenhouse, Lever) can ingest without data loss.'
          : 'Formatting issues detected that could cause parsing errors in automated applicant tracking systems.',
        keyIssues: formattingRisks.map(r => r.risk)
      },
      brevity: {
        score: brevityScore,
        label: 'Brevity & Style',
        status: brevityScore >= 80 ? 'excellent' : brevityScore >= 65 ? 'good' : 'needs_work',
        metrics: [
          { name: 'Total Word Count', value: wordCount, benchmark: '450 – 750 words' },
          { name: 'Reading Time', value: `${Math.max(1, Math.round(wordCount / 200))} min`, benchmark: '2 – 3 minutes' },
          { name: 'Average Bullet Length', value: `${Math.round(wordCount / totalBullets)} words`, benchmark: '15 – 25 words' }
        ],
        feedback: wordCount >= 350 && wordCount <= 850
          ? 'Balanced length and density. Easy for hiring managers to scan within the critical 6-second first-pass window.'
          : wordCount < 350
            ? 'Too sparse. Your resume does not provide enough technical depth to justify a senior interview slot.'
            : 'Too dense. Lengthy paragraphs increase candidate drop-off during initial recruiter scanning.',
        keyIssues: wordCount < 350 ? ['Under-developed project details'] : ['Excessive narrative length']
      }
    },
    skills: {
      hardSkills: foundSkills,
      softSkills: detectedSoftSkills,
      byCategory: categorizedSkills
    },
    gapAnalysis: {
      targetRoleTitle: targetRole,
      roleMatchPercentage,
      gaps,
      matchedCount,
      missingCount
    },
    bulletAudits,
    actionPlan,
    atsSimulation: {
      candidateName,
      detectedEmail: emailMatch ? emailMatch[0] : null,
      detectedPhone: phoneMatch ? phoneMatch[0] : null,
      detectedLinkedIn: linkedInMatch ? linkedInMatch[0] : null,
      detectedLocation: locationMatch ? locationMatch[0] : null,
      detectedExperienceYears: lowerText.includes('6+') ? 6 : lowerText.includes('7') ? 7 : lowerText.includes('5') ? 5 : 2,
      standardSectionsFound: detectedSections,
      missingStandardSections: missingSections,
      formattingRisks
    },
    analyzedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}
