# SiteIQ — Build Prompts

---

## Day 5 — Apr 16 · Report UI + Polish

**Goal:** Make the analysis output look industry-grade.

---

### Prompt

```
You are working on SiteIQ — an AI-powered construction site safety and contract intelligence platform built for the Nigerian construction market. The app uses React + Vite, a dark/light CSS variable theme system (no Tailwind color utilities — all colors via var(--accent), var(--danger), var(--warning), var(--success), var(--text-primary), etc.), Zustand for state, and Claude AI for analysis.

The analysis pipeline produces a JSON result stored in the Zustand `useAppStore` as `currentAnalysis`. The structure includes:
- `risks[]` — array of risk objects with `{ title, description, severity: 'high' | 'medium' | 'low', category }`
- `siteProgress` — object with `{ phase, percentComplete, notes }`
- `recommendedActions[]` — array of `{ id, priority, action, category }`
- `contractFlags[]` — array of `{ clause, issue, recommendation }`
- `summary` — string overview

**Task 1 — Risk Cards UI**
In the analysis output section (currently plain text), render `risks[]` as styled cards:
- Color-code by severity: `var(--danger)` for high, `var(--warning)` for medium, `var(--success)` for low
- Each card shows: severity badge (pill), category label, title (bold), description (body text)
- Cards use the `.card` class with a left border accent in the severity color
- Grid layout: `repeat(auto-fill, minmax(280px, 1fr))`
- No external libraries — pure inline styles + CSS variables

**Task 2 — Site Progress Summary**
Add a progress section above the risk cards:
- Show `siteProgress.phase` as a label and `siteProgress.percentComplete` as a horizontal progress bar
- Bar fill color: green if ≥ 70%, amber if ≥ 40%, red below 40% — using CSS variables
- Show `siteProgress.notes` as a small caption below the bar
- Use the same `.card` container style as the rest of the app

**Task 3 — Recommended Actions List**
Add a "Recommended Actions" section below the risk cards:
- Numbered list (1, 2, 3...) sorted by `priority`
- Each item shows: priority badge, action text (bold), category tag
- Construction-specific icons using lucide-react where appropriate (HardHat, Wrench, ShieldAlert, ClipboardCheck)
- No emojis — icons only
- Styled consistently with the rest of the app

**Task 4 — PDF Export**
Add a "Export Report" button in the report header area:
- On click, calls `window.print()`
- Add a `<style media="print">` block (or a separate `print.css` imported in main.jsx) that:
  - Hides sidebar, navbar, buttons, and the file upload section
  - Shows only the report content in a clean single-column layout
  - Forces white background and black text for print
  - Adds the SiteIQ logo and report title at the top
  - Sets font to serif for print readability
- Button uses a `<Printer>` icon from lucide-react, labeled "Export PDF"

Do not modify: `claude.js`, `huggingface.js`, `pdfParser.js`, `LandingPage.jsx`, `SignInPage.jsx`, `SignUpPage.jsx`.
Do not add Tailwind color classes — use CSS variables exclusively.
Do not introduce new dependencies beyond lucide-react (already installed).
```

---

## Day 6 — Apr 17 · Demo Content + Edge Cases

**Goal:** Make sure it works flawlessly for judges — demo mode, error handling, loading skeletons, and Vercel deployment.

---

### Prompt

```
You are working on SiteIQ — an AI-powered construction site safety and contract intelligence platform. Stack: React + Vite, CSS variable theme (var(--accent), var(--danger), var(--warning), var(--success), etc.), Zustand (`useAppStore`), lucide-react icons. No Tailwind color classes.

**Task 1 — Demo Mode**
Add a "Try Demo" button on the NewAnalysisPage (the upload/input page):
- Renders 3 scenario tiles: "Foundation Work", "Scaffolding Inspection", "Roofing Project"
- Each tile has a short description and a relevant lucide-react icon
- Clicking a tile pre-loads a hardcoded sample `currentAnalysis` object into the Zustand store and navigates to the results/report page
- The sample data must be realistic: Nigerian construction context, plausible risk descriptions, real-sounding contract clause flags
- Create a `src/data/demoScenarios.js` file that exports the 3 scenario objects — keep the pre-loaded data there, not inline in the component
- The "Try Demo" section sits below the upload form, separated by a divider with the label "or try a demo scenario"

**Task 2 — Error States**
Add three specific error states to the analysis flow, displayed inline (not as full-screen overlays):
1. **API timeout** — shown when the Claude API call takes > 30s or returns a network error. Message: "Analysis timed out. Check your connection and try again." with a `<RefreshCw>` retry button.
2. **Unsupported image type** — shown when the uploaded file is not jpg/jpeg/png/webp. Message: "Unsupported file type. Please upload a JPG, PNG, or WEBP image." with the accepted types listed.
3. **No objects detected** — shown when HuggingFace DETR returns 0 detections. Message: "No construction elements detected in this image. Try a clearer photo of the site." with a `<Camera>` icon.

Each error state uses a styled banner: `var(--danger-bg)` background, `var(--danger)` border-left, `<AlertTriangle>` icon, and a dismiss/retry action. No emojis.

**Task 3 — Loading Skeletons**
Replace any plain "loading..." text or spinners in the following locations with skeleton placeholders:
- Dashboard: skeleton cards for recent analyses list while data loads
- Report page: skeleton blocks for risk cards, progress bar, and action list while `currentAnalysis` is null or loading
- Assistant/chat: skeleton message bubble while AI response is streaming

Skeletons use a pulsing div: `background: var(--border); animation: pulse 1.5s ease-in-out infinite; border-radius: 4px`. Heights should match the real content they replace. The `pulse` keyframe is already defined in the global CSS.

**Task 4 — Mobile QA Checklist**
After implementing the above, review these specific files for mobile breakpoints and fix any issues found:
- `NewAnalysisPage.jsx` — upload area and demo tiles must stack vertically on < 640px
- `RegionalPage.jsx` — state grid and zone bar chart must be single-column on mobile
- `DashboardPage.jsx` — stat cards must be 2-column on mobile, not 4-column
Use `@media (max-width: 640px)` inline style workaround if needed (no Tailwind breakpoints).

Do not modify: `claude.js`, `huggingface.js`, `pdfParser.js`, `LandingPage.jsx`, `SignInPage.jsx`, `SignUpPage.jsx`.
Do not add Tailwind color classes — use CSS variables exclusively.
Do not introduce dependencies beyond lucide-react (already installed).
```
