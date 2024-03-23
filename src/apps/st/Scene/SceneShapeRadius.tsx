import * as THREE from 'three';
import React from 'react';
import {TEXTURE_BASE, webGlConfig} from './scene.lib';
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";
import classes from "../css/exp.module.scss";
import PageMask from "../Page/PageMask";

import {DEBUG} from "../../const";

interface MouseEvent {
    d: number;
    dt: number;
}

export interface TypeSceneShapeResult {
    radius: number;
    control_times: number;
    control_event: MouseEvent[];
    page_start_date: number;
    page_end_date: number;
    location: THREE.Vector2;
}

interface SceneShapeRadiusProps {
    done: (result: TypeSceneShapeResult) => void;
}

interface SceneShapeRadiusState {
    radius: number;
    controlTimes: number;
    controlEvents: MouseEvent[];
    done: boolean;
}

class SceneShapeRadius extends React.Component<SceneShapeRadiusProps, SceneShapeRadiusState> {
    page_start_date = new Date().getTime();
    divRef: React.RefObject<HTMLDivElement> = React.createRef();
    rotationYRef = 0;
    rotationXRef = 0;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
    pointsMaterial: THREE.PointsMaterial;
    scene: THREE.Scene;
    point_location: THREE.Vector2;
    state = {
        radius: 6,
        controlTimes: 0,
        controlEvents: [] as MouseEvent[],
        done: false
    };

    constructor(props: SceneShapeRadiusProps) {
        super(props);

        this.renderer = new THREE.WebGLRenderer(webGlConfig);
        this.group = new THREE.Group();
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);
        this.camera.position.set(0, 0, 30);
        this.camera.add(new THREE.PointLight(0xffffff, 3, 0, 0));
        const texture = new THREE.TextureLoader().load(`${TEXTURE_BASE}/src/disc.png`);
        texture.colorSpace = THREE.SRGBColorSpace;
        this.pointsMaterial = new THREE.PointsMaterial({
            color: 0x0080ff,
            map: texture,
            size: 0.6,
            alphaTest: 0.7
        });
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight(0x666666));
        this.scene.add(this.camera);
        this.scene.add(this.group);
        const x_rand = (Math.random() - 0.5) * 20; // +-10
        const y_rand = (Math.random() - 0.5) * 6; // +-10
        this.point_location = new THREE.Vector2(x_rand, y_rand);

        this.group.position.set(this.point_location.x, this.point_location.y, 0);
    }

    componentDidMount() {
        this.divRef.current?.append(this.renderer.domElement);
        this.renderer.domElement.addEventListener('wheel', this.handleWheelEvent);

        this.setupAspect();
        this.animate();
        this.setupScene();
    }

    componentWillUnmount() {
        this.scene.clear();
        this.renderer.forceContextLoss();
        this.renderer.domElement.remove();
        this.renderer.domElement.removeEventListener('wheel', this.handleWheelEvent);
    }

    handleWheelEvent = (event: WheelEvent) => {
        this.setState(prevState => {
            const newRadius = prevState.radius - event.deltaY / 400;
            return {
                radius: newRadius > 0 ? newRadius : prevState.radius,
                controlTimes: prevState.controlTimes + 1,
                controlEvents: [...prevState.controlEvents, {d: event.deltaY, dt: event.timeStamp}]
            };
        }, () => {
            this.setupScene()
        });
    };

    setupAspect = () => {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    animate = () => {
        requestAnimationFrame(this.animate);
        if (this.rotationYRef) {
            this.group.rotation.y = this.rotationYRef;
            this.rotationYRef = 0;
        }
        if (this.rotationXRef) {
            this.group.rotation.x = this.rotationXRef;
            this.rotationXRef = 0;
        }
        this.group.rotation.y += 0.005;
        this.group.rotation.x += 0.003;
        this.renderer.render(this.scene, this.camera);
    };

    setupScene = () => {
        this.group.clear();
        let dodecahedronGeometry = new THREE.DodecahedronGeometry(this.state.radius, 0);

        const vertices = [];
        const positionAttribute = dodecahedronGeometry.getAttribute('position');
        for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positionAttribute, i);
            vertices.push(vertex);
        }

        const pointsGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
        const points = new THREE.Points(pointsGeometry, this.pointsMaterial);

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

        if (DEBUG) {
            setTimeout(() => {
                document.querySelector('span')?.click();
            }, 100);
        }
    };

    handleCompleteClick = () => {
        this.setState({done: true});
        this.props.done({
            radius: this.state.radius,
            page_start_date: this.page_start_date,
            page_end_date: new Date().getTime(),
            control_times: this.state.controlTimes,
            location: this.point_location,
            control_event: this.state.controlEvents
        });
    };

    render() {
        return (
            <>
                {this.state.done ? <PageMask/> : <div ref={this.divRef}/>}
                {!this.state.done && (
                    <span
                        className={[classes.shapeButton, classes.fakeButton].join(' ')}
                        onClick={this.handleCompleteClick}
                    >
                    完&nbsp;成
                </span>
                )}
            </>
        );
    }
}

export default SceneShapeRadius;
