document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.container.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = navLinks.classList.contains('active');
            navLinks.classList.toggle('active');
            if (!isActive) {
                navLinks.style.maxHeight = navLinks.scrollHeight + 'px';
            } else {
                navLinks.style.maxHeight = null;
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navLinks.style.maxHeight = null;
            });
        });

        document.addEventListener('click', (e) => {
            const isClickInsideNav = navLinks.contains(e.target) || navToggle.contains(e.target);
            if (!isClickInsideNav && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navLinks.style.maxHeight = null;
            }
        });

        window.addEventListener('scroll', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                navLinks.style.maxHeight = null;
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.style.maxHeight = null;
                navLinks.classList.remove('active');
            }
        });
    } else {
        console.error('Ошибка: .nav-toggle или .container.nav-links не найдены');
    }

    const emailLink = document.getElementById('copy-text');
    if (emailLink) {
        emailLink.addEventListener('click', (e) => {
            e.preventDefault();
            const emailText = emailLink.textContent;
            navigator.clipboard.writeText(emailText).then(() => {
                showNotification('Сохранено в буфер обмена');ы
            }).catch(err => {
                console.error('Ошибка копирования:', err);
            });
        });
    }

    function showNotification(message) {
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
        }
        notification.innerHTML = '<i class="fas fa-clipboard"></i> Сохранено в буфер обмена';
        notification.classList.add('active');

        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                if (notification && !notification.classList.contains('active')) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }

    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    
    scrollToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
            });
    });
});
