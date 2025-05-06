document.addEventListener('DOMContentLoaded', function() {
    // Кеширование элементов
    const cards = Array.from(document.querySelectorAll('.card'));
    const subsections = Array.from(document.querySelectorAll('.subsection'));
    let filterTimeout;

    // Сбор данных
    const sections = [...new Set(
        Array.from(document.querySelectorAll('.subsection h3.title-md'))
            .map(h3 => h3.textContent.trim())
            .filter(Boolean)
    )];

    const authors = [...new Set(
        Array.from(document.querySelectorAll('.authors'))
            .flatMap(el => {
                const text = el.textContent.trim();
                return text ? text.split(/,+/) : [];
            })
            .map(a => a.trim())
            .filter(a => a.length > 0)
    )];

    // Создание фильтров
    function createFilter(parentId, items) {
        const container = document.getElementById(parentId);
        container.innerHTML = items.map(item => `
            <label>
                <input type="checkbox" value="${item}">
                <span>${item}</span>
            </label>
        `).join('');
    }

    createFilter('section-filters', sections);
    createFilter('author-filters', authors);

    // Элементы управления
    const checkboxes = document.querySelectorAll('.filter-options input');
    const resetBtn = document.querySelector('.reset-filters');

    // Обработчики событий
    const filterHandler = () => {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(filterCards, 200);
    };

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterHandler);
    });

    resetBtn.addEventListener('click', () => {
        checkboxes.forEach(checkbox => checkbox.checked = false);
        filterCards();
    });

    // Логика фильтрации
    function filterCards() {
        const activeSections = new Set(
            Array.from(document.querySelectorAll('#section-filters input:checked'))
                .map(cb => cb.value)
        );

        const activeAuthors = new Set(
            Array.from(document.querySelectorAll('#author-filters input:checked'))
                .map(cb => cb.value)
        );

        // Сброс состояния
        cards.forEach(card => card.classList.remove('card--hidden'));
        subsections.forEach(sub => {
            sub.classList.remove('subsection--hidden');
            sub.querySelector('h3')?.classList.remove('subsection-title--hidden');
        });

        // Фильтрация карточек
        cards.forEach(card => {
            const subsection = card.closest('.subsection');
            const sectionTitle = subsection?.querySelector('h3.title-md')?.textContent.trim();
            const cardAuthors = card.querySelector('.authors')?.textContent.split(/,+/).map(a => a.trim()) || [];

            const sectionMatch = activeSections.size === 0 || activeSections.has(sectionTitle);
            const authorMatch = activeAuthors.size === 0 || 
                [...activeAuthors].every(selected => cardAuthors.includes(selected));

            if (!sectionMatch || !authorMatch) {
                card.classList.add('card--hidden');
            }
        });

        // Обновление разделов
        subsections.forEach(subsection => {
            const visibleCards = subsection.querySelectorAll('.card:not(.card--hidden)');
            const title = subsection.querySelector('h3.title-md');

            if (visibleCards.length === 0) {
                subsection.classList.add('subsection--hidden');
                title?.classList.add('subsection-title--hidden');
            } else {
                title?.classList.remove('subsection-title--hidden');
            }
        });
    }

    // Инициализация
    filterCards();
});