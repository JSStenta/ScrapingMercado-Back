import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { CotoJsonScraper } from "./CotoJsonScraper.ts";
import { CarrefourJsonScraper } from "./CarrefourJsonScraper.ts";
import { ElNeneScraper } from "./ElNeneScraper.ts";
import { SupermarketError } from "../Utils/errorHandler.ts";
import { DiaScraper } from "./DiaScraper.ts";

export class ScraperFactory {
    static getScraper(supermarket: string): SupermarketScraper {
        switch (supermarket) {
            case 'coto':
                return new CotoJsonScraper();
            case 'carrefour':
                return new CarrefourJsonScraper();
            case 'elnene':
                // return new ElNeneScraper();
            case 'dia':
                // return new DiaScraper();
            default:
                // Agregar más casos según sea necesario
                throw new SupermarketError(`Scraper no implementado para el supermercado: ${supermarket}`);
        }
    }
}
