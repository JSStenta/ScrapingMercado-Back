/**
 * @prettier
 */
import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";

export class CarrefourJsonScraper implements SupermarketScraper {
	async scrapeProduct(search: string): Promise<ProductInfo[]> {
		console.log("Buscando en Carrefour");
		try {
			const productos: any[] = [];
			let desde = 0;
			let paso = 100; // Empezamos con lotes de 100

			while (true) {
				console.log(
					`Intentando obtener productos con paso: ${paso}, desde desde: ${desde}`
				);

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
						console.log("Reduciendo la busqueda: ", paso);
					}
				} else {
					productos.push(...nuevosProductos);
					desde += paso; // Avanzamos según el tamaño actual
				}

				console.log(`Total productos obtenidos: ${productos.length}`);
			}

			return formatearProductos(productos);
		} catch (error) {
			console.error("Error:", error);
			return [];
		}
	}
}

function formatearProductos(productos: any[]): ProductInfo[] {
	return productos.map((producto: any) => {
		const price = parseFloat(
			producto.items[0]?.sellers[0]?.commertialOffer?.Price
		);
		const pricePerUnit =
			(parseFloat(producto.skuSpecifications[0]?.values[0]?.name) * price) /
			parseFloat(producto.items[0]?.sellers[0]?.commertialOffer?.ListPrice);
		return {
			supermarket: "Carrefour",
			search: "",
			title: producto.productName, // Nombre del producto
			price: price, // Precio del producto
			unit: ["kg", pricePerUnit], // Unidad de medida y precio por unidad
			image: producto.items[0].images[0]?.imageUrl ?? "", // Imagen del producto
			link: `https://www.carrefour.com.ar${producto.link}`, // Enlace al producto
		};
	});
}

async function cantidadDeProductos(query: string): Promise<number> {
	const datos = await fetchCarrefour(query, 0, 0);
	return datos?.recordsFiltered ?? 0;
}

async function obtenerProductos(busqueda: string, desde = 0, hasta: number) {
	const datos = await fetchCarrefour(busqueda, desde, hasta);
	return datos?.products;
}

async function fetchCarrefour(busqueda: string, desde: number, hasta: number) {
	const url = "https://www.carrefour.com.ar/_v/segment/graphql/v1";
	let variables = generateVariablesJSON(busqueda, desde, hasta);
	let params = generateSearchParams(variables);
	let response = (await fetch(`${url}?${params}`)).json();
	const redirecion = (await response).data?.productSearch?.redirect;
	if (redirecion) {
		variables = generateVariablesJSON(
			redirecion.split("?")[0].toLowerCase(),
			desde,
			hasta,
			true
		);
		params = generateSearchParams(variables);
		response = (await fetch(`${url}?${params}`)).json();
	}
	// console.log(`URL desde ${desde} hasta ${hasta} : ${url}?${params}`);
	return (await response).data.productSearch;
}

function generateVariablesJSON(
	busqueda: string,
	desde: number,
	hasta: number,
	redirected = false
) {
	const variables = {
		hideUnavailableItems: true,
		skuFilter: "ALL_AVAILABLE",
		simulationBehavior: "default",
		installationCriteria: "MAX_WITHOUT_INTEREST",
		productOriginVtex: false,
		map: "ft",
		query: busqueda,
		orderBy: "OrderByScoreDESC",
		from: desde,
		to: hasta,
		selectedFacets: [{ key: "ft", value: busqueda }],
		facetsBehavior: "Static",
		categoryTreeBehavior: "default",
		withFacets: false,
		variant: "null-null",
		...(redirected ? {} : { fullText: busqueda }),
		advertisementOptions: {
			showSponsored: true,
			sponsoredCount: 3,
			advertisementPlacement: "top_search",
			repeatSponsoredProducts: true,
		},
	};
	if (redirected) {
		variables.map = "c,c";
		variables.selectedFacets = [
			{ key: "c", value: busqueda.split("/")[1] },
			{ key: "c", value: busqueda.split("/")[2] },
		];
	}
	return variables;
}

const generateSearchParams = (variables: any) =>
	new URLSearchParams({
		workspace: "master",
		maxAge: "short",
		appsEtag: "remove",
		domain: "store",
		locale: "es-AR",
		operationName: "productSearchV3",
		__bindingId: "ecd0c46c-3b2a-4fe1-aae0-6080b7240f9b",
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
