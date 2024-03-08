import React, {useEffect, useRef, useState} from 'react';
import {
    makeScene,
    doorHeight,
    makeDoorEXR as makeDoor,
    webGlConfig, eyeHeight
} from './scene.lib';

import {floorNameList, getTimestamp, wallNameList} from "../../const";
import {OrbitControls} from "three-stdlib";
import * as THREE from 'three';
import {Select} from "antd";

export interface PropRoom {
    width: number;
    height: number;
    depth: number;
    wall: number;
    ground: number;
    duration: number;
}

export interface PropScene {
    room: PropRoom,
}

export interface TypeTimeStat {
    door_opened: number,
    camera_moved: number,
    done_from_camera_moved: number
}

export default function SceneRoomDev(props: PropScene) {
    const room = props.room;

    const divRef = useRef<HTMLDivElement>(null);
    const doorOpened = useRef(false);
    const timeStat = useRef<TypeTimeStat>({
        door_opened: -1,
        camera_moved: -1,
        done_from_camera_moved: -1
    }).current

    const lastAnimationID = useRef(0);

    const [wallName, setWallName] = useState<string>('');
    const [floorName, setFloorName] = useState<string>('');

    useEffect(() => {
        const renderer = new THREE.WebGLRenderer(webGlConfig);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, eyeHeight, props.room.depth / 2 + 2);
        camera.lookAt(0, eyeHeight, 0);

        // 添加OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        function onDoorOpen() {
            doorOpened.current = true;
            timeStat.door_opened = getTimestamp();
            camera.position.set(0, room.height / 2, room.depth / 2);
            camera.lookAt(0, room.height / 2, 0);

            timeStat.camera_moved = getTimestamp();
            cancelAnimationFrame(lastAnimationID.current);
            setTimeout(() => {
                setTimeout(() => {
                    timeStat.done_from_camera_moved = getTimestamp() - timeStat.camera_moved
                    timeStat.camera_moved -= timeStat.door_opened
                    timeStat.door_opened -= timeStat.door_opened
                }, room.duration + timeStat.camera_moved)
            }, 0)
        }

        const clock = new THREE.Clock();
        const [door, handleDoor] = makeDoor(room, onDoorOpen);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        const [scene,] = makeScene(room, wallName, floorName, renderer, camera, true);
        scene.add(door);

        function onWindowResize() {
            camera.position.set(0, room.height / 2, room.depth / 2);
            camera.lookAt(0, room.height / 2, 0);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            render();
        }

        function render() {
            renderer.render(scene, camera);
        }

        function animate() {
            // console.log('aniing');
            lastAnimationID.current = requestAnimationFrame(animate);
            handleDoor(clock);
            render();
        }

        window.addEventListener('resize', onWindowResize);

        divRef.current?.appendChild(renderer.domElement);
        animate();

        return () => {
            window.removeEventListener('resize', onWindowResize);
            console.log('Requested force context loss');
            renderer.forceContextLoss();
            renderer.domElement.remove();
        }
    }, [wallName, floorName]);

    return (
        <>
            <div style={{position: 'absolute', top: '2rem', right: '1rem'}}>
                <Select
                    style={{width: '20rem'}}
                    onChange={(value) => {
                        setWallName(value)
                    }}
                >
                    {wallNameList.map((name, index) => {
                        return <Select.Option key={index} value={name}>{name}</Select.Option>
                    })}
                </Select>
            </div>
            <div style={{position: 'absolute', top: '6rem', right: '1rem'}}>
                <Select
                    style={{width: '20rem'}}
                    onChange={(value) => {
                        setFloorName(value);
                    }}
                >
                    {floorNameList.map((name, index) => {
                        return <Select.Option key={index} value={name}>{name}</Select.Option>
                    })}
                </Select>
            </div>
            <div style={{cursor: 'default'}} ref={divRef}/>
        </>
    );
}
