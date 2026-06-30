/* FILE: homeController.js
   ========================================================
   CONTROLADOR PARA HOME CON SCROLL VIRTUAL
   - Sin scroll nativo (overflow: hidden)
   - Cambio de slides con eventos de rueda/tactil
   - CORREGIDO PARA MÓVIL
   ======================================================== */

let currentSlide = 0;
const totalSlides = 5;
let scrollTimeout = null;
let threeInitialized = false;
let autoSlideInterval = null;
let isAutoSliding = true;
let isUserInteracting = false;
let isScrolling = false;

// Variables para control táctil
let touchStartY = 0;
let touchEndY = 0;
let isSwiping = false;
let touchActive = false;

/* ========================================================
   FUNCION PRINCIPAL - EXPORTADA
   ======================================================== */
export async function homeController() {

    await new Promise(resolve => setTimeout(resolve, 100));

    // Inicializar el contenido principal
    initScrollDetection();
    initTouchDetection();
    initStepIndicators();
    initButtons();
    initThreeJs();
    
    // INICIAR ANIMACION DE SPLASH
    initSplashAnimation();
    
    // Iniciar auto-slide DESPUES de que termine la animacion
    setTimeout(() => {
        startAutoSlide();
    }, 5000);

    // ESCUCHAR NAVEGACION DESDE EL NAVBAR
    document.addEventListener('navigate:toSlide', (e) => {
        if (e.detail && e.detail.index !== undefined) {
            isUserInteracting = true;
            isScrolling = true;
            goToSlide(e.detail.index);
            setTimeout(() => {
                isScrolling = false;
                isUserInteracting = false;
            }, 1500);
        }
    });
}

/* ========================================================
   ANIMACION DE SPLASH
   ======================================================== */
function initSplashAnimation() {
    const splash = document.getElementById('splashScreen');
    const avion = document.getElementById('airplane');

    if (!splash) {
        return;
    }

    if (avion) {
        avion.addEventListener('animationend', function() {
            if (!splash.classList.contains('sweeping')) {
                splash.classList.add('sweeping');
            }
            
            setTimeout(() => {
                splash.classList.add('hidden');
                document.dispatchEvent(new CustomEvent('splash:completed'));
            }, 2200);
        });
    }

    setTimeout(() => {
        splash.classList.add('sweeping');
    }, 3500);

    setTimeout(() => {
        if (!splash.classList.contains('hidden')) {
            splash.classList.add('sweeping');
            setTimeout(() => {
                splash.classList.add('hidden');
                document.dispatchEvent(new CustomEvent('splash:completed'));
            }, 2200);
        }
    }, 8000);
}

/* ========================================================
   AUTO-SLIDE CADA 10 SEGUNDOS
   ======================================================== */
function startAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }

    autoSlideInterval = setInterval(() => {
        if (!isAutoSliding || isUserInteracting) return;

        let nextSlide = currentSlide + 1;
        if (nextSlide >= totalSlides) {
            nextSlide = 0;
        }

        goToSlide(nextSlide);
    }, 10000);
}

/* ========================================================
   IR A UN SLIDE ESPECIFICO (SIN SCROLL NATIVO)
   ======================================================== */
function goToSlide(index) {
    currentSlide = index;
    updateActiveSlide(currentSlide);
}

/* ========================================================
   DETECCION DE SCROLL CON RULETA (DESKTOP)
   ======================================================== */
