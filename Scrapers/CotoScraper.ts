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
			console.log(url + "&format=json");

			const salida = formatearProductos(productos, url);
			return salida ?? [];
		} catch (_) {
			return [];
		}
	}
}

function formatearProductos(productos: any[], busqueda: string): ProductInfo[] {
	return productos.map((item): ProductInfo => {
		const path = item.records[0];
		const precio = path.attributes["sku.activePrice"];
		const precioDescuento =
			JSON.parse(
				path.attributes["product.dtoDescuentos"][0]
			)[0]?.precioDescuento.replace("$", "") ?? undefined;
		const precioUnidad = parseFloat(path.attributes["sku.referencePrice"]);
		return {
			supermercado: "Coto",
			busqueda: busqueda,
			titulo: path.attributes["product.displayName"][0],
			precio: parseFloat(precioDescuento ?? precio),
			unidad: path.attributes["product.cFormato"]?.[0],
			precioUnidad: precioUnidad
				? precioDescuento
					? (parseFloat(precioDescuento) / parseFloat(precio)) * precioUnidad
					: precioUnidad
				: undefined,
			imagen: path.attributes["product.largeImage.url"][0] ?? "",
			enlace: `https://www.cotodigital.com.ar/sitios/cdigi/productos${(
				item.detailsAction["recordState"] ?? path.detailsAction["recordState"]
			).replace("format=json", "")}`,
		};
	});
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
