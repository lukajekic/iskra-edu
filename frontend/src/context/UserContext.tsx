import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import axios from 'axios'
import posthog from '@/lib/posthog'


interface UserContextType {
    userID: string | null,
    setUserID: (userID: string | null) => void
}

    const userContext = createContext<UserContextType | undefined>(undefined)



export const UserProvider = ({children}:{children:ReactNode}) => {

const [userID, setUserID] = useState<string|null>(null)

useEffect(() => {
  const PUBLIC_PATHS = ['/', '/about', '/legal/terms', '/legal/privacy', '/maintenance', '/not-available-on-mobile']
  if (PUBLIC_PATHS.includes(window.location.pathname)) return // ne proveravaj sesiju na javnim stranicama

  const restoreIdentity = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/user/me`, { withCredentials: true })
      if (response.data?._id) {
        setUserID(response.data._id)
        posthog.identify(response.data._id, {
          name: response.data.name,
          username: response.data.username,
          type: response.data.type,
        })
      }
    } catch {
    }
  }
  restoreIdentity()
}, [])

    
  return (
   <userContext.Provider value={{userID, setUserID}}>
    {children}
   </userContext.Provider>
  )
}

export const useUserId = () => {
  const context = useContext(userContext);
  if (!context) {
    throw new Error('useUserId must be used within a UserProvider');
  }
  return context;
};