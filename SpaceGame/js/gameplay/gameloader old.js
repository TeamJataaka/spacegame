//(function () {

// initializing the main structures and objects when the document is loaded
window.onload = function () {

    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }

    radius = 6371;
    tilt = 0.41;
    rotationSpeed = 0.02;

    cloudsScale = 1.005;
    moonScale = 0.23;
    venusScale = 0.43;

    MARGIN = 0;
    SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
    sCREEN_WIDTH = window.innerWidth;

    d, dPlanet, dMoon, dMoonVec = new THREE.Vector3();
    d, dPlanet, dVenus, dVenusVec = new THREE.Vector3();
    mouse = new THREE.Vector2();

    clock = new THREE.Clock();

    drawShip();
    init();
    animate();
    resetToDisplay();
    dynamicCreateTargetsInit();
};

// global variables
var radius;
var tilt;
var rotationSpeed;

var mouse;

var cloudsScale;
var moonScale;
var venusScale;

var MARGIN, INTERSECTED;
var SCREEN_HEIGHT;
var SCREEN_WIDTH;

var container, stats;
var camera, controls, scene, sceneCube, renderer;
var requestId;
var geometry, meshPlanet, meshClouds, meshMoon, meshVenus;
var dirLight, pointLight, ambientLight;
var d, dPlanet, dMoon, dMoonVec, dVenus, dVenusVec;
var clock;
var shipArmor = 10;
var shipAmmo = 200;

// this is a container for the current game targets 
// searching by target_id -> (to get) the target (by its id)
var targetsDictionary = {};
var targetScreenObjects = {};
var visualTargetIds = {};
var targetIdCounter = 1;
var fireDelayIndex = 1000;

// special objects to find the intersections
var projector, raycaster;

// structures to fast get the object coordinates -> kill check
var coordsX = {};
var coordsY = {};

