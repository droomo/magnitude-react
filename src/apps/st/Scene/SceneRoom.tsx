import React, {useEffect, useRef} from 'react';
import {OrbitControls} from 'three-stdlib'
import * as THREE from 'three';
import Stats from 'stats.js';
import {addGround, addLight, addSky, addWalls, makeCamera, makeDoor, webGlConfig} from './scene.lib';

export interface TypeRoomSize {
    width: number;
    height: number;
    depth: number;
}

interface SceneProps {
    size: TypeRoomSize
}

export default function Scene(props: SceneProps) {

    const divRef = useRef<HTMLDivElement>(null);
    const stats = useRef(new Stats()).current;

    useEffect(() => {

        const clock = new THREE.Clock();
        const renderer = new THREE.WebGLRenderer(webGlConfig)
        const scene = new THREE.Scene();
        const [camera, moveCamera] = makeCamera();
        const [door, handleDoor] = makeDoor(props.size);
        const orbitControls = new OrbitControls(camera, renderer.domElement);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        addGround(scene);
        addLight(scene);
        addWalls(scene, props.size);
        scene.add(door)
        addSky(scene, renderer, camera);

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        }

        function render() {
            renderer.render(scene, camera);
        }

        function animate() {
            requestAnimationFrame(animate);

            moveCamera();
            handleDoor(clock);
            stats.begin();
            stats.end();
            // orbitControls.update();
            render()
        }

        window.addEventListener('resize', onWindowResize);

        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        divRef.current?.appendChild(stats.dom);
        divRef.current?.appendChild(renderer.domElement);
        animate();

        return () => {
            renderer.domElement.remove();
            divRef.current?.removeChild(stats.dom);
        }
    }, [stats])

    return (
        <div ref={divRef}/>
    );
}
