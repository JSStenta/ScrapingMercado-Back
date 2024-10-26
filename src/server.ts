import { serve } from "https://deno.land/std/http/server.ts";
import puppeteer from "https://deno.land/x/puppeteer/mod.ts";

// Función para manejar el delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Función para manejar el scraping de productos
const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  // Cargar index.html para la ruta raíz
  if (url.pathname === "/") {
    const html = await Deno.readTextFile("public/index.html");
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Cargar archivos estáticos desde la carpeta `public`
  if (url.pathname.startsWith("/")) {
    try {
      const filePath = `public${url.pathname}`;
      const fileContent = await Deno.readTextFile(filePath);

      // Determinar el tipo de contenido del archivo solicitado
      let contentType = "text/plain";
      if (filePath.endsWith(".html")) contentType = "text/html";
      else if (filePath.endsWith(".js")) contentType = "application/javascript";
      else if (filePath.endsWith(".css")) contentType = "text/css";

      return new Response(fileContent, {
        headers: { "Content-Type": contentType },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  }

  // Manejar la solicitud de scraping
  if (url.pathname === "/scrape" && req.method === "POST") {
    console.log("Solicitud POST recibida en /scrape");
    const body = await req.text();
    const { searchTerm, store } = JSON.parse(body);

    let results: any[] = [];

    if (store === "coto") {
      results = await scrapeCoto(searchTerm);
    } else if (store === "carrefour") {
      results = await scrapeCarrefour(searchTerm);
    }

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Si la ruta no coincide, retornar 404
  return new Response("Not Found", { status: 404 });
};

// Función para hacer scraping en la tienda Coto usando Puppeteer
const scrapeCoto = async (search: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results: any[] = [];

  // URL de búsqueda en Coto
  const url = `https://www.cotodigital3.com.ar/sitios/cdigi/browse?_dyncharset=utf-8&Dy=1&Ntt=${encodeURIComponent(
    search
  )}&Nty=1&Ntk=&siteScope=ok&_D%3AsiteScope=+&atg_store_searchInput=${encodeURIComponent(
    search
  )}&idSucursal=064&_D%3AidSucursal=+&search=Ir&_D%3Asearch=+&_DARGS=%2Fsitios%2Fcartridges%2FSearchBox%2FSearchBox.jsp`;

  await page.goto(url, { waitUntil: "networkidle2" });

  // Extraer productos de la página
  const products = await page.evaluate(() => {
    const productElements = Array.from(document.querySelectorAll(".leftList"));
    return productElements.map((product) => ({
      title:
        product.querySelector(".descrip_full")?.textContent || "No encontrado",
      unit:
        product.querySelector(".unit")?.textContent || "Precio no encontrado",
      price:
        product.querySelector(".atg_store_newPrice")?.textContent ||
        "Precio no encontrado",
      image:
        product
          .querySelector(".atg_store_productImage img")
          ?.getAttribute("src") || "Imagen no encontrada",
      link:
        "https://www.cotodigital3.com.ar/" +
          product.querySelector("a")?.getAttribute("href") ||
        "Link no encontrado",
    }));
  });

  results.push(...products);

  await browser.close();
  return results;
};

// Función para hacer scraping en Carrefour (ejemplo)
const scrapeCarrefour = async (search: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results: any[] = [];

  const url = `https://www.carrefour.es/search/?query=${encodeURIComponent(
    search
  )}`;
  await page.goto(url, { waitUntil: "networkidle2" });

  // Extraer productos de Carrefour
  const products = await page.evaluate(() => {
    const productElements = Array.from(document.querySelectorAll(".product"));
    return productElements.map((product) => ({
      title: product.querySelector(".title")?.textContent || "No encontrado",
      price:
        product.querySelector(".price")?.textContent || "Precio no encontrado",
      image:
        product.querySelector("img")?.getAttribute("src") ||
        "Imagen no encontrada",
    }));
  });

  results.push(...products);
  await browser.close();
  return results;
};

console.log("Server running on http://localhost:8000");
serve(handler, { port: 8000 });
