import axios from 'axios'
import { toast } from 'sonner'

export async function HandleLogout() {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/user/logout`)
        if (response.status === 200) {
            location.href = '/auth/onboarding'
        }
    } catch (error) {
        toast.error("Desila se greska.")
    }
}