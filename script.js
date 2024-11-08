//script.js
// Variable global para almacenar los resultados de la búsqueda
let allProducts = [];

document
  .getElementById("searchForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const product = document.getElementById("product").value;
    const checkboxes = document.querySelectorAll(
      'input[name="supermarkets"]:checked'
    );
    const supermarkets = Array.from(checkboxes).map(
      (checkbox) => checkbox.value
    );

    const params = new URLSearchParams({
      product,
      supermarkets: supermarkets.join(","),
    });

    try {
      const response = await fetch(`http://localhost:8000/search?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error en la búsqueda de productos");
      }

      const data = await response.json();
      console.log(data);
      allProducts = data; // Almacena los resultados globalmente
      filter ? filterData(data, product) : productTable(data);
    } catch (error) {
      console.error(error);
    }
  });

// Escucha el cambio en el checkbox "filter" y aplica el filtro en tiempo real sin hacer otra consulta al back
document.getElementById("filter").addEventListener("change", () => {
  const filter = document.getElementById("filter").checked;
  const product = document.getElementById("product").value;

  // Si hay datos almacenados previamente, filtra directamente desde la variable global
  if (allProducts.length > 0) {
    filter ? filterData(allProducts, product) : productTable(allProducts);
  }
});

function productTable(data) {
  if (data.length == 0) {
    document.querySelector("#resultsTable").innerHTML =
      "No se encontraron productos";
  } else {
    const table = document.querySelector("#resultsTable");

    table.innerHTML = `<caption>Cantidad de elementos: ${data.length}</caption><thead><tr><th>Supermercado</th><th>Producto</th><th>Precio</th><th>Precio por kg</th><th>Imagen</th><th>Enlace</th></tr></thead><tbody></tbody>`; // Genera la tabla
    table.setAttribute("border", "1");
    const tbody = document.querySelector("#resultsTable tbody");
    data.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td><a href="${item.search}" target="_blank">${item.supermarket}</a></td>
            <td>${item.title}</td>
            <td>$${item.price}</td>
            <td>${item.unit[0]}: $${item.unit[1]}</td>
            <td><img src="${item.image}" alt="${item.title}" width="50" /></td>
            <td><a href="${item.link}" target="_blank">Ver producto</a></td>
        `;
      tbody.appendChild(row);
    });
  }
}

function filterData(data, search) {
  if (data.length != 0) {
    // Filtra los productos que coincidan con todos los términos de búsqueda
    const resultado = data.filter((item) => {
      const title = item["title"].toLowerCase();
      const searchTerms = search.toLowerCase().split(" ");
      return searchTerms.every((term) => title.includes(term)); // Filtra por todos los términos
    });
    productTable(resultado); // Muestra los resultados filtrados
  }
}
