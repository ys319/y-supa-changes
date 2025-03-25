import type { SupabaseClient } from "@supabase/supabase-js"
import { createElement, type PropsWithChildren, type ReactNode, useEffect, useState } from "react"
import { proxy } from "valtio"
import { bind } from "valtio-yjs"
import { Doc } from "yjs"
import type { SupaChangesAdapter } from "../core/adapter"
import { createSupaChangesAdapter } from "../core/helper"
import type { Database } from "../database.generated"
import { SupaChangesContext, type UnknownStore } from "./SupaChangesContext"

export type Props<T extends UnknownStore> = PropsWithChildren<{
    supabase: SupabaseClient<Database>
    room: string
    storeInitFn?: (store: T) => void
    Loading: ReactNode
}>

export const SupaChangesContextProvider = <T extends UnknownStore>({
    children,
    supabase,
    room,
    storeInitFn,
    Loading,
}: Props<T>): ReactNode => {

    const [state, setState] = useState<{
        store: T
        ydoc: Doc
        unbind: () => void
        provider: SupaChangesAdapter
    }>()

    useEffect(() => {

        // Reset state.
        setState(undefined)

        // Prepare proxy store.
        const store = proxy<T>()
        const ydoc = new Doc()
        const ymap = ydoc.getMap()

        // Make abortable.
        const controller = new AbortController()
        const signal = controller.signal

        // Create provider.
        createSupaChangesAdapter(supabase, room, ydoc)
            .then(async (provider) => {

                // Try to initialize.
                try {
                    await provider.initialize(signal)
                } catch (error) {
                    // This error is safe.
                    console.warn(error)
                }

                // Aborted?
                if (signal.aborted) return

                // Bind valtio store to yjs doc.
                const unbind = bind(store, ymap)

                // Initialize store.
                if (typeof storeInitFn === "function") {
                    storeInitFn(store)
                }

                // Done.
                setState({ store, ydoc, provider, unbind })
            })

        return () => {
            controller.abort()
            state?.unbind()
            state?.provider.destroy()
        }
    }, [room, storeInitFn, supabase])

    // Case: Return loading component when not ready.
    if (state === undefined) {
        return Loading
    }

    // Create provider.
    return createElement(
        SupaChangesContext.Provider,
        {
            value: {
                store: state.store,
                ydoc: state.ydoc,
            }
        },
        children
    )
}
