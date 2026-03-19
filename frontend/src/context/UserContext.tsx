import React, { createContext, useContext, useState, type ReactNode } from 'react'


interface UserContextType {
    userID: string | null,
    setUserID: (userID: string | null) => void
}

    const userContext = createContext<UserContextType | undefined>(undefined)



export const UserProvider = ({children}:{children:ReactNode}) => {

const [userID, setUserID] = useState<string|null>(null)


    
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