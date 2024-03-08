import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import {makeScene, doorHeight, makeDoorEXR as makeDoor, webGlConfig} from './scene.lib';
import {PropRoom} from "./SceneRoom";
import {floorNameList, getRandomElement, wallNameList} from "../../const";
import {HelperText} from "../Page/HelperText";

function makeCamera(): [THREE.PerspectiveCamera, () => void, () => void] {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    let movingDirection: number = 0;
    const moveSpeed = 0.08;
    const onKeyDown = (event: { key: any; }) => {
        switch (event.key) {
            case 'w':
                movingDirection = 1;
                break;
            case 's':
                movingDirection = 2;
                break;
            case 'a':
                movingDirection = 3;
                break;
            case 'd':
                movingDirection = 4;
                break;
            default:
                break;
        }
    };

    const onKeyUp = () => {
        movingDirection = 0;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const moveCamera = function () {
        camera.lookAt(0, doorHeight * 0.8, 0);
        switch (movingDirection) {
            case 1:
                camera.translateZ(-moveSpeed);
                break;
            case 2:
                camera.translateZ(moveSpeed);
                break;
            case 3:
                camera.translateX(-moveSpeed);
                break;
            case 4:
                camera.translateX(moveSpeed);
                break;
            default:
                break;
        }
    }

    const clearKeyAction = () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
    }
    return [camera, moveCamera, clearKeyAction];
}

export default function SceneRoomPractice(props: {
    room: PropRoom,
    done: () => void,
}) {

    const room = props.room;

    const divRef = useRef<HTMLDivElement>(null);
    const doorOpened = useRef(false);

    const lastAnimationID = useRef(0);

    const stats = useRef(new Stats()).current;

    const [stage, setStage] = React.useState(1);

    useEffect(() => {
        console.log('okkkkkkk')
        const [camera, moveCamera, clearKeyAction] = makeCamera();

        camera.position.set(0, doorHeight * 0.8, room.depth);
        camera.lookAt(0, doorHeight * 0.8, 0);

        function onDoorOpen() {
            doorOpened.current = true;
            camera.position.set(0, room.height / 2, room.depth / 2 + 1);
            camera.lookAt(0, room.height / 2, 0);
            cancelAnimationFrame(lastAnimationID.current);
            setStage(2);

            stats.dom.remove();

            setTimeout(() => {
                props.done();
            }, props.room.duration)
        }

        const clock = new THREE.Clock();
        const renderer = new THREE.WebGLRenderer(webGlConfig)
        const [door, handleDoor] = makeDoor(room, onDoorOpen);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        const scene = makeScene(room, getRandomElement(wallNameList), getRandomElement(floorNameList), renderer, camera, false);
        scene.add(door);

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
            lastAnimationID.current = requestAnimationFrame(animate);

            moveCamera();
            if (!doorOpened.current) handleDoor(clock);
            stats.begin();
            stats.end();
            render();
        }

        window.addEventListener('resize', onWindowResize);

        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        divRef.current?.appendChild(stats.dom);
        divRef.current?.appendChild(renderer.domElement);
        animate();

        return () => {
            clearKeyAction();
            window.removeEventListener('resize', onWindowResize);
            renderer.forceContextLoss();
            console.log('Requested force context loss');
            renderer.domElement.remove();
        }
    }, [])

    return (
        <>
            <HelperText>
                {stage === 1 && <>
                    <p>游戏的操作同多数电脑游戏一致</p>
                    <p>按<strong style={{color: 'red'}}>“WASD”</strong>键控制方向“上左后右”，按<strong
                        style={{color: 'red'}}>“E”</strong>键开门</p>
                    <p>请想象你正以第一人称处于游戏环境中</p>
                </>}
                {stage === 2 && <>
                    <p>开门后游戏自动带你进入房间，此时不能再移动</p>
                    <p>请想象你正以第一人称处于游戏环境中</p>
                    <p>尽可能身临其境地体验<strong
                        style={{color: 'red', fontSize: '2.2rem'}}>房间的大小</strong>和<strong
                        style={{color: 'red', fontSize: '2.2rem'}}>在房间内的时长</strong></p>
                    <p>一段时间后，页面会自动切换，你需要完成时间或空间再现任务</p>
                </>}
            </HelperText>
            <div ref={divRef}/>
        </>
    );
}
