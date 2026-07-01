/* ========================================
   LOAD LAYOUT
   Carga layouts persistentes (navbar y footer)
   ======================================== */

/**
 * Carga los layouts persistentes en el DOM
 * @returns {Promise<Object>} - Retorna las rutas de los layouts cargados
 */
export async function loadLayout() {
    // Solo cargamos el navbar, el footer se carga dinámicamente
    const navbarHTML = await fetch('/modules/visitor/layout/navbar.html')
        .then(r => {
            if (!r.ok) throw new Error('Error cargando navbar');
            return r.text();
        });

    const navbarContainer = document.getElementById('navbar');
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHTML;
    }

    return {
        navbarLoaded: true,
        footerLoaded: false // El footer se carga bajo demanda
    };
}