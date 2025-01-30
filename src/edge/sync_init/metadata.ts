import z from "zod"

export const roomMetadataSchema = z.object({
    compress: z.enum(["none", "gzip", "deflate"]),
    yjs_version: z.enum(["v1", "v2"])
})

export type RoomMetadata = z.infer<typeof roomMetadataSchema>
export type Compress = RoomMetadata["compress"]
export type YjsVersion = RoomMetadata["yjs_version"]
