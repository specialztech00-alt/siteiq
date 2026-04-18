/**
 * SiteIQ — Zustand global state store
 * Tracks all upload, processing, report, and UI state.
 * Also owns the runAnalysis() orchestration pipeline.
 */

import { create } from 'zustand'
import { detectAllPhotos, extractEntities } from '../lib/huggingface.js'
import { extractTextFromFile } from '../lib/pdfParser.js'
import { analyseSite } from '../lib/claude.js'
import { supabase } from '../lib/supabase.js'

export const LOADING_STEPS = [
  'Initialising analysis engine',
  'Detecting objects in site photo',
  'Extracting contract text',
  'Running entity recognition',
  'Claude: generating safety assessment',
  'Claude: analysing contract obligations',
  'Claude: building PM action plan',
  'Assembling report',
]

const useAppStore = create((set, get) => ({
  // ── Upload state ──────────────────────────────────────────────────────────
  photoFiles: [],
  docFile: null,
  docText: '',
  siteDescription: '',

  // ── Processing results ────────────────────────────────────────────────────
  nerEntities: [],
  hfDetections: [],

  // ── Report ────────────────────────────────────────────────────────────────
  reportData: null,
  analysisId: null,
  projectInfo: { projectName: '', company: '', siteLocation: '', siteManager: '' },
  analyses: [],
  riskStatuses: {},

  // ── Assistant conversations ───────────────────────────────────────────────
  conversations: [],
  activeConversationId: null,

  // ── Loading ───────────────────────────────────────────────────────────────
  isLoading: false,
  loadingStep: 0,
  loadingError: null,

  // ── Chat ──────────────────────────────────────────────────────────────────
  chatHistory: [],
  isChatLoading: false,

  // ── UI ────────────────────────────────────────────────────────────────────
  activeTab: 0,
  theme: localStorage.getItem('siteiq-theme') || 'light',
  selectedState: localStorage.getItem('siteiq-state') || 'Lagos',

  // ── Actions ───────────────────────────────────────────────────────────────
  setPhotoFiles: (files) => set({ photoFiles: Array.isArray(files) ? files : [files].filter(Boolean) }),
  setDocFile: (file) => set({ docFile: file }),
  setDocText: (text) => set({ docText: text }),
  setSiteDescription: (text) => set({ siteDescription: text }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleTheme: () => set(state => {
    const next = state.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('siteiq-theme', next)
    document.documentElement.setAttribute('data-theme', next)
    return { theme: next }
  }),

  setSelectedState: (stateName) => set(() => {
    localStorage.setItem('siteiq-state', stateName)
    return { selectedState: stateName }
  }),
  setReportData: (data) => set({ reportData: data }),
  setAnalysisId: (id) => set({ analysisId: id }),
  setProjectInfo: (info) => set((state) => ({ projectInfo: { ...state.projectInfo, ...info } })),
  addAnalysis: async (analysis) => {
    set((state) => ({ analyses: [analysis, ...state.analyses].slice(0, 50) }))
    if (!supabase) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('analyses').insert({
        user_id: user.id,
        analysis_id: analysis.id,
        report_title: analysis.reportData?.reportTitle ?? null,
        project_name: analysis.projectName ?? null,
        company_name: analysis.companyName ?? null,
        site_location: analysis.siteLocation ?? null,
        site_manager: analysis.siteManager ?? null,
        nigerian_state: analysis.selectedState ?? null,
        construction_phase: analysis.constructionPhase ?? null,
        worker_count: analysis.workerCount ?? null,
        safety_score: analysis.reportData?.safetyScore ?? null,
        contract_score: analysis.reportData?.contractScore ?? null,
        risk_count_high: analysis.reportData?.riskCount?.high ?? 0,
        risk_count_medium: analysis.reportData?.riskCount?.medium ?? 0,
        risk_count_low: analysis.reportData?.riskCount?.low ?? 0,
        report_data: analysis.reportData,
      })
    } catch (err) {
      console.warn('[SiteIQ] Failed to persist analysis:', err.message)
    }
  },

  removeAnalysis: async (id) => {
    set((state) => ({ analyses: state.analyses.filter(a => a.id !== id) }))
    if (!supabase) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('analyses').delete()
        .eq('analysis_id', id)
        .eq('user_id', user.id)
    } catch (err) {
      console.warn('[SiteIQ] Failed to delete analysis:', err.message)
    }
  },

  loadAnalysesFromDb: async (userId) => {
    if (!supabase) return
    try {
      const uid = userId ?? (await supabase.auth.getUser()).data?.user?.id
      if (!uid) return
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      if (!data) return
      set({
        analyses: data.map(row => ({
          id: row.analysis_id,
          projectName: row.project_name,
          companyName: row.company_name,
          selectedState: row.nigerian_state,
          constructionPhase: row.construction_phase,
          workerCount: row.worker_count,
          reportData: row.report_data,
          createdAt: row.created_at,
        })),
      })
    } catch (err) {
      console.warn('[SiteIQ] Failed to load analyses:', err.message)
      throw err
    }
  },

  syncRiskStatus: async (riskUid, status, userId) => {
    set(state => ({ riskStatuses: { ...state.riskStatuses, [riskUid]: status } }))
    if (!supabase) return
    try {
      await supabase.from('risk_statuses').upsert({
        user_id: userId,
        risk_uid: riskUid,
        status,
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      console.warn('[SiteIQ] Failed to sync risk status:', err.message)
    }
  },

  loadRiskStatuses: async (userId) => {
    if (!supabase) return
    try {
      const { data } = await supabase
        .from('risk_statuses')
        .select('*')
        .eq('user_id', userId)
      if (data) {
        const map = {}
        data.forEach(r => { map[r.risk_uid] = r.status })
        set({ riskStatuses: map })
      }
    } catch (err) {
      console.warn('[SiteIQ] Failed to load risk statuses:', err.message)
    }
  },

  // ── Conversation actions ──────────────────────────────────────────────────
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  addConversation: (conv) => set((state) => ({
    conversations: [conv, ...state.conversations],
    activeConversationId: conv.id,
  })),
  updateConversation: (id, updates) => set((state) => ({
    conversations: state.conversations.map(c => c.id === id ? { ...c, ...updates } : c),
  })),
  deleteConversation: (id) => set((state) => ({
    conversations: state.conversations.filter(c => c.id !== id),
    activeConversationId: state.activeConversationId === id
      ? (state.conversations.find(c => c.id !== id)?.id ?? null)
      : state.activeConversationId,
  })),

  clearAll: () => set({
    photoFiles: [],
    docFile: null,
    docText: '',
    siteDescription: '',
    nerEntities: [],
    hfDetections: [],
    reportData: null,
    analysisId: null,
    projectInfo: { projectName: '', company: '', siteLocation: '', siteManager: '' },
    isLoading: false,
    loadingStep: 0,
    loadingError: null,
    chatHistory: [],
    isChatLoading: false,
    activeTab: 0,
  }),

  loadDemoScenario: (scenario) => set({
    photoFiles: [],
    docFile: null,
    siteDescription: scenario.siteDescription,
    docText: scenario.contractText,
    nerEntities: [],
    hfDetections: [],
    reportData: null,
    loadingError: null,
    chatHistory: [],
  }),

  addChatMessage: (message) =>
    set((state) => ({ chatHistory: [...state.chatHistory, message] })),

  clearChat: () => set({ chatHistory: [] }),

  setIsChatLoading: (v) => set({ isChatLoading: v }),

  // ── Main analysis pipeline ────────────────────────────────────────────────
  runAnalysis: async () => {
    const { photoFiles, docFile, docText: existingDocText, siteDescription } = get()

    if (!photoFiles?.length && !docFile && !siteDescription && !existingDocText) {
      set({ loadingError: 'Please upload a site photo, contract document, or describe the site conditions.' })
      return false
    }

    const analysisId = 'SITEIQ-' + Math.random().toString(36).toUpperCase().slice(2, 8)
    set({ isLoading: true, loadingStep: 0, loadingError: null, reportData: null, analysisId })

    let hfDetections = []
    let docText = existingDocText
    let nerEntities = []

    try {
      // ── Step 1: Object detection ──────────────────────────────────────────
      if (photoFiles?.length) {
        set({ loadingStep: 1 })
        try {
          hfDetections = await detectAllPhotos(photoFiles)
          set({ hfDetections })
        } catch (err) {
          console.warn('Object detection failed — continuing without it:', err.message)
          hfDetections = []
        }
      }

      // ── Step 2: Contract text extraction ─────────────────────────────────
      if (docFile && !existingDocText) {
        set({ loadingStep: 2 })
        try {
          docText = await extractTextFromFile(docFile)
          set({ docText })
        } catch (err) {
          console.warn('Contract extraction failed — continuing without it:', err.message)
          docText = ''
        }
      }

      // ── Step 3: Named entity recognition ─────────────────────────────────
      if (docText) {
        set({ loadingStep: 3 })
        try {
          nerEntities = await extractEntities(docText)
          set({ nerEntities })
        } catch (err) {
          console.warn('NER failed — continuing without it:', err.message)
          nerEntities = []
        }
      }

      // ── Step 4: Claude analysis ───────────────────────────────────────────
      set({ loadingStep: 4 })
      // Small delay so users see each step
      await tick(300)

      set({ loadingStep: 5 })
      await tick(300)

      set({ loadingStep: 6 })
      const reportData = await analyseSite({
        siteDescription,
        detectedObjects: hfDetections,
        contractText: docText,
        nerEntities,
      })

      // ── Step 5: Assemble ──────────────────────────────────────────────────
      set({ loadingStep: 7 })
      await tick(400)

      set({ reportData, isLoading: false, activeTab: 0 })
      return true
    } catch (err) {
      set({
        isLoading: false,
        loadingError: err.message || 'Analysis failed. Please check your API keys and try again.',
      })
      return false
    }
  },
}))

function tick(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default useAppStore
