import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase.js'

function mapUser(sbUser, profile = {}) {
  if (!sbUser) return null
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: profile.full_name ?? sbUser.user_metadata?.full_name
      ?? sbUser.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    company: profile.company ?? null,
    role: profile.role ?? null,
  }
}

async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('full_name, company, role')
    .eq('id', userId)
    .single()
  return data ?? {}
}

function friendlyError(message) {
  if (!message) return 'Something went wrong. Please try again.'
  if (message.includes('Invalid login credentials')) return 'Invalid email or password.'
  if (message.includes('Email not confirmed')) return 'Please verify your email before signing in.'
  if (message.includes('User already registered')) return 'An account with this email already exists.'
  if (message.includes('network') || message.includes('fetch')) return 'Please check your internet connection.'
  return message
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,
      authError: null,

      initAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const profile = await fetchProfile(session.user.id)
            set({ user: mapUser(session.user, profile), profile, isAuthenticated: true })
          }
        } catch (err) {
          console.warn('[SiteIQ] initAuth error:', err.message)
        } finally {
          set({ isLoading: false })
        }

        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const profile = await fetchProfile(session.user.id)
            set({ user: mapUser(session.user, profile), profile, isAuthenticated: true })
          }
          if (event === 'SIGNED_OUT') {
            set({ user: null, profile: null, isAuthenticated: false })
          }
        })
      },

      signIn: async (email, password) => {
        if (!email || !password) throw new Error('Email and password are required.')
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(friendlyError(error.message))
        const profile = await fetchProfile(data.user.id)
        const user = mapUser(data.user, profile)
        set({ user, profile, isAuthenticated: true, authError: null })
        return user
      },

      signUp: async ({ name, email, password, company, role }) => {
        if (!name || !email || !password) throw new Error('Name, email, and password are required.')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
        if (error) throw new Error(friendlyError(error.message))

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: name,
            company: company || null,
            role: role || null,
          })
        }

        // Auto-signin to skip email confirmation for demo
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
          if (!signInError && signInData.user) {
            const profile = { full_name: name, company, role }
            const user = mapUser(signInData.user, profile)
            set({ user, profile, isAuthenticated: true, authError: null })
            return user
          }
        } catch {}

        const user = mapUser(data.user, { full_name: name, company, role })
        set({ user, profile: { full_name: name, company, role }, isAuthenticated: true, authError: null })
        return user
      },

      updateProfile: async (updates) => {
        const userId = get().user?.id
        if (!userId) return
        await supabase.from('profiles').update(updates).eq('id', userId)
        set(state => ({
          profile: { ...state.profile, ...updates },
          user: {
            ...state.user,
            name: updates.full_name ?? state.user?.name,
            company: updates.company !== undefined ? updates.company : state.user?.company,
            role: updates.role !== undefined ? updates.role : state.user?.role,
          },
        }))
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, isAuthenticated: false })
      },
    }),
    {
      name: 'siteiq-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
