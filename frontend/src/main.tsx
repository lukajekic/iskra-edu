import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import axios from 'axios'
import { toast } from 'sonner'
axios.defaults.withCredentials = true
axios.interceptors.response.use(response => response, error =>{
    if (error.response.status === 401) {
        if (location.pathname !== '/auth/onboarding') {
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
