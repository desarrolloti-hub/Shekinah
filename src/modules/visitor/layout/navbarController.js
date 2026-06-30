/* ========================================
   SHEKINAH NAVBAR CONTROLLER
   Controlador del navbar con step indicators
   ======================================== */

let state = {
  isMenuOpen: false,
  isScrolled: false,
  isInitialized: false,
  currentSlide: 0
};

let elements = {};

/* ========================================
   FUNCION PRINCIPAL - EXPORTADA
   ======================================== */
export function initShekinahNavbar() {
  waitForNavbar().then(() => {
    cacheElements();
    
    if (!elements.navbar) {
      return;
    }

    if (state.isInitialized) {
      return;
    }

    bindEvents();
    syncWithStepIndicators();
    handleScroll();

    state.isInitialized = true;
  }).catch(error => {
    // Error silencioso
  });
}

/* ========================================
   ESPERA A QUE EL NAVBAR EXISTA EN EL DOM
   ======================================== */
function waitForNavbar(maxAttempts = 30, interval = 100) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const checkNavbar = () => {
      const navbar = document.getElementById('shekinahNavbar');
      if (navbar) {
        resolve();
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Shekinah Navbar no encontrado'));
        } else {
          setTimeout(checkNavbar, interval);
        }
      }
    };

    checkNavbar();
  });
}

/* ========================================
   CACHEA ELEMENTOS DEL DOM
   ======================================== */
function cacheElements() {
  elements = {
    navbar: document.getElementById('shekinahNavbar'),
    menuToggle: document.getElementById('shekinahMenuToggle'),
    navMenu: document.getElementById('shekinahNavMenu'),
    mobileMenu: document.getElementById('shekinahMobileMenu'),
    navLinks: document.querySelectorAll('.shekinah-nav-link'),
    avatar: document.getElementById('shekinahUserAvatar'),
    body: document.body,
    brandTitle: document.querySelector('.shekinah-brand-title'),
    stepDots: document.querySelectorAll('.step-dot')
  };
}

/* ========================================
   VINCULA EVENTOS
   ======================================== */
function bindEvents() {
  // Menu movil
  if (elements.menuToggle && elements.mobileMenu) {
    const newToggle = elements.menuToggle.cloneNode(true);
    if (elements.menuToggle.parentNode) {
      elements.menuToggle.parentNode.replaceChild(newToggle, elements.menuToggle);
      elements.menuToggle = newToggle;
    }
    elements.menuToggle.addEventListener('click', toggleMobileMenu);
  }

  // Scroll - animacion de cambio de color
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Sincronizar con step indicators - USANDO requestAnimationFrame
  let rafId = null;
  const syncHandler = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      syncWithStepIndicators();
      rafId = null;
    });
  };
  
  const container = document.getElementById('scrollContainer');
  if (container) {
    container.addEventListener('scroll', syncHandler, { passive: true });
  }

  // Cerrar menu al hacer clic en enlaces
  if (elements.navLinks) {
    elements.navLinks.forEach(link => {
      link.removeEventListener('click', handleNavClick);
      link.addEventListener('click', handleNavClick);
    });
  }

  // Click en el logo para ir al inicio
  if (elements.brandTitle) {
    elements.brandTitle.addEventListener('click', () => {
      goToSlide(0);
    });
  }

  // Click fuera del menu
  document.addEventListener('click', handleClickOutside);

  // Evento resize
  window.addEventListener('resize', handleResize);

  // Escuchar cambios de slide desde el homeController
  document.addEventListener('slide:changed', (e) => {
    if (e.detail && e.detail.index !== undefined) {
      state.currentSlide = e.detail.index;
      updateActiveNavLink(state.currentSlide);
      updateStepDots(state.currentSlide);
    }
  });
}

/* ========================================
   SINCRONIZAR CON STEP INDICATORS
   ======================================== */
