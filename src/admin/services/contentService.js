import * as store from '../../services/clinicStore'

export const getContent = () => store.getContent()
export const saveContent = (patch) => store.saveContent(patch)
export const resetContent = () => store.resetContent()
export const DEFAULT_CONTENT = store.DEFAULT_CONTENT
