import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {makeScene, webGlConfig} from './scene.lib';
import {
    DEBUG,
    DELAY_TRIAL_START_MASK,
    floorNameList,
    getFloorUrl,
    getTimestamp,
    getWallUrl,
    wallNameList
} from "../../const";

export interface PropRoom {
    width: number;
    height: number;
    depth: number;
    duration: number;
}

export interface PropScene {
    room: PropRoom,
    done: (timeStat: TypeRoomStat) => void,
}

const FRAME = 1000 / 144;

export interface TypeRoomStat {
    stage_started_date: number,
    stage_started: number,
    camera_moved_fss: number,
    done_from_camera_moved_fss: number,
    floor: string,
    ceiling: string,
    wall: string
}

export default function SceneRoom(props: PropScene) {
    const room = props.room;

    const divRef = useRef<HTMLDivElement>(null);
    const roomStat = useRef<TypeRoomStat>({
        stage_started_date: -1,
        stage_started: -1,
        done_from_camera_moved_fss: -1,
        camera_moved_fss: -1,
        floor: "",
        ceiling: "",
        wall: ""
    }).current

    useEffect(() => {
        roomStat.stage_started_date = new Date().getTime();
        roomStat.stage_started = getTimestamp();

        const renderer = new THREE.WebGLRenderer(webGlConfig);

        renderer.setClearColor(new THREE.Color(0xEEEEEE));

        divRef.current!.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

        function setBlackCamera() {
            camera.position.set(0, -100, 0);
            camera.lookAt(0, -100, 0);
        }

        setBlackCamera();

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        roomStat.floor = floorNameList[0];
        roomStat.wall = wallNameList[0];
        roomStat.ceiling = wallNameList[0];

        const [scene,] = makeScene(room, {
            wall: {
                D: getWallUrl(roomStat.wall, 'D'),
                N: getWallUrl(roomStat.wall, 'N'),
            },
            floor: {
                D: getFloorUrl(roomStat.floor, 'D'),
                N: getFloorUrl(roomStat.floor, 'N'),
            },
            ceiling: {
                D: getWallUrl(roomStat.ceiling, 'D'),
                N: getWallUrl(roomStat.ceiling, 'N'),
            },
        }, renderer, camera, true);

        let cameraMoved = -1;

        const duration = DEBUG ? 10 : room.duration;

        function check() {
            const now = getTimestamp();

            if (cameraMoved > -1 && (duration + cameraMoved < now + FRAME * 0.5)) {
                setBlackCamera();
                roomStat.camera_moved_fss = cameraMoved - roomStat.stage_started;
                roomStat.done_from_camera_moved_fss = now - cameraMoved;
                props.done(roomStat);
                return
            }
            if (now - roomStat.stage_started > DELAY_TRIAL_START_MASK - FRAME * 1.01) {
                if (cameraMoved === -1) {
                    cameraMoved = now;
                    camera.position.set(0, room.height / 2, room.depth / 2);
                    camera.lookAt(0, room.height / 2, 0);
                    renderer.render(scene, camera);
                }
            }
            requestAnimationFrame(check);
        }

        check();

        return () => {
            console.log('Requested force context loss');
            renderer.forceContextLoss();
            renderer.domElement.remove();
        }
    }, [])

    return <div ref={divRef} style={{cursor: 'none'}}/>
}