function initScrollDetection() {
    let scrollDirection = 0;
    let lastWheelTime = 0;

    // Escuchar en el documento completo
    document.addEventListener('wheel', (e) => {
        // No prevenir default en móviles con touchpad
        // Solo prevenir si es realmente un scroll de escritorio
        if (!e.touches) {
            e.preventDefault();
        }

        const now = Date.now();
        if (now - lastWheelTime < 800) return;
        lastWheelTime = now;

        if (isScrolling) return;

        const delta = e.deltaY;

        if (delta > 0) {
            scrollDirection = 1;
        } else if (delta < 0) {
            scrollDirection = -1;
        } else {
            return;
        }

        let nextSlide = currentSlide + scrollDirection;

        if (nextSlide < 0) nextSlide = 0;
        if (nextSlide >= totalSlides) nextSlide = totalSlides - 1;

        if (nextSlide !== currentSlide) {
            isScrolling = true;
            isUserInteracting = true;

            goToSlide(nextSlide);

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                isUserInteracting = false;
            }, 800);
        }

    }, { passive: false });

    // Teclado (flechas)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (isScrolling) return;

            let nextSlide = currentSlide + 1;
            if (nextSlide >= totalSlides) nextSlide = totalSlides - 1;

            if (nextSlide !== currentSlide) {
                isScrolling = true;
                isUserInteracting = true;
                goToSlide(nextSlide);

                setTimeout(() => {
                    isScrolling = false;
                    isUserInteracting = false;
                }, 800);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (isScrolling) return;

            let nextSlide = currentSlide - 1;
            if (nextSlide < 0) nextSlide = 0;

            if (nextSlide !== currentSlide) {
                isScrolling = true;
                isUserInteracting = true;
                goToSlide(nextSlide);

                setTimeout(() => {
                    isScrolling = false;
                    isUserInteracting = false;
                }, 800);
            }
        }
    });
}

/* ========================================================
   DETECCION TACTIL PARA MOVIL - CORREGIDA
   ======================================================== */
function initTouchDetection() {
    // Usar el body como capturador de eventos táctiles
    const target = document.body;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    let touchTimeout = null;

    // Prevenir scroll nativo en todo el body
    target.addEventListener('touchmove', (e) => {
        // Solo prevenir si estamos dentro del área de la app
        if (e.target.closest('.home-main') || e.target.closest('#scrollContainer')) {
            e.preventDefault();
        }
    }, { passive: false });

    // Touch start - capturar posición inicial
    target.addEventListener('touchstart', (e) => {
        // Solo procesar toques dentro del área de la app
        if (!e.target.closest('.home-main') && !e.target.closest('#scrollContainer')) {
            return;
        }
        
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        touchStartX = touch.clientX;
        isSwiping = false;
        touchActive = true;
        
        // Detener auto-slide durante interacción táctil
        isUserInteracting = true;
        
        // Limpiar timeout anterior
        if (touchTimeout) {
            clearTimeout(touchTimeout);
            touchTimeout = null;
        }
    }, { passive: true });

    // Touch move - detectar deslizamiento vertical
    target.addEventListener('touchmove', (e) => {
        // Solo procesar toques dentro del área de la app
        if (!e.target.closest('.home-main') && !e.target.closest('#scrollContainer')) {
            return;
        }
        
        if (isScrolling || !touchActive) return;

        const touch = e.touches[0];
        const deltaY = touchStartY - touch.clientY;
        const deltaX = Math.abs(touchStartX - touch.clientX);

        // Si es movimiento horizontal, ignorar (para no interferir con otros gestos)
        if (deltaX > 30) {
            return;
        }

        // Umbral mínimo de 30px para considerar un swipe
        if (Math.abs(deltaY) < 30) return;

        // Marcar como swipe
        isSwiping = true;

        let nextSlide = currentSlide;

        if (deltaY > 0) {
            // Deslizar hacia arriba → siguiente slide
            nextSlide = currentSlide + 1;
        } else if (deltaY < 0) {
            // Deslizar hacia abajo → slide anterior
            nextSlide = currentSlide - 1;
        }

        // Validar límites
        if (nextSlide < 0) nextSlide = 0;
        if (nextSlide >= totalSlides) nextSlide = totalSlides - 1;

        if (nextSlide !== currentSlide) {
            isScrolling = true;
            
            // Bloquear auto-slide temporalmente
            isAutoSliding = false;
            
            goToSlide(nextSlide);

            // Reactivar auto-slide después de un tiempo
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                isAutoSliding = true;
                isUserInteracting = false;
            }, 1500);
        }

        // Actualizar punto de referencia para evitar múltiples cambios
        touchStartY = touch.clientY;

    }, { passive: false });

    // Touch end - resetear estados
    target.addEventListener('touchend', (e) => {
        if (!touchActive) return;
        touchActive = false;
        
        // Si no hubo swipe, resetear usuario interactivo después de un tiempo
        if (!isSwiping) {
            touchTimeout = setTimeout(() => {
                isUserInteracting = false;
            }, 3000);
        }
        
        isSwiping = false;
        
        // Reactivar auto-slide si no está activo
        if (!isAutoSliding && !isScrolling) {
            setTimeout(() => {
                isAutoSliding = true;
                isUserInteracting = false;
            }, 2000);
        }
    }, { passive: true });

    // También escuchar en el contenedor específico
    const container = document.getElementById('scrollContainer');
    if (container) {
        container.addEventListener('touchstart', (e) => {
            // No hacer nada, ya lo maneja el body
        }, { passive: true });
        
        container.addEventListener('touchmove', (e) => {
            // No hacer nada, ya lo maneja el body
        }, { passive: false });
    }
}

