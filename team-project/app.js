let evData = [];

async function loadData() {
    try {
        const response = await fetch('data.json');

        if (!response.ok) {
            throw new Error(`Помилка HTTP: ${response.status}`);
        }
        
        const data = await response.json();

        evData = data.categories;
        
        console.log("Дані успішно завантажено:", evData);
        
    } catch (error) {
        console.error("Помилка при завантаженні даних:", error);
        document.getElementById('main-content').innerHTML = 
            `<div class="alert alert-danger">Не вдалося завантажити дані. Перевірте консоль.</div>`;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});
