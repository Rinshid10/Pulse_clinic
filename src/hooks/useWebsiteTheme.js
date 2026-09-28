import { useEffect } from 'react'
import { applyCustomerTheme, subscribe } from '../services/clinicStore'

/* Applies the Pulse website colour theme (chosen in Admin → Theme) to the
   document root and keeps it in sync, so consoles that map their brand
   variables to --brand / --violet / --accent match the website. */
export function useWebsiteTheme() {
  useEffect(() => {
    applyCustomerTheme()
    return subscribe((key) => {
      if (!key || key === 'pulse-theme-colors') applyCustomerTheme()
    })
  }, [])
}
