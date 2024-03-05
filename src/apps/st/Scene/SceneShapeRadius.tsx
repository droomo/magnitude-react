import React, {useEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';
import {TEXTURE_BASE, webGlConfig} from './scene.lib';

// @ts-ignore
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {ConvexGeometry} from "three/examples/jsm/geometries/ConvexGeometry";
import classes from "../css/timeCounter.module.scss";

export interface TypeSceneShapeResult {
    radius: number
    control_times: number
}

export default function SceneShapeRadius(props: {
    done: (result: TypeSceneShapeResult) => void
}) {

    const [radius, setRadius] = useState(5);
    const [controlTimes, setControlTimes] = useState(0);

    const divRef = useRef<HTMLDivElement>(null);
    const rotationYRef = useRef(0);
    const rotationXRef = useRef(0);

    const renderer = useMemo(() => {
        const renderer = new THREE.WebGLRenderer(webGlConfig);
        renderer.domElement.addEventListener('wheel', (event) => {
            setRadius(r => {
                const target = r - event.deltaY / 400;
                return target > 0 ? target : r;
            })
            setControlTimes(t => t + 1)
        });
        return renderer
    }, [])

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
            renderer.domElement.remove();
        }
    }, [camera, group, scene, renderer]);

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

        window.addEventListener('resize', onWindowResize);

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        return () => {
            group.remove(mesh)
            group.remove(points)
            rotationYRef.current = group.rotation.y;
            rotationXRef.current = group.rotation.x;
            window.removeEventListener('resize', onWindowResize);
        }
    }, [radius, camera, group, scene, renderer, pointsMaterial])

    return (
        <>
            <div ref={divRef}/>
            <button
                className={classes.shapeButton}
                onClick={() => {
                    props.done({
                        radius,
                        control_times: controlTimes
                    })
                }}
            >完成
            </button>
        </>
    );
}