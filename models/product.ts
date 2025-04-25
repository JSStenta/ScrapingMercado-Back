// Modelo estándar de producto
export interface ProductInfo {
    supermercado: string;
    busqueda: string;
    titulo: string;
    precio: number;
    unidad?: string;
    precioUnidad?: number;
    imagen: string;
    enlace: string;
}

// Enumeración de unidades estándar
export enum StandardUnit {
    KILOGRAM = "Kilo",
    LITER = "Litro",
    UNIT = "Unidad",
}