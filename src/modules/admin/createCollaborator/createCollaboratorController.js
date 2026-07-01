/* FILE: createCollaboratorPlanet.js */
/* SHEKINAH - Planeta 3D para la pantalla de Crear Colaborador */

let planetInitialized = false;

export function initCreateCollaboratorPlanet() {
    if (planetInitialized) return;
    planetInitialized = true;

    if (typeof THREE === 'undefined') {
        loadThreeJs();
        return;
    }

    createCollaboratorGlobe();
}

function loadThreeJs() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        createCollaboratorGlobe();
    };
    script.onerror = () => {
        console.warn('⚠️ Three.js no pudo cargarse para crear colaborador');
    };
    document.head.appendChild(script);
}

function createCollaboratorGlobe() {
    const container = document.getElementById('create-collaborator-three-canvas');
    if (!container) return;

    container.innerHTML = '';

    if (typeof THREE === 'undefined') {
        console.warn('⚠️ Three.js no disponible para crear colaborador');
        return;
    }

    // ========================================================
    // ESCENA
    // ========================================================
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

    // ========================================================
    // LUCES
    // ========================================================
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

    // ========================================================
    // GRUPO DEL PLANETA
    // ========================================================
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const geo = new THREE.SphereGeometry(1, 128, 128);

    // Océano
    const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x0a2a3a,
        emissive: 0x031a22,
        emissiveIntensity: 0.12,
        roughness: 0.6,
        metalness: 0.4,
    });
    const ocean = new THREE.Mesh(geo, oceanMat);
    earthGroup.add(ocean);

    // Tierra
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

    // Wireframe sutil
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x2a6a8a,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
    });
    const wire = new THREE.Mesh(geo, wireMat);
    wire.scale.set(1.008, 1.008, 1.008);
    earthGroup.add(wire);

    // Nubes
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

    // Anillo decorativo
    const ringPts = [];
    for (let i = 0; i <= 360; i += 6) {
        const rad = i * Math.PI / 180;
        ringPts.push(new THREE.Vector3(Math.cos(rad) * 1.15, 0.02, Math.sin(rad) * 1.15));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x1a5a7a });
    const ring = new THREE.LineLoop(ringGeo, ringMat);
    earthGroup.add(ring);

    // Anillo 2
    const ring2Pts = [];
    for (let i = 0; i <= 360; i += 5) {
        const rad = i * Math.PI / 180;
        ring2Pts.push(new THREE.Vector3(Math.cos(rad) * 1.18, Math.sin(rad * 2) * 0.08, Math.sin(rad) * 1.18));
    }
    const ring2Geo = new THREE.BufferGeometry().setFromPoints(ring2Pts);
    const ring2Mat = new THREE.LineBasicMaterial({ color: 0x0f4a6a });
    const ring2 = new THREE.LineLoop(ring2Geo, ring2Mat);
    earthGroup.add(ring2);

    // ========================================================
    // ESTRELLAS
    // ========================================================
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

    // ========================================================
    // ANIMACIÓN
    // ========================================================
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
    planetInitialized = true;
}