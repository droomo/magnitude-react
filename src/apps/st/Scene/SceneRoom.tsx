import React, {useEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {makeScene, makeDoorEXR as makeDoor, webGlConfig, eyeHeight} from './scene.lib';
import {DELAY_TRIAL_START_MASK, floorNameList, getRandomElement, getTimestamp, wallNameList} from "../../const";
import PageMask from "../Page/PageMask";
import classes from "../css/exp.module.scss";

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
    done: (timeStat: TypeRoomStat) => void,
    startedIndex: number,
}

export interface TypeRoomStat {
    door_opened: number,
    camera_moved: number,
    done_from_camera_moved: number,
    floor: string,
    wall: string
}

export default function SceneRoom(props: PropScene) {
    const room = props.room;

    const divRef = useRef<HTMLDivElement>(null);
    const doorOpened = useRef(false);
    const roomStat = useRef<TypeRoomStat>({
        door_opened: -1,
        camera_moved: -1,
        done_from_camera_moved: -1,
        floor: "",
        wall: ""
    }).current
    const [mask, setMask] = React.useState(true);

    const lastAnimationID = useRef(0);

    const renderer = useMemo(() => {
        return new THREE.WebGLRenderer(webGlConfig);
    }, [])

    useEffect(() => {
        setTimeout(() => {
            setMask(false)
        }, DELAY_TRIAL_START_MASK)

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, eyeHeight, props.room.depth / 2 + 4);
        camera.lookAt(0, eyeHeight, 0);

        function onDoorOpen() {
            doorOpened.current = true;
            roomStat.door_opened = getTimestamp();
            camera.position.set(0, room.height / 2, room.depth / 2);
            camera.lookAt(0, room.height / 2, 0);

            roomStat.camera_moved = getTimestamp();
            cancelAnimationFrame(lastAnimationID.current);
            setTimeout(() => {
                while (true) {
                    if (room.duration + roomStat.camera_moved < getTimestamp()) {
                        roomStat.done_from_camera_moved = getTimestamp() - roomStat.camera_moved
                        roomStat.camera_moved -= roomStat.door_opened
                        roomStat.door_opened -= roomStat.door_opened
                        props.done(roomStat)
                        break;
                    }
                }
            }, 0)
        }

        const clock = new THREE.Clock();
        const [door, handleDoor] = makeDoor(room, onDoorOpen);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        roomStat.floor = getRandomElement(floorNameList);
        roomStat.wall = getRandomElement(wallNameList);

        const [scene,] = makeScene(room, roomStat.wall, roomStat.floor, renderer, camera, true);
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
            // console.log('aniing')
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
    }, [])

    return (
        <>{
            mask && <div style={{cursor: 'none'}} className={classes.mask}>
                <PageMask text={props.startedIndex === 0 ? 'Loading...' : '已完成'}/>
            </div>}
            <div style={{cursor: 'none'}} ref={divRef}/>
        </>
    );
}
