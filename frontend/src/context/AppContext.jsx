import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const currencySymbol = '₹'
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim()

    const [doctors, setDoctors] = useState([])
    const [doctorsLoading, setDoctorsLoading] = useState(true)
    const [doctorsError, setDoctorsError] = useState('')
    const [token, setToken] = useState(localStorage.getItem('token') || '')
    const [userData, setUserData] = useState(false)

    const getDoctorsData = async (attempt = 1) => {
        try {
            if (attempt === 1) {
                setDoctorsLoading(true)
                setDoctorsError('')
            }

            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
                setDoctorsError('')
            } else {
                setDoctorsError(data.message || 'Unable to load doctors right now.')
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            if (attempt < 3) {
                setTimeout(() => {
                    getDoctorsData(attempt + 1)
                }, attempt * 1500)
                return
            }

            setDoctorsError('Unable to load doctors right now. Please refresh in a moment.')
            toast.error(error.message)
        } finally {
            if (attempt === 1 || attempt >= 3) {
                setDoctorsLoading(false)
            }
        }
    }

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', {
                headers: { token }
            })

            if (data.success) {
                const safeUserData = {
                    ...data.userData,
                    address: data.userData.address || { line1: '', line2: '' },
                    gender: data.userData.gender || '',
                    dob: data.userData.dob || ''
                }
                setUserData(safeUserData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getDoctorsData()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    const value = {
        doctors, getDoctorsData, doctorsLoading, doctorsError,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, loadUserProfileData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
