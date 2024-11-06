//scraper.ts
import puppeteer, { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { ProductInfo, SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { delay } from "./Utils.ts";

export class CarrefourScraper implements SupermarketScraper {
    async scrapeProduct(search: string): Promise<ProductInfo[]> {
        const browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
            headless: false,
        });
        const page = await browser.newPage();
        const results: ProductInfo[] = [];

        try {
            await page.goto("https://www.carrefour.com.ar/", { waitUntil: 'domcontentloaded' });
            await this.performSearch(page, search);
            results.push(...await this.extractProducts(page));
        } catch (error) {
            console.error("Error scraping Carrefour:", error);
            return []
        } finally {
            await page.close();
            await browser.close();
        }

        return results;
    }

    private async performSearch(page: Page, search: string) {
        await page.waitForSelector('input');
        await delay(1000);
        await page.type('.atg_store_searchInput', search, { delay: 100 });
        await page.keyboard.press('Enter');
        await page.waitForSelector('.grid_center');
    }

    private async extractProducts(page: Page): Promise<ProductInfo[]> {
        return await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a article')).map((product) => ({
                supermarket: 'Carrefour',
                search: page.url(),
                title: product.querySelector(".t-body")?.textContent || "No encontrado",
                unit: [product.querySelector('.valtech-carrefourar-dynamic-weight-price-0-x-unit')?.textContent, +(Array.from(product.querySelectorAll('.valtech-carrefourar-dynamic-weight-price-0-x-currencyContainer span')).map(span => span.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.')] as [string, number],
                price: +(Array.from(product.querySelectorAll('.valtech-carrefourar-product-price-0-x-sellingPriceValue .valtech-carrefourar-product-price-0-x-currencyContainer span')).map(span => span.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.'),
                image: product.querySelector("img")?.getAttribute('src') || "Imagen no encontrada",
                link: "https://www.carrefour.com.ar" + product.parentElement?.parentElement?.querySelector("a")?.getAttribute('href') || "Link no encontrado"
            }));
        });
    }
}

/*
export async function scrapeCarrefour(search: string) {
    let n = 1;
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        headless: false
    });
    const results: ProductInfo[] = [];
    let url = `https://www.carrefour.com.ar/`;
    const page = await browser.newPage();
    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        await page.setExtraHTTPHeaders({
            "Accept-Language": "es-Ar,es;q=0.9",
        });

        await page.setRequestInterception(true); // Habilita la interceptación de solicitudes

        page.on('request', (request) => {
            const url = request.url();
            // Verifica si la URL contiene la ruta del script específico
            if (request.resourceType() === 'script' || url.includes('carrefourar.vtexassets.com/_v/public/assets/v1/published/bundle/public/react/asset-2642b082de53f37340bc0fc92b82436bbb466d7b.min.js')) {
                request.abort(); // Cancela la solicitud del script
            } else {
                request.continue(); // Permite otras solicitudes
            }
        });

        // Obtiene la URL redireccionada
        page.on('response', (response) => {
            const locationHeader = response.headers()['location'];
            if (locationHeader) {
                url = new URL(locationHeader, response.url()).href;  // Construimos la URL completa
            }
        });

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Espera a que se complete la recarga de la página
        //await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        // Uso de la función en el código principal
        await page.addStyleTag({ content: '.vtex-tab-layout-0-x-contentContainer { display: none !important; }' });
        await performSearchWithRedirect(page, 'input', search);

        //await page.addStyleTag({ content: '.slider { display: none !important; }' });
        console.log('Pasa ' + n++); // 1

        /*
        // Se realiza la búsqueda desde el buscador del super
        await page.waitForSelector('input');
        await delay(1000);
        console.log('Pasa' + n++); // 2
        
        await page.focus('input');
        await page.keyboard.type(search, { delay: 100 });
        await page.keyboard.press('Enter');
        
        // Espera la navegación después de presionar Enter
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        console.log('Pasa' + n++); // 3
        */
/*
       await page.addStyleTag({ content: '.dynotifyjs-wrapper, .ot-sdk-container { display: none !important; }' });
       //await page.waitForFunction(() => !document.querySelector('.slider'), { timeout: 10000 });
       await waitForSelectorWithRetry(page, 'button', 5, 10000);
       console.log('Pasa ' + n++); // 1

       // Busca y presiona el botón de precios más bajos
       await page.evaluate(() => {
           const menor = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.trim() === 'Precios más bajo');
           if (menor) {
               menor.click();
           }
       });

       // Asegúrate de obtener la última redirección después de la búsqueda
       const currentUrl = page.url();
       console.log('URL actual después de búsqueda:', currentUrl); // Muestra la URL actual

       // Espera productos
       await waitForSelectorWithRetry(page, 'a article .t-body', 5, 10000);
       await delay(3000);

       // Realiza scroll hasta el final para cargar todos los productos
       await autoScrollDown(page);
       await delay(5000);

       results.push(...products);
       console.log('Éxito en Carrefour');
   } catch (error) {
       console.log(error);
       results.length = 0;
   } finally {
       await page.close();
   }
   await browser.close();
   return results;
}
*/