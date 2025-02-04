import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { ProductInfo } from "../models/product.ts";

export class CarrefourJsonScraper implements SupermarketScraper {
    async scrapeProduct(search: string): Promise<ProductInfo[]> {
        console.log("Buscando en Carrefour");
        try {
            const totalProducts = await getTotalProducts(search);
            console.log(`Cantidad de productos: ${totalProducts}`);

            // URL base para la búsqueda de productos
            const urlBusqueda = `https://www.carrefour.com.ar/api/catalog_system/pub/products/search/${search}`;

            // Obtener la lista de productos
            const response = (await import(urlBusqueda, { with: { type: "json" } }));
            //console.log(response);
            if (!response.ok) throw new Error(`Error al buscar en Carrefour: ${response.status}`);
            const productos = await response.json();
            if (productos.length === 0) {
                throw new Error("No se encontraron productos.");
            }

            // Extraer información de cada producto y mapearla a ProductInfo
            const salida: ProductInfo[] = productos.map((producto: any) => ({
                supermarket: "Carrefour",
                search: urlBusqueda,
                title: producto.productName,
                price: parseFloat(producto.items[0]?.sellers[0]?.commertialOffer?.Price || 0),
                unit: ["Unidad", 1], // Carrefour no especifica unidad en esta API
                image: producto.items[0]?.images[0]?.imageUrl || "",
                link: `https://www.carrefour.com.ar/${producto.linkText}/p`, // Enlace al producto
            }));

            console.log(salida);
            return salida;
        } catch (error) {
            console.error("Error:", error);
            return [];
        }
    }
}

async function getTotalProducts(query: string): Promise<number> {
    const url = "https://www.carrefour.com.ar/_v/segment/graphql/v1";
    let variables = generateVariablesJSON(query);
    let params = generateSearchParams(variables);
    let response = await fetch(`${url}?${params}`);
    let data = await response.json();
    console.log(`${url}?${params}`);
    const redirect = data.data.productSearch.redirect;
    console.log('REDIRECT: ', redirect)
    if (redirect) {
        console.log('REDIRECTED')
        variables = generateVariablesJSON(redirect.split('?')[0].replace(/^\/*/, ""), 'c,c');
        params = generateSearchParams(variables);
        response = await fetch(`${url}?${params}`);
        data = await response.json();
        console.log(`${url}?${params}`);
    }
    return data?.data?.productSearch?.recordsFiltered ?? 0;
}

function generateVariablesJSON(searchQuery: string, facets = 'ft') {
    const variables = {
        hideUnavailableItems: true,
        skuFilter: "ALL_AVAILABLE",
        simulationBehavior: "default",
        installationCriteria: "MAX_WITHOUT_INTEREST",
        productOriginVtex: false,
        map: facets,
        query: searchQuery,
        orderBy: "OrderByScoreDESC",
        from: 0,
        to: 0,
        selectedFacets: [{ key: 'ft', value: searchQuery }],
        facetsBehavior: "Static",
        categoryTreeBehavior: "default",
        withFacets: false,
        variant: "null-null",
        // fullText: 'cafe',
        advertisementOptions: {
            showSponsored: true,
            sponsoredCount: 3,
            advertisementPlacement: "top_search",
            repeatSponsoredProducts: true
        }
    }
    if (facets === 'c,c') {
        variables.map = 'c,c';
        variables.query = 'desayuno-y-merienda/cafe';
        variables.selectedFacets = [{ key: 'c', value: 'desayuno-y-merienda' }, { key: 'c', value: 'cafe' }];
        // delete variables.fullText;
    }
    console.log(variables)
    return variables
}
// function generateVariablesJSON(searchQuery: string, facets = 'ft') {
//     const variables = {
//         hideUnavailableItems: true,
//         skuFilter: "ALL_AVAILABLE",
//         simulationBehavior: "default",
//         installationCriteria: "MAX_WITHOUT_INTEREST",
//         productOriginVtex: false,
//         query: searchQuery,
//         orderBy: "OrderByScoreDESC",
//         map: facets,
//         selectedFacets: [{ key: 'ft', value: searchQuery }],
//         from: 0,
//         to: 0,
//         fullText: searchQuery,
//         facetsBehavior: "Static",
//         categoryTreeBehavior: "default",
//         withFacets: false,
//         variant: "null-null",
//         advertisementOptions: {
//             showSponsored: true,
//             sponsoredCount: 3,
//             advertisementPlacement: "top_search",
//             repeatSponsoredProducts: true
//         }
//     }
//     if (facets === 'c,c') {
//         variables.map = 'c,c';
//         variables.selectedFacets = [{ key: 'c', value: searchQuery.split('/')[0] }, { key: 'c', value: searchQuery.split('/')[1] }];
//         variables.fullText = searchQuery.split('/')[1];
//     }
//     console.log(variables)
//     return variables
// }

const generateSearchParams = (variables: any) => new URLSearchParams({
    workspace: "master",
    maxAge: "short",
    appsEtag: "remove",
    domain: "store",
    locale: "es-AR",
    operationName: "productSearchV3",
    // __bindingId: "ecd0c46c-3b2a-4fe1-aae0-6080b7240f9b",
    variables: "{}",
    extensions: JSON.stringify({
        persistedQuery: {
            version: 1,
            sha256Hash: "9177ba6f883473505dc99fcf2b679a6e270af6320a157f0798b92efeab98d5d3",
            sender: "vtex.store-resources@0.x",
            provider: "vtex.search-graphql@0.x"
        },
        variables: btoa(JSON.stringify(variables)) // Codifica las variables en Base64
    })
});