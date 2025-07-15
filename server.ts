//server.ts
/// <reference lib="deno.ns" />
import { Application } from "jsr:@oak/oak/application";
import { Router } from "jsr:@oak/oak/router";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { scrapeProductPrices } from "./Scrapers/ScrapreProductPrices.ts";
import { SupermarketError, ScraperError } from "./Utils/errorHandler.ts";

const app = new Application();
const router = new Router();
const host = Deno.env.get("HOST") ?? "127.0.0.1";
const puerto = parseInt(Deno.env.get("PUERTO") ?? "8000");
const front = Deno.env.get("FRONT");

// Configurar CORS
app.use(oakCors({ origin: front ?? "*" }));

// Definir la ruta de búsqueda
router.get("/buscar", async (context) => {
    const producto = context.request.url.searchParams.get("producto");
    const supermercados = context.request.url.searchParams.get("supermercados")?.split(",") ?? [];
    console.log(context.request.url);

    if (producto) {
        try {
            const results = await scrapeProductPrices(producto, supermercados);
            context.response.status = 200;
            context.response.headers.set("Content-Type", "application/json");
            context.response.body = JSON.stringify(results);
        } catch (error) {
            console.error("Error en /buscar:", error);
            context.response.body =
                (error instanceof SupermarketError) ?
                    { error: "Invalid supermarket provided" } :
                    (error instanceof ScraperError) ?
                        { error: `Error scraping ${supermercados}` } :
                        { error: "Unknown error occurred" };
            context.response.status = 500;
        }
    } else {
        context.response.status = 400;
        context.response.body = { error: "Product parameter is required" };
    }
});

// Usar el router en la aplicación
app.use(router.routes());
app.use(router.allowedMethods());

// Iniciar el servidor en el puerto 8000
app.addEventListener("listen", () => {
    console.log(`Servidor escuchando en ${host}:${puerto}`);
});

await app.listen({ hostname: host, port: puerto });