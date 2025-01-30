import base64 from "@protobufjs/base64"
import { deflateSync, gunzipSync, gzipSync, inflateSync } from "fflate"
import type { Compress } from "./metadata.ts"

export const base64_encode = (data: Uint8Array) => base64.encode(data, 0, data.length)

export const base64_decode = (data: string) => {
    const result = new Uint8Array(base64.length(data))
    base64.decode(data, result, 0)
    return result
}

export const encode_update = (data: Uint8Array, encoding: "base64"): string => {
    if (encoding === "base64") return base64_encode(data)
    else throw new Error(`Unknown encoding: ${encoding}`)
}

export const decode_update = (data: string, encoding: "base64"): Uint8Array => {
    if (encoding === "base64") return base64_decode(data)
    else throw new Error(`Unknown encoding: ${encoding}`)
}

export const encode_with_compress = (data: Uint8Array, compress: Compress) => {
    let buf: Uint8Array
    if (compress === "deflate") buf = deflateSync(data)
    else if (compress === "gzip") buf = gzipSync(data)
    else if (compress === "none") buf = data
    else throw Error(`Unknown compress type: ${compress}`)
    return encode_update(buf, "base64")
}

export const decode_with_compress = (data: string, compress: Compress) => {
    const buf = decode_update(data, "base64")
    if (compress === "deflate") return inflateSync(buf)
    else if (compress === "gzip") return gunzipSync(buf)
    else if (compress === "none") return buf
    else throw Error(`Unknown compress type: ${compress}`)
}
