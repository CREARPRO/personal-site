// Cargar tema inmediatamente para evitar parpadeo
(function() {
    function getCookieEarly(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    const savedTheme = getCookieEarly('user_theme');
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        document.documentElement.className = savedTheme;
        if (document.body) {
            document.body.className = savedTheme;
        }
    }
})();

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM cargado");
    
    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.getElementById("main-nav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            mainNav.classList.toggle("active");
        });
    }

    // Inicializar vista previa del editor si existe
    initializeEditor();
    
    // Scroll suave para enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 140,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Aplicar personalización (incluyendo tema guardado y botón de tema)
    console.log("Aplicando personalización...");
    applyPersonalization();
});

// Función para inicializar el editor
function initializeEditor() {
    const editor = document.getElementById('editor');
    const previewContent = document.getElementById('previewContent');
    
    console.log("Inicializando editor...");
    console.log("Editor encontrado:", !!editor);
    console.log("Preview encontrado:", !!previewContent);
    
    if (editor && previewContent) {
        // Agregar listener para input
        editor.addEventListener('input', updatePreview);
        
        // Actualizar vista previa inicial
        setTimeout(function() {
            updatePreview();
            console.log("Vista previa inicial cargada");
        }, 500);
    } else {
        console.log("Editor o preview no encontrados");
    }
}

// ===== NUEVAS FUNCIONES INTEGRADAS =====

// Reloj en tiempo real
function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        timeZoneName: 'short' 
    };
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = now.toLocaleDateString('es-ES', options);
    }
}

// Actualizar reloj cada segundo
setInterval(updateClock, 1000);
updateClock();

// Barra de progreso de scroll
window.addEventListener('scroll', function() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
});

// Editor de texto para la sección "¿Quién Soy?"
function formatText(command) {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    let selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    let newText = '';
    
    switch(command) {
        case 'bold':
            newText = `**${selectedText}**`;
            break;
        case 'italic':
            newText = `*${selectedText}*`;
            break;
        case 'underline':
            newText = `<u>${selectedText}</u>`;
            break;
        case 'h2':
            newText = `## ${selectedText}`;
            break;
        case 'h3':
            newText = `### ${selectedText}`;
            break;
        case 'p':
            newText = `${selectedText}\n\n`;
            break;
        default:
            newText = selectedText;
    }
    
    if (selectedText) {
        editor.value = editor.value.substring(0, editor.selectionStart) + newText + editor.value.substring(editor.selectionEnd);
    } else if (command === 'h2' || command === 'h3' || command === 'p') {
        editor.value += newText;
    }
    
    updatePreview();
}

function clearText() {
    const editor = document.getElementById('editor');
    if (editor) {
        editor.value = '';
        updatePreview();
    }
}

function updatePreview() {
    const editor = document.getElementById('editor');
    const previewContent = document.getElementById('previewContent');
    
    console.log("updatePreview ejecutada");
    console.log("Editor disponible:", !!editor);
    console.log("Preview disponible:", !!previewContent);
    
    if (!editor || !previewContent) {
        console.log("No se encontraron elementos necesarios");
        return;
    }
    
    const content = editor.value;
    console.log("Contenido del editor:", content.substring(0, 50) + "...");
    
    let html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
        .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Asegurar que el contenido esté envuelto en párrafos
    if (html && !html.startsWith('<h2') && !html.startsWith('<h3') && !html.startsWith('<p>')) {
        html = '<p>' + html + '</p>';
    }
    
    console.log("HTML generado:", html.substring(0, 100) + "...");
    
    previewContent.innerHTML = html;
    console.log("Vista previa actualizada");
}

