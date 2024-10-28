//script.js
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

    try {
      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, supermarkets }),
      });

      if (!response.ok) {
        throw new Error("Error en la búsqueda de productos");
      }

      const data = await response.json();
      populateTable(data);
    } catch (error) {
      console.error(error);
    }
  });

function populateTable(data) {
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = ""; // Limpia los resultados anteriores

  data.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
            <td>${item.supermarket}</td>
            <td>${item.title}</td>
            <td>${item.price}</td>
            <td>${item.unit}</td>
            <td><img src="${item.image}" alt="${item.product}" width="50" /></td>
            <td><a href="${item.link}" target="_blank">Ver producto</a></td>
        `;

    tbody.appendChild(row);
  });
}