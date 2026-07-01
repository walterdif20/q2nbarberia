import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { isFirebaseConfigured } from '../firebase'
import { getUserProfile, listenAuth } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = listenAuth(async (user) => {
      setAuthUser(user)

      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const userProfile = await getUserProfile(user.uid)
        setProfile(userProfile || {
          displayName: user.displayName || user.email,
          email: user.email,
          id: user.uid,
          role: 'user',
        })
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      authUser,
      firebaseReady: isFirebaseConfigured,
      isAdmin: profile?.role === 'admin',
      loading,
      profile,
      user: authUser,
    }),
    [authUser, loading, profile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
