import z from "zod"

export const roomMetadataSchema = z.object({
    yjs_compress: z.enum(["none", "gzip", "deflate", "deflate-raw"]),
    yjs_encoding: z.enum(["base64", "ascii85"]),
    yjs_version: z.enum(["v1", "v2"])
})

export type RoomMetadata = z.infer<typeof roomMetadataSchema>
export type YjsCompress = RoomMetadata["yjs_compress"]
export type YjsEncoding = RoomMetadata["yjs_encoding"]
export type YjsVersion = RoomMetadata["yjs_version"]
