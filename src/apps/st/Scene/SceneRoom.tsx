import React, {useContext, useEffect, useRef} from 'react';
import * as THREE from 'three';
import {addGround, addLight, addSky, addWalls, makeCamera, makeDoor} from './scene.lib';
import {DELAY_TRIAL_START_MASK, getTimestamp} from "../../const";
import PageDone from "../Page/PageDone";
import classes from "../css/timeCounter.module.scss";
import WebGLContext from "../WebGLContext";

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
    done: (timeStat: TypeTimeStat) => void
}

export interface TypeTimeStat {
    door_opened: number,
    camera_moved: number,
    done_from_camera_moved: number
}

export default function SceneRoom(props: PropScene) {
    const room = props.room;

    const divRef = useRef<HTMLDivElement>(null);
    const doorOpened = useRef(false);
    const timeStat = useRef<TypeTimeStat>({
        door_opened: -1,
        camera_moved: -1,
        done_from_camera_moved: -1
    }).current
    const [mask, setMask] = React.useState(true);
    const renderer = useContext(WebGLContext);

    useEffect(() => {
        setTimeout(() => {
            setMask(false)
        }, DELAY_TRIAL_START_MASK)
    }, []);

    useEffect(() => {
        const [camera, , clearKeyAction] = makeCamera(room);

        function onDoorOpen() {
            doorOpened.current = true;
            timeStat.door_opened = getTimestamp();
            camera.position.set(0, room.height / 2, room.depth / 2);
            camera.lookAt(0, room.height / 2, 0);

            console.log(camera)
            timeStat.camera_moved = getTimestamp();
        }

        const clock = new THREE.Clock();
        const scene = new THREE.Scene();
        const [door, handleDoor] = makeDoor(room, onDoorOpen);

        renderer!.setPixelRatio(window.devicePixelRatio);
        renderer!.setSize(window.innerWidth, window.innerHeight);
        renderer!.toneMapping = THREE.ACESFilmicToneMapping;
        renderer!.toneMappingExposure = 0.5;

        addGround(scene);
        addLight(scene);
        addWalls(scene, room);
        scene.add(door)
        addSky(scene, renderer!, camera);

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer!.setSize(window.innerWidth, window.innerHeight);
            render();
        }

        function render() {
            renderer!.render(scene, camera);
        }

        function animate() {
            if (timeStat.camera_moved > -1) {
                if (room.duration + timeStat.camera_moved < getTimestamp()) {
                    timeStat.done_from_camera_moved = getTimestamp() - timeStat.camera_moved
                    timeStat.camera_moved -= timeStat.door_opened
                    timeStat.door_opened -= timeStat.door_opened
                    props.done(timeStat)
                    return
                }
            }
            requestAnimationFrame(animate);
            if (!doorOpened.current) handleDoor(clock);
            render()
        }

        window.addEventListener('resize', onWindowResize);

        divRef.current?.appendChild(renderer!.domElement);
        animate();

        return () => {
            clearKeyAction();
            window.removeEventListener('resize', onWindowResize);
            renderer!.domElement.remove();
        }
    }, [props, renderer, room, timeStat])

    return (
        <>{mask && <div className={classes.mask}><PageDone/></div>}
            <div ref={divRef}/>
        </>
    );
}
