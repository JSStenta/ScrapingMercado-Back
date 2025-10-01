/**
 * @prettier
 */
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";
import { fetchSupermercado } from "../Utils/vtex.ts";

export class CarrefourScraper implements SupermarketScraper {
	async scrapeProduct(search: string): Promise<ProductInfo[]> {
		console.log("Buscando en Carrefour");
		try {
			const productos: ProductInfo[] = [];
			let desde = 0;
			let paso = 100; // Empezamos con lotes de 100

			while (true) {
				const nuevosProductos = await obtenerProductos(
					search,
					desde,
					desde + paso - 1
				);

				if (!nuevosProductos || nuevosProductos.length === 0) {
					if (paso == 1) {
						console.warn(
							"No se encontraron más productos, terminando búsqueda."
						);
						break; // Si ya está en 1 y sigue fallando, terminamos
					} else {
						paso *= 0.1;
					}
				} else {
					productos.push(...nuevosProductos);
					desde += paso; // Avanzamos según el tamaño actual
				}
			}

			return formatearProductos(productos, search);
		} catch (error) {
			console.error("Error:", error);
			return [];
		}
	}
}

function formatearProductos(productos: any[], busqueda: string): ProductInfo[] {
	let cadena = "";
	const prod = productos.map((producto): ProductInfo => {
		const genesixVtexGroup = producto.specificationGroups.find(
			(group: any) => group.name === "Genesix Vtex"
		);
		cadena += `"${producto.productName}": ${JSON.stringify(
			genesixVtexGroup,
			null,
			2
		)},\n`;

		const price = parseFloat(
			producto.items[0]?.sellers[0]?.commertialOffer?.Price
		);
		const pricePerUnit =
			(parseFloat(producto.skuSpecifications[0]?.values[0]?.name) * price) /
			parseFloat(producto.items[0]?.sellers[0]?.commertialOffer?.ListPrice);
		return {
			supermercado: "carrefour",
			busqueda: `/${busqueda}?_q=${busqueda}`,
			titulo: producto.productName,
			precio: price,
			unidad: genesixVtexGroup?.specifications[0]?.values[0] ?? undefined,
			precioUnidad: pricePerUnit ?? undefined,
			imagen: producto.items[0].images[0]?.imageUrl ?? "", // Imagen del producto
			enlace: producto.link, // Enlace al producto
		};
	});
	return prod;
}

async function _cantidadDeProductos(query: string): Promise<number> {
	const datos = await fetchSupermercado(
		query,
		0,
		0,
		"https://www.carrefour.com.ar/"
	);
	return datos?.recordsFiltered ?? 0;
}

async function obtenerProductos(busqueda: string, desde = 0, hasta: number) {
	const datos = await fetchSupermercado(
		busqueda,
		desde,
		hasta,
		"https://www.carrefour.com.ar/"
	);
	return datos?.products;
}
