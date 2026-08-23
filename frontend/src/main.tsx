import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'
import { toast } from 'sonner'
import './lib/posthog.ts'
axios.defaults.withCredentials = true
const PUBLIC_PATHS = ['/', '/about', '/legal/terms', '/legal/privacy', '/maintenance', '/not-available-on-mobile']

axios.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401) {
        const isPublicPath = PUBLIC_PATHS.includes(location.pathname)
        const alreadyOnOnboarding = location.pathname === '/auth/onboarding'
        if (!isPublicPath && !alreadyOnOnboarding) {
            location.href = '/auth/onboarding'
        }
    }else if (error.response.status === 400) {
        if (error.response.data.toast) {
            let toasttype = error.response.data.toast
            let toastcontent = error.response.data.toast_message
            if (toasttype === 'success') {
                toast.success(toastcontent)
            } else if (toasttype === 'error') {
                toast.error(toastcontent)
            } else if (toasttype === 'info') {
                toast.info(toastcontent)
            }
        }
    }

    return Promise.reject(error)
})
createRoot(document.getElementById('root')!).render(

<App />

)
