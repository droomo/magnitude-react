import React from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import {
    eyeHeight,
    createWalls,
    webGlConfig, addLight,
} from './scene.lib';
import {PropRoom} from "./SceneRoom";
import {floorNameList, getFloorUrl, getWallUrl, wallNameList, WS_CONTROL_COMMAND} from "../../const";
import {HelperText} from "../Page/HelperText";
import {message} from "antd";
import WSRC, {TypeSendData} from "../WSRC";
import classes from "../css/exp.module.scss";
import PureShapeRadius from "./PureShapeRadius";
import {Scene} from "three";


export interface TypeExploringRecord {
    start_date: number,
    end_date: number,
    key_pressed: string,
}

const roomWall = {
    wall: {
        D: getWallUrl(wallNameList[0], 'D'),
        N: getWallUrl(wallNameList[0], 'N'),
    },
    floor: {
        D: getFloorUrl(floorNameList[0], 'D'),
        N: getFloorUrl(floorNameList[0], 'N'),
    },
    ceiling: {
        D: getWallUrl(wallNameList[0], 'D'),
        N: getWallUrl(wallNameList[0], 'N'),
    },
}

export default class SceneRoomPractice extends WSRC<{
    room: PropRoom,
    done: (record: TypeExploringRecord) => void,
}, {}> {
    private divRef: React.RefObject<HTMLDivElement>;
    private startButtonRef: React.RefObject<HTMLButtonElement>;
    private stats: Stats;
    private record: TypeExploringRecord;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private walls: THREE.Mesh[];
    private shapeScene: PureShapeRadius | null = null;


    constructor(props: any) {
        super(props);
        this.divRef = React.createRef<HTMLDivElement>();
        this.startButtonRef = React.createRef<HTMLButtonElement>();
        this.stats = new Stats();
        this.record = {end_date: 0, key_pressed: '', start_date: 0};
        this.renderer = new THREE.WebGLRenderer(webGlConfig);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

        this.scene = new THREE.Scene();

        this.walls = [];

        createWalls(this.props.room, roomWall, this.walls)
    }

    switchRoomScene() {
        this.clearScene();
        addLight(this.scene, this.props.room)
        for (const wall of this.walls) {
            this.scene.add(wall)
        }
    }

    switchShapeScene = () => {
        this.clearScene();

        this.camera.position.set(0, 0, 30);
        this.camera.add(new THREE.PointLight(0xffffff, 3, 0, 0));

        this.shapeScene = new PureShapeRadius({
            renderer: this.renderer,
            camera: this.camera,
            scene: this.scene,
            done: () => {
                alert(1)
            }
        })
    }

    clearScene() {
        this.shapeScene?.clear();
        this.scene.clear();
        this.scene = new Scene();
        this.scene.add(this.camera);
        this.camera.clear();
        this.camera.position.set(0, this.props.room.height / 2, -this.props.room.depth * 0.5);
        this.camera.lookAt(0, this.props.room.height / 2, 0);
        this.renderer.setAnimationLoop(this.animate);
    }

    componentDidMount() {
        super.componentDidMount()
        this.record.start_date = new Date().getTime();

        this.renderer.xr.enabled = true;

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;

        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        if (this.divRef.current) {
            this.divRef.current.appendChild(this.stats.dom);
            this.divRef.current.appendChild(this.renderer.domElement);
        }

        navigator.xr!.addEventListener('sessiongranted', () => {
            this.startSession();
        });
    }

    animate = () => {
        this.stats.begin();
        this.renderer.render(this.scene, this.camera);
        this.stats.end();
    };

    startSession = () => {
        if (this.renderer.xr.getSession()) {
            return
        }
        const xr = navigator.xr!;
        xr.requestSession('immersive-vr', {
            optionalFeatures: ['local-floor', 'bounded-floor', 'layers']
        }).then((session) => {
            this.renderer.xr.setSession(session);
            this.switchRoomScene();
        }).catch((err) => {
            this.sendCommand(`${err}`);
            message.error(`Error happened while starting VR session: ${err}`);
        });
    }

    endSession = () => {
        this.clearScene()
        this.renderer.xr.getSession()?.end()
    };

    onMessage = (data_str: string) => {
        const data: TypeSendData = JSON.parse(data_str);
        console.log(data)
        console.log(data.action)
        switch (data.action) {
            case WS_CONTROL_COMMAND.loss_session:
                this.endSession();
                break;
            case WS_CONTROL_COMMAND.start_session:
                this.startSession();
                break;
            case WS_CONTROL_COMMAND.enter_shape:
                this.switchShapeScene();
                break;
            case WS_CONTROL_COMMAND.enter_room:
                this.switchRoomScene();
                break;
        }

    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    render() {
        return (
            <>
                <HelperText>
                    <p>请想象你正以第一人称视角处于游戏环境中</p>
                    <button
                        className={classes.buttonStartVR}
                        ref={this.startButtonRef}
                        onClick={() => {
                            this.startSession()
                        }}>进入沉浸式VR场景
                    </button>
                </HelperText>
                <div ref={this.divRef}/>
            </>)
    }
}