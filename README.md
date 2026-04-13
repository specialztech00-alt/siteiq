# SiteIQ — AI-Powered Construction Site Safety & Contract Intelligence

> Built for the **Claude Builder Hackathon 2026** · Solving construction's deadliest problems with AI.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/siteiq&env=VITE_ANTHROPIC_API_KEY,VITE_HF_API_KEY&envDescription=API%20keys%20for%20Claude%20and%20Hugging%20Face)

---

## The Problem

Construction is the world's **deadliest industry** — 1 in 5 worker deaths globally happen on construction sites. Small contractors sign contracts they don't understand and lose money to penalty clauses they never saw coming. 90% of construction firms have no access to AI tools.

**SiteIQ democratises expert safety and contract intelligence for every site manager, anywhere in the world.**

---

## Features

| Feature | Description |
|--------|-------------|
| 🦺 **Site Safety Analysis** | Upload a photo or describe conditions — AI identifies PPE violations, fall risks, CDM non-compliance with specific regulation references |
| 📋 **Contract Intelligence** | Upload JCT, NEC4, FIDIC or any contract — AI extracts obligations, flags onerous clauses, calculates LAD exposure |
| ⚡ **PM Action Plan** | Prioritised, deadline-stamped actions the site manager can act on immediately |
| 💬 **Contract Q&A Chat** | Ask any question about your contract in plain English — clause-referenced answers |
| 🔍 **Computer Vision** | Facebook DETR detects objects and people in site photos |
| 📊 **Risk Scoring** | Safety score 0–100, contract health score 0–100 with colour-coded risk levels |

---

## Tech Stack

- **React 18 + Vite** — fast SPA
- **Tailwind CSS** — industrial design system
- **Claude claude-sonnet-4-20250514** — safety analysis, contract intelligence, PM actions, Q&A chat
- **Hugging Face** — `facebook/detr-resnet-50` (object detection), `dslim/bert-base-NER` (entity extraction)
- **PDF.js** — contract PDF text extraction
- **Zustand** — global state management
- **Vercel** — deployment

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/siteiq.git
cd siteiq
npm install
```

### 2. Get API keys

**Anthropic (Claude API)**
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an account and add billing
3. Navigate to **API Keys** → **Create Key**
4. Copy the key starting with `sk-ant-...`

**Hugging Face**
1. Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a **Read** access token
3. Copy the token starting with `hf_...`

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
VITE_HF_API_KEY=hf_your-key-here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## PowerShell users (Windows)

If you get `running scripts is disabled on this system`:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run `npm run dev` normally.

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables:
   - `VITE_ANTHROPIC_API_KEY`
   - `VITE_HF_API_KEY`
4. Deploy — Vercel auto-detects Vite

Or use the one-click button at the top of this README.

---

## Demo Scenarios

No API key? Load a demo scenario on the home screen — it pre-fills realistic site conditions and contract text, then runs the full Claude pipeline with your key.

Four scenarios included:
- ⛏️ Foundation works — deep excavation + JCT SBC/Q
- 🏗️ Scaffolding erection — height safety + NEC4 ECC
- 🏠 Roofing works — fall protection + FIDIC Red Book
- 📋 Contract review only — JCT D&B onerous clauses

---

## Architecture

```
src/
├── lib/
│   ├── claude.js        # analyseSite() + chatWithContract() — direct fetch to Anthropic API
│   ├── huggingface.js   # detectObjects() + extractEntities() — HF Inference API
│   ├── pdfParser.js     # extractTextFromPDF() — PDF.js
│   └── prompts.js       # All system prompts + demo scenario data
├── store/
│   └── useAppStore.js   # Zustand — owns the full analysis pipeline
├── components/          # Reusable UI components
└── pages/
    ├── HomePage.jsx     # Upload screen
    └── ReportPage.jsx   # 5-tab report (Overview / Safety / Contract / PM Actions / Q&A)
```

---

## Notes

- API keys are used client-side (acceptable for hackathon demo). For production, proxy via a serverless function.
- Analysis output is AI-generated and should not substitute qualified safety or legal advice.
- HuggingFace models may take 20–30s to warm up on first request — the UI handles this gracefully.

---

*SiteIQ — Because every worker deserves to come home safe.*
