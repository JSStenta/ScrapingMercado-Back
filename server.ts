//server.ts
/// <reference lib="deno.ns" />
import { scrapeProductPrices } from "./Scrapers/ScrapreProductPrices.ts";
import { SupermarketError, ScraperError } from "./Utils/errorHandler.ts";

const puerto = parseInt(Deno.env.get("PUERTO") ?? "8000");
const front = Deno.env.get("FRONT");

Deno.serve({
    port: puerto,
    handler: async (request) => {
        const url = new URL(request.url);

        if (url.pathname === "/buscar" && request.method === "GET") {
            const producto = url.searchParams.get("producto");
            const supermercados = url.searchParams.get("supermercados")?.split(",") ?? [];

            if (!producto) {
                return new Response(JSON.stringify({ error: "Product parameter is required" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }

            try {
                const resultados = await scrapeProductPrices(producto, supermercados);
                return new Response(JSON.stringify(resultados), {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": front,
                    },
                });
            } catch (error) {
                console.error("Error en /buscar:", error);
                const body =
                    (error instanceof SupermarketError)
                        ? { error: "Invalid supermarket provided" }
                        : (error instanceof ScraperError)
                            ? {
                                error: `Error scraping ${supermercados}`
                            }
                            : { error: "Unknown error occurred" };
                return new Response(JSON.stringify(body), {
                    status: 500,
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": front },
                });
            }
        }
        return new Response("Not Found", { status: 404 });
    }
})