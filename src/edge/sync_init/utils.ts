import { decodeAscii85, decodeBase64, encodeAscii85, encodeBase64 } from "@std/encoding"
import { deflateSync, gunzipSync, gzipSync, inflateSync } from "fflate"
import type { YjsCompress, YjsEncoding } from "./metadata.ts"

export const encode_update = (data: Uint8Array, encoding: YjsEncoding): string => {
    if (encoding === "base64") return encodeBase64(data)
    if (encoding === "ascii85") return encodeAscii85(data)
    else throw new Error(`Unknown encoding: ${encoding}`)
}

export const decode_update = (data: string, encoding: YjsEncoding): Uint8Array => {
    if (encoding === "base64") return decodeBase64(data)
    if (encoding === "ascii85") return decodeAscii85(data)
    else throw new Error(`Unknown encoding: ${encoding}`)
}

export const encode_with_compress = (data: Uint8Array, compress: YjsCompress, encoding: YjsEncoding) => {
    let buf: Uint8Array
    if (compress === "deflate") buf = deflateSync(data)
    else if (compress === "gzip") buf = gzipSync(data)
    else if (compress === "none") buf = data
    else throw Error(`Unknown compress type: ${compress}`)
    return encode_update(buf, encoding)
}

export const decode_with_compress = (data: string, compress: YjsCompress, encoding: YjsEncoding) => {
    const buf = decode_update(data, encoding)
    if (compress === "deflate") return inflateSync(buf)
    else if (compress === "gzip") return gunzipSync(buf)
    else if (compress === "none") return buf
    else throw Error(`Unknown compress type: ${compress}`)
}
