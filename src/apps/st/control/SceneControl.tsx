import React from 'react';
import {createWalls, webGlConfig, makeLight, create3DText,} from '../Scene/scene.lib';

import classes from "../css/exp.module.scss";
import * as THREE from 'three';
import {TypeSubject} from "../Login";

export const VIEWER_RATE = 0.65;

export interface TypeRoom {
    width: number;
    height: number;
    depth: number;
}

export default class SceneControl extends React.Component<{
    setClearFunc: (clearFunc: () => void) => void,
    setUpdateTextFunc: (setText: (text: string) => void) => void,
    setSwitchRoom: (switchRoom: (room: TypeRoom) => void) => void,
}, {
    subject: TypeSubject | null
}> {
    private divRef: React.RefObject<HTMLDivElement>;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private group: THREE.Group;

    constructor(props: any) {
        super(props);
        this.divRef = React.createRef<HTMLDivElement>();

        this.renderer = new THREE.WebGLRenderer(webGlConfig);

        this.scene = new THREE.Scene();

        this.state = {
            subject: null
        }

        this.props.setSwitchRoom((room) => {
            this.switchRoomScene(room)
        })
        this.props.setUpdateTextFunc((text) => {
            this.set3DText(text)
        })
        this.props.setClearFunc(() => {
            this.clear();
        })

        this.camera = new THREE.PerspectiveCamera(75, 1, 1, 1000);

        this.group = new THREE.Group();
    }

    set3DText = (text: string) => {
        this.clear();
        this.camera.position.set(0, 1.5, -2)
        this.camera.lookAt(0, 1.5, -10)
        this.scene.add(create3DText(text));
        console.log(text)
    }

    switchRoomScene(room: TypeRoom) {
        this.clear();

        for (const light of makeLight(room)) {
            this.scene.add(light);
        }

        createWalls(room,
            walls => {
                for (const wall of walls) {
                    this.scene.add(wall);
                }

                this.camera.position.set(0, room.height / 2, -room.depth / 2 + 0.15)
                this.camera.lookAt(0, room.height / 2, 0)
            }
        );
    }


    componentDidMount() {
        this.camera = new THREE.PerspectiveCamera(100, this.divRef.current!.clientWidth / window.innerHeight * VIEWER_RATE, 1, 1000);

        this.renderer.xr.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.setSize(this.divRef.current!.clientWidth, window.innerHeight * VIEWER_RATE);

        this.camera.aspect = this.divRef.current!.clientWidth / (window.innerHeight * VIEWER_RATE);
        this.camera.updateProjectionMatrix();

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;

        if (this.divRef.current) {
            this.divRef.current.appendChild(this.renderer.domElement);
        }

        requestAnimationFrame(this.animate);
    }

    animate = () => {
        this.group.rotation.y += 0.003;
        this.group.rotation.x += 0.0015;

        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    };

    clear = () => {
        this.group.clear();
        this.scene.clear();
        this.camera.clear();
    }


    render() {
        return <div
            className={classes.viewer}
            style={{
                height: window.innerHeight * VIEWER_RATE,
            }}
        >
            <div ref={this.divRef}/>
        </div>
    }
}