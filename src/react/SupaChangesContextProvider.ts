import { SupabaseClient } from "@supabase/supabase-js"
import { createElement, PropsWithChildren, ReactNode, useCallback, useEffect, useState } from "react"
import { proxy } from "valtio"
import { bind } from "valtio-yjs"
import { Doc } from "yjs"
import { SupaChangesAdapter } from "../core/adapter"
import { createSupaChangesAdapter } from "../core/helper.js"
import { Database } from "../database.generated"
import { SupaChangesContext, UnknownStore } from "./SupaChangesContext"

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
}: Props<T>) => {

    const [state, setState] = useState<{
        store: T
        ydoc: Doc
        unbind: () => void
        provider: SupaChangesAdapter
    }>()

    const connect = useCallback(async () => {

        // Reset state.
        setState(undefined)

        // Create provider.
        const store = proxy<T>()
        const ydoc = new Doc()
        const ymap = ydoc.getMap('data')
        const provider = await createSupaChangesAdapter(supabase, room, ydoc)

        // Try to initialize.
        try {
            await provider.initialize()
            // Initialize store.
            if (typeof storeInitFn === "function") {
                storeInitFn(store)
            }
        } catch (error) {
            // This error is safe.
            console.warn(error)
        }

        // Bind valtio store to yjs doc.
        const unbind = bind(store, ymap)

        // Done.
        setState({ store, ydoc, provider, unbind })
    }, [room, storeInitFn, supabase])

    // Connect.
    useEffect(() => {
        connect()
    }, [connect])

    // Cleanup.
    useEffect(() => () => {
        state?.provider.destroy()
        state?.unbind()
    }, [state])

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
