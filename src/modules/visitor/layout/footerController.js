/* ========================================
   SHEKINAH FOOTER CONTROLLER
   Controlador del footer - SOLO EN CONTACTO
   ======================================== */

let isFooterLoaded = false;
let currentSlide = -1;
let footerHTML = null;

/* ========================================
   FUNCIÓN PRINCIPAL - EXPORTADA
   ======================================== */
export async function footerController() {
  // Escuchar cambios de slide
  document.addEventListener('slide:changed', (e) => {
    if (e.detail && e.detail.index !== undefined) {
      currentSlide = e.detail.index;
      handleFooterVisibility(currentSlide);
    }
  });

  // También escuchar navegación desde el navbar
  document.addEventListener('navigate:toSlide', (e) => {
    if (e.detail && e.detail.index !== undefined) {
      currentSlide = e.detail.index;
      handleFooterVisibility(currentSlide);
    }
  });

  // Cargar el HTML del footer una sola vez
  await loadFooterHTML();

  // Inicializar visibilidad (oculto por defecto)
  handleFooterVisibility(0);

  console.log('🏠 SHEKINAH Footer controller inicializado (solo visible en Contacto)');
}

/* ========================================
   CARGA EL HTML DEL FOOTER
   ======================================== */
async function loadFooterHTML() {
  if (footerHTML !== null) return;
  
  try {
    const response = await fetch('/modules/visitor/layout/footer.html');
    if (!response.ok) throw new Error('Error cargando footer');
    footerHTML = await response.text();
  } catch (error) {
    console.error('❌ Error cargando footer:', error);
    footerHTML = '';
  }
}

/* ========================================
   MANEJA LA VISIBILIDAD DEL FOOTER
   ======================================== */
function handleFooterVisibility(slideIndex) {
  const footerContainer = document.getElementById('footer');
  if (!footerContainer) return;

  // Solo mostrar en el slide 4 (Contacto)
  const shouldShow = slideIndex === 4;

  if (shouldShow) {
    // Si no está cargado, lo insertamos
    if (!isFooterLoaded && footerHTML) {
      footerContainer.innerHTML = footerHTML;
      isFooterLoaded = true;
      
      // Inicializar eventos del footer después de insertarlo
      setTimeout(() => {
        initFooterEvents();
      }, 50);
    }
    
    // Mostrar el footer
    footerContainer.classList.add('footer-active');
  } else {
    // Ocultar el footer
    footerContainer.classList.remove('footer-active');
    
    // Opcional: Eliminar el footer del DOM cuando no se usa
    // (comentado para mantener eventos, pero puedes descomentar si quieres)
    // if (isFooterLoaded) {
    //   footerContainer.innerHTML = '';
    //   isFooterLoaded = false;
    // }
  }
}

/* ========================================
   INICIALIZA EVENTOS DEL FOOTER
   ======================================== */
function initFooterEvents() {
  const footer = document.getElementById('shekinahFooter');
  if (!footer) return;

  // Navegación desde el footer
  const navLinks = footer.querySelectorAll('.shekinah-footer-link[data-nav]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const slideIndex = parseInt(link.dataset.nav);
      if (!isNaN(slideIndex)) {
        goToSlide(slideIndex);
      }
    });
  });

  // Enlaces de contacto - WhatsApp
  const contactLinks = footer.querySelectorAll('.shekinah-footer-contact-link');
  contactLinks.forEach(link => {
    if (link.href && link.href.startsWith('tel:')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const phoneNumber = link.href.replace('tel:', '').replace(/\+/g, '').replace(/\s/g, '');
        if (phoneNumber) {
          openWhatsApp(phoneNumber);
        }
      });
    }
  });

  // Redes sociales - tracking
  const socialLinks = footer.querySelectorAll('.shekinah-footer-social-link');
  socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const platform = link.getAttribute('aria-label') || 'social';
      console.log(`📱 Footer: Click en ${platform}`);
    });
  });

  console.log('✅ Eventos del footer inicializados');
}

/* ========================================
   NAVEGACIÓN A SLIDE
   ======================================== */
function goToSlide(index) {
  const event = new CustomEvent('navigate:toSlide', { 
    detail: { index: index } 
  });
  document.dispatchEvent(event);
}

/* ========================================
   WHATSAPP
   ======================================== */
function openWhatsApp(phoneNumber, customMessage) {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const defaultMessage = 'Hola, vi su informacion de contacto en SHEKINAH Logistics y me gustaria obtener mas informacion.';
  const message = customMessage || defaultMessage;
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/* ========================================
   REINICIALIZAR
   ======================================== */
export function reinitializeFooter() {
  isFooterLoaded = false;
  footerHTML = null;
  const container = document.getElementById('footer');
  if (container) {
    container.innerHTML = '';
    container.classList.remove('footer-active');
  }
  footerController();
}