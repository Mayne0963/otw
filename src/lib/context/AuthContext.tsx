"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "../../types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [auth, setAuth] = useState<any>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      const { getAuth } = await import("firebase/auth")
      const { app } = await import("../services/firebase")
      setAuth(getAuth(app))
    }
    initializeAuth()
  }, [])

  useEffect(() => {
    if (!auth) return

    const initializeAuthState = async () => {
      const { onAuthStateChanged } = await import("firebase/auth")
      const unsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
          // Convert Firebase user to our User type
          const appUser: User = {
            id: authUser.uid,
            name: authUser.displayName || "Guest User",
            email: authUser.email || "",
            isGuest: false,
          }
          setUser(appUser)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      })

      return () => unsubscribe()
    }

    initializeAuthState()
  }, [auth])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      })

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      const { signOut } = await import("firebase/auth")
      await signOut(auth)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth")
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (error) {
      console.error("Password reset error:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
