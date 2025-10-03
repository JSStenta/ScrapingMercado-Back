export function redondeoConDecimales(num: number) {
  return Math.round(num * 100) / 100;
}

export function normalizarUnidades(unidad: string) {
  if (!unidad) return undefined;
  const unidadLower = unidad.toLowerCase();
  if (unidadLower.includes("k")) return "kg";
  if (unidadLower.includes("g")) return "gr";
  if (unidadLower.includes("m")) return "ml";
  if (unidadLower.includes("l")) return "lt";
}

export function unidadDeCadena(texto: string) {
  const regex = /(\d+(?:[\.,]\d+)?)\s*([a-zA-Z]+)/i;
  const match = texto.replace(/\s+/g, " ").match(regex);

  if (match) {
    const cantidad = parseFloat(match[1].replace(",", "."));
    const unidad = normalizarUnidades(match[2]);
    return { cantidad, unidad };
  }
  return null;
}

export function calcularPrecioPorUnidad(precio: number, cantidad?: number, unidad?: string): number | undefined {
  if (!precio || !cantidad || !unidad) return undefined;
  const unidadNorm = normalizarUnidades(unidad);
  let cantidadBase = cantidad;
  switch (unidadNorm) {
    case "kg":
    case "lt":
      break;
    case "ml":
      cantidadBase = cantidad / 1000;
      break;
    case "gr":
      cantidadBase = cantidad / 1000;
      break;
    default:
      return undefined;
  }

  return redondeoConDecimales(precio / cantidadBase);
}
