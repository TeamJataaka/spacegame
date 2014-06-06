﻿//(function () {

    window.onload = function () {
        
        if (!Detector.webgl) Detector.addGetWebGLMessage();

        radius = 6371;
        tilt = 0.41;
        rotationSpeed = 0.02;

        cloudsScale = 1.005;
        moonScale = 0.23;

        MARGIN = 0;
        SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
        sCREEN_WIDTH = window.innerWidth;

        d, dPlanet, dMoon, dMoonVec = new THREE.Vector3();

        clock = new THREE.Clock();

        init();
        animate();
        resetToDisplay();
    };

    var radius;
    var tilt;
    var rotationSpeed;

    var cloudsScale;
    var moonScale;

    var MARGIN;
    var SCREEN_HEIGHT;
    var SCREEN_WIDTH;

    var container, stats;
    var camera, controls, scene, sceneCube, renderer;
    var geometry, meshPlanet, meshClouds, meshMoon;
    var dirLight, pointLight, ambientLight;
    var d, dPlanet, dMoon, dMoonVec;
    var clock;

    var projector, canvasrenderer;

    function init() {

        container = document.createElement('div');
        container.id = 'container';
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera(25, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7);
        camera.position.z = radius * 15;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.00000025);

        controls = new THREE.FlyControls(camera);

        controls.movementSpeed = 1000;
        controls.domElement = container;
        controls.rollSpeed = Math.PI / 24;
        controls.autoForward = false;
        controls.dragToLook = false;

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
            meshMoonNew.position.set(-radius * Math.random() * Math.random() * i * 20, Math.random() * 10000, Math.random() * 10000);
            meshMoonNew.scale.set(moonScale, moonScale, moonScale);
            scene.add(meshMoonNew);
        }

        // stars

        var i, r = radius, starsGeometry = [new THREE.Geometry(), new THREE.Geometry()];

        for (i = 0; i < 500; i++) {

            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2 - 1;
            vertex.y = Math.random() * 2 - 1;
            vertex.z = Math.random() * 2 - 1;
            vertex.multiplyScalar(r);

            starsGeometry[0].vertices.push(vertex);

        }

        for (i = 0; i < 1500; i++) {

            var vertex = new THREE.Vector3();
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
            new THREE.ParticleSystemMaterial({ color: 0x1a1a1a, size: 1, sizeAttenuation: false }),
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

        /// particles

        //for (var i = 0; i < 100; i++) {

        //    var particle = new THREE.Sprite(new THREE.SpriteCanvasMaterial({ color: Math.random() * 0x808080 + 0x808080, program: programStroke }));
        //    particle.position.x = Math.random() * 800 - 400;
        //    particle.position.y = Math.random() * 800 - 400;
        //    particle.position.z = Math.random() * 800 - 400;
        //    particle.scale.x = particle.scale.y = Math.random() * 20 + 20;
        //    scene.add(particle);

        //}

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

        window.addEventListener('resize', onWindowResize, false);

        // postprocessing

        var renderModel = new THREE.RenderPass(scene, camera);
        var effectFilm = new THREE.FilmPass(0.35, 0.75, 2048, false);

        effectFilm.renderToScreen = true;

        composer = new THREE.EffectComposer(renderer);

        composer.addPass(renderModel);
        composer.addPass(effectFilm);

    };

    function onWindowResize(event) {

        SCREEN_HEIGHT = window.innerHeight;
        SCREEN_WIDTH = window.innerWidth;

        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();

        composer.reset();

    };

    function animate() {

        requestAnimationFrame(animate);

        render();
        stats.update();

    };

    function render() {

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

        controls.movementSpeed = 0.33 * d;
        controls.update(delta);

        renderer.clear();
        composer.render(delta);

    };

    function resetToDisplay() {
        SCREEN_HEIGHT = window.innerHeight;
        SCREEN_WIDTH = window.innerWidth;

        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();

        composer.reset();
    };

    function mouseOverPlanet(a){

        var a = 4;
    }

    var programStroke = function (context) {

        context.lineWidth = 0.025;
        context.beginPath();
        context.arc(0, 0, 0.5, 0, PI2, true);
        context.stroke();

    }


//}());