/* FILE: loginController.js */
/* SHEKINAH LOGIN - Controlador */

let loginState = {
    isLoading: false,
    isVisible: false
};

/* ========================================================
   FUNCIÓN PRINCIPAL - EXPORTADA
   ======================================================== */
export async function loginController() {
    console.log('🔐 Login Controller - SHEKINAH');

    // Esperar a que el DOM esté listo
    await new Promise(resolve => setTimeout(resolve, 100));

    // Cachear elementos
    const elements = {
        form: document.getElementById('loginForm'),
        email: document.getElementById('loginUser'),
        password: document.getElementById('loginPassword'),
        togglePassword: document.getElementById('togglePassword'),
        submitBtn: document.getElementById('loginBtn'),
        loader: document.getElementById('loginLoader'),
        btnText: document.querySelector('.login-btn-text'),
        error: document.getElementById('loginError'),
        errorMsg: document.getElementById('loginErrorMessage'),
        rememberMe: document.getElementById('rememberMe'),
        registerBtn: document.getElementById('registerBtn')
    };

    // Verificar que el formulario existe
    if (!elements.form) {
        console.warn('⚠️ Login form no encontrado');
        return;
    }

    // Inicializar eventos
    bindEvents(elements);
    checkRememberMe(elements);

    console.log('✅ Login Controller inicializado');
}

/* ========================================================
   VINCULAR EVENTOS
   ======================================================== */
function bindEvents(elements) {
    // Envío del formulario
    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin(elements);
    });

    // Mostrar/ocultar contraseña
    if (elements.togglePassword) {
        elements.togglePassword.addEventListener('click', () => {
            togglePasswordVisibility(elements);
        });
    }

    // Botón de registro
    if (elements.registerBtn) {
        elements.registerBtn.addEventListener('click', () => {
            showToast('📝 Redirigiendo al registro...');
        });
    }

    // Enter en los campos
    elements.email.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            elements.password.focus();
        }
    });

    elements.password.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin(elements);
        }
    });
}

/* ========================================================
   MANEJAR LOGIN
   ======================================================== */
function handleLogin(elements) {
    // Validar campos
    const email = elements.email.value.trim();
    const password = elements.password.value.trim();

    if (!email || !password) {
        showError(elements, 'Por favor, completa todos los campos');
        shakeElement(elements.form);
        return;
    }

    // Simular carga
    setLoading(elements, true);

    // Simular petición al servidor
    setTimeout(() => {
        // Validación de ejemplo
        if (email === 'admin@shekinah.com' && password === 'admin123') {
            // Login exitoso
            setLoading(elements, false);
            hideError(elements);
            
            // Guardar sesión
            if (elements.rememberMe.checked) {
                localStorage.setItem('shekinah_user', email);
            }
            
            showToast('✅ ¡Bienvenido a SHEKINAH Logistics!');
            
            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } else {
            // Login fallido
            setLoading(elements, false);
            showError(elements, 'Usuario o contraseña incorrectos');
        }
    }, 2000);
}

/* ========================================================
   MOSTRAR/OCULTAR CONTRASEÑA
   ======================================================== */
function togglePasswordVisibility(elements) {
    const input = elements.password;
    const icon = elements.togglePassword.querySelector('.material-symbols-outlined');

    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility_off';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility';
    }
}

/* ========================================================
   ESTADO DE CARGA
   ======================================================== */
function setLoading(elements, loading) {
    loginState.isLoading = loading;
    
    if (loading) {
        elements.submitBtn.classList.add('loading');
        elements.btnText.style.display = 'none';
        elements.loader.style.display = 'flex';
        elements.submitBtn.disabled = true;
    } else {
        elements.submitBtn.classList.remove('loading');
        elements.btnText.style.display = 'block';
        elements.loader.style.display = 'none';
        elements.submitBtn.disabled = false;
    }
}

/* ========================================================
   ERRORES
   ======================================================== */
function showError(elements, message) {
    elements.errorMsg.textContent = message;
    elements.error.classList.add('show');
    elements.error.style.display = 'flex';
}

function hideError(elements) {
    elements.error.classList.remove('show');
    elements.error.style.display = 'none';
}

/* ========================================================
   RECORDAR SESIÓN
   ======================================================== */
function checkRememberMe(elements) {
    const savedUser = localStorage.getItem('shekinah_user');
    if (savedUser) {
        elements.email.value = savedUser;
        elements.rememberMe.checked = true;
    }
}

/* ========================================================
   ANIMACIONES
   ======================================================== */
function shakeElement(element) {
    element.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

// Agregar keyframe de shake
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-8px); }
        40% { transform: translateX(8px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
    }
`;
document.head.appendChild(styleSheet);

/* ========================================================
   TOAST NOTIFICATION (reutilizada)
   ======================================================== */
function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(11, 15, 26, 0.95);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(62, 146, 204, 0.2);
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Work Sans', sans-serif;
        font-size: 0.85rem;
        z-index: 10000;
        animation: fadeInUp 0.3s ease;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        max-width: 90%;
        text-align: center;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}