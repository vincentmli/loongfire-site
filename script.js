// Language toggle
(function() {
    const toggleBtn = document.getElementById('langToggle');
    const body = document.body;

    function getCurrentLang() {
        if (body.classList.contains('lang-zh')) return 'zh';
        return 'en';
    }

    function setLanguage(lang) {
        body.classList.remove('lang-en', 'lang-zh');
        body.classList.add('lang-' + lang);
        const icon = toggleBtn.querySelector('i');
        icon.className = (lang === 'zh') ? 'fas fa-language' : 'fas fa-globe';
        localStorage.setItem('loongfire-lang', lang);
    }

    const saved = localStorage.getItem('loongfire-lang');
    if (saved === 'zh' || saved === 'en') {
        setLanguage(saved);
    } else {
        setLanguage('en');
    }

    toggleBtn.addEventListener('click', function() {
        const current = getCurrentLang();
        const next = current === 'en' ? 'zh' : 'en';
        setLanguage(next);
    });
})();

// CAPTCHA system
(function() {
    const overlay = document.getElementById('captchaOverlay');
    const showBtn = document.getElementById('showCaptchaBtn');
    const closeBtn = document.getElementById('closeCaptchaBtn');
    const verifyBtn = document.getElementById('verifyCaptchaBtn');
    const refreshBtn = document.getElementById('refreshCaptchaBtn');
    const captchaInput = document.getElementById('captchaInput');
    const num1El = document.getElementById('num1');
    const num2El = document.getElementById('num2');
    const errorEl = document.getElementById('captchaError');
    const successEl = document.getElementById('captchaSuccess');
    const emailRevealed = document.getElementById('emailRevealed');
    
    let currentAnswer = 0;
    let isVerified = false;

    function generateChallenge() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        num1El.textContent = num1;
        num2El.textContent = num2;
        currentAnswer = num1 + num2;
        errorEl.classList.remove('show');
        successEl.classList.remove('show');
        captchaInput.value = '';
        captchaInput.focus();
        isVerified = false;
        // If email was previously revealed, hide it again when new challenge is generated
        emailRevealed.classList.remove('show');
    }

    function verifyCaptcha() {
        const userAnswer = parseInt(captchaInput.value);
        if (isNaN(userAnswer)) {
            errorEl.textContent = document.body.classList.contains('lang-zh') ? 
                '请输入一个数字' : 'Please enter a number';
            errorEl.classList.add('show');
            return;
        }

        if (userAnswer === currentAnswer) {
            errorEl.classList.remove('show');
            successEl.classList.add('show');
            isVerified = true;
            verifyBtn.disabled = true;
            // Reveal email after successful verification
            emailRevealed.classList.add('show');
            // Auto-close after 2 seconds
            setTimeout(() => {
                closeCaptcha();
            }, 2000);
        } else {
            errorEl.textContent = document.body.classList.contains('lang-zh') ? 
                '答案错误。请重试。' : 'Incorrect answer. Please try again.';
            errorEl.classList.add('show');
            captchaInput.value = '';
            captchaInput.focus();
            // Generate new challenge on wrong answer
            setTimeout(() => {
                generateChallenge();
            }, 500);
        }
    }

    function openCaptcha() {
        overlay.classList.add('active');
        generateChallenge();
        document.body.style.overflow = 'hidden';
        setTimeout(() => captchaInput.focus(), 100);
    }

    function closeCaptcha() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        // If verified, keep email shown; if not, hide it
        if (!isVerified) {
            emailRevealed.classList.remove('show');
        }
        verifyBtn.disabled = false;
    }

    // Event listeners
    showBtn.addEventListener('click', openCaptcha);
    closeBtn.addEventListener('click', closeCaptcha);
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeCaptcha();
        }
    });

    verifyBtn.addEventListener('click', verifyCaptcha);
    
    captchaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyCaptcha();
        }
    });

    refreshBtn.addEventListener('click', function() {
        generateChallenge();
        verifyBtn.disabled = false;
        emailRevealed.classList.remove('show');
    });

    // Contact nav link
    document.getElementById('contactNavLink').addEventListener('click', function(e) {
        e.preventDefault();
        const contactSection = document.querySelector('.contact-section');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            contactSection.style.transition = 'box-shadow 0.3s';
            contactSection.style.boxShadow = '0 0 0 3px #d4a54a, 0 8px 24px rgba(0,0,0,0.15)';
            setTimeout(() => {
                contactSection.style.boxShadow = 'none';
            }, 2000);
        }
        // Auto-open CAPTCHA after scrolling
        setTimeout(() => {
            openCaptcha();
        }, 600);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Close mobile dropdown if open
                const dropdownContent = this.closest('.dropdown-content');
                if (dropdownContent) {
                    dropdownContent.style.display = 'none';
                }
            }
        });
    });

    // Expose for debugging
    window.captcha = { generateChallenge, verifyCaptcha, openCaptcha, closeCaptcha };
})();

// News ticker
(function() {
    const newsItems = document.querySelectorAll('.news-item');
    let currentIndex = 0;
    let newsInterval;

    function showNews(index) {
        // Hide all news items
        newsItems.forEach(item => item.classList.remove('active'));
        // Show the current one
        if (newsItems[index]) {
            newsItems[index].classList.add('active');
        }
    }

    function nextNews() {
        currentIndex = (currentIndex + 1) % newsItems.length;
        showNews(currentIndex);
    }

    function startNewsTicker() {
        // Clear any existing interval
        if (newsInterval) {
            clearInterval(newsInterval);
        }
        // Start the ticker (change every 5 seconds)
        newsInterval = setInterval(nextNews, 5000);
    }

    // Initialize: show first news item
    if (newsItems.length > 0) {
        showNews(0);
        startNewsTicker();

        // Pause on hover
        const ticker = document.querySelector('.news-ticker');
        if (ticker) {
            ticker.addEventListener('mouseenter', function() {
                clearInterval(newsInterval);
            });
            ticker.addEventListener('mouseleave', function() {
                startNewsTicker();
            });
        }
    }
})();

// Team section "Contact us" link - scroll to contact and open CAPTCHA
(function() {
    const teamContactLink = document.getElementById('teamContactLink');
    const teamContactLinkZh = document.getElementById('teamContactLinkZh');
    const contactSection = document.getElementById('contactSection');

    function handleTeamContact(e) {
        e.preventDefault();
        if (contactSection) {
            // Scroll to contact section
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the contact section
            contactSection.style.transition = 'box-shadow 0.3s';
            contactSection.style.boxShadow = '0 0 0 3px #d4a54a, 0 8px 24px rgba(0,0,0,0.15)';
            setTimeout(() => {
                contactSection.style.boxShadow = 'none';
            }, 2000);
        }
        // Auto-open CAPTCHA after scrolling
        setTimeout(() => {
            if (window.captcha && window.captcha.openCaptcha) {
                window.captcha.openCaptcha();
            }
        }, 600);
    }

    if (teamContactLink) {
        teamContactLink.addEventListener('click', handleTeamContact);
    }
    if (teamContactLinkZh) {
        teamContactLinkZh.addEventListener('click', handleTeamContact);
    }
})();
