import { useContext } from "react"
import { SupaChangesContext, UnknownStore } from "./SupaChangesContext.ts"

export const useSupaChanges = <T extends UnknownStore>() => {
    const context = useContext(SupaChangesContext)

    // Case: Failed to get context.
    if (context === undefined) {
        throw new Error(
            [
                "Failed to access SupaChangesContextProvider's context. This could happen because:",
                "  1. The component is not wrapped in an SupaChangesContextProvider",
                "  2. Multiple versions of the context are being used",
                "",
                "Please ensure your component is wrapped like this:",
                "  <SupaChangesContextProvider>",
                "    <YourComponent />",
                "  </SupaChangesContextProvider>"
            ].join("\n")
        )
    }

    return {
        store: context.store as T,
        ydoc: context.ydoc,
    }
}
