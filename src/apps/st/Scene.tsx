import React, {Ref, useRef} from 'react';
import {Canvas, extend, useFrame, useThree} from '@react-three/fiber';
import type {OrbitControls as OrbitControlsImpl} from 'three-stdlib'
import {OrbitControls, Box, PerspectiveCamera} from '@react-three/drei';
import {useTexture} from '@react-three/drei';
import {TextureLoader} from 'three';
import * as THREE from 'three';


function Room() {

    const texture = useTexture('http://127.0.0.1:9000/texture.png'); // 替换为你的贴图路径
    // const texture = useLoader(TextureLoader, 'http://127.0.0.1:9000/texture.png'); // 替换为你的贴图路径

    return (
        <mesh>
            {/* 地板 */}
            <Box args={[10, 0.1, 10]} position={[0, -0.5, 0]}>
                <meshStandardMaterial attach="material" map={texture}/>
            </Box>
            {/* 天花板 */}
            <Box args={[10, 0.1, 10]} position={[0, 2.5, 0]}>
                <meshStandardMaterial attach="material" map={texture}/>
            </Box>
            {/* 前墙 */}
            <Box args={[10, 3, 0.1]} position={[0, 1, -5]}>
                <meshStandardMaterial attach="material" map={texture}/>
            </Box>
            {/* 后墙 */}
            <Box args={[10, 3, 0.1]} position={[0, 1, 5]}>
                <meshStandardMaterial attach="material" map={texture}/>
            </Box>
            {/* 左墙 */}
            <Box args={[0.1, 3, 10]} position={[-5, 1, 0]}>
                <meshStandardMaterial attach="material" map={texture}/>
            </Box>
            {/* 右墙 */}
            <Box args={[0.1, 3, 10]} position={[5, 1, 0]}>
                <meshStandardMaterial attach="material" map={texture}/>
            </Box>
        </mesh>
    );
}


function CameraController() {
    const {camera, gl} = useThree();
    const orbitRef = useRef<OrbitControlsImpl>(null);

    useFrame(() => {
        const controls = orbitRef.current;
        // 这里可以添加逻辑来调整摄像机位置，确保它不会离开房间的边界
        // 示例：简单地保持摄像机的Y轴位置，防止上下移动超出预设范围
        camera.position.clamp(new THREE.Vector3(-5, 0.5, -5), new THREE.Vector3(5, 2.5, 5));
    });

    return <OrbitControls ref={orbitRef} args={[camera, gl.domElement]} maxPolarAngle={Math.PI / 2} minPolarAngle={0}/>;
}


export default function Scene() {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, 2, 15]}/>
            {/*<OrbitControls/>*/}
            <CameraController/>
            <ambientLight intensity={2}/>
            <pointLight position={[10, 10, 10]}/>
            <Room/>
        </Canvas>
    );
}