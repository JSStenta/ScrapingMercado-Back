//scraper.ts
import puppeteer, { HTTPRequest, Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

interface ProductInfo {
    supermarket: string;
    search: string;
    title: string;
    price: number;
    unit?: [string, number];
    image: string;
    link: string;
}

export async function scrapeProductPrices(
    product: string,
    supermarkets: string[]
): Promise<ProductInfo[]> {
    const results: ProductInfo[] = [];
    //const scrapePromises: Promise<ProductInfo[]>[] = []; Para guardar el scraping paralelo

    for (const supermarket of supermarkets) {
        switch (supermarket) {
            case 'coto':
                console.log('Scrapeando Coto...')
                //scrapePromises.push(scrapeCoto(product)); Scraping paralelo
                results.push(...await scrapeCoto(product));
                break;
            case 'carrefour':
                console.log('Scrapeando Carrefour...')
                //scrapePromises.push(scrapeCarrefour(product)); Scraping paralelo
                results.push(...await scrapeCarrefour(product));
                break;
            case 'el-nene':
                console.log('Scrapeando El Nene...')
                //scrapePromises.push(scrapeElNene(product)); Scraping paralelo
                results.push(...await scrapeElNene(product));
                break;
            default: {
                // Simulando el scraping y devolviendo un objeto de ejemplo.
                const exampleResult = {
                    supermarket,
                    title: "Nombre del producto",
                    search: "https://example.com/" + supermarket,
                    price: 0,
                    unit: ["Unidad de ejemplo", 1] as [string, number],
                    image: "https://example.com/image.png",
                    link: "https://example.com/" + product,
                };
                results.push(exampleResult);
                break;
            }
        }
    }

    return results.sort((a, b) => a.price - b.price);
}

//Funcion para buscar productos en Coto
export async function scrapeCoto(search: string): Promise<ProductInfo[]> {
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        headless: false,
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
        //Se realiza la busqueda desde el buscador del super
        await waitForSelectorWithRetry(page, '.atg_store_searchInput', 5, 10000);
        await page.focus('.atg_store_searchInput');
        await page.keyboard.type(search);
        await page.keyboard.press('Enter');
        await waitForSelectorWithRetry(page, '.grid_center', 5, 10000);
        await page.evaluate(() => {
            if (Array.from(document.querySelectorAll('h3')).find(encuentrant => encuentrant.textContent?.trim() === 'No se han encontrado artículos coincidentes') !== undefined) { throw new Error("No se han encontrado artículos coincidentes"); }
            else {
                const menor = Array.from(document.querySelectorAll('option')).find(option => option.textContent?.trim() === 'Precio: de menor a mayor');
                if (menor) {
                    menor.selected = true; // Selecciona la opción en el DOM
                    menor.parentElement?.dispatchEvent(new Event('change')); // Dispara el evento "change"
                }
            }
        });
        await waitForSelectorWithRetry(page, '.leftList', 5, 10000);

        const products = await page.evaluate((url: string) => {
            return Array.from(document.querySelectorAll(".leftList")).map((product) => ({
                supermarket: 'Coto',
                search: url,
                title: product.querySelector(".descrip_full")?.textContent || "No encontrado",
                unit: [product.querySelector(".unit")?.textContent?.split(':')[0], +(product.querySelector(".unit")?.textContent?.split(':')[1] ?? '0')] as [string, number],
                price: +(product.querySelector(".atg_store_newPrice")?.textContent ?? '0').replace('$', '').replace('.', '').replace(',', '.'),
                image: product.querySelector(".atg_store_productImage img")?.getAttribute("src") || "Imagen no encontrada",
                link: "https://www.cotodigital3.com.ar" + product.querySelector("a")?.getAttribute("href") || "Link no encontrado",
            }));
        }, page.url());
        results.push(...products);
        console.log('Exito en Coto');
    } catch (error) {
        results.length = 0;
    } finally {
        await page.close();
    }
    await browser.close();
    return results;
}

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

        const products = await page.evaluate((currentUrl: string) => {
            return Array.from(document.querySelectorAll('a article')).map((product) => ({
                supermarket: 'Carrefour',
                search: currentUrl, // Usar la URL actual
                title: product.querySelector(".t-body")?.textContent || "No encontrado",
                unit: [product.querySelector('.valtech-carrefourar-dynamic-weight-price-0-x-unit')?.textContent, +(Array.from(product.querySelectorAll('.valtech-carrefourar-dynamic-weight-price-0-x-currencyContainer span')).map(span => span.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.')] as [string, number],
                price: +(Array.from(product.querySelectorAll('.valtech-carrefourar-product-price-0-x-sellingPriceValue .valtech-carrefourar-product-price-0-x-currencyContainer span')).map(span => span.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.'),
                image: product.querySelector("img")?.getAttribute('src') || "Imagen no encontrada",
                link: "https://www.carrefour.com.ar" + product.parentElement?.parentElement?.querySelector("a")?.getAttribute('href') || "Link no encontrado"
            }));
        }, currentUrl); // Pasar la URL actual

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


export async function scrapeElNene(search: string) {
    let n = 1;
    const browser = await puppeteer.launch({
        executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        headless: false
    });
    const results: ProductInfo[] = [];
    const url = `https://www.grupoelnene.com.ar/${encodeURI(search)}?_q${search.replaceAll(' ', '+')}&map=ft&order=OrderByPriceASC`;
    const page = await browser.newPage();
    try {
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
        await page.setExtraHTTPHeaders({
            "Accept-Language": "es-Ar,es;q=0.9",
        });

        await page.goto(url, { waitUntil: "load" });
        await page.addStyleTag({ content: '.vtex-flex-layout-0-x-stretchChildrenWidth { display: none !important; }' });
        console.log('Pasa' + n++); // 1

        // Espera productos
        await waitForSelectorWithRetry(page, 'a article .t-body', 5, 10000);

        // Revisa productos
        const products = await page.evaluate((currentUrl: string) => {
            return Array.from(document.querySelectorAll('a article')).map((product) => ({
                supermarket: 'El Nene',
                search: currentUrl, // Usar la URL actual
                title: product.querySelector(".t-body")?.textContent || "No encontrado",
                //unit: ["Precio no encontrado", undefined] as [string, number],
                price: +(Array.from(product.querySelectorAll('.vtex-product-price-1-x-sellingPriceValue .vtex-product-price-1-x-currencyContainer span')).map(span => span.textContent?.trim()).join('')).replace('$', '').replace('.', '').replace(',', '.'),
                image: product.querySelector("img")?.getAttribute('src') || "Imagen no encontrada",
                link: "https://www.grupoelnene.com.ar" + product.parentElement?.parentElement?.querySelector("a")?.getAttribute('href') || "Link no encontrado"
            }));
        }, page.url()); // Pasa la URL actual

        results.push(...products);
        console.log('Éxito en El Nene');
    } catch (error) {
        console.log(error);
        results.length = 0;
    } finally {
        await page.close();
    }
    await browser.close();
    return results;
}

// Función para hacer scroll en la página hasta el inicio
async function autoScrollDown(page: Page) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            const scrollHeight = document.body.scrollHeight;
            globalThis.scrollBy(0, scrollHeight);
            resolve();
        });
    });
}

