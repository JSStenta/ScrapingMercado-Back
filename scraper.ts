//scraper.ts
import { CHAR_0 } from "https://deno.land/std@0.93.0/path/_constants.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import type { BrowserFetcher } from "https://deno.land/x/puppeteer@16.2.0/src/deno/BrowserFetcher.ts";

interface ProductInfo {
    supermarket: string;
    title: string;
    price: string;
    unit: string;
    image: string;
    link: string;
}

export async function scrapeProductPrices(
    product: string,
    supermarkets: string[]
): Promise<ProductInfo[]> {
    const results: ProductInfo[] = [];
    const scrapePromises: Promise<ProductInfo[]>[] = [];

    for (const supermarket of supermarkets) {
        switch (supermarket) {
            case 'coto':
                scrapePromises.push(scrapeCoto(product));
                break;
            case 'carrefour':
                scrapePromises.push(scrapeCarrefour(product));
                break;
            default: {
                // Simulando el scraping y devolviendo un objeto de ejemplo.
                const exampleResult = {
                    supermarket,
                    title: "Nombre del producto",
                    price: "Precio de ejemplo",
                    unit: "Unidad de ejemplo",
                    image: "https://example.com/image.png",
                    link: "https://example.com/producto",
                };
                results.push(exampleResult);
                break;
            }
        }
    }

    // Esperar a que todas las promesas se resuelvan
    const scrapedResults = await Promise.all(scrapePromises);

    // Aplanar el array de resultados y añadirlos a results
    for (const result of scrapedResults) {
        results.push(...result);
    }

    return results.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
}

//Funcion para buscar productos en Coto
export async function scrapeCoto(search: string): Promise<ProductInfo[]> {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        headless: false,
        slowMo: 100
    });
    const results: ProductInfo[] = [];
    const page = await browser.newPage();
    const url = `https://www.cotodigital3.com.ar/sitios/cdigi/`;

    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        await page.setExtraHTTPHeaders({
            "Accept-Language": "es-Ar,es;q=0.9",
        });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('.atg_store_searchInput'); // Espera a que se cargue el primer artículo
        /*
                await page.evaluate((searchTerm: string) => {
                    const busqueda = document.querySelector('.atg_store_searchInput');
                    busqueda.textContent = searchTerm;
                    busqueda.value = searchTerm;
                }, search);*/

        await page.focus('.atg_store_searchInput');
        await page.keyboard.type(search);
        await page.keyboard.press('Enter');
        await page.waitForSelector('.leftList');
        await page.evaluate(() => {
            const menor = Array.from(document.querySelectorAll('option')).find(option => option.textContent.trim() === 'Precio: de menor a mayor');
            if (menor) {
                menor.selected = true; // Selecciona la opción en el DOM
                menor.parentElement.dispatchEvent(new Event('change')); // Dispara el evento "change"
            }
        });
        await page.waitForSelector('.leftList'); // Espera a que se cargue el primer artículo

        const products = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".leftList")).map((product) => ({
                supermarket: 'Coto',
                title: product.querySelector(".descrip_full")?.textContent || "No encontrado",
                unit: product.querySelector(".unit")?.textContent || "Unidad no encontrada",
                price: (product.querySelector(".atg_store_newPrice")?.textContent).replace('$', '').replace('.', '').replace(',', '.') || "Precio no encontrado",
                image: product.querySelector(".atg_store_productImage img")?.getAttribute("src") || "Imagen no encontrada",
                link: "https://www.cotodigital3.com.ar" + product.querySelector("a")?.getAttribute("href") || "Link no encontrado",
            }));
        });
        results.push(...products);
    } catch (error) {
        console.error(`Error en el scraping de Coto: ${error}`);
    } finally {
        await page.close();
    }
    await browser.close();
    return results;
}

export async function scrapeCarrefour(search: string) {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        headless: false,
        slowMo: 100
    });
    const results: ProductInfo[] = [];
    const page = await browser.newPage();
    const url = `https://www.carrefour.com.ar/${search.replaceAll(' ', '+')}?_q=${search.replaceAll(' ', '+')}&map=ft&order=OrderByPriceASC`;
    console.log(url);

    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        await page.setExtraHTTPHeaders({
            "Accept-Language": "es-Ar,es;q=0.9",
        });
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.waitForSelector('a article'); // Espera a que se cargue el primer artículo

        // Realizar scroll hasta el final para cargar todos los productos
        await page.evaluate(() => {
            const menor = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === 'Precios más bajo');
            if (menor) {
                menor.click();
            }
        });
        await page.waitForSelector('a article'); // Espera a que se cargue el primer artículo

        await autoScroll(page);
        await delay(5000);

        const products = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a article')).map((product) => ({
                supermarket: 'Carrefour',
                title: product.querySelector(".t-body")?.textContent || "No encontrado",
                unit: Array.from(product.querySelectorAll('.valtech-carrefourar-dynamic-weight-price-0-x-currencyContainer span')).map(span => span.textContent.trim()).join('') || "Precio no encontrado",
                price: (Array.from(product.querySelectorAll('.valtech-carrefourar-product-price-0-x-sellingPriceValue .valtech-carrefourar-product-price-0-x-currencyContainer span')).map(span => span.textContent.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.') || "Precio no encontrado",
                image: product.querySelector("img")?.getAttribute('src') || "Imagen no encontrada",
                link: "https://www.carrefour.com.ar" + product.parentElement.parentElement.querySelector("a").getAttribute('href') || "Link no encontrado"
            }));
        });
        results.push(...products);
    } catch (error) {
        console.error(`Error en el scraping de Carrefour: ${error}`);
    } finally {
        await page.close();
    }
    await browser.close();
    return results;
}

export async function scrapeTest(search: string) {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 500,
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'
    });
    const results: ProductInfo[] = [];
    const page = await browser.newPage();
    let url = `https://www.cotodigital3.com.ar/`;

    // Capturamos la URL del redireccionamiento
    page.on('response', response => {
        if (response.status() === 302 || response.status() === 301) {  // Detecta códigos de redirección
            url = response.headers().location;
        }
    });
    await page.goto(url);
    await page.close();
    await browser.close();
    console.log(baseURI);
}

// Función para hacer scroll en la página hasta el final
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, scrollHeight);
            resolve();
        });
    });
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function redirect(url: string, page) {
    let redirected = url;
    try {
        do {
            await page.goto(redirected, { waitUntil: "load" });
            page.on('response', response => {
                redirected = (response.status() === 302 || response.status() === 301) ? response.headers().location : url;
                console.log(redirected);
            });
        } while (redirected == url)
    } catch (error) {
        console.error(`Error en el scraping de Coto: ${error}`);
    }
}