// This is the main initialization function
// Loads the three.js 3D envinronment
// Load the vusualization space and objects
function init() {

    // the main container for the three.js envinronment
    container = document.createElement('div');
    container.id = 'container';
    document.body.appendChild(container);

    // viwer position details initializing
    camera = new THREE.PerspectiveCamera(25, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7);
    camera.position.z = radius * 100;

    // main container for the visual objects
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00000025);

    // main control module
    controls = new THREE.FlyControls(camera);

    controls.movementSpeed = 1000;
    controls.domElement = container;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = false;
    //controls.minDistance = 0;
    //controls.maxDistance = 30000;

    /// visual objects and effects
    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-1, 0, 1).normalize();
    scene.add(dirLight);

    ambientLight = new THREE.AmbientLight(0x000000);
    scene.add(ambientLight);

    var planetTexture = THREE.ImageUtils.loadTexture("textures/planets/earth_atmos_2048.jpg");
    var cloudsTexture = THREE.ImageUtils.loadTexture("textures/planets/earth_clouds_1024.png");
    var normalTexture = THREE.ImageUtils.loadTexture("textures/planets/earth_normal_2048.jpg");
    var specularTexture = THREE.ImageUtils.loadTexture("textures/planets/earth_specular_2048.jpg");

    var moonTexture = THREE.ImageUtils.loadTexture("textures/planets/moon_1024.jpg");

    var venusTexture = THREE.ImageUtils.loadTexture("textures/planets/venus_1024.jpg");

    var shader = THREE.ShaderLib["normalmap"];
    var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms["tNormal"].value = normalTexture;
    uniforms["uNormalScale"].value.set(0.85, 0.85);

    uniforms["tDiffuse"].value = planetTexture;
    uniforms["tSpecular"].value = specularTexture;

    uniforms["enableAO"].value = false;
    uniforms["enableDiffuse"].value = true;
    uniforms["enableSpecular"].value = true;

    uniforms["uDiffuseColor"].value.setHex(0xffffff);
    uniforms["uSpecularColor"].value.setHex(0x333333);
    uniforms["uAmbientColor"].value.setHex(0x000000);

    uniforms["uShininess"].value = 15;

    var parameters = {

        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: uniforms,
        lights: true,
        fog: true

    };

    var materialNormalMap = new THREE.ShaderMaterial(parameters);

    // planet

    geometry = new THREE.SphereGeometry(radius, 100, 50);
    geometry.computeTangents();

    meshPlanet = new THREE.Mesh(geometry, materialNormalMap);
    meshPlanet.rotation.y = 0;
    meshPlanet.rotation.z = tilt;
    meshPlanet.position.z = -1000;
    scene.add(meshPlanet);

    // clouds

    var materialClouds = new THREE.MeshLambertMaterial({ color: 0xffffff, map: cloudsTexture, transparent: true });

    meshClouds = new THREE.Mesh(geometry, materialClouds);
    meshClouds.scale.set(cloudsScale, cloudsScale, cloudsScale);
    meshClouds.rotation.z = tilt;
    scene.add(meshClouds);

    // moon

    var materialMoon = new THREE.MeshPhongMaterial({ color: 0xffffff, map: moonTexture });

    meshMoon = new THREE.Mesh(geometry, materialMoon);
    meshMoon.position.set(radius * 5, 0, 0);
    meshMoon.scale.set(moonScale, moonScale, moonScale);
    scene.add(meshMoon);

    for (var i = 0; i < 2; i++) {

        var meshMoonNew = new THREE.Mesh(geometry, materialMoon);
        meshMoonNew.position.set(-radius * Math.random() * Math.random() * i * 20, Math.random() * 10000, -Math.random() * 66000);
        meshMoonNew.scale.set(moonScale, moonScale, moonScale);
        scene.add(meshMoonNew);
    }

    // venus

    var materialVenus = new THREE.MeshPhongMaterial({ color: 0xffffff, map: venusTexture });

    meshVenus = new THREE.Mesh(geometry, materialVenus);
    meshVenus.position.set(radius * 7, 0, 0);
    meshVenus.scale.set(venusScale, venusScale, venusScale);
    scene.add(meshVenus);

    for (i = 0; i < 2; i++) {

        var meshVenusNew = new THREE.Mesh(geometry, materialVenus);
        meshVenusNew.position.set(-radius * Math.random() * Math.random() * i * 33, Math.random() * 30000, Math.random() * 50000);
        meshVenusNew.scale.set(venusScale, venusScale, venusScale);
        scene.add(meshVenusNew);
    }

    // stars

    var r = radius, starsGeometry = [new THREE.Geometry(), new THREE.Geometry()];

    for (i = 0; i < 1500; i++) {

        var vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar(r);

        starsGeometry[0].vertices.push(vertex);

    }

    for (i = 0; i < 1500; i++) {

        vertex = new THREE.Vector3();
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar(r);

        starsGeometry[1].vertices.push(vertex);

    }

    var stars;
    var starsMaterials = [
        new THREE.ParticleSystemMaterial({ color: 0xffffff, size: 3, sizeAttenuation: false }),
        new THREE.ParticleSystemMaterial({ color: 0x555555, size: 4, sizeAttenuation: false }),
        new THREE.ParticleSystemMaterial({ color: 0x333333, size: 3, sizeAttenuation: false }),
        new THREE.ParticleSystemMaterial({ color: 0x3a3a3a, size: 2, sizeAttenuation: false }),
        new THREE.ParticleSystemMaterial({ color: 0xffffff, size: 1, sizeAttenuation: false }),
        new THREE.ParticleSystemMaterial({ color: 0x1a1a1a, size: 2, sizeAttenuation: false })
    ];

    for (i = 10; i < 30; i++) {

        stars = new THREE.ParticleSystem(starsGeometry[i % 2], starsMaterials[i % 6]);

        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;

        s = i * 10;
        stars.scale.set(s, s, s);

        stars.matrixAutoUpdate = false;
        stars.updateMatrix();

        scene.add(stars);

    }

    /// new cubes for target using

    geometry = new THREE.CubeGeometry(600, 600, 600);

    for (i = 0; i < 500; i++) {

        targetIdCounter++;
        var target_id = 'target' + targetIdCounter;
        var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

        object.position.x = 200000 * getRandomArbitrary(0.5, 4);
        object.position.y = 200000 * getRandomArbitrary(0.5, 4);
        object.position.z = 200000 * getRandomArbitrary(0.5, 4);

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() + 0.5;
        object.scale.y = Math.random() + 0.5;
        object.scale.z = Math.random() + 0.5;

        object.id = target_id;

        //  indicates that the element is real target
        visualTargetIds[target_id] = true;

        targetScreenObjects[target_id] = object;

        scene.add(object);
    }

    for (i = 0; i < 1000; i++) {

        targetIdCounter++;
        target_id = 'target' + targetIdCounter;
        object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

        object.position.x = 200000 * Math.random();
        object.position.y = 200000 * Math.random();
        object.position.z = 200000 * Math.random();

        object.id = target_id;

        //  indicates that the element is real target
        visualTargetIds[target_id] = true;

        targetScreenObjects[target_id] = object;

        scene.add(object);
    }

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    // the enemy ships
    createEnemyShips();

    projector = new THREE.Projector();
    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({ alpha: false });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.sortObjects = false;

    renderer.autoClear = false;

    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    window.addEventListener('resize', onWindowResize, false);

    // postprocessing

    var renderModel = new THREE.RenderPass(scene, camera);
    var effectFilm = new THREE.FilmPass(0.35, 0.75, 2048, false);

    effectFilm.renderToScreen = true;

    composer = new THREE.EffectComposer(renderer);

    composer.addPass(renderModel);
    composer.addPass(effectFilm);

}

