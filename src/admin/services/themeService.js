import * as store from '../../services/clinicStore'

export const getColors = () => store.getThemeColors()
export const saveColors = (colors) => {
  store.saveThemeColors(colors)
  store.applyCustomerTheme()
  return colors
}
export const resetColors = () => {
  store.resetThemeColors()
  store.applyCustomerTheme()
}
export const getMode = () => store.getThemeMode()
export const setMode = (mode) => store.setThemeMode(mode)
export const PRESETS = store.PRESETS
export const DEFAULT_THEME = store.DEFAULT_THEME
