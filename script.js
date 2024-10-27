//script.js
 <script>
        document.getElementById("searchForm").addEventListener("submit", async (e) => {
            e.preventDefault();
            const product = document.getElementById("product").value;
            const supermarkets = Array.from(document.querySelectorAll('input[name="supermarkets"]:checked'))
                .map(cb => cb.value);
            
            const response = await fetch("/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product, supermarkets })
            });

            const results = await response.json();
            const resultsBody = document.getElementById("resultsBody");
            resultsBody.innerHTML = "";
            results.forEach(result => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${result.supermarket}</td>
                    <td>${result.product}</td>
                    <td>${result.price}</td>
                `;
                resultsBody.appendChild(row);
            });
        });
    </script>