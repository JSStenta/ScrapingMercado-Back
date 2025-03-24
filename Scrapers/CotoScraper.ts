/**
 * @prettier
 */
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";

export class CotoScraper implements SupermarketScraper {
	async scrapeProduct(search: string): Promise<ProductInfo[]> {
		console.log("Buscando en Coto");
		try {
			const cantidad = (await fetchCoto(search))["totalNumRecs"];
			if (!cantidad) throw new Error("No se encontraron productos en Coto");

			const productos = (await fetchCoto(search, cantidad)).records;
			const url = `https://www.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Nrpp=${cantidad}&Ntt=${search}`;

			const salida: ProductInfo[] = productos.map((item: any) => {
				const path = item.records[0];
				try {
					const producto = {
						supermarket: "Coto",
						search: url,
						title: path.attributes["product.displayName"][0],
						price: parseFloat(
							JSON.parse(
								path.attributes["product.dtoDescuentos"][0]
							)[0]?.precioDescuento.replace("$", "") ??
								path.attributes["sku.activePrice"]
						),
						unit: [
							path.attributes["product.cFormato"] ?? undefined,
							parseFloat(path.attributes["sku.referencePrice"] ?? undefined),
						] as [string, number],
						image: path.attributes["product.mediumImage.url"][0] ?? "",
						link: `https://www.cotodigital.com.ar/sitios/cdigi/productos${(
							item.detailsAction["recordState"] ??
							path.detailsAction["recordState"]
						).replace("format=json", "")}`,
					};
					return producto;
				} catch (e) {
					console.error("Error en coto", e);
				}
			});
			return salida ?? [];
		} catch (_) {
			return [];
		}
	}
}
async function fetchCoto(search: string, cantidad = 1) {
	const response = await (
		await fetch(
			`https://www.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Nrpp=${cantidad}&Ntt=${search}&format=json`
		)
	).json();
	const largo = response.contents[0].Main.length - 1;
	return response.contents[0].Main[largo].contents[0];
}
