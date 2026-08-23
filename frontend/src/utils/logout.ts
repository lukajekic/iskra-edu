import axios from 'axios'
import { toast } from 'sonner'
import posthog from '@/lib/posthog'

export async function HandleLogout() {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/logout`)
        if (response.status === 200) {
            posthog.reset()
            location.href = '/auth/onboarding'
        }
    } catch {
        toast.error("Desila se greska.")
    }
}