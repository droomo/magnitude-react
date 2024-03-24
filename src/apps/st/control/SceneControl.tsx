import React from 'react';
import {createWalls, webGlConfig, makeLight,} from '../Scene/scene.lib';
import {pointsMaterial, WS_CONTROL_COMMAND} from "../../const";
import WSRC from "../WSRC";

import classes from "../css/exp.module.scss";
import * as THREE from 'three';
import {TypeSubject} from "../Login";
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";
import {MAX_DISTANCE} from "../Scene/PureShapeRadius";

export interface TypeTrial {
    done: boolean
    id: number
    duration: number
    width: number
    depth: number
    height: number
    updated_at_room: string | null
    updated_at_reaction: string | null
}


export interface TypeRoom {
    width: number;
    height: number;
    depth: number;
}

export default class SceneControl extends WSRC<{
    setSwitchRoom: (switchRoom: (room: TypeRoom) => void) => void,
    setSwitchShape: (switchShape: (radius: number, newShape: boolean) => void) => void
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
        this.props.setSwitchShape((radius, newShape) => {
            this.switchShapeScene(radius, newShape)
        })

        this.camera = new THREE.PerspectiveCamera(75, 1, 1, 1000);

        this.group = new THREE.Group();
    }

    switchRoomScene(room: TypeRoom) {
        this.scene.clear();

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

    switchShapeScene = (radius: number, newShape: boolean) => {

        this.scene.clear();
        if (newShape) {
            this.group = new THREE.Group()
        } else {
            this.group.clear();
        }

        this.scene.add(new THREE.PointLight(0xffffff, 5, 0, 0));

        this.camera.position.set(0, 0, 0);
        this.camera.lookAt(0, 0, -10)

        this.group.position.set(0, 0, -MAX_DISTANCE);

        let dodecahedronGeometry = new THREE.DodecahedronGeometry(radius, 0);
        const vertices = [];
        const positionAttribute = dodecahedronGeometry.getAttribute('position');
        for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positionAttribute, i);
            vertices.push(vertex);
        }

        const pointsGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
        const points = new THREE.Points(pointsGeometry, pointsMaterial);

        // Convex hull
        const meshMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            opacity: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });
        const meshGeometry = new ConvexGeometry(vertices);
        const mesh = new THREE.Mesh(meshGeometry, meshMaterial);

        this.group.add(mesh, points);
        this.scene.add(this.group);
    }

    componentDidMount() {
        this.camera = new THREE.PerspectiveCamera(100, this.divRef.current!.clientWidth / window.innerHeight * 0.5, 1, 1000);

        super.componentDidMount()

        this.renderer.xr.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderer.setSize(this.divRef.current!.clientWidth, window.innerHeight * 0.5);

        this.camera.aspect = this.divRef.current!.clientWidth / (window.innerHeight * 0.5);
        this.camera.updateProjectionMatrix();

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;

        if (this.divRef.current) {
            this.divRef.current.appendChild(this.renderer.domElement);
        }

        requestAnimationFrame(this.animate);
    }

    animate = () => {
        this.group.rotation.y += 0.005;
        this.group.rotation.x += 0.003;

        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    };


    onMessage = (data_str: string) => {
        const data = JSON.parse(data_str);
        console.log('action', data.action)
        switch (data.action) {
            case WS_CONTROL_COMMAND.switch_room:
                this.switchRoomScene(data.room);
                break;
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    render() {
        return <div className={classes.viewer}>
            <div ref={this.divRef}/>
        </div>
    }
}