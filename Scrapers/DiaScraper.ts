/**
 * @prettier
 */
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";
import { fetchSupermercado } from "../Utils/vtex.ts";

export class DiaScraper implements SupermarketScraper {
	async scrapeProduct(search: string): Promise<ProductInfo[]> {
		console.log("Buscando en Dia");
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
	return productos.map((producto: any) => ({
		supermarket: "Dia",
		search: `https://diaonline.supermercadosdia.com.ar/${busqueda}?_q=${busqueda}`,
		title: producto.productName, // Nombre del producto
		price: producto.priceRange.sellingPrice.lowPrice, // Precio del producto
		unit: [
			producto.specificationGroups[0]?.specifications[1]?.values[0],
			parseFloat(producto.specificationGroups[0]?.specifications[0]?.values[0]),
		],
		image: producto.items[0].images[0]?.imageUrl ?? "", // Imagen del producto
		link: `https://diaonline.supermercadosdia.com.ar/${producto.linkText}/p`, // Enlace al producto
	}));
}

async function cantidadDeProductos(query: string): Promise<number> {
	const datos = await fetchSupermercado(
		query,
		0,
		0,
		"https://diaonline.supermercadosdia.com.ar/"
	);
	return datos?.recordsFiltered ?? 0;
}

async function obtenerProductos(busqueda: string, desde = 0, hasta: number) {
	const datos = await fetchSupermercado(
		busqueda,
		desde,
		hasta,
		"https://diaonline.supermercadosdia.com.ar/"
	);
	return datos?.products;
}
