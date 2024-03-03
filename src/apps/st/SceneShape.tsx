import React, {useEffect, useRef, useState} from 'react';
import {OrbitControls} from 'three-stdlib'
import * as THREE from 'three';
import Stats from 'stats.js';
import {TEXTURE_BASE, webGlConfig} from './scene.lib';

// @ts-ignore
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";


export default function Scene(props: any) {

    const divRef = useRef<HTMLDivElement>(null);
    const [radius, setRadius] = useState(5);

    const rotationRef = useRef(0);
    const rendererRef = useRef(new THREE.WebGLRenderer({antialias: true}));

    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    useEffect(() => {

        let group: THREE.Group, camera: THREE.PerspectiveCamera, scene: THREE.Scene;

        init();
        animate();

        function init() {

            scene = new THREE.Scene();

            document.body.appendChild(rendererRef.current.domElement);

            // camera

            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
            camera.position.set(0, 0, 30);
            scene.add(camera);

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

            let dodecahedronGeometry = new THREE.DodecahedronGeometry(radius, 2);

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
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            group.rotation.y += 0.005 + rotationRef.current;
            rotationRef.current = 0;
            render();
        }

        function render() {
            rendererRef.current.render(scene, camera);
        }

        return () => {
            rotationRef.current = group.rotation.y;
            rendererRef.current.domElement.remove();
            window.removeEventListener('resize', onWindowResize);
            scene.clear();
        }
    }, [radius])

    return (
        <div>
            <div ref={divRef}/>
            <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                placeholder="Enter radius"
            />
        </div>
    );
}