/* ========================================================
   ACTUALIZA SLIDE ACTIVO
   ======================================================== */
function updateActiveSlide(index) {
    const slides = document.querySelectorAll('.slide-content');
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    const footer = document.getElementById('mainFooter');
    if (footer) {
        footer.classList.toggle('visible', index === 4);
    }

    const event = new CustomEvent('slide:changed', {
        detail: { index: index }
    });
    document.dispatchEvent(event);
}

/* ========================================================
   INICIALIZA INDICADORES DE PASOS (DOTS)
   ======================================================== */
function initStepIndicators() {
    const dots = document.querySelectorAll('.step-dot');

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            isUserInteracting = true;
            isScrolling = true;
            isAutoSliding = false;

            goToSlide(index);

            setTimeout(() => {
                isScrolling = false;
                isAutoSliding = true;
                isUserInteracting = false;
            }, 1500);
        });
    });
}

function initButtons() {
    // ========================================
    // FUNCION REUTILIZABLE PARA WHATSAPP
    // ========================================
    function openWhatsApp(phoneNumber, customMessage) {
        const cleanNumber = phoneNumber.replace(/\D/g, '');
        const defaultMessage = 'Hola, vi su informacion de contacto en SHEKINAH Logistics y me gustaria obtener mas informacion.';
        const message = customMessage || defaultMessage;
        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // ========================================
    // BOTON CTA - WHATSAPP
    // ========================================
    const ctaBtn = document.querySelector('.btn-cta');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp('5563532420', 'Hola, estoy interesado en solicitar una cotizacion para ruta de comercio exterior.');
        });
    }

    // ========================================
    // TODOS LOS NUMEROS DE TELEFONO EN CONTACTOS
    // ========================================
    const whatsappLinks = document.querySelectorAll('.whatsapp-link');
    whatsappLinks.forEach(link => {
        link.removeEventListener('click', handleWhatsAppClick);
        link.addEventListener('click', handleWhatsAppClick);
    });

    function handleWhatsAppClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const phoneNumber = this.dataset.phone;
        if (phoneNumber) {
            openWhatsApp(phoneNumber);
        }
    }

    const telLinks = document.querySelectorAll('a[href^="tel:"]');
    telLinks.forEach(link => {
        link.removeEventListener('click', handleTelClick);
        link.addEventListener('click', handleTelClick);
    });

    function handleTelClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const href = this.getAttribute('href');
        const phoneNumber = href.replace('tel:', '').replace(/\+/g, '').replace(/\s/g, '');
        if (phoneNumber) {
            openWhatsApp(phoneNumber);
        }
    }

    // ========================================
    // OTROS BOTONES DE ACCION
    // ========================================
    const actionButtons = document.querySelectorAll('[data-action]');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.dataset.action;
            const messages = {
                'conocer-mas': 'Redirigiendo a mas informacion...',
                'contactar': 'Abriendo formulario de contacto...',
                'rutas-sostenibles': 'Mostrando rutas sostenibles...',
                'informe-impacto': 'Generando informe de impacto...',
                'cotizar': 'Solicitud de cotizacion enviada. Te contactaremos pronto.'
            };
            showToast(messages[action] || `Accion: ${action}`);
        });
    });
}

/* ========================================================
   INICIALIZA THREE.JS (PLANETA 3D)
   ======================================================== */
function initThreeJs() {
    if (threeInitialized) return;
    threeInitialized = true;

    if (typeof THREE === 'undefined') {
        loadThreeJs();
        return;
    }

    createGlobe();
}