// Conversor de divisas
function convertCurrency() {
    const amount = parseFloat(document.getElementById('amount')?.value) || 0;
    const fromCurrency = document.getElementById('fromCurrency')?.value;
    const toCurrency = document.getElementById('toCurrency')?.value;
    
    const rates = {
        'USD_MXN': 17.50,
        'EUR_MXN': 19.20,
        'MXN_USD': 0.057,
        'MXN_EUR': 0.052,
        'USD_EUR': 0.91,
        'EUR_USD': 1.10
    };
    
    let result = 0;
    let symbol = '';
    
    if (fromCurrency === toCurrency) {
        result = amount;
    } else {
        const rateKey = `${fromCurrency}_${toCurrency}`;
        if (rates[rateKey]) {
            result = amount * rates[rateKey];
        }
    }
    
    const symbols = { 'USD': '$', 'EUR': '€', 'MXN': '$' };
    symbol = symbols[toCurrency];
    
    const resultElement = document.getElementById('conversionResult');
    if (resultElement) {
        resultElement.textContent = `${result.toFixed(2)} ${symbol} ${toCurrency}`;
    }
}

// Cuestionario interactivo
let selectedAnswers = {};
let correctAnswers = { 'a': 'c', 'b': 'b', 'c': 'c' };

function selectOption(element, questionId) {
    const options = element.parentElement.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    selectedAnswers[questionId] = element.textContent;
}

function checkAnswers() {
    let score = 0;
    let total = Object.keys(correctAnswers).length;
    
    for (let questionId in correctAnswers) {
        const correctAnswer = correctAnswers[questionId];
        const options = document.querySelectorAll(`.quiz-option[onclick*="'${questionId}'"]`);
        
        options.forEach(option => {
            if (option.textContent === getCorrectAnswerText(questionId, correctAnswer)) {
                option.style.backgroundColor = 'rgba(28, 186, 214, 0.3)';
                option.style.borderColor = '#1CBAD6';
            }
            
            if (selectedAnswers[questionId] === option.textContent) {
                if (option.textContent === getCorrectAnswerText(questionId, correctAnswer)) {
                    score++;
                } else {
                    option.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
                    option.style.borderColor = '#e74c3c';
                }
            }
        });
    }
    
    const scoreElement = document.getElementById('score');
    const messageElement = document.getElementById('quizMessage');
    const resultsElement = document.getElementById('quizResults');
    
    if (scoreElement) scoreElement.textContent = `${score}/${total}`;
    
    let message = '';
    if (score === total) {
        message = '¡Perfecto! ¡Eres un experto en desarrollo web!';
    } else if (score >= total * 0.7) {
        message = '¡Muy bien! Tienes buenos conocimientos.';
    } else if (score >= total * 0.4) {
        message = 'No está mal, pero puedes mejorar.';
    } else {
        message = 'Te recomendamos estudiar más sobre desarrollo web.';
    }
    
    if (messageElement) messageElement.textContent = message;
    if (resultsElement) resultsElement.classList.add('show');
}

function getCorrectAnswerText(questionId, answerKey) {
    const answers = { 'a': 'JavaScript', 'b': 'CSS', 'c': 'React' };
    return answers[answerKey];
}

function resetQuiz() {
    selectedAnswers = {};
    
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
        option.style.backgroundColor = '';
        option.style.borderColor = '';
    });
    
    const resultsElement = document.getElementById('quizResults');
    if (resultsElement) resultsElement.classList.remove('show');
}

// ===== SISTEMA CREATIVO DE COOKIES =====

// Configuración de cookies
const COOKIE_CONFIG = {
    essential: true,
    analytics: false,
    personalization: false,
    functionality: false
};

// Inicializar sistema de cookies cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeCookieSystem();
});

function initializeCookieSystem() {
    // Verificar si ya se ha dado consentimiento
    const consent = getCookie('cookie_consent');
    
    if (!consent) {
        // Mostrar banner después de 2 segundos
        setTimeout(() => {
            showCookieBanner();
        }, 2000);
    } else {
        // Cargar preferencias guardadas
        loadCookiePreferences();
        showCookieStatus();
        
        // Aplicar personalización si está habilitada
        if (getCookieConsent('personalization')) {
            applyPersonalization();
        }
        
        // Aplicar funcionalidad si está habilitada
        if (getCookieConsent('functionality')) {
            applyFunctionality();
        }
    }
}

// Mostrar banner de cookies
function showCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.add('show');
        
        // Agregar efecto de partículas de cookies
        createCookieParticles();
    }
}