function createEnemyShips() {

    ; (function () {
        // add a ambient light
        var light = new THREE.AmbientLight(0xff0000);
        scene.add(light);
        // add a light in front
        light = new THREE.DirectionalLight('white', 1);
        light.position.set(0.5, 0.5, 2);
        scene.add(light);
        // add a light behind
        light = new THREE.DirectionalLight('white', 1);
        light.position.set(-0.5, -0.5, -2);
        scene.add(light);
    })();

    //////////////////////////////////////////////////////////////////////////////////
    //		comment								//
    //////////////////////////////////////////////////////////////////////////////////

    THREEx.SpaceShips.loadSpaceFighter01(function (object3d) {
        object3d.position.x = -1;
        object3d.position.y = 0.5;
        scene.add(object3d);
    });

    THREEx.SpaceShips.loadSpaceFighter02(function (object3d) {
        object3d.position.x = 1;
        object3d.position.y = 0.5;
        scene.add(object3d);
    });

    THREEx.SpaceShips.loadSpaceFighter03(function (object3d) {
        var spaceship = object3d;
        spaceship.scale.set(10000, 10000, 10000);
        scene.add(spaceship);

        var shoot = new THREEx.SpaceShips.Shoot();
        shoot.position.x = 0.5;
        shoot.position.z = 0.3;
        scene.add(shoot);

        shoot = new THREEx.SpaceShips.Shoot();
        shoot.position.x = -0.5;
        shoot.position.z = 0.3;
        scene.add(shoot);

        var detonation = new THREEx.SpaceShips.Detonation();
        detonation.position.x = 0.5;
        detonation.position.z = 0.1;
        scene.add(detonation);

        detonation = new THREEx.SpaceShips.Detonation();
        detonation.position.x = -0.5;
        detonation.position.z = 0.1;
        scene.add(detonation);

        var light = new THREE.PointLight();
        detonation.position.x = -0.5;
        detonation.position.z = 0.1;

        scene.add(light);
    });

    THREEx.SpaceShips.loadShuttle01(function (object3d) {
        object3d.position.x = -1;
        object3d.position.y = -0.5;
        scene.add(object3d);
    });

    THREEx.SpaceShips.loadShuttle02(function (object3d) {
        object3d.position.x = 1;
        object3d.position.y = -0.5;
        scene.add(object3d);
    });
}

function onWindowResize(event) {

    SCREEN_HEIGHT = window.innerHeight;
    SCREEN_WIDTH = window.innerWidth;

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    composer.reset();

}

function animate() {

    requestId = window.requestAnimationFrame(animate);

    render();
    stats.update();
}

