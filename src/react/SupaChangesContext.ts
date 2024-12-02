import { createContext } from "react"
import { Doc } from "yjs"

export type UnknownStore = Record<string | number | symbol, unknown> | Array<unknown>
export const SupaChangesContext = createContext<{ store: UnknownStore, ydoc: Doc } | undefined>(undefined)