function syncWithStepIndicators() {
  const container = document.getElementById('scrollContainer');
  if (!container) {
    return;
  }

  const scrollTop = container.scrollTop;
  const viewportHeight = window.innerHeight;
  const currentSlide = Math.round(scrollTop / viewportHeight);

  const totalSlides = elements.stepDots.length || 4;
  const safeIndex = Math.max(0, Math.min(currentSlide, totalSlides - 1));
  
  if (safeIndex !== state.currentSlide && !isNaN(safeIndex)) {
    state.currentSlide = safeIndex;
    updateActiveNavLink(safeIndex);
    updateStepDots(safeIndex);
  }
}

/* ========================================
   ACTUALIZAR STEP DOTS
   ======================================== */
function updateStepDots(index) {
  if (!elements.stepDots || elements.stepDots.length === 0) return;
  
  elements.stepDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

/* ========================================
   NAVEGACION A SLIDE
   ======================================== */
function goToSlide(index) {
  const container = document.getElementById('scrollContainer');
  if (!container) {
    return;
  }

  // Desactivar auto-slide temporalmente
  const event = new CustomEvent('navigate:toSlide', { detail: { index } });
  document.dispatchEvent(event);

  const viewportHeight = window.innerHeight;
  container.scrollTo({
    top: index * viewportHeight,
    behavior: 'smooth'
  });

  state.currentSlide = index;
  updateActiveNavLink(index);
  updateStepDots(index);
  closeMobileMenu();
}

/* ========================================
   MANEJA CLICK EN ENLACES DEL NAV
   ======================================== */
function handleNavClick(e) {
  e.preventDefault();
  
  const link = e.currentTarget;
  const slideIndex = parseInt(link.dataset.nav);
  
  if (!isNaN(slideIndex)) {
    goToSlide(slideIndex);
  }
}

/* ========================================
   ACTUALIZA ENLACE ACTIVO DEL NAV
   ======================================== */
function updateActiveNavLink(index) {
  if (!elements.navLinks || elements.navLinks.length === 0) return;

  elements.navLinks.forEach(link => {
    const linkIndex = parseInt(link.dataset.nav);
    link.classList.toggle('active', linkIndex === index);
  });
}

/* ========================================
   MENU MOVIL
   ======================================== */
function toggleMobileMenu() {
  if (!elements.mobileMenu || !elements.menuToggle) return;

  const isOpen = elements.mobileMenu.classList.contains('open');
  
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  elements.mobileMenu.classList.add('open');
  elements.menuToggle.textContent = 'close';
  state.isMenuOpen = true;
  elements.body.style.overflow = 'hidden';
  createOverlay();
}

function closeMobileMenu() {
  elements.mobileMenu.classList.remove('open');
  elements.menuToggle.textContent = 'menu';
  state.isMenuOpen = false;
  elements.body.style.overflow = '';
  
  const overlay = document.querySelector('.shekinah-menu-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    setTimeout(() => overlay.remove(), 300);
  }
}

function createOverlay() {
  let overlay = document.querySelector('.shekinah-menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'shekinah-menu-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', closeMobileMenu);
  }
  overlay.classList.add('open');
}

/* ========================================
   MANEJA EVENTO SCROLL
   ======================================== */
function handleScroll() {
  if (!elements.navbar) return;

  const scrolled = window.scrollY > 30;

  if (scrolled !== state.isScrolled) {
    state.isScrolled = scrolled;
    elements.navbar.classList.toggle('scrolled', scrolled);
  }
}

/* ========================================
   MANEJA CLICK FUERA DEL MENU
   ======================================== */
function handleClickOutside(event) {
  if (!state.isMenuOpen) return;

  const isClickInsideMenu = elements.mobileMenu?.contains(event.target);
  const isClickOnToggle = elements.menuToggle?.contains(event.target);

  if (!isClickInsideMenu && !isClickOnToggle) {
    closeMobileMenu();
  }
}

/* ========================================
   MANEJA RESIZE
   ======================================== */
function handleResize() {
  if (window.innerWidth > 850 && state.isMenuOpen) {
    closeMobileMenu();
  }
}

/* ========================================
   REINICIALIZAR
   ======================================== */
export function reinitializeShekinahNavbar() {
  cacheElements();
  if (!elements.navbar) return;
  bindEvents();
  syncWithStepIndicators();
  handleScroll();
}

/* ========================================
   OBTENER ESTADO
   ======================================== */
export function getShekinahNavbarState() {
  return { ...state };
}