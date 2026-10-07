# Resume Analyzer

Comprehensive ATS resume analyzer that evaluates qualifications, detects skill gaps against target roles, and generates actionable high-impact bullet improvements.

## 🚀 Resolving "npm not installed" on GitHub

If your GitHub deployment failed with `npm: command not found` or `npm not installed`, it is because the GitHub environment needs **Node.js & npm** explicitly set up before running build commands.

We have included pre-configured solutions:

### Option 1: GitHub Pages Deployment (Included Automated Workflow)
A GitHub Actions workflow is provided at `.github/workflows/deploy.yml`.

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow and Dockerfile"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**
   - Under **Build and deployment** > **Source**, select **GitHub Actions**
3. The workflow will automatically:
   - Install **Node.js 22** & **npm** using `actions/setup-node@v4`
   - Run `npm install` and `npm run build`
   - Deploy your app to your free GitHub Pages URL (e.g. `https://<username>.github.io/<repo>/`)

---

### Option 2: Full-Stack Cloud Host (Render / Railway / Vercel)
If you want the full-stack Express backend with server-side Gemini AI enabled:

1. **Render.com**:
   - Create a **Web Service** connected to your GitHub repository.
   - **Environment**: Select `Node` (not Static).
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `GEMINI_API_KEY`

2. **Railway.app / Fly.io / Google Cloud Run**:
   - The included `Dockerfile` uses `FROM node:22-alpine`, which bundles Node.js 22 and npm out of the box with zero setup needed.

---

## 🛠 Local Development in VS Code

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.
