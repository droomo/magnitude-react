import React from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import {
    eyeHeight,
    makeScene,
    webGlConfig,
} from './scene.lib';
import {PropRoom} from "./SceneRoom";
import {floorNameList, getFloorUrl, getWallUrl, wallNameList, WS_CONTROL_COMMAND} from "../../const";
import {HelperText} from "../Page/HelperText";
import {message} from "antd";
import WSRC, {TypeSendData} from "../WSRC";
import classes from "../css/exp.module.scss";


export interface TypeExploringRecord {
    start_date: number,
    end_date: number,
    key_pressed: string,
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

    constructor(props: any) {
        super(props);
        this.divRef = React.createRef<HTMLDivElement>();
        this.startButtonRef = React.createRef<HTMLButtonElement>();
        this.stats = new Stats();
        this.record = {end_date: 0, key_pressed: '', start_date: 0};
        this.renderer = new THREE.WebGLRenderer(webGlConfig);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        this.scene = makeScene(
            this.props.room,
            {
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
        );
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

        this.adjustCamera();
        const animate = () => {
            this.stats.begin();
            this.renderer.render(this.scene, this.camera);
            this.stats.end();
        };

        this.renderer.setAnimationLoop(animate);

        navigator.xr!.addEventListener('sessiongranted', () => {
            this.startSession();
        });
    }

    adjustCamera() {
        this.camera.position.set(0, this.props.room.height / 2, -this.props.room.depth * 0.5);
        this.camera.lookAt(0, this.props.room.height / 2, 0);
    }

    startSession = () => {
        if (this.renderer.xr.getSession()) {
            return
        }
        const xr = navigator.xr!;
        xr.requestSession('immersive-vr', {
            optionalFeatures: ['local-floor', 'bounded-floor', 'layers']
        }).then((session) => {
            this.renderer.xr.setSession(session);
            this.sendCommand('in_practice');
        }).catch((err) => {
            this.sendCommand(`${err}`);
            message.error(`Error happened while starting VR session: ${err}`);
        });
    }

    endSession = () => {
        this.renderer.xr.getSession()?.end()
    };

    startShapeScene = () => {
        
    }

    onMessage = (data_str: string) => {
        const data: TypeSendData = JSON.parse(data_str);
        console.log(data)
        console.log(data.action)
        if (data.action === WS_CONTROL_COMMAND.exit_practice) {
            this.endSession()
        } else if (data.action === WS_CONTROL_COMMAND.enter_practice) {
            this.startSession()
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