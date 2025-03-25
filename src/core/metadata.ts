import z from "zod"

export const roomMetadataSchema: RoomMetadataSchema = z.object({
    yjs_compress: z.enum(["none", "gzip", "deflate", "deflate-raw"]),
    yjs_version: z.enum(["v1", "v2"]),
    yjs_encoding: z.enum(["ascii85", "base64"])
})

export type RoomMetadata = z.infer<typeof roomMetadataSchema>
export type YjsCompress = RoomMetadata["yjs_compress"]
export type YjsVersion = RoomMetadata["yjs_version"]
export type YjsEncoding = RoomMetadata["yjs_encoding"]

type RoomMetadataSchema = z.ZodObject<
    {
        yjs_compress: z.ZodEnum<["none", "gzip", "deflate", "deflate-raw"]>
        yjs_version: z.ZodEnum<["v1", "v2"]>
        yjs_encoding: z.ZodEnum<["ascii85", "base64"]>
    },
    "strip",
    z.ZodTypeAny,
    {
        yjs_compress: "none" | "gzip" | "deflate" | "deflate-raw"
        yjs_version: "v1" | "v2"
        yjs_encoding: "ascii85" | "base64"
    },
    {
        yjs_compress: "none" | "gzip" | "deflate" | "deflate-raw"
        yjs_version: "v1" | "v2"
        yjs_encoding: "ascii85" | "base64"
    }
>
