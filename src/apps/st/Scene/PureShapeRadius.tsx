import * as THREE from 'three';
import {TEXTURE_BASE, webGlConfig} from './scene.lib';
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";

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

    rotationYRef = 0;
    rotationXRef = 0;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    group: THREE.Group;
    pointsMaterial: THREE.PointsMaterial;
    scene: THREE.Scene;
    radius: number;
    controlTimes: number;
    controlEvents: MouseEvent[];
    private props: SceneShapeRadiusProps;
    private session: XRSession;

    protected distance = 18;

    constructor(props: SceneShapeRadiusProps) {

        this.props = props;

        this.renderer = this.props.renderer;
        this.camera = this.props.camera;
        this.scene = this.props.scene;

        this.group = new THREE.Group();
        this.camera.position.set(0, 0, 30);
        this.camera.add(new THREE.PointLight(0xffffff, 3, 0, 0));
        const texture = new THREE.TextureLoader().load(`${TEXTURE_BASE}/src/disc.png`);
        texture.colorSpace = THREE.SRGBColorSpace;
        this.pointsMaterial = new THREE.PointsMaterial({
            color: 0x0080ff,
            map: texture,
            size: 0.2,
            alphaTest: 0.7
        });
        this.scene.add(new THREE.AmbientLight(0x666666));
        this.scene.add(this.camera);
        this.scene.add(this.group);

        this.group.position.set(0, 0, -this.distance);

        this.session = this.renderer.xr.getSession()!;

        this.session.requestAnimationFrame(this.onXRFrame);

        this.radius = 6
        this.controlTimes = 0
        this.controlEvents = []

        this.setupAspect();
        this.animate();
        this.setupScene();
    }

    onXRFrame = (time: number, frame: { session: any; }) => {
        let session = frame.session;
        session.requestAnimationFrame(this.onXRFrame);

        const inputSource = session.inputSources[0]

        const axes = inputSource.gamepad.axes;
        const y = axes[3];
        if (y) {
            this.handleWheelEvent(y, Math.round(time * 100) / 100)
        }

    }

    componentWillUnmount() {
        this.scene.clear();
        this.renderer.forceContextLoss();
        this.renderer.domElement.remove();
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

    setupAspect = () => {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    animate = () => {
        this.renderer.setAnimationLoop(this.animate);

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
        let dodecahedronGeometry = new THREE.DodecahedronGeometry(this.radius, 0);

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
