// Función para hacer scroll en la página hasta el final
export async function guardarJson(nombre:string,json:ReadableStream) {
    await Deno.writeTextFile(`${nombre}.json`, json)
}