function checkForShipCollisions() {

    var cx = camera.position.x;
    var cy = camera.position.y;
    var cz = camera.position.y;

    if (cx !== 0 && cy !== 0 && cz !== 0) {

        for (var a in targetScreenObjects) {

            var currentTarget = targetScreenObjects[a];

            if (currentTarget.position) {

                var ix = currentTarget.position.x;
                var iy = currentTarget.position.y;

                var ax = Math.abs(cx - ix);
                var ay = Math.abs(cy - iy);
                if (ax < 80 && ay < 80) {
                    playSound(explodeSound, 0.45);
                    shipArmor -= 10;
                    displayStats();
                    if (shipArmor<=0) {
                        pauseWhenDead();
                    }
                }
            }
        }
    }
}

function checkCameraLimits() {

    var cx = Math.abs(camera.position.x);
    var cy = Math.abs(camera.position.y);
    var cz = Math.abs(camera.position.z);

    //console.log(cx);
    //console.log(cy);
    //console.log(cz);

    if (cx > 800000 || cy > 800000 || cz > 800000) {

        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 637100;

        camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    }
}

function render() {

    // find intersections between the mouse cursor and the present 3D objects
    checkForShipNearEarth();
    checkForShipCollisions();
    checkCameraLimits();

    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    projector.unprojectVector(vector, camera);

    raycaster.set(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {

        if (INTERSECTED !== intersects[0].object) {

            if (INTERSECTED && INTERSECTED.material.emissive) {
                INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            }

            INTERSECTED = intersects[0].object;

            if (INTERSECTED.id) {

                var current_id = INTERSECTED.id;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex(0xff0000);
            }
        }

    } else {

        if (INTERSECTED && INTERSECTED.material.emissive) {
            INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
        }

        INTERSECTED = null;

    }

    // rotate the planet and clouds

    var delta = clock.getDelta();

    meshPlanet.rotation.y += rotationSpeed * delta;
    meshClouds.rotation.y += 1.25 * rotationSpeed * delta;

    // slow down as we approach the surface

    dPlanet = camera.position.length();

    dMoonVec.subVectors(camera.position, meshMoon.position);
    dMoon = dMoonVec.length();

    if (dMoon < dPlanet) {

        d = (dMoon - radius * moonScale * 1.01);

    } else {

        d = (dPlanet - radius * 1.01);

    }

    dVenusVec.subVectors(camera.position, meshVenus.position);
    dVenus = dVenusVec.length();

    if (dVenus < dPlanet) {

        d = (dVenus - radius * venusScale * 1.01);

    } else {

        d = (dPlanet - radius * 1.01);

    }

    // moving the bullets

    var mislength = missilesObjects.length;

    for (var i = 0; i < mislength; i++) {

        var currentMissile = missilesObjects[i];

        currentMissile.position.x += additionX / 10;
        currentMissile.position.y += additionY / 10;
        currentMissile.position.z += additionZ / 10;
    }

    controls.movementSpeed = 0.33 * d;
    controls.update(delta);

    renderer.clear();
    composer.render(delta);
}

var globalCx, globalCy, globalCz;

// this function resets the view when the game starts
function resetToDisplay() {

    SCREEN_HEIGHT = window.innerHeight;
    SCREEN_WIDTH = window.innerWidth;

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    composer.reset();
}

// function to calculate the mouse coordinates when mouse move
function onDocumentMouseMove(event) {

    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

}

// fire event functions
var objectTokill = null;
function callFire() {

    // fire torpedo function
    shipAmmo -= 1;
    displayStats();
    initMissile();

    if (INTERSECTED && INTERSECTED.id) {

        // kill the object is its on target
        var current_id = INTERSECTED.id;
        var isRealTarget = visualTargetIds[current_id];

        if (isRealTarget) {

            playSound(blasterSound, 0.03);
            visualTargetIds[current_id] = false;
            objectTokill = INTERSECTED;

            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xffffff);

            setTimeout(function () {
                delayKill();
            }, fireDelayIndex);
        }

        //scene.remove(INTERSECTED);

        INTERSECTED = null;
    }
}

// physycal removement of the kiled object
function delayKill(current_id) {

    scene.remove(objectTokill);
    INTERSECTED = objectTokill = null;
    playSound(explodeSound, 0.45);
}

