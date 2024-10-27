//deno.js
{
  "compilerOptions": {
    "lib": ["deno.window", "dom", "dom.iterable"]
  },
  "importMap": "./import_map.json",
  "tasks": {
    "start": "deno run --allow-net --allow-read --allow-write --allow-run --allow-env src/server.ts"
  }
}
