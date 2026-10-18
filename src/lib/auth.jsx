import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { supabase } from './supabase.js'

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    console.error('Failed to fetch profile:', error.message)
    return null
  }
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!mounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setProfile(await fetchProfile(currentUser?.id))
      setLoading(false)
    }
    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setProfile(await fetchProfile(currentUser?.id))
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email, password, whatsapp) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    const newUser = data.user
    if (newUser) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: newUser.id,
        email,
        whatsapp: whatsapp || null,
      })
      if (profileError) throw profileError
    }
    return data
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }, [])

  const isAdmin = !!profile?.is_admin

  return (
    <AuthContext.Provider
      value={{ user, profile, isAdmin, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
