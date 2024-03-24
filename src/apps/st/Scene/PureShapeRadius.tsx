import * as THREE from 'three';
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";

import {DEBUG, pointsMaterial} from "../../const";


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
    location: THREE.Vector3;
}

interface SceneShapeRadiusProps {
    done: (result: TypeSceneShapeResult) => void;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    scene: THREE.Scene;
}


class PureShapeRadius {
    page_start_date = new Date().getTime();

    group: THREE.Group;
    radius: number;
    controlTimes: number;
    controlEvents: MouseEvent[];
    private props: SceneShapeRadiusProps;
    private session: XRSession;

    protected distance = 18;

    constructor(props: SceneShapeRadiusProps) {

        this.props = props;

        this.group = new THREE.Group();
        this.group.position.set(0, 0, -this.distance);

        this.props.scene.add(this.group);

        this.session = this.props.renderer.xr.getSession()!;

        this.session.requestAnimationFrame(this.onXRFrame);

        this.session.addEventListener('select', this.handleCompleteClick);

        this.radius = 6
        this.controlTimes = 0
        this.controlEvents = []

        this.setupScene();
    }

    clear = () => {
        this.group.children = [];
        this.session.removeEventListener('select', this.handleCompleteClick);
    }

    onXRFrame = (time: number, frame: { session: any; }) => {
        if (this.group.children.length === 0) {
            return
        }

        frame.session.requestAnimationFrame(this.onXRFrame);

        let y: number = 0;

        for (let inputSource of frame.session.inputSources) {
            if (inputSource.gamepad.axes) {
                y += inputSource.gamepad.axes[3];
            }
        }

        if (y) {
            this.handleWheelEvent(y, Math.round(time * 100) / 100)
        }
    }

    handleWheelEvent = (y: number, time: number) => {
        const newRadius = this.radius - y / 10;

        if (newRadius < 0.1 || newRadius > this.distance) {
            return
        }

        this.radius = newRadius;

        this.controlTimes = this.controlTimes + 1
        this.controlEvents = [...this.controlEvents, {d: y, dt: time}]

        this.setupScene()
    };

    animate = () => {
        this.group.rotation.y += 0.005;
        this.group.rotation.x += 0.003;
    };

    setupScene = () => {
        let dodecahedronGeometry = new THREE.DodecahedronGeometry(this.radius, 0);
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

        if (DEBUG) {
            setTimeout(() => {
                document.querySelector('span')?.click();
            }, 100);
        }
    };

    handleCompleteClick = () => {
        this.props.done({
            radius: this.radius,
            page_start_date: this.page_start_date,
            page_end_date: new Date().getTime(),
            control_times: this.controlTimes,
            location: this.group.position,
            control_event: this.controlEvents
        });
    };
}

export default PureShapeRadius;