// Ocultar banner de cookies
function hideCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.style.display = 'none';
        }, 500);
    }
}

// Aceptar todas las cookies
function acceptAllCookies() {
    COOKIE_CONFIG.analytics = true;
    COOKIE_CONFIG.personalization = true;
    COOKIE_CONFIG.functionality = true;
    
    saveCookieConsent('accepted');
    hideCookieBanner();
    showCookieStatus('accepted');
    
    // Aplicar todas las funcionalidades
    applyPersonalization();
    applyFunctionality();
    
    showCookieNotification('🎉 ¡Todas las cookies aceptadas! Experiencia completa habilitada.', 'success');
}

// Rechazar cookies opcionales
function rejectAllCookies() {
    COOKIE_CONFIG.analytics = false;
    COOKIE_CONFIG.personalization = false;
    COOKIE_CONFIG.functionality = false;
    
    saveCookieConsent('rejected');
    hideCookieBanner();
    showCookieStatus('rejected');
    
    showCookieNotification('🚫 Cookies opcionales rechazadas. Solo cookies esenciales activas.', 'warning');
}

// Mostrar modal de preferencias
function showCookiePreferences() {
    const modal = document.getElementById('cookie-modal');
    if (modal) {
        modal.classList.add('show');
        
        // Cargar estado actual de las preferencias
        loadModalPreferences();
    }
}

