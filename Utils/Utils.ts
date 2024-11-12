import { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

// Función para hacer scroll en la página hasta el final
export async function scrollToBottom(page: Page) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            const scrollHeight = document.body.scrollHeight;
            globalThis.scrollBy(0, scrollHeight);
            resolve();
        });
    });
}

// Función para hacer scroll en la página hasta el inicio
export async function autoScrollUp(page: Page) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            const scrollHeight = document.body.scrollHeight;
            globalThis.scrollBy(scrollHeight, 0);
            resolve();
        });
    });
}

// Función para esperar un tiempo
export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para esperar por un selector
export async function waitForSelectorWithRetry(page: Page, selector: string, maxAttempts = 3, delayMs = 3000) {
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

// Función para realizar una busqueda con intentos
export async function performSearchWithRedirect(page: Page, selector: string, search: string, maxRetries: number = 5): Promise<void> {
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
            if (await page.$(selector) || await page.evaluate((param: string) => { return ((document.querySelector(param) as HTMLInputElement).value == '') }, selector)) {
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

export function priceToNumber(price: string): number {
    
    return +price.replace("$", "").replace(",", ".");
}