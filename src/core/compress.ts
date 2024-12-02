const processStream = async (
    data: Uint8Array,
    transformer: CompressionStream | DecompressionStream,
) => {
    const values = new Blob([data]).stream().pipeThrough(transformer).values()
    const chunks = await Array.fromAsync(values)
    return new Uint8Array(await new Blob(chunks).arrayBuffer())
}

export const compress = (data: Uint8Array, compression: CompressionFormat) =>
    processStream(data, new CompressionStream(compression))

export const decompress = (data: Uint8Array, compression: CompressionFormat) =>
    processStream(data, new DecompressionStream(compression))