// Cerrar modal de preferencias
function closeCookieModal() {
    const modal = document.getElementById('cookie-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Guardar preferencias personalizadas
function saveCustomPreferences() {
    const analytics = document.getElementById('analytics-cookies').checked;
    const personalization = document.getElementById('personalization-cookies').checked;
    const functionality = document.getElementById('functionality-cookies').checked;
    
    COOKIE_CONFIG.analytics = analytics;
    COOKIE_CONFIG.personalization = personalization;
    COOKIE_CONFIG.functionality = functionality;
    
    saveCookieConsent('customized');
    closeCookieModal();
    hideCookieBanner();
    showCookieStatus('customized');
    
    // Aplicar configuraciones
    if (personalization) applyPersonalization();
    if (functionality) applyFunctionality();
    
    showCookieNotification('⚙️ Preferencias guardadas exitosamente', 'info');
}

// Cargar preferencias en el modal
function loadModalPreferences() {
    const analyticsCheckbox = document.getElementById('analytics-cookies');
    const personalizationCheckbox = document.getElementById('personalization-cookies');
    const functionalityCheckbox = document.getElementById('functionality-cookies');
    
    if (analyticsCheckbox) analyticsCheckbox.checked = COOKIE_CONFIG.analytics;
    if (personalizationCheckbox) personalizationCheckbox.checked = COOKIE_CONFIG.personalization;
    if (functionalityCheckbox) functionalityCheckbox.checked = COOKIE_CONFIG.functionality;
}

// Guardar consentimiento de cookies
function saveCookieConsent(type) {
    const consent = {
        type: type,
        timestamp: new Date().toISOString(),
        config: {...COOKIE_CONFIG}
    };
    
    setCookie('cookie_consent', JSON.stringify(consent), 365);
    setCookie('cookie_preferences', JSON.stringify(COOKIE_CONFIG), 365);
}

// Cargar preferencias de cookies guardadas
function loadCookiePreferences() {
    const preferences = getCookie('cookie_preferences');
    if (preferences) {
        try {
            const config = JSON.parse(preferences);
            Object.assign(COOKIE_CONFIG, config);
        } catch (e) {
            console.error('Error al cargar preferencias de cookies:', e);
        }
    }
}

// Mostrar indicador de estado de cookies
function showCookieStatus(type) {
    const status = document.getElementById('cookie-status');
    if (status) {
        status.style.display = 'block';
        status.className = `cookie-status ${type || 'default'}`;
        
        const consent = getCookie('cookie_consent');
        if (consent) {
            try {
                const data = JSON.parse(consent);
                const date = new Date(data.timestamp).toLocaleDateString('es-ES');
                status.title = `Cookies configuradas el ${date}. Click para gestionar.`;
            } catch (e) {
                status.title = 'Click para gestionar cookies';
            }
        }
    }
}

// Aplicar personalización basada en cookies
function applyPersonalization() {
    console.log("Aplicando personalización...");
    
    // Recordar tema preferido - aplicar inmediatamente
    const savedTheme = getCookie('user_theme');
    console.log("Tema guardado:", savedTheme);
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        document.documentElement.className = savedTheme;
        document.body.className = savedTheme;
        console.log("Tema aplicado:", savedTheme);
    } else {
        // Tema por defecto
        document.documentElement.className = 'light';
        document.body.className = 'light';
        console.log("Aplicando tema por defecto: light");
    }
    
    // Recordar nombre del usuario si se proporcionó
    const userData = getCookie('user_data');
    if (userData) {
        try {
            const data = JSON.parse(userData);
            if (data.name) {
                personalizeGreeting(data.name);
            }
        } catch (e) {
            console.error('Error al cargar datos de usuario:', e);
        }
    }
    
    // Agregar botón de cambio de tema
    addThemeToggle();
}

// Aplicar funcionalidad avanzada
function applyFunctionality() {
    // Habilitar guardado automático del progreso
    enableAutoSave();
    
    // Recordar configuraciones del usuario
    loadUserSettings();
    
    // Habilitar notificaciones de progreso
    enableProgressNotifications();
}

// Personalizar saludo
function personalizeGreeting(name) {
    const heroSection = document.querySelector('.hero h2');
    if (heroSection && !heroSection.textContent.includes(name)) {
        heroSection.innerHTML = `¡BIENVENIDO/A, ${name.toUpperCase()}!`;
    }
}

// Agregar botón de cambio de tema
function addThemeToggle() {
    console.log("Ejecutando addThemeToggle...");
    if (document.getElementById('theme-toggle')) {
        console.log("El botón de tema ya existe");
        return; // Ya existe
    }
    
    console.log("Creando botón de tema...");
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.innerHTML = '🌓';
    themeToggle.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: var(--color-accent);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        z-index: 1000;
        font-size: 1.2rem;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('mouseenter', () => {
        themeToggle.style.transform = 'scale(1.1) rotate(180deg)';
    });
    themeToggle.addEventListener('mouseleave', () => {
        themeToggle.style.transform = 'scale(1) rotate(0deg)';
    });
    
    document.body.appendChild(themeToggle);
    console.log("Botón de tema agregado al DOM");
}

// Cambiar tema
function toggleTheme() {
    console.log("Cambiando tema...");
    const body = document.body;
    const currentTheme = body.className.includes('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log("Tema actual:", currentTheme, "-> Nuevo tema:", newTheme);
    
    document.documentElement.className = newTheme;
    body.className = newTheme;
    
    // Siempre guardar el tema (sin depender del consentimiento de cookies)
    setCookie('user_theme', newTheme, 365);
    console.log("Tema guardado en cookie:", newTheme);
    
    // Mostrar notificación solo si hay consentimiento
    if (getCookieConsent && getCookieConsent('personalization')) {
        showCookieNotification(`🎨 Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info');
    }
}

// Habilitar guardado automático
function enableAutoSave() {
    // Guardar progreso del formulario de contacto
    const contactForm = document.querySelector('#contacto form');
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (getCookieConsent('functionality')) {
                    const formData = new FormData(contactForm);
                    const data = Object.fromEntries(formData.entries());
                    setCookie('form_draft', JSON.stringify(data), 7);
                }
            });
        });
    }
}

// Cargar configuraciones del usuario
function loadUserSettings() {
    const settings = getCookie('user_settings');
    if (settings) {
        try {
            const data = JSON.parse(settings);
            // Aplicar configuraciones guardadas
            console.log('Configuraciones cargadas:', data);
        } catch (e) {
            console.error('Error al cargar configuraciones:', e);
        }
    }
}

// Habilitar notificaciones de progreso
function enableProgressNotifications() {
    let scrollNotified = false;
    
    window.addEventListener('scroll', () => {
        if (!scrollNotified && window.scrollY > 1000) {
            showCookieNotification('📊 Progreso guardado automáticamente', 'info');
            scrollNotified = true;
            
            if (getCookieConsent('functionality')) {
                setCookie('scroll_progress', window.scrollY, 1);
            }
        }
    });
}

// Crear efecto de partículas de cookies
function createCookieParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(particleContainer);
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            createSingleParticle(particleContainer);
        }, i * 200);
    }
    
    // Limpiar partículas después de 5 segundos
    setTimeout(() => {
        particleContainer.remove();
    }, 5000);
}

function createSingleParticle(container) {
    const particle = document.createElement('div');
    particle.innerHTML = '🍪';
    particle.style.cssText = `
        position: absolute;
        font-size: 2rem;
        animation: cookieFloat 3s ease-out forwards;
        left: ${Math.random() * 100}%;
        top: 100%;
    `;
    
    // Agregar animación CSS dinámicamente
    if (!document.getElementById('cookie-particles-style')) {
        const style = document.createElement('style');
        style.id = 'cookie-particles-style';
        style.textContent = `
            @keyframes cookieFloat {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.appendChild(particle);
    
    // Eliminar partícula después de la animación
    setTimeout(() => {
        particle.remove();
    }, 3000);
}

// Mostrar notificación
function showCookieNotification(message, type = 'info') {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.cookie-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `cookie-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Ocultar notificación después de 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 4000);
}

// Funciones utilitarias para cookies
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

function getCookieConsent(type) {
    return COOKIE_CONFIG[type] || false;
}

// Función para limpiar todas las cookies (para desarrollo/testing)
function clearAllCookies() {
    const cookies = document.cookie.split(";");
    
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        deleteCookie(name);
    }
    
    // Reiniciar configuración
    COOKIE_CONFIG.analytics = false;
    COOKIE_CONFIG.personalization = false;
    COOKIE_CONFIG.functionality = false;
    
    // Ocultar indicador de estado
    const status = document.getElementById('cookie-status');
    if (status) status.style.display = 'none';
    
    showCookieNotification('🧹 Todas las cookies han sido eliminadas', 'warning');
    
    // Mostrar banner nuevamente después de 2 segundos
    setTimeout(() => {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.style.display = 'block';
            showCookieBanner();
        }
    }, 2000);
}

// Agregar función al objeto global para acceso desde consola (para desarrollo)
window.clearAllCookies = clearAllCookies;

// ===== FUNCIONES ESPECÍFICAS PARA FORMULARIO DE CONTACTO =====

// Inicializar funcionalidades del formulario cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeFormFeatures();
});

function initializeFormFeatures() {
    // Actualizar estado de funcionalidades
    updateFormStatus();
    
    // Configurar autoguardado si está habilitado
    if (getCookieConsent('functionality')) {
        setupAutoSave();
        loadFormDraft();
    }
    
    // Configurar personalización si está habilitada
    if (getCookieConsent('personalization')) {
        setupPersonalization();
    }
    
    // Escuchar cambios en el formulario
    const form = document.querySelector('#contacto form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

function updateFormStatus() {
    const autosaveStatus = document.getElementById('autosave-status');
    const personalizationStatus = document.getElementById('personalization-status');
    
    if (autosaveStatus) {
        const isEnabled = getCookieConsent('functionality');
        autosaveStatus.textContent = isEnabled ? 'Activado ✅' : 'Deshabilitado ❌';
        autosaveStatus.className = isEnabled ? 'enabled' : 'disabled';
    }
    
    if (personalizationStatus) {
        const isEnabled = getCookieConsent('personalization');
        personalizationStatus.textContent = isEnabled ? 'Activada ✅' : 'Deshabilitada ❌';
        personalizationStatus.className = isEnabled ? 'enabled' : 'disabled';
    }
}

function setupAutoSave() {
    const form = document.querySelector('#contacto form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveFormDraft, 1000));
        input.addEventListener('change', saveFormDraft);
    });
    
    showCookieNotification('💾 Autoguardado activado para el formulario', 'info');
}

function setupPersonalization() {
    // Personalizar saludo en el formulario
    const heroSection = document.querySelector('.hero h2');
    const userData = getCookie('user_data');
    
    if (userData && heroSection) {
        try {
            const data = JSON.parse(userData);
            if (data.name) {
                heroSection.textContent = `¡Hola ${data.name}! - Contacto`;
            }
        } catch (e) {
            console.error('Error al cargar datos de usuario:', e);
        }
    }
}

function saveFormDraft() {
    if (!getCookieConsent('functionality')) return;
    
    const form = document.querySelector('#contacto form');
    if (!form) return;
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Incluir checkboxes múltiples
    const checkboxes = form.querySelectorAll('input[type=\"checkbox\"]:checked');
    const checkboxData = {};
    checkboxes.forEach(checkbox => {
        if (!checkboxData[checkbox.name]) {
            checkboxData[checkbox.name] = [];
        }
        checkboxData[checkbox.name].push(checkbox.value);
    });
    
    const draftData = {
        ...data,
        ...checkboxData,
        timestamp: new Date().toISOString()
    };
    
    setCookie('form_draft', JSON.stringify(draftData), 7);
    
    // Mostrar indicador visual de guardado
    showTemporaryIndicator('💾 Borrador guardado');
}

function loadFormDraft() {
    const draft = getCookie('form_draft');
    if (!draft) {
        showCookieNotification('📄 No hay borrador guardado', 'warning');
        return;
    }
    
    try {
        const data = JSON.parse(draft);
        const form = document.querySelector('#contacto form');
        if (!form) return;
        
        // Cargar datos en el formulario
        Object.keys(data).forEach(key => {
            if (key === 'timestamp') return;
            
            const element = form.querySelector(`[name=\"${key}\"]`);
            if (element) {
                if (element.type === 'checkbox' || element.type === 'radio') {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(value => {
                            const checkbox = form.querySelector(`[name=\"${key}\"][value=\"${value}\"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    } else {
                        element.checked = element.value === data[key];
                    }
                } else {
                    element.value = data[key];
                }
            }
        });
        
        const date = new Date(data.timestamp).toLocaleString('es-ES');
        showCookieNotification(`📄 Borrador cargado (guardado: ${date})`, 'success');
        
    } catch (e) {
        console.error('Error al cargar borrador:', e);
        showCookieNotification('❌ Error al cargar el borrador', 'warning');
    }
}

function clearForm() {
    const form = document.querySelector('#contacto form');
    if (!form) return;
    
    if (confirm('¿Está seguro de que desea limpiar todo el formulario?')) {
        form.reset();
        
        // Eliminar borrador guardado
        if (getCookieConsent('functionality')) {
            deleteCookie('form_draft');
        }
        
        showCookieNotification('🗑️ Formulario limpiado', 'info');
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Simular envío del formulario
    showCookieNotification('📨 Enviando mensaje...', 'info');
    
    setTimeout(() => {
        // Guardar datos del usuario si la personalización está habilitada
        if (getCookieConsent('personalization') && data.nombre) {
            const userData = {
                name: data.nombre,
                email: data.email,
                lastContact: new Date().toISOString()
            };
            setCookie('user_data', JSON.stringify(userData), 365);
        }
        
        // Limpiar borrador después del envío exitoso
        if (getCookieConsent('functionality')) {
            deleteCookie('form_draft');
        }
        
        showCookieNotification('✅ Mensaje enviado exitosamente', 'success');
        
        // Mostrar mensaje de confirmación personalizado
        const userName = data.nombre || 'Usuario';
        alert(`¡Gracias ${userName}! Su mensaje ha sido enviado. Nos pondremos en contacto pronto.`);
        
        // Limpiar formulario
        form.reset();
        
    }, 2000);
}

function loadDraft() {
    if (!getCookieConsent('functionality')) {
        showCookieNotification('🚫 Active las cookies de funcionalidad para usar esta función', 'warning');
        return;
    }
    
    loadFormDraft();
}

// Función utilitaria para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mostrar indicador temporal
function showTemporaryIndicator(message) {
    const indicator = document.createElement('div');
    indicator.textContent = message;
    indicator.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: var(--color-accent);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.8rem;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => indicator.style.opacity = '1', 100);
    
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }, 2000);
}