var additionX;
var additionY;
var additionZ;
var missilesObjects = [];
// making the missile objects
function initMissile() {

    var posX = camera.position.x;
    var posY = camera.position.y;
    var posZ = camera.position.z;

    if (INTERSECTED && INTERSECTED.position.x) {

        var moveX = INTERSECTED.position.x;
        var moveY = INTERSECTED.position.y;
        var moveZ = INTERSECTED.position.z;

        additionX = moveX - posX;
        additionY = moveY - posY;
        additionZ = moveZ - posZ;

        var geometry = new THREE.CubeGeometry(80, 80, 80);

        for (var i = 0; i < 2; i++) {

            var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

            object.position.x = posX;
            object.position.y = posY;
            object.position.z = posZ;
            missilesObjects.push(object);

            scene.add(object);

        }

        setTimeout(function () {
            clearMissiles();
        }, 1100);
    }
}

function coordsInit() {
    setTimeout(function () {
        coordsInitReal();
    }, 2000);
}

// on spacebar pressed
$(window).keypress(function (e) {
    if (e.which === 32) {
        callFire();
    }
});

// deleting the missiles from the screen
// clearing the missile stricture
function clearMissiles() {

    for (var a in missilesObjects) {

        var missile = missilesObjects[a];
        scene.remove(missile);
    }

    missilesObjects.length = 0;
}

// creates target elements each 5 seconds
function createDynamicTargets() {

    var geometry = new THREE.CubeGeometry(900, 900, 900);
    var cx = camera.position.x;
    var cy = camera.position.y;
    var cz = camera.position.z;

    if (globalCx && globalCy && globalCz) {

        if (true) {

            var newX = cx - globalCx;
            var newY = cy - globalCy;
            var newZ = cz - globalCz;

            for (var i = 0; i < 30; i++) {

                targetIdCounter++;
                var target_id = 'target' + targetIdCounter;
                var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

                object.position.x = Math.random() * newX * 70;
                object.position.y = Math.random() * newY * 70;
                object.position.z = Math.random() * newZ * 70;

                object.rotation.x = Math.random() * 2 * Math.PI;
                object.rotation.y = Math.random() * 2 * Math.PI;
                object.rotation.z = Math.random() * 2 * Math.PI;

                object.scale.x = Math.random() + 0.5;
                object.scale.y = Math.random() + 0.5;
                object.scale.z = Math.random() + 0.5;

                object.id = target_id;
                targetScreenObjects[target_id] = object;

                //  indicates that the element is real target
                visualTargetIds[target_id] = true;

                scene.add(object);
            }
        }
    }

    globalCx = cx; globalCy = cy; globalCz = cz;
}

function dynamicCreateTargetsInit() {

    var intervalID = setInterval(function () { createDynamicTargets(); }, 3000);
}

// drawing of the spaceship cabin
function drawShip() {

    var canvas = document.getElementById('the-canvas');
    var ctx = canvas.getContext('2d');
    var ship = document.getElementById('cabin');
    ctx.drawImage(ship, 0, 0, canvas.width, canvas.height);
    displayStats();
}

function displayStats() {
    var shipAmmoStats = document.getElementById('ammo-stats');
    var shipArmorStats = document.getElementById('armor-stats');
    shipAmmoStats.innerHTML = 'Ammo: ' + shipAmmo;
    shipArmorStats.innerHTML = 'Armor: ' + shipArmor;
}

function checkForShipNearEarth() {

    var cx = camera.position.x;
    var cy = camera.position.y;
    var cz = camera.position.z;

    if (cx !== 0 && cy !== 0 && cz !== 0) {

        if (meshPlanet.position) {

            var ix = meshPlanet.position.x;
            var iy = meshPlanet.position.y;
            var iz = meshPlanet.position.z;

            var ax = Math.abs(cx - ix);
            var ay = Math.abs(cy - iy);
            var az= Math.abs(cz-iz);
            if (ax < 8000 && ay < 8000 && az<8000) {
                if (shipAmmo<200) {
                    shipAmmo += 1;
                    displayStats();
                    playSound(explodeSound, 0.10);
                }
                if (shipArmor<100) {
                    shipArmor += 1;
                    displayStats();
                    playSound(explodeSound, 0.10);
                }
            }
        }
    }

}
//}());