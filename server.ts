//server.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { scrapeProductPrices } from "./scraper.ts";

serve(async (req) => {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/search") {
        const product = url.searchParams.get("product") ?? '';
        const supermarkets = url.searchParams.get("supermarkets")?.split(",") || [];
        const results = await scrapeProductPrices(product, supermarkets);
        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
        });
    }

    // Sirve el archivo `script.js`
    if (url.pathname === "/script.js") {
        const script = await Deno.readTextFile("script.js");
        return new Response(script, {
            headers: { "Content-Type": "application/javascript" },
        });
    }

    // Sirve el archivo `index.html` por defecto
    const html = await Deno.readTextFile("index.html");
    return new Response(html, {
        headers: { "Content-Type": "text/html" },
    });
}, { port: 8000 });

console.log("Servidor escuchando en http://localhost:8000");
