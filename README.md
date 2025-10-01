# Backend - ScrapingMercado

## Descripción
Este proyecto es una API REST desarrollada en Deno que permite obtener precios de productos de diferentes supermercados mediante web scraping. Facilita la búsqueda de precios actualizados para ayudar a los usuarios a comparar productos entre varias cadenas.

## Tecnologías 
- **Deno**: Entorno de ejecución para TypeScript.
- **TypeScript**: Lenguaje utilizado para escribir el código de forma tipada.

## Requisitos Previos
- Tener Deno instalado [(Guía de instalación de Deno)](https://docs.deno.com/runtime/getting_started/installation/).

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
### `GET /buscar`
Busca precios de productos en los supermercados especificados.

**Parámetros de Query**
- `producto` (string): Nombre del producto a buscar.
- `supermercados` (string): Lista de supermercados, separados por coma.

**Ejemplo de Uso**
```bash
curl "http://localhost:8000/buscar?producto=leche&supermercados=carrefour,coto"
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
- `supermercadoError`: Ocurre si se proporciona un supermercado inválido.
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
GET http://localhost:8000/busqueda?producto=leche&supermercados=carrefour,coto
```

**Parámetros:**
- `producto`: Nombre del producto a buscar (en este caso, "leche").
- `supermercados`: Lista de supermercados en los cuales se quiere realizar la búsqueda, separados por coma (en este caso, "carrefour" y "coto").

### Ejemplo de Respuesta
La API devuelve un array de objetos JSON, donde cada objeto representa un producto encontrado en los supermercados especificados.

**Response:**
```json
[
  {
    "supermercado": "Carrefour",
    "busqueda": "https://www.carrefour.com.ar/Lacteos-y-productos-frescos/Leches?order=",
    "titulo": "Leche La Serenísima reducida en lactosa sachet 1 l.",
    "unidad": "1 L.",
    "precioUnidad": 1530,
    "precio": 1530,
    "imagen": "https://carrefourar.vtexassets.com/arquivos/ids/239408-170-170?v=637838185739200000&width=170&height=170&aspect=true",
    "enlace": "https://www.carrefour.com.ar/leche-la-serenisima-reducida-en-lactosa-sachet-1-l/p"
  },
  {
    "supermercado": "Carrefour",
    "busqueda": "https://www.carrefour.com.ar/Lacteos-y-productos-frescos/Leches?order=",
    "titulo": "Leche entera larga vida Las tres niñas 1 l.",
    "unidad": "1 L.",
    "precioUnidad": 1829.99,
    "precio": 1219.99,
    "imagen": "https://carrefourar.vtexassets.com/arquivos/ids/178226-170-170?v=637468578430900000&width=170&height=170&aspect=true",
    "enlace": "https://www.carrefour.com.ar/leche-entera-larga-vida-las-tres-ninas-1-l/p"
  },
  {
    "supermercado": "Coto",
    "busqueda": "https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Nrpp=514&Ntt=leche",
    "titulo": "Leche Parcialmente Descremada Liviana LA SERENISIMA Botella Larga Vida 1l",
    "precio": 2127.5,
    "unidad": "Litro ",
    "precioUnidad": 2127.5,
    "imagen": "https://static.cotodigital3.com.ar/sitios/fotos/medium/00253100/00253104.jpg",
    "enlace": "https://api.cotodigital.com.ar/sitios/cdigi/productos/leche-parcialmente-descremada-liviana-la-serenisima-botella-larga-vida-1l/_/A-00253104-00253104-200?"
  },
  {
    "supermercado": "Coto",
    "busqueda": "https://api.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Nrpp=514&Ntt=leche",
    "titulo": "Leche Chocolatada Shake Con Vitamina A SANCOR 1l",
    "precio": 3610,
    "unidad": "Litro ",
    "precioUnidad": 3610,
    "imagen": "https://static.cotodigital3.com.ar/sitios/fotos/medium/00255100/00255114.jpg",
    "enlace": "https://api.cotodigital.com.ar/sitios/cdigi/productos/leche-chocolatada-shake-con-vitamina-a-sancor-1l/_/A-00255114-00255114-200?"
  }
]
```

- `supermercado`: Supermercado donde se encontró el producto.
- `busqueda`: Enlace de búsqueda en la tienda en línea del supermercado.
- `titulo`: Nombre del producto.
- `unidad`: Describe el tamaño o volumen del producto (por ejemplo, "1 L.").
- `precioUnidad`: es el precio del producto en esa unidad.
- `precio`: Precio del producto.
- `imagen`: URL de la imagen del producto.
- `enlace`: URL directa al producto en la tienda del supermercado.
