import { SupabaseClient } from "@supabase/supabase-js"
import { applyUpdate, applyUpdateV2, Doc, encodeStateAsUpdate, encodeStateAsUpdateV2 } from "yjs"
import type { Database } from "./database.ts"
import { roomMetadataSchema } from "./metadata.ts"
import { decode_with_compress, encode_with_compress } from "./utils.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*'
}

type Supa = SupabaseClient<Database, "y_supa_changes", Database["y_supa_changes"]>

export const sync_init_handler = (supabaseUrl: string, supabaseKey: string): Deno.ServeHandler<Deno.NetAddr> => {
    const supabase: Supa = new SupabaseClient(supabaseUrl, supabaseKey)

    return async (req: Request) => {

        // Handle preflight
        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
        }

        // Get room from body
        const { room_id } = await req.json()

        // Case: Room is not provided.
        if (room_id === undefined) {
            return new Response(
                JSON.stringify({ status: "error" }),
                {
                    headers: { "Content-Type": "application/json" },
                    status: 404,
                    statusText: "Room not found."
                }
            )
        }

        // Fetch metadata.
        const metadata = await supabase
            .schema("y_supa_changes")
            .from("rooms")
            .select("compress,yjs_version")
            .eq("id", room_id)
            .single()

        // Case: Metadata not found.
        if (metadata.error !== null) {
            return new Response(
                JSON.stringify({ status: "error", reason: metadata.error }),
                {
                    headers: { "Content-Type": "application/json" },
                    status: 404,
                    statusText: "Failed to fetch room metadata."
                }
            )
        }

        // Case: Broken metadata found.
        const parsed = roomMetadataSchema.safeParse(metadata.data)
        if (!parsed.success) {
            return new Response(
                JSON.stringify({ status: "error" }),
                {
                    headers: { "Content-Type": "application/json" },
                    status: 503,
                    statusText: "Failed to parse room metadata."
                }
            )
        }

        // Get room metadata.
        const { compress, yjs_version } = parsed.data

        // Get all updates from room.
        const updates = await supabase
            .schema("y_supa_changes")
            .from("updates")
            .select("id,update")
            .eq("room_id", room_id)
            .order("id")

        // Case: Invalid room.
        if (updates.error !== null) {
            return new Response(
                JSON.stringify({ status: "error", reason: metadata.error }),
                {
                    headers: { "Content-Type": "application/json" },
                    status: 400,
                    statusText: "Failed to fetch room updates."
                }
            )
        }

        // New ydoc for merge updates.
        const ydoc = new Doc()
        for (const { update } of updates.data) {
            if (yjs_version === "v1") {
                applyUpdate(ydoc, decode_with_compress(update, compress))
            } else if (yjs_version === "v2") {
                applyUpdateV2(ydoc, decode_with_compress(update, compress))
            }
        }

        // Encode update to string.
        let encoded
        if (yjs_version === "v1") {
            encoded = encodeStateAsUpdate(ydoc)
        } else if (yjs_version === "v2") {
            encoded = encodeStateAsUpdateV2(ydoc)
        } else {
            throw new Error(`Unknown yjs version: ${yjs_version}`)
        }
        const update = encode_with_compress(encoded, compress)

        // // Insert checkpoint to database.
        // await supabase
        //     .schema("y_supa_changes")
        //     .from("updates")
        //     .insert({
        //         update,
        //         room_id,
        //         checkpoint: true,
        //     })

        // // Delete merged update.
        // const merged_ids = updates.data.map(datum => datum.id)
        // await supabase
        //     .schema("y_supa_changes")
        //     .from("updates")
        //     .delete()
        //     .in("id", merged_ids)

        // OK.
        return new Response(
            JSON.stringify({ update }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
                statusText: "Success."
            }
        )
    }
}
