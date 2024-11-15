//server.ts
/// <reference lib="deno.ns" />

import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { scrapeProductPrices } from "./Scrapers/ScrapreProductPrices.ts";
import { SupermarketError, ScraperError } from "./Utils/errorHandler.ts";

const app = new Application();
const router = new Router();

// Configurar CORS
app.use(oakCors({ origin: "http://localhost:3000" }));

// Definir la ruta de búsqueda
router.get("/search", async (context) => {
    const product = context.request.url.searchParams.get("product");
    const supermarkets = context.request.url.searchParams.get("supermarkets")?.split(",");
    console.log(context.request.url);

    if (product && supermarkets) {
        try {
            const results = await scrapeProductPrices(product, supermarkets);
            context.response.status = 200;
            context.response.headers.set("Content-Type", "application/json");
            context.response.body = JSON.stringify(results);
        } catch (error) {
            context.response.body =
                (error instanceof SupermarketError) ?
                    { error: "Invalid supermarket provided" } :
                (error instanceof ScraperError) ?
                    { error: `Error scraping ${supermarkets}` } :
                        { error: "Unknown error occurred" };
            context.response.status = 500;
        }
    } else {
        context.response.status = 400;
        context.response.body = { error: "Product and supermarkets parameters are required" };
    }
});

// Ruta para `script.js`
router.get("/script.js", async (context) => {
    const script = await Deno.readTextFile("script.js");
    context.response.headers.set("Content-Type", "application/javascript");
    context.response.body = script;
});

// Ruta para servir `index.html` por defecto
router.get("/", async (context) => {
    const html = await Deno.readTextFile("index.html");
    context.response.headers.set("Content-Type", "text/html");
    context.response.body = html;
});

// Usar el router en la aplicación
app.use(router.routes());
app.use(router.allowedMethods());

// Iniciar el servidor en el puerto 8000
app.addEventListener("listen", () => {
    console.log("Servidor escuchando en http://localhost:8000");
});

await app.listen({ port: 8000 });
