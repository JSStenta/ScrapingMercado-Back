import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { scrapeProductPrices } from "./scraper.ts";

serve(
  async (req) => {
    if (req.method === "POST" && new URL(req.url).pathname === "/search") {
      const { product, supermarkets } = await req.json();
      const results = await scrapeProductPrices(product, supermarkets);
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const html = await Deno.readTextFile("index.html");
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  },
  { port: 8000 }
);

console.log("Servidor escuchando en http://localhost:8000");
