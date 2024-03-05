import React, {useEffect, useRef} from 'react';
import {OrbitControls} from 'three-stdlib'
import * as THREE from 'three';
import Stats from 'stats.js';
import {addGround, addLight, addSky, addWalls, makeCamera, makeDoor, webGlConfig} from './scene.lib';
import {getTimestamp} from "../../const";

export interface PropRoom {
    width: number;
    height: number;
    depth: number;
    wall: number;
    ground: number;
    duration: number;
}

export default function Scene(props: PropRoom) {

    const divRef = useRef<HTMLDivElement>(null);
    const doorOpened = useRef(false);

    const timeStat = useRef({
        doorOpened: -1,
        cameraMoved: -1,
    }).current

    // const stats = useRef(new Stats()).current;



    useEffect(() => {
        const [camera, moveCamera] = makeCamera();

        function onDoorOpen() {
            doorOpened.current = true;
            timeStat.doorOpened = getTimestamp();
            camera.position.set(0, props.height / 2, props.depth / 2);
            camera.lookAt(0, props.height / 2, 0);
            timeStat.cameraMoved = getTimestamp();
        }

        const clock = new THREE.Clock();
        const renderer = new THREE.WebGLRenderer(webGlConfig)
        const scene = new THREE.Scene();
        const [door, handleDoor] = makeDoor(props, onDoorOpen);
        // const _ = new OrbitControls(camera, renderer.domElement);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        addGround(scene);
        addLight(scene);
        addWalls(scene, props);
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
            if (!doorOpened.current) handleDoor(clock);
            // stats.begin();
            // stats.end();

            render()
        }

        window.addEventListener('resize', onWindowResize);

        // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        // divRef.current?.appendChild(stats.dom);
        divRef.current?.appendChild(renderer.domElement);
        animate();

        return () => {
            renderer.domElement.remove();
            // stats.dom.remove();
        }
    }, [props]) // stats

    return (
        <div ref={divRef}/>
    );
}
