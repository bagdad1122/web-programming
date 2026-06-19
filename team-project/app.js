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
        setupRouting();
        
    } catch (error) {
        document.getElementById('main-content').innerHTML = 
            `<div class="alert alert-danger">Помилка завантаження даних.</div>`;
    }
}

function renderCatalog(categories, searchQuery = '') {
    const contentArea = document.getElementById('main-content');
    
    let htmlContent = `
        <div class="col-12 mb-4">
            <input type="text" id="searchInput" class="form-control form-control-lg shadow-sm" placeholder="Пошук електромобілів або станцій..." value="${searchQuery}">
        </div>
    `;

    let hasResults = false;

    categories.forEach(category => {
        const filteredItems = category.items.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filteredItems.length > 0) {
            hasResults = true;
            htmlContent += `<div class="col-12 mt-2 mb-3"><h3 class="text-primary">${category.name}</h3><hr></div>`;
            
            filteredItems.forEach(item => {
                const isHighlighted = searchQuery !== '' ? 'border-success border-2 shadow' : 'border-0 shadow-sm';
                // Кодуємо назву, щоб уникнути проблем з пробілами при передачі у функцію
                const encodedName = encodeURIComponent(item.name);
                
                htmlContent += `
                    <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
                        <div class="card h-100 ${isHighlighted}" style="transition: all 0.3s ease;">
                            <img src="${item.image}" class="card-img-top" alt="${item.name}" onerror="this.src='https://placehold.co/600x400?text=Auto'">
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${item.name}</h5>
                                <p class="card-text flex-grow-1">${item.description}</p>
                                <button class="btn btn-outline-primary mt-auto w-100" onclick="showDetails('${encodedName}')">Детальніше</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
    });

    if (!hasResults) {
        htmlContent += `<div class="col-12 text-center"><p class="text-muted">За вашим запитом нічого не знайдено.</p></div>`;
    }

    contentArea.innerHTML = htmlContent;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        searchInput.addEventListener('input', (e) => {
            renderCatalog(evData, e.target.value);
        });
    }
}

// Нова функція для відображення деталей у модальному вікні
window.showDetails = function(encodedName) {
    const itemName = decodeURIComponent(encodedName);
    let selectedItem = null;
    
    // Шукаємо клікнутий елемент у наших даних
    evData.forEach(category => {
        const found = category.items.find(i => i.name === itemName);
        if (found) selectedItem = found;
    });

    if (selectedItem) {
        // Підставляємо дані у модальне вікно
        document.getElementById('modalTitle').innerText = selectedItem.name;
        document.getElementById('modalDescription').innerText = selectedItem.description;
        
        const imgEl = document.getElementById('modalImage');
        imgEl.src = selectedItem.image;
        imgEl.onerror = function() { this.src='https://placehold.co/600x400?text=Auto'; };

        // Відкриваємо вікно за допомогою інструментів Bootstrap
        const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
        modal.show();
    }
};

function setupRouting() {
    const navCatalog = document.getElementById('nav-catalog');
    const navGame = document.getElementById('nav-game');
    const pageTitle = document.getElementById('page-title');
    const navHome = document.getElementById('nav-home');

    const showCatalog = (e) => {
        if(e) e.preventDefault();
        navCatalog.classList.add('active');
        navGame.classList.remove('active');
        pageTitle.innerText = 'Каталог електромобілів та станцій';
        renderCatalog(evData);
    };

    navCatalog.addEventListener('click', showCatalog);
    navHome.addEventListener('click', showCatalog);

    navGame.addEventListener('click', (e) => {
        e.preventDefault();
        navGame.classList.add('active');
        navCatalog.classList.remove('active');
        pageTitle.innerText = 'Міні-гра: Енергорейд';
        renderGame();
    });
}

function renderGame() {
    const contentArea = document.getElementById('main-content');
    contentArea.innerHTML = `
        <div class="col-12 text-center">
            <div class="p-4 bg-white rounded shadow-sm border">
                <canvas id="gameCanvas" width="800" height="400" class="w-100 bg-dark rounded" style="max-width: 800px; border: 2px solid #ccc;"></canvas>
                <div class="mt-3">
                    <button id="startGameBtn" class="btn btn-success btn-lg px-5">Почати гру</button>
                </div>
                <p class="mt-3 text-muted small">Керуйте електромобілем за допомогою стрілок (або кнопок на екрані), уникайте перешкод та збирайте заряд!</p>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
