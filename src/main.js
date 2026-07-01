import { loadLayout } from './modules/visitor/layout/loadLayout.js';
import { initShekinahNavbar } from './modules/visitor/layout/navbarController.js';
import { footerController } from './modules/visitor/layout/footerController.js';
import { initRouter } from './router/router.js';

function loadExternalScripts() {
    return new Promise((resolve) => {
        if (document.querySelector('script[src*="swiper"]')) {
            resolve();
            return;
        }
        
        const aosLink = document.createElement('link');
        aosLink.rel = 'stylesheet';
        aosLink.href = 'https://unpkg.com/aos@2.3.1/dist/aos.css';
        document.head.appendChild(aosLink);
        
        const aosScript = document.createElement('script');
        aosScript.src = 'https://unpkg.com/aos@2.3.1/dist/aos.js';
        aosScript.onload = () => {
            window.AOS = AOS;
        };
        document.body.appendChild(aosScript);
        
        const swiperLink = document.createElement('link');
        swiperLink.rel = 'stylesheet';
        swiperLink.href = 'https://unpkg.com/swiper/swiper-bundle.min.css';
        document.head.appendChild(swiperLink);
        
        const swiperScript = document.createElement('script');
        swiperScript.src = 'https://unpkg.com/swiper/swiper-bundle.min.js';
        swiperScript.onload = () => {
            window.Swiper = Swiper;
            resolve();
        };
        document.body.appendChild(swiperScript);
        
        setTimeout(resolve, 3000);
    });
}

/**
 * Inicializa la aplicación
 */
async function initApp() {
    try {
        await loadExternalScripts();
        
        // 1. Cargar layout (solo navbar)
        await loadLayout();
        
        // 2. Inicializar navbar
        await initShekinahNavbar();
        
        // 3. Inicializar footer controller (escucha eventos, pero no inserta el footer aún)
        await footerController();
        
        // 4. Inicializar router
        initRouter();
        
        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
    }
}

initApp();