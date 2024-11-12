# Backend - ScrapingMercado

## Descripción
Este proyecto es una API REST desarrollada en Deno que permite obtener precios de productos de diferentes supermercados mediante web scraping. Facilita la búsqueda de precios actualizados para ayudar a los usuarios a comparar productos entre varias cadenas.

## Tecnologías 
- **Deno**: Entorno de ejecución para TypeScript y JavaScript.
- **Oak**: Framework web para Deno.
- **Puppeteer**: Herramienta de scraping para interactuar con páginas web.
- **TypeScript**: Lenguaje utilizado para escribir el código de forma tipada.

## Requisitos Previos
- Tener Deno instalado [(Guía de instalación de Deno)](https://deno.land/manual@v1.28.0/getting_started/installation).

## Instalación
```bash
# Clonar el repositorio
git clone https://github.com/JSStenta/ScrapingMercado-Back.git
```

## Ejecución
```bash
# Iniciar el servidor
deno run --allow-net --allow-read server.ts
```
El servidor se iniciará en [http://localhost:8000](http://localhost:8000).

## Endpoints
### `GET /search`
Busca precios de productos en los supermercados especificados.

**Parámetros de Query**
- `product` (string): Nombre del producto a buscar.
- `supermarkets` (string): Lista de supermercados, separados por coma.

**Ejemplo de Uso**
```bash
curl "http://localhost:8000/search?product=leche&supermarkets=carrefour,coto"
```
> [!NOTE]
> Estoy trabajando en otros endpoints
 
## Estructura del Proyecto
```plaintext
scrapingmercado/
├── Scrapers/
│   ├── ScraperFactory.ts
│   ├── ScrapeProductPrices.ts
│   ├── CarrefourScraper.ts
│   ├── CotoJsonScraper.ts
│   └── ElNeneScraper.ts
├── Utils/
│   ├── Utils.ts
│   └── errorHandler.ts
├── server.ts
└── deno.lock
```

## Manejo de Errores
- `SupermarketError`: Ocurre si se proporciona un supermercado inválido.
- `ScraperError`: Error durante el proceso de scraping.
- `UnknownError`: Error desconocido.

## Contribución
Las contribuciones son bienvenidas. Si tienes sugerencias, encuentra un error o deseas contribuir de otra forma, abre un _issue_ o envía un _pull request_.

## Casos de Uso
La API permite buscar precios de productos específicos en varios supermercados de manera rápida y centralizada. Esto puede ser útil para:
- Usuarios que desean comparar precios entre supermercados para ahorrar tiempo y dinero.
- Aplicaciones o sitios web que ofrecen comparativas de precios de productos.
- Estudios de mercado para monitorear variaciones de precios en distintas cadenas.

### Ejemplo de Búsqueda
**Request:**
```bash
GET http://localhost:8000/search?product=leche&supermarkets=carrefour,coto
```

**Parámetros:**
- `product`: Nombre del producto a buscar (en este caso, "leche").
- `supermarkets`: Lista de supermercados en los cuales se quiere realizar la búsqueda, separados por coma (en este caso, "carrefour" y "coto").

### Ejemplo de Respuesta
La API devuelve un array de objetos JSON, donde cada objeto representa un producto encontrado en los supermercados especificados.

**Response:**
```json
[
  {
    "supermarket": "Carrefour",
    "search": "https://www.carrefour.com.ar/Lacteos-y-productos-frescos/Leches?order=",
    "title": "Leche La Serenísima reducida en lactosa sachet 1 l.",
    "unit": [
      "1 L.",
      1530
    ],
    "price": 1530,
    "image": "https://carrefourar.vtexassets.com/arquivos/ids/239408-170-170?v=637838185739200000&width=170&height=170&aspect=true",
    "link": "https://www.carrefour.com.ar/leche-la-serenisima-reducida-en-lactosa-sachet-1-l/p"
  },
  {
    "supermarket": "Carrefour",
    "search": "https://www.carrefour.com.ar/Lacteos-y-productos-frescos/Leches?order=",
    "title": "Leche entera larga vida Las tres niñas 1 l.",
    "unit": [
      "1 L.",
      1829.99
    ],
    "price": 1219.99,
    "image": "https://carrefourar.vtexassets.com/arquivos/ids/178226-170-170?v=637468578430900000&width=170&height=170&aspect=true",
    "link": "https://www.carrefour.com.ar/leche-entera-larga-vida-las-tres-ninas-1-l/p"
  },
  {
    "supermarket": "Coto",
    "search": "https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Nrpp=514&Ntt=leche",
    "title": "Leche Parcialmente Descremada Liviana LA SERENISIMA Botella Larga Vida 1l",
    "price": 2127.5,
    "unit": [
      [
        "Litro "
      ],
      2127.5
    ],
    "image": "https://static.cotodigital3.com.ar/sitios/fotos/medium/00253100/00253104.jpg",
    "link": "https://api.cotodigital.com.ar/sitios/cdigi/productos/leche-parcialmente-descremada-liviana-la-serenisima-botella-larga-vida-1l/_/A-00253104-00253104-200?"
  },
  {
    "supermarket": "Coto",
    "search": "https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Nrpp=514&Ntt=leche",
    "title": "Leche Chocolatada Shake Con Vitamina A SANCOR 1l",
    "price": 3610,
    "unit": [
      [
        "Litro "
      ],
      3610
    ],
    "image": "https://static.cotodigital3.com.ar/sitios/fotos/medium/00255100/00255114.jpg",
    "link": "https://api.cotodigital.com.ar/sitios/cdigi/productos/leche-chocolatada-shake-con-vitamina-a-sancor-1l/_/A-00255114-00255114-200?"
  }
]
```
En cada objeto:
- `supermarket`: Supermercado donde se encontró el producto.
- `search`: Enlace de búsqueda en la tienda en línea del supermercado.
- `title`: Nombre del producto.
- `unit`: Información de la unidad y precio unitario.
  - El primer elemento (por ejemplo, "1 L.") describe el tamaño o volumen del producto.
  - El segundo elemento es el precio del producto en esa unidad.
- `price`: Precio del producto.
- `image`: URL de la imagen del producto.
- `link`: URL directa al producto en la tienda del supermercado.
