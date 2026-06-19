let evData = [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        evData = data.categories;
        
        renderCatalog(evData);
        
    } catch (error) {
        document.getElementById('main-content').innerHTML = 
            `<div class="alert alert-danger">Помилка завантаження даних.</div>`;
    }
}

function renderCatalog(categories) {
    const contentArea = document.getElementById('main-content');
    let htmlContent = '';

    categories.forEach(category => {
        htmlContent += `<div class="col-12 mt-4 mb-3"><h3 class="text-primary">${category.name}</h3><hr></div>`;
        
        category.items.forEach(item => {
            htmlContent += `
                <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${item.image}" class="card-img-top" alt="${item.name}" onerror="this.src='https://placehold.co/600x400?text=Auto'">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text flex-grow-1">${item.description}</p>
                            <button class="btn btn-outline-primary mt-auto w-100">Детальніше</button>
                        </div>
                    </div>
                </div>
            `;
        });
    });

    contentArea.innerHTML = htmlContent;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
