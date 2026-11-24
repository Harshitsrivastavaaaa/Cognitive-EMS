import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { companyService } from '../services/company'
import DefaultLogoSvg from '../assets/logo.svg'
import DefaultLogoPng from '../assets/logo.png'

const DEFAULT_PROFILE = {
    company_name: 'Cognitive EMS',
    tagline: null,
    address: null,
    email: null,
    phone: null,
    website: null,
    has_logo: false,
    version: 0,
}

const BrandingContext = createContext(null)

export function BrandingProvider({ children }) {
    const [profile, setProfile] = useState(DEFAULT_PROFILE)
    const [customLogoUrl, setCustomLogoUrl] = useState(null)
    const objectUrlRef = useRef(null)

    const applyProfile = useCallback(async (data) => {
        setProfile({ ...DEFAULT_PROFILE, ...data })
        let nextUrl = null
        if (data.has_logo) {
            try {
                nextUrl = URL.createObjectURL(await companyService.getLogoBlob(data.version))
            } catch (err) {
                console.warn('Could not load company logo, using default:', err)
            }
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = nextUrl
        setCustomLogoUrl(nextUrl)
    }, [])

    const refresh = useCallback(async () => {
        try {
            await applyProfile(await companyService.getProfile())
        } catch (err) {
            // Backend unreachable: keep the built-in branding
            console.warn('Could not load company profile:', err)
        }
    }, [applyProfile])

    useEffect(() => {
        refresh()
        return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current) }
    }, [refresh])

    // One-line contact summary for document headers, e.g. "12 MG Road · hr@acme.com · +91 ..."
    const contactLine = [profile.address, profile.email, profile.phone, profile.website].filter(Boolean).join('  ·  ')

    const value = {
        ...profile,
        companyName: profile.company_name,
        contactLine,
        hasCustomLogo: !!customLogoUrl,
        // Crisp SVG for the UI; raster PNG for jsPDF, which cannot embed SVG
        logoUrl: customLogoUrl || DefaultLogoSvg,
        documentLogoUrl: customLogoUrl || DefaultLogoPng,
        applyProfile,
        refresh,
    }

    return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export function useBranding() {
    const ctx = useContext(BrandingContext)
    if (!ctx) throw new Error('useBranding must be used within BrandingProvider')
    return ctx
}
