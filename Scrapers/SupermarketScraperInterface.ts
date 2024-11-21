import { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import { ProductInfo } from "../models/product.ts";
export interface SupermarketScraper {
    scrapeProduct(search: string, page: Page): Promise<ProductInfo[]>;
}