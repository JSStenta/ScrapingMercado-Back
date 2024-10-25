// script.js
document.getElementById('scrapeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = document.getElementById('url').value;

    // Validación de URL
    if (!isValidUrl(url)) {
        alert('Por favor, ingrese una URL válida.');
        return;
    }

    try {
        const response = await fetch('/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        // Si el servidor responde con un error
        if (data.error) {
            alert(data.error);
            return;
        }

        const titlesList = document.getElementById('titles');
        titlesList.innerHTML = '';

        data.forEach(title => {
            const li = document.createElement('li');
            li.textContent = title;
            titlesList.appendChild(li);
        });
    } catch (error) {
        console.error('Error al realizar la solicitud:', error);
    }
});

// Función de validación de URL
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}