function loadThreeJs() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        createGlobe();
    };
    script.onerror = () => {
        const container = document.getElementById('three-canvas');
        if (container) {
            container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#3e92cc;font-family:'Hanken Grotesk',sans-serif;font-size:1.2rem;opacity:0.3;">
                    <span>Cargando planeta...</span>
                </div>
            `;
        }
    };
    document.head.appendChild(script);
}

function createGlobe() {
    const container = document.getElementById('three-canvas');
    if (!container) return;

    container.innerHTML = '';

    if (typeof THREE === 'undefined') {
        return;
    }

    const scene = new THREE.Scene();
    scene.background = null;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.1, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x1a4763, 0.4);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(0x7bc8e8, 1.0);
    mainLight.position.set(2, 3, 4);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x226688, 0.5);
    fillLight.position.set(-1, 1, 2);
    scene.add(fillLight);

    const backLight = new THREE.PointLight(0x3E92CC, 0.4);
    backLight.position.set(0, 1, -3);
    scene.add(backLight);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const geo = new THREE.SphereGeometry(1, 128, 128);

    const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x0a2a3a,
        emissive: 0x031a22,
        emissiveIntensity: 0.12,
        roughness: 0.6,
        metalness: 0.4,
    });
    const ocean = new THREE.Mesh(geo, oceanMat);
    earthGroup.add(ocean);

    const loader = new THREE.TextureLoader();
    const landMap = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const landMat = new THREE.MeshStandardMaterial({
        map: landMap,
        color: 0x6699cc,
        emissive: 0x0a2a44,
        emissiveIntensity: 0.06,
        roughness: 0.6,
        metalness: 0.15,
    });
    const land = new THREE.Mesh(geo, landMat);
    land.scale.set(1.002, 1.002, 1.002);
    earthGroup.add(land);

    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x2a6a8a,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
    });
    const wire = new THREE.Mesh(geo, wireMat);
    wire.scale.set(1.008, 1.008, 1.008);
    earthGroup.add(wire);

    const cloudTex = loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
    const cloudMat = new THREE.MeshPhongMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.012, 96, 96), cloudMat);
    earthGroup.add(clouds);

    const ringPts = [];
    for (let i = 0; i <= 360; i += 6) {
        const rad = i * Math.PI / 180;
        ringPts.push(new THREE.Vector3(Math.cos(rad) * 1.15, 0.02, Math.sin(rad) * 1.15));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x1a5a7a });
    const ring = new THREE.LineLoop(ringGeo, ringMat);
    earthGroup.add(ring);

    const ring2Pts = [];
    for (let i = 0; i <= 360; i += 5) {
        const rad = i * Math.PI / 180;
        ring2Pts.push(new THREE.Vector3(Math.cos(rad) * 1.18, Math.sin(rad * 2) * 0.08, Math.sin(rad) * 1.18));
    }
    const ring2Geo = new THREE.BufferGeometry().setFromPoints(ring2Pts);
    const ring2Mat = new THREE.LineBasicMaterial({ color: 0x0f4a6a });
    const ring2 = new THREE.LineLoop(ring2Geo, ring2Mat);
    earthGroup.add(ring2);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 800;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 500;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 150 - 50;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
        color: 0x4a7a9f,
        size: 0.12,
        transparent: true,
        opacity: 0.25,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    let autoRotationSpeed = 0.0012;

    const resizeHandler = () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', resizeHandler);

    function animate() {
        requestAnimationFrame(animate);

        earthGroup.rotation.y += autoRotationSpeed;
        clouds.rotation.y = earthGroup.rotation.y * 1.02;

        stars.rotation.y += 0.0001;

        renderer.render(scene, camera);
    }

    animate();
    threeInitialized = true;
}

/* ========================================================
   TOAST NOTIFICATION
   ======================================================== */
function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(11, 15, 26, 0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(62, 146, 204, 0.2);
        color: #ffffff;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Work Sans', sans-serif;
        font-size: 0.85rem;
        z-index: 1000;
        animation: fadeInUp 0.3s ease;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ========================================================
   LIMPIEZA DEL CONTROLADOR
   ======================================================== */
export function cleanupHome() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }

    const toast = document.querySelector('.toast-notification');
    if (toast) toast.remove();
}