// script_import.js
document.addEventListener('DOMContentLoaded', () => {
    // Находим все элементы <p> с атрибутом src
    const paragraphs = document.querySelectorAll('p[src]');
    
    paragraphs.forEach(paragraph => {
        const filePath = paragraph.getAttribute('src');
        
        // Загружаем содержимое файла
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить файл');
                }
                return response.text();
            })
            .then(data => {
                paragraph.innerText = data; // Вставляем текст в <p>
            })
            .catch(error => {
                console.error('Ошибка:', error);
                paragraph.innerText = 'Ошибка загрузки файла';
            });
    });
});