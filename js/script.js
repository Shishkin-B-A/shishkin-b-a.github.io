document.addEventListener('DOMContentLoaded', () => {
    // Переключение мобильной навигации
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.container.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.contains('active');
            navLinks.classList.toggle('active');
            
            // Устанавливаем max-height для анимации при закрытии
            if (!isActive) {
                navLinks.style.maxHeight = navLinks.scrollHeight + 'px'; // Устанавливаем реальную высоту
            } else {
                navLinks.style.maxHeight = null; // Сбрасываем для закрытия
            }
            
            console.log('Бургер нажат');
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navLinks.style.maxHeight = null; // Сбрасываем высоту при закрытии
            });
        });

        // Сбрасываем inline-стили при изменении размера окна (для десктопа)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.style.maxHeight = null;
                navLinks.classList.remove('active');
            }
        });
    } else {
        console.error('Ошибка: .nav-toggle или .container.nav-links не найдены');
    }
});