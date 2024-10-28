//scraper.ts
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

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
    let results: ProductInfo[] = [];
    for (const supermarket of supermarkets) {
        switch (supermarket) {
            case 'coto':
                const cotoResults = await scrapeCoto(product);
                results.push(...cotoResults);
                break;
            case 'carrefour':
                const carrefourResults = await scrapeCarrefour(product);
                results.push(...carrefourResults);
                break;
            default:
                // Simulando el scraping y devolviendo un objeto de ejemplo.
                results.push({
                    supermarket,
                    title: "Nombre del producto",
                    price: "Precio de ejemplo",
                    unit: "Unidad de ejemplo",
                    image: "https://example.com/image.png",
                    link: "https://example.com/producto",
                });
                break;
        }
    }


    return results;
}

export async function scrapeCoto(search: string): Promise<ProductInfo[]> {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 200,
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'
    });
    const results: ProductInfo[] = [];
    const page = await browser.newPage();
    const url = `https://www.cotodigital3.com.ar/sitios/cdigi/browse?_dyncharset=utf-8&Dy=1&Ntt=${encodeURIComponent(search)}&Nty=1&Ntk=&siteScope=ok&_D%3AsiteScope=+&atg_store_searchInput=${encodeURIComponent(search)}&idSucursal=064&_D%3AidSucursal=+&search=Ir&_D%3Asearch=+&_DARGS=%2Fsitios%2Fcartridges%2FSearchBox%2FSearchBox.jsp`;
    console.log(url);

    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        await page.setExtraHTTPHeaders({
            "Accept-Language": "es-Ar,es;q=0.9",
        });
        await page.goto(url, { waitUntil: 'load' });
        await page.evaluate(() => {
            const menor = Array.from(document.querySelectorAll('option')).find(option => option.textContent.trim() === 'Precio: de menor a mayor');
            if (menor) {
                menor.selected = true; // Selecciona la opción en el DOM
                menor.parentElement.dispatchEvent(new Event('change')); // Dispara el evento "change"
            }
        });
        await page.waitForNavigation();
        
        const products = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".leftList")).map((product) => ({
                supermarket: 'Coto',
                title:
                    product.querySelector(".descrip_full")?.textContent ||
                    "No encontrado",
                unit:
                    product.querySelector(".unit")?.textContent || "Unidad no encontrada",
                price:
                    product.querySelector(".atg_store_newPrice")?.textContent ||
                    "Precio no encontrado",
                image:
                    product
                        .querySelector(".atg_store_productImage img")
                        ?.getAttribute("src") || "Imagen no encontrada",
                link:
                    "https://www.cotodigital3.com.ar" +
                    product.querySelector("a")?.getAttribute("href") ||
                    "Link no encontrado",
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
        slowMo: 200,
    });
    const results: ProductInfo[] = [];
    const page = await browser.newPage();
    const url = `https://www.carrefour.com.ar/${encodeURIComponent(search)}?_q=${encodeURIComponent(search)}&map=ft&order=OrderByPriceASC`;
    console.log(url);

    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        await page.setExtraHTTPHeaders({
            "Accept-Language": "es-Ar,es;q=0.9",
        });
        await page.goto(url);

        const products = await page.evaluate(() => {
            console.log('entro al evaluate');
            return Array.from(document.querySelectorAll('a article')).map((product) => ({
                supermarket: 'Carrefour',
                title:
                    product.querySelector(".t-body")?.textContent ||
                    "No encontrado",
                /*
                unit: //Arreglar
                    product.querySelector(".unit")?.textContent || "Unidad no encontrada",*/
                price: //Arreglar
                    Array.from(product.querySelectorAll('.valtech-carrefourar-product-price-0-x-currencyContainer span')).map(span => span.textContent.trim()).join('') ||
                    "Precio no encontrado",
                image:
                    product.querySelector("img")?.getAttribute('src') || "Imagen no encontrada",
                /*
                link: //Arreglar
                    "https://www.cotodigital3.com.ar" +
                    product.querySelector("a")?.getAttribute("href") ||
                    "Link no encontrado",*/
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