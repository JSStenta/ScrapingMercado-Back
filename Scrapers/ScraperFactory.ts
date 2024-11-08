import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { CotoJsonScraper } from "./CotoJsonScraper.ts";
import { CarrefourScraper } from "./CarrefourScraper.ts";
import { ElNeneScraper } from "./ElNeneScraper.ts";

export class ScraperFactory {
    static getScraper(supermarket: string): SupermarketScraper | null {
        switch (supermarket) {
            case 'coto':
                return new CotoJsonScraper();
            case 'carrefour':
                return new CarrefourScraper();
            case 'elnene':
                return new ElNeneScraper();
            default:
                // Agrega más casos según sea necesario
                console.warn(`Scraper no implementado para el supermercado: ${supermarket}`);
                return null;
        }
    }
}
