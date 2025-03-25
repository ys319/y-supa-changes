import { defineConfig } from "tsup"

export default defineConfig({
    // Source
    entry: {
        "mod": "src/mod.ts",
        "react": "src/react.ts",
        "edge": "src/edge.ts",
    },
    outDir: "dist",

    // Format
    format: "esm",
    minify: false,
    sourcemap: true,
    splitting: false,
    dts: true,

    // Misc
    clean: true,
})
