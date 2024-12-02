import type { SupabaseClient } from "@supabase/supabase-js"
import type { Doc } from "yjs"
import type { Database } from "../database.generated"
import { SupaChangesAdapter } from "./adapter"
import { roomMetadataSchema } from "./metadata"

export const createSupaChangesAdapter = async (
    supabase: SupabaseClient<Database>,
    room: string,
    doc: Doc,
    option: {
        channel?: string
    } = {}
) => {
    const metadata = await supabase
        .schema("y_supa_changes")
        .from("rooms")
        .select("yjs_compress,yjs_version,yjs_encoding")
        .eq("id", room)
        .single()

    if (metadata.error !== null || metadata.data === null) {
        throw new Error("Failed to fetch room metadata.")
    }

    // Case: Broken metadata found.
    const parsed = roomMetadataSchema.safeParse(metadata.data)
    if (!parsed.success) {
        throw new Error(
            [
                "Failed to parse room metadata.",
                parsed.error
            ].join("\n")
        )
    }

    // Get room metadata.
    const { yjs_compress, yjs_version, yjs_encoding } = parsed.data

    // Instantiate provider
    const provider = new SupaChangesAdapter(
        supabase,
        room,
        doc,
        yjs_version,
        yjs_compress,
        yjs_encoding,
        option.channel ?? "yspg"
    )

    // OK
    return provider
}
