import * as THREE from 'three';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {TEXTURE_BASE, webGlConfig} from './scene.lib';
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";
import classes from "../css/exp.module.scss";
import PageMask from "../Page/PageMask";
// @ts-ignore
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {DEBUG, getTimestamp} from "../../const";

interface MouseEvent {
    d: number,
    dt: number
}

export interface TypeSceneShapeResult {
    radius: number
    control_times: number
    control_event: MouseEvent[]
    page_start_date: number
    page_start: number
    page_end_date: number
    location: THREE.Vector2
}

export default function SceneShapeRadius(props: {
    done: (result: TypeSceneShapeResult) => void,
}) {
    const page_start = getTimestamp()
    const page_start_date = new Date().getTime()
    const [radius, setRadius] = useState(6);
    const [controlTimes, setControlTimes] = useState(0);
    const controlEvents = useRef<MouseEvent[]>([]);

    const divRef = useRef<HTMLDivElement>(null);
    const rotationYRef = useRef(0);
    const rotationXRef = useRef(0);

    const [done, setDone] = useState(false);

    const renderer = useMemo(() => {
        return new THREE.WebGLRenderer(webGlConfig);
    }, [])

    useEffect(() => {
        renderer.domElement.addEventListener('wheel', (event: WheelEvent) => {
            setRadius(r => {
                const target = r - event.deltaY / 400;
                return target > 0 ? target : r;
            })
            setControlTimes(t => t + 1);
            controlEvents.current.push({
                d: event.deltaY,
                dt: getTimestamp()
            })
        });
    }, [renderer]);

    const group = useMemo(() => {
        return new THREE.Group();
    }, [])

    const camera = useMemo(() => {
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight)
        camera.position.set(0, 0, 30);
        camera.add(new THREE.PointLight(0xffffff, 3, 0, 0));
        return camera
    }, [])

    const pointsMaterial = useMemo(() => {
        const texture = new THREE.TextureLoader().load(`${TEXTURE_BASE}/src/disc.png`);
        texture.colorSpace = THREE.SRGBColorSpace;
        return new THREE.PointsMaterial({
            color: 0x0080ff,
            map: texture,
            size: 0.6,
            alphaTest: 0.7
        });
    }, [])

    const scene = useMemo(() => {
        const scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0x666666));
        scene.add(camera);
        scene.add(group);
        return scene
    }, [camera, group])

    useEffect(() => {
        divRef.current?.append(renderer.domElement)

        function animate() {
            requestAnimationFrame(animate);
            if (rotationYRef.current) {
                group.rotation.y = rotationYRef.current;
                rotationYRef.current = 0;
            }
            if (rotationXRef.current) {
                group.rotation.x = rotationXRef.current;
                rotationXRef.current = 0;
            }
            group.rotation.y += 0.005;
            group.rotation.x += 0.003;
            renderer.render(scene, camera);
        }

        animate();

        return () => {
            renderer.forceContextLoss();
            renderer.domElement.remove();
        }
    }, [camera, group, scene, renderer]);

    const point_location = useMemo(() => {
        const x_rand = (Math.random() - 0.5) * 20; // +-10
        const y_rand = (Math.random() - 0.5) * 6; // +-10
        return new THREE.Vector2(x_rand, y_rand);
    }, [])

    useEffect(() => {
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        let dodecahedronGeometry = new THREE.DodecahedronGeometry(radius, 0);

        // if normal and uv attributes are not removed, mergeVertices() can't consolidate indentical vertices with different normal/uv data
        dodecahedronGeometry.deleteAttribute('normal');
        dodecahedronGeometry.deleteAttribute('uv');

        dodecahedronGeometry = BufferGeometryUtils.mergeVertices(dodecahedronGeometry);

        const vertices = [];
        const positionAttribute = dodecahedronGeometry.getAttribute('position');

        for (let i = 0; i < positionAttribute.count; i++) {
            const vertex = new THREE.Vector3();
            vertex.fromBufferAttribute(positionAttribute, i);
            vertices.push(vertex);
        }

        const pointsGeometry = new THREE.BufferGeometry().setFromPoints(vertices);

        const points = new THREE.Points(pointsGeometry, pointsMaterial);

        // convex hull
        const meshMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            opacity: 0.5,
            side: THREE.DoubleSide,
            transparent: true
        });

        const meshGeometry = new ConvexGeometry(vertices);
        const mesh = new THREE.Mesh(meshGeometry, meshMaterial);

        group.add(points);
        group.add(mesh);

        group.position.set(point_location.x, point_location.y, 0);

        window.addEventListener('resize', onWindowResize);

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        if (DEBUG) {
            setTimeout(() => {
                document.querySelector('span')?.click();
            }, 100)
        }

        return () => {
            group.remove(mesh)
            group.remove(points)
            rotationYRef.current = group.rotation.y;
            rotationXRef.current = group.rotation.x;
            window.removeEventListener('resize', onWindowResize);
        }
    }, [radius, camera, group, scene, renderer, pointsMaterial, point_location.x, point_location.y])

    return (
        <>
            {done ? <PageMask/> : <div ref={divRef}/>}
            {!done && <span
                className={[classes.shapeButton, classes.fakeButton].join(' ')}
                onClick={() => {
                    setDone(true)
                    props.done({
                        radius,
                        page_start,
                        page_start_date,
                        page_end_date: new Date().getTime(),
                        control_times: controlTimes,
                        location: point_location,
                        control_event: controlEvents.current
                    })
                }}
            >完&nbsp;成</span>}
        </>
    );
}