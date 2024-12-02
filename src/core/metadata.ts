import z from "zod"

export const roomMetadataSchema = z.object({
    yjs_compress: z.enum(["none", "gzip", "deflate", "deflate-raw"]),
    yjs_version: z.enum(["v1", "v2"]),
    yjs_encoding: z.enum(["ascii85", "base64"])
})

export type RoomMetadata = z.infer<typeof roomMetadataSchema>
export type YjsCompress = RoomMetadata["yjs_compress"]
export type YjsVersion = RoomMetadata["yjs_version"]
export type YjsEncoding = RoomMetadata["yjs_encoding"]
