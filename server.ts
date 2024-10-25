//server.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// Función de validación de URL
function isValidUrl(url: string): boolean {
    try {
        new URL(url); // Intenta crear un objeto URL para verificar si es válida
        return true;
    } catch {
        return false;
    }
}

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);

    if (url.pathname === "/script.js") {
        const js = await Deno.readTextFile("script.js");
        return new Response(js, {
            headers: { "Content-Type": "application/javascript" },
        });
    }

    if (url.pathname === "/scrape" && req.method === "POST") {
        const body = await req.text();
        const { url } = JSON.parse(body);

        // Validación de la URL
        if (!isValidUrl(url)) {
            return new Response(JSON.stringify({ error: "URL inválida" }), {
                headers: { "Content-Type": "application/json" },
                status: 400,
            });
        }

        try {
            const response = await fetch(url);
            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, "text/html");

            if (doc) {
                const titles = Array.from(doc.querySelectorAll("h1, h2, h3")).map(
                    (title) => title.textContent
                );
                return new Response(JSON.stringify(titles), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                });
            } else {
                return new Response(JSON.stringify([]), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                });
            }
        } catch (error) {
            return new Response(JSON.stringify({ error: "Error al obtener la URL" }), {
                headers: { "Content-Type": "application/json" },
                status: 500,
            });
        }
    } else {
        const html = await Deno.readTextFile("index.html");
        return new Response(html, {
            headers: { "Content-Type": "text/html" },
        });
    }
};

console.log("Server running on http://localhost:8000");
serve(handler, { port: 8000 });