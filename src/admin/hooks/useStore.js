import { useCallback, useEffect, useState } from 'react'
import { subscribe } from '../../services/clinicStore'

/* Re-runs `selector` whenever the shared store changes (same tab or cross-tab).
   Returns [value, refresh]. Keeps admin views live without a backend. */
export function useStore(selector, deps = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const select = useCallback(selector, deps)
  const [value, setValue] = useState(select)

  useEffect(() => {
    setValue(select())
    const unsub = subscribe(() => setValue(select()))
    return unsub
  }, [select])

  const refresh = useCallback(() => setValue(select()), [select])
  return [value, refresh]
}
