export interface ProductInfo {
    supermarket: string;
    search: string;
    title: string;
    price: number;
    unit?: [string, number];
    image: string;
    link: string;
}

export interface SupermarketScraper {
    scrapeProduct(search: string): Promise<ProductInfo[]>;
}