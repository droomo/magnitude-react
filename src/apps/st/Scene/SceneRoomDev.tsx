import React, {useEffect, useRef, useState} from 'react';
import {
    makeScene,
    doorHeight,
    makeDoorEXR as makeDoor,
    webGlConfig, eyeHeight
} from './scene.lib';

import {floorNameList, getFloorUrl, getTimestamp, getWallUrl, wallNameList} from "../../const";
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

    const lastAnimationID = useRef(0);

    const [wallName, setWallName] = useState<string>('');
    const [floorName, setFloorName] = useState<string>('');
    const [ceilingName, setCeilingName] = useState<string>('');

    useEffect(() => {
        const renderer = new THREE.WebGLRenderer(webGlConfig);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

        // 添加OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        const [scene,] = makeScene(room, {
            wall: {
                D: getWallUrl(wallName, 'D'),
                N: getWallUrl(wallName, 'N'),
            },
            floor: {
                D: getFloorUrl(floorName, 'D'),
                N: getFloorUrl(floorName, 'N'),
            },
            ceiling: {
                D: getWallUrl(ceilingName, 'D'),
                N: getWallUrl(ceilingName, 'N'),
            },
        }, renderer, camera, true);


        function render() {
            renderer.render(scene, camera);
        }

        function animate() {
            camera.position.set(0, room.height / 2, room.depth / 2);
            camera.lookAt(0, room.height / 2, 0);

            lastAnimationID.current = requestAnimationFrame(animate);
            render();
        }


        divRef.current?.appendChild(renderer.domElement);
        animate();

        return () => {
            console.log('Requested force context loss');
            renderer.forceContextLoss();
            renderer.domElement.remove();
        }
    }, [wallName, floorName, ceilingName]);

    return (
        <>
            <div style={{position: 'absolute', top: '2rem', right: '1rem'}}>
                wall
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
                floor
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
            <div style={{position: 'absolute', top: '12rem', right: '1rem'}}>
                ceiling
                <Select
                    style={{width: '20rem'}}
                    onChange={(value) => {
                        setCeilingName(value);
                    }}
                >
                    {wallNameList.map((name, index) => {
                        return <Select.Option key={index} value={name}>{name}</Select.Option>
                    })}
                </Select>
            </div>
            <div style={{cursor: 'default'}} ref={divRef}/>
        </>
    );
}
