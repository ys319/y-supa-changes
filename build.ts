import { resolve } from "https://deno.land/std@0.224.0/path/mod.ts"
import { PackageJson, build } from "https://deno.land/x/dnt@0.40.0/mod.ts"
// import { PackageJson, build } from "jsr:@deno/dnt"

const { dirname } = import.meta

if (dirname === undefined)
    throw new Error("Failed to get dirname.")

export const createPackage = (input: PackageInput): PackageJson => ({

    // Required
    name: `@${input.repo}`,
    version: Deno.args[0]?.replace(/^v/, ""),

    // Detail
    description: input.description,
    license: input.license,
    keywords: input.keywords,
    author: input.author,

    // Repository
    repository: {
        type: "git",
        url: `github:${input.repo}`
    },

    // Homapage
    homepage: `https://github.com/${input.repo}`,
    bugs: {
        url: `https://github.com/${input.repo}/issues`
    },
})

await build({
    package: {
        ...createPackage({
            repo: "ys319/y-supa-changes",
            description: "Yjs provider for Supabase Postgres Changes",
            license: "MIT",
            keywords: ["yjs", "supabase"],
            author: "Yoshimasa Kuroyama",
        }),
        "peerDependencies": {
            "@supabase/supabase-js": "^2.46.1",
            "react": "^18.3.1",
            "valtio": "^2.1.2",
            "valtio-yjs": "^0.6.0",
            "yjs": "^13.6.20"
        }
    },

    // Source and Destination
    entryPoints: [
        resolve(dirname, "src", "mod.ts")
    ],
    outDir: resolve(dirname, "dist"),

    // TypeScript
    compilerOptions: {
        target: "Latest",
        lib: [
            "ESNext",
            "DOM",
            // "DOM.AsyncIterable",
            "DOM.Iterable",
        ]
    },

    // Deno
    importMap: "deno.jsonc",
    packageManager: "npm",

    // Tests
    test: false,
    typeCheck: "both",

    // Output
    shims: {},
    skipSourceOutput: true,
    declaration: "separate",
    // scriptModule: "cjs",
    esModule: true,

    // Finishing
    postBuild: async () => {

        // Copy files to dist
        const files = [
            ["LICENSE"],
            ["README.md"],
        ]

        for (const file of files) {
            await Deno.copyFile(
                resolve(dirname, ...file),
                resolve(dirname, "dist", ...file),
            )
        }

        // Fix package.json
        const devDependencies = [
            "@types/react"
        ]

        const json: PackageJson = JSON.parse(
            await Deno.readTextFile(
                resolve(dirname, "dist", "package.json")
            )
        )

        if (json.dependencies === undefined) return

        for (const item of devDependencies) {
            json.devDependencies = {
                ...json.devDependencies,
                [item]: json.dependencies[item]
            }
            delete json.dependencies[item]
        }

        await Deno.writeTextFile(
            resolve(dirname, "dist", "package.json"),
            JSON.stringify(json, undefined, 2),
        )
    }
})

type PackageInput = {
    repo: string
    description: string
    license: string
    keywords: string[]
    author: PackageJson["author"]
}
