import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { CotoJsonScraper } from "./CotoJsonScraper.ts";
import { CarrefourScraper } from "./CarrefourScraper.ts";
import { ElNeneScraper } from "./ElNeneScraper.ts";
import { SupermarketError } from "../Utils/errorHandler.ts";

export class ScraperFactory {
    static getScraper(supermarket: string): SupermarketScraper {
        switch (supermarket) {
            case 'coto':
                return new CotoJsonScraper();
            case 'carrefour':
                return new CarrefourScraper();
            case 'elnene':
                return new ElNeneScraper();
            default:
                // Agregar más casos según sea necesario
                throw new SupermarketError(`Scraper no implementado para el supermercado: ${supermarket}`);
        }
    }
}
