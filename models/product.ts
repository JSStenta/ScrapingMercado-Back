// Modelo estándar de producto
export interface ProductInfo {
    supermarket: string;
    search: string;
    title: string;
    price: number;
    unit?: [string, number];
    image: string;
    link: string;
}

// Enumeración de unidades estándar
export enum StandardUnit {
    KILOGRAM = "Kilo",
    LITER = "Litro",
    UNIT = "Unidad",
}