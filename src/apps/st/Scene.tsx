import React from 'react';
import {Canvas, useLoader} from '@react-three/fiber';
import {Box, PerspectiveCamera, OrbitControls} from '@react-three/drei';
import {useTexture} from '@react-three/drei';
import {TextureLoader} from 'three';


function Room() {
    // 使用TextureLoader加载贴图
    const texture = useLoader(TextureLoader, 'http://127.0.0.1:9000/texture.png'); // 替换为你的贴图路径

    return (
        <mesh>
            {/* 地板 */}
            <Box args={[10, 0.1, 10]} position={[0, -0.5, 0]}>
                <meshStandardMaterial attach="material" map={texture}/>
            </Box>
            {/* 示例墙壁 */}
            <Box args={[10, 3, 0.1]} position={[0, 1, -5]}>
                <meshStandardMaterial attach="material" map={texture}/>
            </Box>
            {/* 根据需要添加更多墙壁 */}
        </mesh>
    );
}

export default function Scene() {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, 2, 15]}/>
            <OrbitControls/>
            <ambientLight intensity={0.5}/>
            <pointLight position={[10, 10, 10]}/>
            <Room/>
        </Canvas>
    );
}