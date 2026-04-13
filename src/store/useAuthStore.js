/**
 * SiteIQ — Auth store (Zustand + localStorage persist)
 * Hackathon mode: accepts any email/password — no real backend.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      /** Sign in — stores user, marks authenticated */
      signIn: async (email, password) => {
        if (!email || !password) throw new Error('Email and password are required.')
        // Simulate network latency
        await new Promise(r => setTimeout(r, 900))
        const user = {
          id: Date.now(),
          email,
          name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          company: null,
          role: null,
        }
        set({ user, isAuthenticated: true })
        return user
      },

      /** Sign up — stores user, marks authenticated */
      signUp: async ({ name, email, password, company, role }) => {
        if (!name || !email || !password) throw new Error('Name, email, and password are required.')
        await new Promise(r => setTimeout(r, 1100))
        const user = { id: Date.now(), name, email, company, role }
        set({ user, isAuthenticated: true })
        return user
      },

      /** Sign out */
      signOut: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'siteiq-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

export default useAuthStore
