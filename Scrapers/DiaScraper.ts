/**
 * @prettier
 */
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";

export class DiaScraper implements SupermarketScraper {
	async scrapeProduct(search: string): Promise<ProductInfo[]> {
		console.log("Buscando en Dia");
		try {
			const cantProductos = await cantidadDeProductos(search);
			console.log("cantidadDeProductos: ", cantProductos);
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
			producto.specificationGroups[0].specifications[1].values[0],
			producto.specificationGroups[0].specifications[0].values[0],
		],
		image: producto.items[0].images[0]?.imageUrl ?? "", // Imagen del producto
		link: `https://diaonline.supermercadosdia.com.ar${producto.link}`, // Enlace al producto
	}));
}

async function cantidadDeProductos(query: string): Promise<number> {
	const datos = await fetchDia(query, 0, 0);
	return datos?.recordsFiltered ?? 0;
}

async function obtenerProductos(busqueda: string, desde = 0, hasta: number) {
	const datos = await fetchDia(busqueda, desde, hasta);
	return datos?.products;
}

async function fetchDia(busqueda: string, desde: number, hasta: number) {
	const url = "https://diaonline.supermercadosdia.com.ar/_v/segment/graphql/v1";
	const variables = generateVariablesJSON(busqueda, desde, hasta);
	const params = generateSearchParams(variables);
	const response = (await fetch(`${url}?${params}`)).json();
	return (await response).data.productSearch;
}

function generateVariablesJSON(busqueda: string, desde: number, hasta: number) {
	const variables = {
		hideUnavailableItems: true,
		skuFilter: "ALL",
		simulationBehavior: "default",
		installationCriteria: "MAX_WITHOUT_INTEREST",
		productOriginVtex: true,
		// productOriginVtex: false,
		map: "ft",
		query: busqueda,
		orderBy: "OrderByScoreDESC",
		from: desde,
		to: hasta,
		selectedFacets: [{ key: "ft", value: busqueda }],
		fullText: busqueda,
		// operator: "and",
		fuzzy: "0",
		searchState: null,
		facetsBehavior: "Static",
		categoryTreeBehavior: "default",
		withFacets: false,
		advertisementOptions: {
			showSponsored: true,
			sponsoredCount: 3,
			advertisementPlacement: "top_search",
			repeatSponsoredProducts: true,
		},
	};
	return variables;
}

const generateSearchParams = (variables: any) =>
	new URLSearchParams({
		workspace: "master",
		maxAge: "short",
		appsEtag: "remove",
		domain: "store",
		locale: "es-AR",
		__bindingId: "39bdf81c-0d1f-4400-9510-96377195dd22",
		operationName: "productSearchV3",
		variables: "{}",
		extensions: JSON.stringify({
			persistedQuery: {
				version: 1,
				sha256Hash:
					"9177ba6f883473505dc99fcf2b679a6e270af6320a157f0798b92efeab98d5d3",
				sender: "vtex.store-resources@0.x",
				provider: "vtex.search-graphql@0.x",
			},
			variables: btoa(JSON.stringify(variables)),
		}),
	});
