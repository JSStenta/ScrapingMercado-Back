import { SupermarketScraper } from "./SupermarketScraperInterface.ts";
import { CotoScraper } from "./CotoScraper.ts";
import { CarrefourScraper } from "./CarrefourScraper.ts";
import { ElNeneScraper } from "./ElNeneScraper.ts";
import { SupermarketError } from "../Utils/errorHandler.ts";
import { DiaScraper } from "./DiaScraper.ts";

export class ScraperFactory {
    static getScraper(supermarket: string): SupermarketScraper {
        switch (supermarket) {
            case 'coto':
                return new CotoScraper();
            case 'carrefour':
                return new CarrefourScraper();
            case 'elnene':
                return new ElNeneScraper();
            case 'dia':
                 return new DiaScraper();
            default:
                // Agregar más casos según sea necesario
                throw new SupermarketError(`Scraper no implementado para el supermercado: ${supermarket}`);
        }
    }
}
