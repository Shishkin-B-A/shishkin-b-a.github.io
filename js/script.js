document.addEventListener('DOMContentLoaded', () => {
    // Переключение мобильной навигации
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.container.nav-links');

    if (navToggle && navLinks) {
        // Открытие/закрытие при клике на бургер
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = navLinks.classList.contains('active');
            navLinks.classList.toggle('active');
            
            if (!isActive) {
                navLinks.style.maxHeight = navLinks.scrollHeight + 'px';
            } else {
                navLinks.style.maxHeight = null;
            }
            
            console.log('Кнопка гамбургера нажата на странице:', window.location.pathname);
        });

        // Закрытие при клике на ссылку
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navLinks.style.maxHeight = null;
            });
        });

        // Закрытие при клике вне навигации
        document.addEventListener('click', (e) => {
            const isClickInsideNav = navLinks.contains(e.target) || navToggle.contains(e.target);
            if (!isClickInsideNav && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navLinks.style.maxHeight = null;
                console.log('Клик вне навигации, меню скрыто');
            }
        });

        // Закрытие при прокрутке страницы (включая колёсико)
        window.addEventListener('scroll', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navLinks.style.maxHeight = null;
                console.log('Прокрутка страницы, меню скрыто');
            }
        });

        // Сброс стилей при переходе на десктоп
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