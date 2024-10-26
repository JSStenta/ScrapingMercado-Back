import { serve } from "https://deno.land/std/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// Función para manejar el delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Función para manejar el scraping de productos
const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  // Cargar index.html para la ruta raíz
  if (url.pathname === "/") {
    const html = await Deno.readTextFile("index.html");
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Cargar script.js para las solicitudes de script
  if (url.pathname === "/script.js") {
    const js = await Deno.readTextFile("script.js");
    return new Response(js, {
      headers: { "Content-Type": "application/javascript" },
    });
  }

  // Manejar la solicitud de scraping
  if (url.pathname === "/scrape" && req.method === "POST") {
    const body = await req.text();
    const { searchTerm, store } = JSON.parse(body);

    let results: any[] = [];

    // Función para buscar productos en una tienda específica
    const scrapeStore = async (url: string) => {
      const response = await fetch(url);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      if (doc) {
        // Filtrar productos según la estructura de la página
        const products = Array.from(doc.querySelectorAll(".product")).map(
          (product) => ({
            title: product.querySelector(".title")?.textContent,
            price: product.querySelector(".price")?.textContent,
            image: product.querySelector("img")?.src,
          })
        );
        results = [...results, ...products];
      }
    };

    // URLs de las tiendas (Ejemplo)
    if (store === "coto") {
      results = await scrapeCoto(searchTerm);
    } else if (store === "carrefour") {
      await scrapeStore(
        `https://www.carrefour.es/search/?query=${encodeURIComponent(
          searchTerm
        )}`
      );
    }

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Si la ruta no coincide, retornar 404
  return new Response("Not Found", { status: 404 });
};

const scrapeCoto = async (search: string) => {
  let results: any[] = [];

  // Agrega el delay antes de la solicitud
  await delay(2000);
  const url = `https://www.cotodigital3.com.ar/sitios/cdigi/browse?_dyncharset=utf-8&Dy=1&Ntt=${encodeURIComponent(
    search
  )}&Nty=1&Ntk=&siteScope=ok&_D%3AsiteScope=+&atg_store_searchInput=${encodeURIComponent(
    search
  )}&idSucursal=064&_D%3AidSucursal=+&search=Ir&_D%3Asearch=+&_DARGS=%2Fsitios%2Fcartridges%2FSearchBox%2FSearchBox.jsp`;

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    },
  });
  const html = await response.text();
  console.log(url);

  const doc = new DOMParser().parseFromString(html, "text/html");

  if (doc) {
    // Filtrar productos según la estructura de la página
    const products = Array.from(doc.querySelectorAll(".leftList")).map(
      (product) => ({
        title:
          product.querySelector(".descrip_full")?.textContent ||
          "No encontrado",
        unit:
          product.querySelector(".unit")?.textContent || "Precio no encontrado",
        price:
          product.querySelector(".atg_store_newPrice")?.textContent ||
          "Precio no encontrado",
        image:
          product
            .querySelector(".atg_store_productImage")
            .querySelector("img")
            ?.getAttribute("src") || "Imagen no encontrada",
        link:
          "https://www.cotodigital3.com.ar/" +
            product.querySelector("a")?.getAttribute("href") ||
          "Link no encontrado",
      })
    );
    await delay(2000);

    // Verifica si los datos están bien capturados
    /*products.forEach((elem) => {
      console.log("Producto encontrado:", elem);
    });*/
    results = [...results, ...products];
  }
  return results;
};

console.log("Server running on http://localhost:8000");
serve(handler, { port: 8000 });
