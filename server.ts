import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeResumeHeuristically } from './src/services/analyzerEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Helper to check if Gemini is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// POST /api/analyze-resume
app.post('/api/analyze-resume', async (req: Request, res: Response) => {
  try {
    const { resumeText, targetRole = 'Senior Full-Stack Engineer', jobDescription } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide valid resume text of at least 20 characters.' });
    }

    // Baseline heuristic analysis
    const baseline = analyzeResumeHeuristically(resumeText, targetRole);

    // If Gemini is available, run deep contextual analysis
    if (aiClient) {
      try {
        const prompt = `You are a world-class senior technical recruiter and ATS systems architect.
Analyze the following resume thoroughly for the target role: "${targetRole}".
${jobDescription ? `Target Job Description:\n${jobDescription}\n` : ''}

Resume Content:
${resumeText.slice(0, 15000)}

Perform a rigorous evaluation focusing on:
1. ATS score (0-100) and grade.
2. Executive summary critique explaining why the candidate would or would not pass initial screening.
3. Top 3 concrete strengths and top 3 critical weaknesses.
4. Detailed Pillar scores:
   - Impact & Quantification (0-100)
   - Skills & Keyword Alignment (0-100)
   - ATS Parseability (0-100)
   - Brevity & Style (0-100)
5. Skill Gap Analysis: identify which core skills for ${targetRole} are present vs missing vs under-demonstrated, with concrete tips to acquire or showcase them.
6. Bullet point audits: take 3-5 weak bullets from the resume and rewrite them into high-impact Google XYZ formula bullets ("Accomplished [X] as measured by [Y] by doing [Z]").
7. Prioritized action checklist to turn this into a top-tier resume.

Return the result strictly in valid JSON matching this schema:
{
  "candidateName": string,
  "targetRole": string,
  "overallScore": number,
  "scoreGrade": "Exceptional" | "Competitive" | "Needs Improvement" | "High Risk",
  "executiveSummary": string,
  "topStrengths": string[],
  "topWeaknesses": string[],
  "pillars": {
    "impact": { "score": number, "label": "Impact & Quantification", "feedback": string, "keyIssues": string[] },
    "skills": { "score": number, "label": "Skills & Keyword Alignment", "feedback": string, "keyIssues": string[] },
    "atsParseability": { "score": number, "label": "ATS Parseability & Layout", "feedback": string, "keyIssues": string[] },
    "brevity": { "score": number, "label": "Brevity & Style", "feedback": string, "keyIssues": string[] }
  },
  "gaps": [
    {
      "skill": string,
      "category": string,
      "importance": "critical" | "preferred" | "bonus",
      "status": "matched" | "missing" | "under_demonstrated",
      "rationale": string,
      "actionableTip": string
    }
  ],
  "bulletAudits": [
    {
      "id": string,
      "original": string,
      "rewritten": string,
      "section": string,
      "diagnostics": string,
      "impactScoreBefore": number,
      "impactScoreAfter": number,
      "metricsIntroduced": string
    }
  ],
  "actionPlan": [
    {
      "id": string,
      "title": string,
      "description": string,
      "category": "Impact" | "Skills" | "ATS Format" | "Brevity",
      "priority": "urgent" | "high" | "medium"
    }
  ]
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const rawJson = response.text?.trim();
        if (rawJson) {
          const parsed = JSON.parse(rawJson);

          // Merge AI richness with robust structural analysis
          const combined = {
            ...baseline,
            candidateName: parsed.candidateName || baseline.candidateName,
            overallScore: typeof parsed.overallScore === 'number' ? parsed.overallScore : baseline.overallScore,
            scoreGrade: parsed.scoreGrade || baseline.scoreGrade,
            executiveSummary: parsed.executiveSummary || baseline.executiveSummary,
            topStrengths: parsed.topStrengths?.length ? parsed.topStrengths : baseline.topStrengths,
            topWeaknesses: parsed.topWeaknesses?.length ? parsed.topWeaknesses : baseline.topWeaknesses,
            pillars: {
              impact: {
                ...baseline.pillars.impact,
                score: parsed.pillars?.impact?.score ?? baseline.pillars.impact.score,
                feedback: parsed.pillars?.impact?.feedback || baseline.pillars.impact.feedback,
                keyIssues: parsed.pillars?.impact?.keyIssues || baseline.pillars.impact.keyIssues,
              },
              skills: {
                ...baseline.pillars.skills,
                score: parsed.pillars?.skills?.score ?? baseline.pillars.skills.score,
                feedback: parsed.pillars?.skills?.feedback || baseline.pillars.skills.feedback,
                keyIssues: parsed.pillars?.skills?.keyIssues || baseline.pillars.skills.keyIssues,
              },
              atsParseability: {
                ...baseline.pillars.atsParseability,
                score: parsed.pillars?.atsParseability?.score ?? baseline.pillars.atsParseability.score,
                feedback: parsed.pillars?.atsParseability?.feedback || baseline.pillars.atsParseability.feedback,
                keyIssues: parsed.pillars?.atsParseability?.keyIssues || baseline.pillars.atsParseability.keyIssues,
              },
              brevity: {
                ...baseline.pillars.brevity,
                score: parsed.pillars?.brevity?.score ?? baseline.pillars.brevity.score,
                feedback: parsed.pillars?.brevity?.feedback || baseline.pillars.brevity.feedback,
                keyIssues: parsed.pillars?.brevity?.keyIssues || baseline.pillars.brevity.keyIssues,
              },
            },
            gapAnalysis: {
              ...baseline.gapAnalysis,
              gaps: parsed.gaps && Array.isArray(parsed.gaps) && parsed.gaps.length > 0 ? parsed.gaps : baseline.gapAnalysis.gaps,
            },
            bulletAudits: parsed.bulletAudits && parsed.bulletAudits.length > 0
              ? parsed.bulletAudits.map((b: any, idx: number) => ({
                  id: b.id || `audit-${idx}`,
                  original: b.original,
                  rewritten: b.rewritten,
                  section: b.section || 'Experience',
                  flawTypes: ['lacks_metrics', 'weak_verb'],
                  diagnostics: b.diagnostics || 'Task-based without quantifiable outcomes',
                  impactScoreBefore: b.impactScoreBefore || 40,
                  impactScoreAfter: b.impactScoreAfter || 92,
                  metricsIntroduced: b.metricsIntroduced || 'Quantified business outcome using Google XYZ formula',
                }))
              : baseline.bulletAudits,
            actionPlan: parsed.actionPlan && parsed.actionPlan.length > 0
              ? parsed.actionPlan.map((a: any, idx: number) => ({
                  id: a.id || `act-${idx}`,
                  title: a.title,
                  description: a.description,
                  category: a.category || 'Impact',
                  priority: a.priority || 'high',
                  completed: false,
                }))
              : baseline.actionPlan,
          };

          return res.json({ result: combined, source: 'gemini-3.8-flash' });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to heuristic engine:', geminiError);
      }
    }

    // Heuristic return
    return res.json({ result: baseline, source: 'deterministic-rules' });
  } catch (error: any) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({ error: error.message || 'Internal server error while analyzing resume' });
  }
});

// POST /api/rewrite-bullet
app.post('/api/rewrite-bullet', async (req: Request, res: Response) => {
  try {
    const { bulletText, role = 'Software Engineer' } = req.body;
    if (!bulletText || typeof bulletText !== 'string' || bulletText.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a valid bullet point to rewrite.' });
    }

    if (aiClient) {
      try {
        const prompt = `Rewrite this resume bullet point for a candidate targeting "${role}".
Original Bullet: "${bulletText}"

Provide 3 distinct, high-impact rewrites:
1. "xyz_impact": Uses Google's XYZ formula ("Accomplished [X] as measured by [Y] by doing [Z]"). Injects realistic metrics, percentages, or scale.
2. "executive_leadership": Highlights cross-functional ownership, mentorship, architecture decisions, and strategic initiative.
3. "ats_technical": Dense in keywords, precise frameworks, testing, and modern engineering practices.

Return strictly JSON:
{
  "xyz_impact": { "text": string, "rationale": string },
  "executive_leadership": { "text": string, "rationale": string },
  "ats_technical": { "text": string, "rationale": string }
}`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const raw = response.text?.trim();
        if (raw) {
          const parsed = JSON.parse(raw);
          return res.json({ variations: parsed, source: 'gemini-3.8-flash' });
        }
      } catch (err) {
        console.warn('Gemini rewrite error, using fallback:', err);
      }
    }

    // Heuristic fallback rewrites
    const clean = bulletText.replace(/^[•\-*]\s*/, '').trim();
    return res.json({
      variations: {
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
      },
      source: 'deterministic-rules'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error rewriting bullet' });
  }
});

// GET /api/download-zip
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.join(__dirname, 'resume-analyzer.zip');
  res.download(zipPath, 'resume-analyzer.zip', (err) => {
    if (err) {
      console.error('Error sending zip:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Could not download zip file' });
      }
    }
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Resume Analyzer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
