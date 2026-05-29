/* ==========================================================================
   SYMBIOSIS.CO - INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SMART SCROLL NAVIGATION ---
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    let lastScrollY = window.scrollY;

    // Handle scroll header style and direction hide/show
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Scrolled background style
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide/Show navbar based on scroll direction (desktop only)
        if (window.innerWidth > 768) {
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
                // Scrolling down - Hide
                header.style.transform = 'translate(-50%, -100px)';
            } else {
                // Scrolling up - Show
                header.style.transform = 'translate(-50%, 0)';
            }
        }
        
        lastScrollY = currentScrollY;
    });

    // Mobile Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            // Toggle hamburger animation
            const spans = menuToggle.querySelectorAll('span');
            if (navMenu.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -7px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Close menu on link click (mobile)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // --- 2. ACTIVE SECTION LINK ON SCROLL (INTERSECTION OBSERVER) ---
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the middle portion
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (section.id) sectionObserver.observe(section);
    });


    // --- 3. REAL-TIME IMPACT GLOBAL COUNTERS ---
    const counterElements = {
        co2: { element: document.getElementById('count-co2'), base: 145248.5, rate: 0.12, decimals: 1, suffix: ' t' },
        invest: { element: document.getElementById('count-invest'), base: 12450000, rate: 15.5, decimals: 0, prefix: '$', suffix: ' USD' },
        hectares: { element: document.getElementById('count-hectares'), base: 84320.0, rate: 0.04, decimals: 2, suffix: ' ha' }
    };

    // Fast initial count-up
    function initCounters() {
        Object.keys(counterElements).forEach(key => {
            const data = counterElements[key];
            if (!data.element) return;
            
            let start = data.base - (data.rate * 100);
            const duration = 2000; // 2 seconds count up
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = (data.base - start) / steps;
            let current = start;
            let stepCount = 0;

            const timer = setInterval(() => {
                current += increment;
                stepCount++;
                
                if (stepCount >= steps) {
                    clearInterval(timer);
                    data.element.innerText = formatNumber(data.base, data.decimals, data.prefix, data.suffix);
                    // Start continuous ticking after initial count up
                    startTicking(data);
                } else {
                    data.element.innerText = formatNumber(current, data.decimals, data.prefix, data.suffix);
                }
            }, stepTime);
        });
    }

    // Continuous slow live increment
    function startTicking(counterData) {
        let currentValue = counterData.base;
        setInterval(() => {
            currentValue += counterData.rate * (0.8 + Math.random() * 0.4); // Add random fluctuation
            counterData.element.innerText = formatNumber(currentValue, counterData.decimals, counterData.prefix, counterData.suffix);
        }, 1000);
    }

    function formatNumber(num, decimals, prefix = '', suffix = '') {
        const formatted = num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `${prefix}${formatted}${suffix}`;
    }

    initCounters();


    // --- 4. INTERACTIVE ESG & ROI SIMULATOR ---
    const industryData = {
        manufacturing: { co2Factor: 0.85, esgBase: 35, esgMaxImprove: 45, roiMultiplier: 1.4, paybackBase: 4.5, lbl: 'Manufactura e Industrial' },
        technology: { co2Factor: 0.35, esgBase: 55, esgMaxImprove: 28, roiMultiplier: 2.2, paybackBase: 3.0, lbl: 'Tecnología & Servicios' },
        agriculture: { co2Factor: 0.95, esgBase: 25, esgMaxImprove: 52, roiMultiplier: 1.6, paybackBase: 4.0, lbl: 'Agroindustria & Alimentos' },
        finance: { co2Factor: 0.20, esgBase: 65, esgMaxImprove: 20, roiMultiplier: 2.6, paybackBase: 2.5, lbl: 'Banca & Servicios Financieros' }
    };

    const selectIndustry = document.getElementById('sim-sector');
    const sliderBudget = document.getElementById('sim-presupuesto');
    const sliderEnergy = document.getElementById('sim-energia');

    const valBudget = document.getElementById('val-presupuesto');
    const valEnergy = document.getElementById('val-energia');

    const resultCO2 = document.getElementById('res-co2');
    const resultESG = document.getElementById('res-esg');
    const resultROI = document.getElementById('res-roi');
    const resultPayback = document.getElementById('res-payback');

    const radialCircle = document.getElementById('radial-progress-circle');
    const radialText = document.getElementById('radial-value');

    // Circle perimeter calculation
    const circleRadius = 35;
    const circleCircumference = 2 * Math.PI * circleRadius;
    if (radialCircle) {
        radialCircle.style.strokeDasharray = `${circleCircumference} ${circleCircumference}`;
    }

    function updateSimulator() {
        if (!selectIndustry || !sliderBudget || !sliderEnergy) return;

        const industryKey = selectIndustry.value;
        const budget = parseInt(sliderBudget.value, 10);
        const energyMix = parseInt(sliderEnergy.value, 10);

        const ind = industryData[industryKey];

        // Format controls labels
        valBudget.innerText = `$${(budget / 1000).toFixed(0)}k USD`;
        valEnergy.innerText = `${energyMix}%`;

        // CALCULATIONS:
        // 1. Carbon Offset (Tons CO2 / year): Scales with budget and inversely with current clean energy mix
        const currentFossilPercent = 100 - energyMix;
        const co2Offset = (budget * 0.08 * (currentFossilPercent / 100) * ind.co2Factor).toFixed(0);

        // 2. ESG Score: Base industry rating + improvement based on investment and clean energy transition
        const energyImprovement = (energyMix / 100) * ind.esgMaxImprove;
        const budgetImprovement = (budget / 1000000) * (ind.esgMaxImprove * 0.4);
        const totalESG = Math.min(ind.esgBase + energyImprovement + budgetImprovement, 95).toFixed(0);

        // 3. ROI Proyectado: returns based on budget and efficiency factors
        const projectedROI = (budget * ind.roiMultiplier * (1 + (currentFossilPercent / 200))).toFixed(0);

        // 4. Payback Period (years)
        const payback = Math.max(ind.paybackBase * (1 - (energyMix / 300)), 1.5).toFixed(1);

        // Update Text Results
        resultCO2.innerText = `${parseInt(co2Offset).toLocaleString('es-ES')} t`;
        resultROI.innerText = `$${parseInt(projectedROI).toLocaleString('es-ES')} USD`;
        resultPayback.innerText = `${payback} Años`;
        resultESG.innerText = `${totalESG}/100`;

        // Update Circular Progress Bar
        if (radialCircle && radialText) {
            radialText.innerText = `+${(totalESG - ind.esgBase).toFixed(0)}%`;
            const offset = circleCircumference - ((totalESG / 100) * circleCircumference);
            radialCircle.style.strokeDashoffset = offset;
        }
    }

    if (selectIndustry && sliderBudget && sliderEnergy) {
        selectIndustry.addEventListener('change', updateSimulator);
        sliderBudget.addEventListener('input', updateSimulator);
        sliderEnergy.addEventListener('input', updateSimulator);
        
        // Initial Trigger
        updateSimulator();
    }


    // --- 5. PORTFOLIO FILTERING ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const caseCards = document.querySelectorAll('.case-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State on Buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-filter');

            caseCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    // Trigger fade-in effect
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });


    // --- 6. DYNAMIC CONTACT FORM VALIDATION & SIMULATED SUBMISSION ---
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Select inputs
            const nameInput = document.getElementById('form-name');
            const emailInput = document.getElementById('form-email');
            const messageInput = document.getElementById('form-message');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            // Reset validation states
            let isValid = true;
            formFeedback.className = 'form-feedback';
            formFeedback.style.display = 'none';

            // Validate Name
            if (nameInput.value.trim().length < 3) {
                isValid = false;
                nameInput.style.borderColor = '#ff0055';
            } else {
                nameInput.style.borderColor = 'rgba(0, 255, 179, 0.15)';
            }

            // Validate Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                isValid = false;
                emailInput.style.borderColor = '#ff0055';
            } else {
                emailInput.style.borderColor = 'rgba(0, 255, 179, 0.15)';
            }

            // Validate Message
            if (messageInput.value.trim().length < 10) {
                isValid = false;
                messageInput.style.borderColor = '#ff0055';
            } else {
                messageInput.style.borderColor = 'rgba(0, 255, 179, 0.15)';
            }

            if (!isValid) {
                formFeedback.innerText = 'Por favor, rellene los campos correctamente con información válida.';
                formFeedback.classList.add('error');
                return;
            }

            // If Valid, Simulate API Sending
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Enviando propuesta...</span> <div class="spinner"></div>';
            
            // Inline Spinner CSS addition just for dynamic submission loader
            if (!document.getElementById('spinner-style')) {
                const style = document.createElement('style');
                style.id = 'spinner-style';
                style.innerText = `
                    .spinner {
                        border: 2px solid rgba(255,255,255,0.1);
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        border-left-color: #000;
                        animation: spin 0.8s linear infinite;
                        display: inline-block;
                        vertical-align: middle;
                    }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `;
                document.head.appendChild(style);
            }

            setTimeout(() => {
                // Success Response
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                formFeedback.innerHTML = '<strong>¡Mensaje enviado con éxito!</strong> Un consultor regional de <em>symbiosis.co</em> se pondrá en contacto en menos de 24 horas para agendar su sesión diagnóstica.';
                formFeedback.classList.add('success');

                // Reset form inputs (making sure floating labels reset too)
                contactForm.reset();
                
                // Remove green borders
                nameInput.style.borderColor = '';
                emailInput.style.borderColor = '';
                messageInput.style.borderColor = '';
            }, 1800);
        });
    }

    // --- 7. COOKIE CONSENT BANNER SYSTEM ---
    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept-btn');

    if (cookieBanner && cookieAcceptBtn) {
        // Check if the user has already accepted cookies
        const hasAccepted = localStorage.getItem('symbiosis_cookies_accept');
        
        if (!hasAccepted) {
            // Show the banner smoothly after 2.5 seconds
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 2500);
        }

        // Handle the accept button click
        cookieAcceptBtn.addEventListener('click', () => {
            localStorage.setItem('symbiosis_cookies_accept', 'true');
            cookieBanner.classList.remove('show');
        });
    }
});
