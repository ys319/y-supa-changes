import { defineConfig } from "tsup"

export default defineConfig({
    // Source
    entry: {
        "index": "src/index.ts",
        "react": "src/react.ts",
        // "func": 
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
