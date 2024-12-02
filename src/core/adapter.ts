import { decodeAscii85, decodeBase64, encodeAscii85, encodeBase64 } from "@std/encoding"
import { REALTIME_SUBSCRIBE_STATES, RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import { Doc, applyUpdate, applyUpdateV2 } from "yjs"
import { Database } from "../database.generated"
import { compress, decompress } from "./compress"
import { YjsCompress, YjsEncoding, YjsVersion } from "./metadata"

type RealtimePayload = Database["y_supa_changes"]["Tables"]["updates"]["Insert"]

export class SupaChangesAdapter {

    // References
    #supabase: SupabaseClient<Database>
    #room_id: string
    #doc: Doc

    // Options
    #channel: string
    #yjs_version: YjsVersion
    #yjs_compress: YjsCompress
    #yjs_encoding: YjsEncoding

    // States
    #subscription?: RealtimeChannel

    constructor(
        supabase: SupabaseClient<Database>,
        room: string,
        doc: Doc,
        yjs_version: YjsVersion,
        yjs_compress: YjsCompress,
        yjs_encoding: YjsEncoding,
        channel: string
    ) {

        // Required param
        this.#supabase = supabase
        this.#room_id = room
        this.#doc = doc
        this.#yjs_version = yjs_version
        this.#yjs_compress = yjs_compress
        this.#yjs_encoding = yjs_encoding
        this.#channel = channel

        // Subscribe to document updates
        if (this.#yjs_version === "v1") {
            this.#doc.on("update", this.updateHandler.bind(this))
        } else if (this.#yjs_version === "v2") {
            this.#doc.on("updateV2", this.updateHandler.bind(this))
        } else {
            throw new Error(`Unknown yjs version: ${this.#yjs_version}`)
        }
    }

    // Encoder & Decoder
    private encodeUpdate(data: Uint8Array): string {
        if (this.#yjs_encoding === "base64") return encodeBase64(data)
        else if (this.#yjs_encoding === "ascii85") return encodeAscii85(data)
        else throw new Error(`Unknown data encoding: ${this.#yjs_encoding}`)
    }

    private decodeUpdate(data: string): Uint8Array {
        if (this.#yjs_encoding === "base64") return decodeBase64(data)
        else if (this.#yjs_encoding === "ascii85") return decodeAscii85(data)
        else throw new Error(`Unknown data encoding: ${this.#yjs_encoding}`)
    }

    // Compress
    private async encodeUpdateWithCompress(data: Uint8Array): Promise<string> {
        switch (this.#yjs_compress) {
            case "deflate-raw":
                return this.encodeUpdate(await compress(data, "deflate-raw"))
            case "deflate":
                return this.encodeUpdate(await compress(data, "deflate"))
            case "gzip":
                return this.encodeUpdate(await compress(data, "gzip"))
            case "none":
                return this.encodeUpdate(data)
            default:
                throw Error(`Unknown compress type: ${this.#yjs_compress}`)
        }
    }

    private async decodeUpdateWithCompress(data: string): Promise<Uint8Array> {
        switch (this.#yjs_compress) {
            case "deflate-raw":
                return await decompress(this.decodeUpdate(data), "deflate-raw")
            case "deflate":
                return await decompress(this.decodeUpdate(data), "deflate")
            case "gzip":
                return await decompress(this.decodeUpdate(data), "gzip")
            case "none":
                return this.decodeUpdate(data)
            default:
                throw Error(`Unknown compress type: ${this.#yjs_compress}`)
        }
    }

    // Wrappers
    async applyUpdate(payload: Pick<RealtimePayload, "update">) {
        if (this.#yjs_version === "v1") {
            applyUpdate(this.#doc, await this.decodeUpdateWithCompress(payload.update), this)
        } else if (this.#yjs_version === "v2") {
            applyUpdateV2(this.#doc, await this.decodeUpdateWithCompress(payload.update), this)
        }
    }

    public async initialize() {

        // Subscribe to realtime updates
        const channelName = `${this.#channel}:${this.#room_id}:crdt`
        // @ts-ignore
        const subscribed = Promise.withResolvers<`${REALTIME_SUBSCRIBE_STATES}`>()
        this.#subscription = this.#supabase
            .channel(channelName)
            .on<RealtimePayload>(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "y_supa_changes",
                    table: "updates",
                    filter: `room_id=eq.${this.#room_id}`
                },
                (payload) => {
                    // Ignore merged update
                    if (payload.new.checkpoint === true) return
                    // Ignore empty update
                    if (payload.new.update === undefined) return
                    // Apply remote updates to the document
                    this.applyUpdate(payload.new)
                }
            )
            .subscribe((status) => subscribed.resolve(status))

        // Wait for subscribe.
        const status = await subscribed.promise

        if (status === "SUBSCRIBED") {
            // Get remote status.
            await this.syncInitialState()
        } else {
            this.destroy()
            throw new Error("Failed to subscribe database.")
        }
    }

    private async syncInitialState() {

        // Fetch all existing updates ordered by autoincrement id
        const { data, error } = await this.#supabase
            .schema("y_supa_changes")
            .from("updates")
            .select("update")
            .eq("room_id", this.#room_id)
            .order("id")

        if (error !== null) {
            throw error
        }

        // Apply all updates in order
        for (const payload of data) {
            if (typeof payload.update !== "string") {
                console.warn("Failed to apply update: ", payload);
                continue
            }
            await this.applyUpdate(payload)
        }
    }

    private async updateHandler(update: Uint8Array, origin: SupaChangesAdapter) {

        // Only sync if update didn't come from Supabase
        if (origin === this) return

        try {
            await this.#supabase
                .schema("y_supa_changes")
                .from("updates")
                .insert({
                    update: await this.encodeUpdateWithCompress(update),
                    room_id: this.#room_id,
                })
        } catch (error) {
            console.error("Failed to sync update:", error)
        }
    }

    destroy() {
        // Clean up
        this.#subscription?.unsubscribe()
        if (this.#yjs_version === "v1") {
            this.#doc.off("update", this.updateHandler)
        } else if (this.#yjs_version === "v2") {
            this.#doc.off("updateV2", this.updateHandler)
        }
    }
}
