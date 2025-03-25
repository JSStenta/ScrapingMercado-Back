/**
 * @prettier
 */
export async function fetchSupermercado(
	busqueda: string,
	desde: number,
	hasta: number,
	url: string
) {
	let parametros = generateFetch(busqueda, desde, hasta);
	let response = (
		await fetch(`${url}_v/segment/graphql/v1?${parametros}`)
	).json();
	const redireccion = (await response).data?.productSearch?.redirect;
	if (redireccion) {
		parametros = generateFetch(
			redireccion.split("?")[0].toLowerCase(),
			desde,
			hasta,
			true
		);
		response = (
			await fetch(`${url}_v/segment/graphql/v1?${parametros}`)
		).json();
	}
	if (!(await response).data.productSearch)
		console.log(`${url}_v/segment/graphql/v1?${parametros}`);
	return (await response).data.productSearch;
}

const generateFetch = (
	busqueda: string,
	desde: number,
	hasta: number,
	redirected = false
) => {
	const variables = {
		hideUnavailableItems: true,
		skuFilter: "ALL",
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
		...(redirected ? {} : { fullText: busqueda }),
	};
	if (redirected) {
		const split = busqueda.split("/");
		if (split[1] == "162") {
			variables.map = "b";
			variables.selectedFacets = [{ key: "b", value: "carrefour" }];
		} else {
			variables.map = "c,c";
			variables.selectedFacets = [
				{ key: "c", value: busqueda.split("/")[1] },
				{ key: "c", value: busqueda.split("/")[2] },
			];
		}
	}
	return generateParametros(variables);
};

const generateParametros = (variables: any) =>
	new URLSearchParams({
		workspace: "master",
		maxAge: "short",
		appsEtag: "remove",
		domain: "store",
		locale: "es-AR",
		// __bindingId: "39bdf81c-0d1f-4400-9510-96377195dd22",
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
