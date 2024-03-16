import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import {
    makeScene,
    makeDoorEXR as makeDoor,
    webGlConfig,
    checkCollisionAndMoveDelta as checkCollisionAndMove,
    eyeHeight,
    loadFBXModel
} from './scene.lib';
import {PropRoom} from "./SceneRoom";
import {floorNameList, getFloorUrl, getWallUrl, material_map} from "../../const";
import {HelperText} from "../Page/HelperText";
import {Vector3} from "three/src/math/Vector3";
import {message} from "antd";

const moveCamera = function (camera: THREE.Camera, raycaster: THREE.Raycaster, movingDirection: number, moveSpeed: number, walls: THREE.Object3D[], deltaTime: number) {
    // camera.lookAt(0, eyeHeight, 0);
    switch (movingDirection) {
        case 1:
            checkCollisionAndMove(raycaster, new THREE.Vector3(0, 0, -1), moveSpeed, camera, walls, deltaTime);
            break;
        case 2:
            checkCollisionAndMove(raycaster, new THREE.Vector3(0, 0, 1), moveSpeed, camera, walls, deltaTime);
            break;
        case 3:
            checkCollisionAndMove(raycaster, new THREE.Vector3(-1, 0, 0), moveSpeed, camera, walls, deltaTime);
            break;
        case 4:
            checkCollisionAndMove(raycaster, new THREE.Vector3(1, 0, 0), moveSpeed, camera, walls, deltaTime);
            break;
        default:
            break;
    }
}

export interface TypeExploringRecord {
    start_date: number,
    end_date: number,
    key_pressed: string,
}

export default function SceneRoomPractice(props: {
    room: PropRoom,
    done: (record: TypeExploringRecord) => void,
}) {
    const room = props.room;
    const divRef = useRef<HTMLDivElement>(null);
    const stats = useRef(new Stats()).current;
    const isDoorOpened = useRef<boolean>(false);

    const record: TypeExploringRecord = {end_date: 0, key_pressed: '', start_date: 0}

    useEffect(() => {
        record.start_date = new Date().getTime();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        const raycaster = new THREE.Raycaster();

        let movingDirection: number = 0;
        const moveSpeed = 2;
        const onKeyDown = (event: KeyboardEvent) => {
            record.key_pressed += event.key;
            switch (event.code) {
                case 'ArrowUp':
                    movingDirection = 1;
                    break;
                case 'ArrowDown':
                    movingDirection = 2;
                    break;
                case 'ArrowLeft':
                    movingDirection = 3;
                    break;
                case 'ArrowRight':
                    movingDirection = 4;
                    break;
                case 'KeyE':
                    if (camera.position.distanceTo(new Vector3(...bookPosition)) < 3) {
                        if (book !== undefined && book !== 2) {
                            scene.remove(book);
                            book = 2;
                        }
                    } else if (camera.position.distanceTo(door.position) < 3) {
                        if (book === 2) {
                            changeDoorState();
                        } else {
                            message.error('请先在你的右后方拾取书籍');
                        }
                    }
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

        const renderer = new THREE.WebGLRenderer(webGlConfig);

        const [scene, walls] = makeScene(
            room, {
                wall: {
                    D: getWallUrl('T_Decorative_Wall_Tiles_vlqvfdj_1K', 'D'),
                    N: getWallUrl('T_Decorative_Wall_Tiles_vlqvfdj_1K', 'D'),
                },
                floor: {
                    D: getFloorUrl(floorNameList[0], 'D'),
                    N: getFloorUrl(floorNameList[0], 'D'),
                },
                ceiling: {
                    D: getWallUrl('T_Decorative_Wall_Tiles_vlqvfdj_1K', 'D'),
                    N: getWallUrl('T_Decorative_Wall_Tiles_vlqvfdj_1K', 'D'),
                },
            }, renderer, camera, false);

        camera.position.set(0, eyeHeight, room.depth * 2);
        camera.lookAt(0, eyeHeight, 0);

        const bookPosition: [number, number, number] = [-room.width, 0, room.depth * 0.9];

        function onDoorOpen() {
            record.end_date = new Date().getTime();
            isDoorOpened.current = true;
            props.done(record);
        }

        const clock = new THREE.Clock();
        const [door, updateDoor, changeDoorState] = makeDoor(room, onDoorOpen);

        walls.push(door);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;

        scene.add(door);

        let book: undefined | THREE.Group<THREE.Object3DEventMap> | 2 = undefined;
        loadFBXModel(material_map.bookModel, material_map.bookD, material_map.bookN,
            (model, material) => {
                model.traverse((child) => {
                    if ((child as THREE.Mesh).isMesh) {
                        (child as THREE.Mesh).material = material;
                    }
                });
                const scaleNumber = 0.01;
                model.scale.set(scaleNumber, scaleNumber, scaleNumber)
                model.rotateX(-Math.PI / 2);
                model.rotateZ(-Math.PI * 0.3);
                model.position.set(...bookPosition);
                scene.add(model);
                book = model;
            }
        );

        function render() {
            renderer.render(scene, camera);
        }

        let lastTime = 0;

        function animate() {
            if (isDoorOpened.current) {
                return;
            }
            updateDoor(clock);
            requestAnimationFrame(animate);

            const now = performance.now();
            const deltaTime = (now - lastTime) / 1000;
            moveCamera(camera, raycaster, movingDirection, moveSpeed, walls, deltaTime);
            lastTime = now;

            stats.begin();
            stats.end();
            render();
        }

        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        divRef.current?.appendChild(stats.dom);
        divRef.current?.appendChild(renderer.domElement);
        animate();

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            renderer.forceContextLoss();
            console.log('Requested force context loss');
            renderer.domElement.remove();
        }
    }, [])

    return (
        <>
            <HelperText>
                <p>请想象你正以第一人称视角处于游戏环境中</p>
                <p>游戏的操作同多数电脑游戏一致</p>
                <p>按<strong style={{color: 'red'}}>“WASD”</strong>键控制方向<strong
                    style={{color: 'red'}}>“前左后右”</strong>，按<strong
                    style={{color: 'red'}}>“E”</strong>键捡拾物品或开门</p>
                <p>请捡起地上的书，然后进入房间</p>
            </HelperText>
            <div ref={divRef}/>
        </>
    );
}
