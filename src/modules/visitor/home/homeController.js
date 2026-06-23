/* FILE: homeController.js
   ========================================================
   CONTROLADOR PARA HOME CON:
   - Scroll horizontal
   - Planeta 3D de fondo (sin marcador, brillo reducido)
   ======================================================== */

let currentSlide = 0;
const totalSlides = 4;
let scrollTimeout = null;
let threeInitialized = false;
let autoSlideInterval = null;
let isAutoSliding = true;
let isUserInteracting = false;
let isScrolling = false;

/* ========================================================
   FUNCION PRINCIPAL - EXPORTADA
   ======================================================== */
export async function homeController() {
    console.log('🌍 Home Controller - Shekinah');

    await new Promise(resolve => setTimeout(resolve, 100));

    // Inicializar el contenido principal
    initScrollDetection();
    initStepIndicators();
    initButtons();
    initThreeJs();
    startAutoSlide();

    // ESCUCHAR NAVEGACIÓN DESDE EL NAVBAR
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
   IR A UN SLIDE ESPECÍFICO
   ======================================================== */
function goToSlide(index) {
    const container = document.getElementById('scrollContainer');
    if (!container) return;

    const viewportHeight = window.innerHeight;
    container.scrollTo({
        top: index * viewportHeight,
        behavior: 'smooth'
    });

    currentSlide = index;
    updateActiveSlide(currentSlide);
}

/* ========================================================
   DETECCIÓN DE SCROLL
   ======================================================== */
function initScrollDetection() {
    const container = document.getElementById('scrollContainer');
    if (!container) return;

    let lastScrollY = 0;
    let scrollDirection = 0;

    container.addEventListener('wheel', (e) => {
        e.preventDefault();

        const delta = e.deltaY;

        if (isScrolling) return;

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
                console.log('🔄 Scroll reactivado');
            }, 1500);
        }

    }, { passive: false });

    container.addEventListener('keydown', (e) => {
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
                }, 1500);
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
                }, 1500);
            }
        }
    });
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
        footer.classList.toggle('visible', index === 3);
    }

    // DISPARAR EVENTO PARA EL NAVBAR
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
    const container = document.getElementById('scrollContainer');

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            isUserInteracting = true;
            isScrolling = true;

            if (container) {
                const viewportHeight = window.innerHeight;
                container.scrollTo({
                    top: index * viewportHeight,
                    behavior: 'smooth'
                });
            }

            currentSlide = index;
            updateActiveSlide(currentSlide);

            setTimeout(() => {
                isScrolling = false;
                isUserInteracting = false;
            }, 1500);
        });
    });
}

/* ========================================================
   INICIALIZA BOTONES DE ACCIÓN
   ======================================================== */
function initButtons() {
    const ctaBtn = document.querySelector('.btn-cta');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('🚢 Solicitud de cotización enviada. Te contactaremos pronto.');
        });
    }

    const actionButtons = document.querySelectorAll('[data-action]');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.dataset.action;
            const messages = {
                'conocer-mas': '🔍 Redirigiendo a más información...',
                'contactar': '📞 Abriendo formulario de contacto...',
                'rutas-sostenibles': '🌿 Mostrando rutas sostenibles...',
                'informe-impacto': '📊 Generando informe de impacto...',
                'cotizar': '🚢 Solicitud de cotización enviada. Te contactaremos pronto.'
            };
            showToast(messages[action] || `Acción: ${action}`);
        });
    });
}

/* ========================================================
   INICIALIZA THREE.JS (PLANETA 3D DE FONDO - SIN MARCADOR)
   ======================================================== */
function initThreeJs() {
    if (threeInitialized) return;
    threeInitialized = true;

    if (typeof THREE === 'undefined') {
        console.warn('Three.js no está cargado, cargando...');
        loadThreeJs();
        return;
    }

    createGlobe();
}

function loadThreeJs() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        console.log('✅ Three.js cargado');
        createGlobe();
    };
    script.onerror = () => {
        console.error('❌ Error cargando Three.js');
        const container = document.getElementById('three-canvas');
        if (container) {
            container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#3e92cc;font-family:'Hanken Grotesk',sans-serif;font-size:1.2rem;opacity:0.3;">
                    <span>🌍 Cargando planeta...</span>
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
        console.error('❌ Three.js no disponible');
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

    // LUCES - REDUCIDAS PARA MENOS BRILLO
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

    // GRUPO DEL PLANETA
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const geo = new THREE.SphereGeometry(1, 128, 128);

    // OCÉANO (base del planeta)
    const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x0a2a3a,
        emissive: 0x031a22,
        emissiveIntensity: 0.12,
        roughness: 0.6,
        metalness: 0.4,
    });
    const ocean = new THREE.Mesh(geo, oceanMat);
    earthGroup.add(ocean);

    // TIERRA
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

    // WIREFRAME
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x2a6a8a,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
    });
    const wire = new THREE.Mesh(geo, wireMat);
    wire.scale.set(1.008, 1.008, 1.008);
    earthGroup.add(wire);

    // NUBES
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

    // ANILLO 1
    const ringPts = [];
    for (let i = 0; i <= 360; i += 6) {
        const rad = i * Math.PI / 180;
        ringPts.push(new THREE.Vector3(Math.cos(rad) * 1.15, 0.02, Math.sin(rad) * 1.15));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x1a5a7a });
    const ring = new THREE.LineLoop(ringGeo, ringMat);
    earthGroup.add(ring);

    // ANILLO 2
    const ring2Pts = [];
    for (let i = 0; i <= 360; i += 5) {
        const rad = i * Math.PI / 180;
        ring2Pts.push(new THREE.Vector3(Math.cos(rad) * 1.18, Math.sin(rad * 2) * 0.08, Math.sin(rad) * 1.18));
    }
    const ring2Geo = new THREE.BufferGeometry().setFromPoints(ring2Pts);
    const ring2Mat = new THREE.LineBasicMaterial({ color: 0x0f4a6a });
    const ring2 = new THREE.LineLoop(ring2Geo, ring2Mat);
    earthGroup.add(ring2);

    // ESTRELLAS DE FONDO
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

    // VELOCIDAD DE ROTACIÓN
    let autoRotationSpeed = 0.0012;

    // RESPONSIVE
    const resizeHandler = () => {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', resizeHandler);

    // ANIMACIÓN
    function animate() {
        requestAnimationFrame(animate);

        earthGroup.rotation.y += autoRotationSpeed;
        clouds.rotation.y = earthGroup.rotation.y * 1.02;

        stars.rotation.y += 0.0001;

        renderer.render(scene, camera);
    }

    animate();
    threeInitialized = true;
    console.log('✅ Planeta 3D creado (sin marcador, brillo reducido)');
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

    const container = document.getElementById('three-canvas');
    if (container) {
        container.innerHTML = '';
    }
    const toast = document.querySelector('.toast-notification');
    if (toast) toast.remove();
}