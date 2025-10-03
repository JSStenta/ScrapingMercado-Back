/**
 * @prettier
 */
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";
import { fetchSupermercado } from "../Utils/vtex.ts";
import {
	calcularPrecioPorUnidad,
	redondeoConDecimales,
	unidadDeCadena,
} from "../Utils/Utils.ts";

export class ElNeneScraper implements SupermarketScraper {
	async scrapeProduct(search: string): Promise<ProductInfo[]> {
		console.info("Buscando en El Nene");
		try {
			const cantProductos = await cantidadDeProductos(search);
			const productos: ProductInfo[] = [];
			for (let i = 0; i < cantProductos / 100; i++) {
				const nuevosProductos = await obtenerProductos(
					search,
					i * 100,
					(i + 1) * 100 - 1
				);
				productos.push(...nuevosProductos);
			}
			return formatearProductos(productos, search);
		} catch (error) {
			console.error("Error:", error);
			return [];
		}
	}
}

function formatearProductos(productos: any[], busqueda: string): ProductInfo[] {
	return productos.map((producto: any) => {
		const unidad = unidadDeCadena(producto.productName);
		const precio = redondeoConDecimales((producto.priceRange.sellingPrice.lowPrice));
		return {
			supermercado: "elnene",
			busqueda: `/${busqueda}?_q=${busqueda}`,
			titulo: producto.productName,
			precio: precio,
			unidad: unidad?.unidad,
			precioUnidad: calcularPrecioPorUnidad(precio, unidad?.cantidad, unidad?.unidad),
			imagen: producto.items[0].images[0]?.imageUrl ?? "",
			enlace: `${producto.link}`,
		};
	});
}

async function cantidadDeProductos(query: string): Promise<number> {
	const datos = await fetchSupermercado(
		query,
		0,
		0,
		"https://www.grupoelnene.com.ar/"
	);
	return datos?.recordsFiltered ?? 0;
}

async function obtenerProductos(busqueda: string, desde = 0, hasta: number) {
	const datos = await fetchSupermercado(
		busqueda,
		desde,
		hasta,
		"https://www.grupoelnene.com.ar/"
	);
	return datos?.products;
}
