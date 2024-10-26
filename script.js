//script.js
document.getElementById("scrapeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const searchTerm = document.getElementById("searchTerm").value;

  // Obtener las tiendas seleccionadas
  const selectedStores = Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);

  // Verificar si se ha seleccionado al menos una tienda
  if (selectedStores.length === 0) {
    alert("Por favor, seleccione al menos una tienda.");
    return;
  }

  const results = [];

  // Realizar la solicitud para cada tienda seleccionada
  for (const store of selectedStores) {
    const response = await fetch("/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchTerm, store }),
    });

    const products = await response.json();
    console.log(products);
    results.push(...products);
  }

  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  results.forEach((product) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${product.title}</strong></br><img src="${product.image}" width="50"/> ${product.price} | ${product.unit} </br>Enlace: <a target="_blank" href='${product.link}'>${product.title}</a>`;
    productList.appendChild(li);
  });
});