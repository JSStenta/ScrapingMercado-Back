import { ProductInfo } from "../models/product.ts";
export interface SupermarketScraper {
    scrapeProduct(search: string): Promise<ProductInfo[]>;
}