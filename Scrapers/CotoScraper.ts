import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";

export class CotoScraper implements SupermarketScraper {
    async scrapeProduct(search: string): Promise<ProductInfo[]> {
        try {
            const unidad = (await import(`https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Nrpp=1&Ntt=${search}&format=json`, { with: { type: "json" } }));
            const cantidad = (unidad.default.contents?.[0].Main?.[1] ?? unidad.default.contents?.[0].Main?.[0]).contents?.[0]?.['totalNumRecs'];
            if (cantidad == 0) {
                throw new Error;
            }
            const url = `https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Nrpp=${cantidad}&Ntt=${search}&format=json`;

            const resultados = await import(url, { with: { type: "json" } });
            const productos = (resultados?.default?.contents?.[0]?.Main?.[1] ?? resultados?.default?.contents?.[0]?.Main?.[0]).contents?.[0]?.records;

            const salida: ProductInfo[] = productos
                .map((item: any) => ({
                    supermarket: 'Coto',
                    search: url.replace('&format=json', ''),
                    title: item.records?.[0].attributes["product.displayName"]?.[0],
                    price: parseFloat(JSON.parse(item.records?.[0].attributes["product.dtoDescuentos"])[0]?.precioDescuento.replace('$', '') ?? item.records?.[0].attributes["sku.activePrice"]),
                    unit: [(item.records?.[0].attributes["product.cFormato"] ?? undefined), parseFloat(item.records?.[0]?.attributes["sku.referencePrice"] ?? undefined)] as [string, number],
                    image: item.records?.[0].attributes["product.mediumImage.url"]?.[0] ?? "",
                    link: `https://api.cotodigital.com.ar/sitios/cdigi/productos${item.detailsAction["recordState"].replace('format=json', '')}`
                }));
            return salida;
        } catch (_) {
            return [];
        }
    }
}
