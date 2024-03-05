import React, {useEffect, useRef} from 'react';
import {OrbitControls} from 'three-stdlib'
import * as THREE from 'three';
import {TEXTURE_BASE, webGlConfig} from '../Scene/scene.lib';

// @ts-ignore
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";


export default function Scene(props: any) {

    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        let group: THREE.Group, camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;

        init();
        animate();

        function init() {

            scene = new THREE.Scene();

            renderer = new THREE.WebGLRenderer(webGlConfig);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            // camera
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
            camera.position.set(0, 0, 30);
            scene.add(camera);

            // controls
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.minDistance = 1;
            controls.maxDistance = 120;
            controls.maxPolarAngle = Math.PI / 2;

            controls.mouseButtons = {
                LEFT: -1,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: -1
            };

            renderer.domElement.addEventListener('wheel', (event) => {
                // event.deltaY > 0 表示向下滚动，< 0 表示向上滚动
                console.log(controls.getDistance())
            });

            // ambient light
            scene.add(new THREE.AmbientLight(0x666666));

            // point light
            const light = new THREE.PointLight(0xffffff, 3, 0, 0);
            camera.add(light);

            // textures
            const loader = new THREE.TextureLoader();
            const texture = loader.load(`${TEXTURE_BASE}/src/disc.png`);
            texture.colorSpace = THREE.SRGBColorSpace;

            group = new THREE.Group();
            scene.add(group);

            // points
            let dodecahedronGeometry = new THREE.DodecahedronGeometry(5, 0);

            // if normal and uv attributes are not removed, mergeVertices() can't consolidate indentical vertices with different normal/uv data
            dodecahedronGeometry.deleteAttribute('normal');
            dodecahedronGeometry.deleteAttribute('uv');

            dodecahedronGeometry = BufferGeometryUtils.mergeVertices(dodecahedronGeometry);

            const vertices = [];
            const positionAttribute = dodecahedronGeometry.getAttribute('position');

            for (let i = 0; i < positionAttribute.count; i++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positionAttribute, i);
                vertices.push(vertex);
            }

            const pointsMaterial = new THREE.PointsMaterial({
                color: 0x0080ff,
                map: texture,
                size: 0.6,
                alphaTest: 0.7
            });

            const pointsGeometry = new THREE.BufferGeometry().setFromPoints(vertices);

            const points = new THREE.Points(pointsGeometry, pointsMaterial);
            group.add(points);

            // convex hull
            const meshMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                opacity: 0.5,
                side: THREE.DoubleSide,
                transparent: true
            });

            const meshGeometry = new ConvexGeometry(vertices);
            const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
            group.add(mesh);

            window.addEventListener('resize', onWindowResize);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            group.rotation.y += 0.005;
            group.rotation.x += 0.003;
            render();
        }

        function render() {
            renderer.render(scene, camera);
        }


        return () => {
            renderer.domElement.remove()
        }
    }, [])

    return (
        <div ref={divRef}/>
    );
}