import React from 'react';
import * as THREE from 'three';
import Stats from 'stats.js';
import {
    webGlConfig,
    eyeHeight,
    makeSceneWalk
} from './scene.lib';
import {getTimestamp} from "../../const";

const moveCamera = function (camera: THREE.Camera, moveSpeed: number) {
    const newPosition = new THREE.Vector3(0, 0, -0.3).clone().multiplyScalar(moveSpeed).add(camera.position);
    camera.position.copy(newPosition);
}

const moveCameraDelta = function (camera: THREE.Camera, moveSpeed: number, deltaTime: number) {
    const distance = moveSpeed * deltaTime; // deltaTime应该以秒为单位

    // 使用摄像机的前向方向和移动距离来更新位置
    const direction = new THREE.Vector3(0, 0, -1); // 默认前向方向
    direction.applyQuaternion(camera.quaternion); // 应用摄像机的旋转
    direction.multiplyScalar(distance); // 根据时间差调整移动距离

    camera.position.add(direction);
}

export interface TypeExploringRecord {
    start_date: number,
    end_date: number,
    key_pressed: string,
}

export interface TypeWalkResult {
    page_start_date: number,
    page_start: number,
    walk_start: number,
    walk_end: number,
    walk_end_fws: number,
    walk_event_times: number
}

export interface TypeSceneWalk {
    done: (result: TypeWalkResult) => void,
    speed: number
}

export class SceneWalk extends React.Component<TypeSceneWalk, any> {
    private divRef: React.RefObject<HTMLDivElement>;
    private stats: Stats;
    private movingDirection: number;
    private result: TypeWalkResult;

    constructor(props: any) {
        super(props);
        this.divRef = React.createRef<HTMLDivElement>();
        this.stats = new Stats();
        this.result = {
            page_start: 0,
            page_start_date: 0,
            walk_end: 0,
            walk_start: 0,
            walk_event_times: 0,
            walk_end_fws: 0
        };
        this.movingDirection = 0;
        this.state = {}
    }

    componentDidMount() {
        this.result.page_start_date = new Date().getTime();
        this.result.page_start = performance.now();

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

        const moveSpeed = this.props.speed / 1000;

        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'ArrowUp':
                    this.result.walk_event_times += 1
                    this.movingDirection = 1;
                    if (this.result.walk_start === 0) {
                        this.result.walk_start = getTimestamp();
                    }
                    break;
                default:
                    break;
            }
        };
        const onKeyUp = () => {
            if (this.movingDirection > 0) {

                this.movingDirection = 0;
                const now = getTimestamp();
                this.props.done({
                    ...this.result,
                    walk_end: now,
                    walk_end_fws: now - this.result.walk_start
                })
                window.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('keyup', onKeyUp);
                renderer.forceContextLoss();
                console.log('Requested force context loss');
                renderer.domElement.remove();
                this.stats.dom.remove()
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        const renderer = new THREE.WebGLRenderer(webGlConfig);

        const scene = makeSceneWalk();

        camera.position.set(0, eyeHeight, 0);
        camera.lookAt(0, eyeHeight, 0);

        renderer.render(scene, camera);

        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.LinearToneMapping;
        renderer.toneMappingExposure = 0.5;

        function render() {
            renderer.render(scene, camera);
        }

        let lastTime = 0;

        const animate = () => {
            requestAnimationFrame(animate);
            const now = performance.now();
            if (this.movingDirection > 0) {
                const deltaTime = (now - lastTime) / 1000;
                moveCameraDelta(camera, moveSpeed, deltaTime);
            }
            lastTime = now;
            this.stats.begin();
            this.stats.end();
            render();
        }

        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        this.divRef.current?.appendChild(renderer.domElement);
        this.divRef.current?.appendChild(this.stats.dom);

        animate();

    }

    render() {
        return (
            <div style={{cursor: 'none'}} ref={this.divRef}/>
        )
    }

}