// Función para hacer scroll en la página hasta el final
async function autoScrollUp(page: Page) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(1000, 0);
            resolve();
        });
    });
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForSelectorWithRetry(page: Page, selector: string, maxAttempts = 3, delayMs = 5000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await page.waitForSelector(selector, { timeout: delayMs });
            return true; // Si encuentra el selector, salimos del bucle
        } catch (error) {
            if (attempt < maxAttempts) {
                console.log(`Intento ${attempt} fallido, recargando la página...`);
                await page.reload({ waitUntil: "domcontentloaded" });
            } else {
                console.error(`Error: No se pudo encontrar el selector "${selector}" después de ${maxAttempts} intentos.`);
                throw error;
            }
        }
    }
}

async function performSearchWithRedirect(page: Page, selector: string, search: string, maxRetries: number = 5): Promise<void> {
    let redirectSuccess = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Espera a que el campo de búsqueda esté disponible
            await page.waitForSelector(selector, { timeout: 5000 });
            await delay(1000); // Espera un segundo antes de continuar

            console.log(`Intento de búsqueda #${attempt}`);

            await page.focus(selector);
            await page.keyboard.type(search, { delay: 100 });
            await page.keyboard.press('Enter');

            // Espera un momento para darle tiempo a la página de redirigir
            await delay(5000);

            // Verifica si estás en la página de resultados comprobando la URL o un elemento específico
            if (await page.$('a article .t-body') || await page.evaluate((param: string) => { return ((document.querySelector(param) as HTMLInputElement).value == '') }, selector)) {
                console.log('Redirección exitosa');
                redirectSuccess = true;
                break; // Salimos del bucle si la redirección es exitosa
            } else {
                console.log('Redirección no completada, reintentando...');
            }
        } catch (error) {
            console.log('Error durante la búsqueda o la redirección:', error);
        }
    }

    if (!redirectSuccess) {
        throw new Error('No se pudo redirigir a la página de resultados después de varios intentos');
    }
}