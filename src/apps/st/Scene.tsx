import React, {Ref, useEffect, useMemo, useRef} from 'react';
import {Canvas, extend, useFrame, useLoader, useThree} from '@react-three/fiber';
import type {OrbitControls as OrbitControlsImpl} from 'three-stdlib'
import {OrbitControls, Box, PerspectiveCamera} from '@react-three/drei';
import {useTexture} from '@react-three/drei';
import {
    BufferGeometry,
    Float32BufferAttribute,
    MeshStandardMaterial,
    RepeatWrapping,
    TextureLoader,
    Vector2,
    Mesh,
    Group
} from 'three';
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader'

const BASE_URL = 'http://127.0.0.1:9000'

// 墙壁的厚度
const wallThickness = 0.12;
// 墙壁的高度
const wallHeight = 3;

// 门宽度
const doorWidth = 1;
const doorHeight = 2 * doorWidth;

function Ground() {
    const [map, metalnessMap, normalMap] = useLoader(TextureLoader, [
        `${BASE_URL}/T_Brick_Clay_Beveled_D.PNG`,
        `${BASE_URL}/T_Brick_Clay_Beveled_M.PNG`,
        `${BASE_URL}/T_Brick_Clay_Beveled_N.PNG`,
    ]);

    const repeat = new Vector2(10, 10); // 根据您的需要调整这个值
    [map, metalnessMap, normalMap].forEach(texture => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(repeat.x, repeat.y);
    });

    const mixedTexture = {
        map,
        metalnessMap,
        normalMap,
        metalness: 0.4,
        roughness: 0.5,
        normalScale: new Vector2(2, 2),
    };

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow receiveShadow>
            <planeGeometry attach="geometry" args={[50, 50]}/>
            <meshStandardMaterial attach="material" {...mixedTexture}/>
        </mesh>
    );
}

export default function Scene() {
    return (
        <Canvas>
            <PerspectiveCamera makeDefault position={[0, 2, -10]}/>
            {/*<OrbitControls/>*/}
            <CameraController/>
            <ambientLight/>
            {/*<pointLight position={[0, 3, -6]} intensity={1}/>*/}
            <pointLight position={[10, 10, 10]}/>
            <Ground/>
            <Room/>
        </Canvas>
    );
}

function Door() {
    const doorRefBox = useRef<Mesh>(null);
    const doorGroupRef = useRef<Group>(null);

    const [map, metalnessMap, normalMap] = useTexture([
        `${BASE_URL}/door/door.png`,
        `${BASE_URL}/door/doorM.png`,
        `${BASE_URL}/door/doorN.png`,
    ]);

    useMemo(() => {
        [map, metalnessMap, normalMap].forEach(texture => {
            texture.wrapS = texture.wrapT = RepeatWrapping;
        });
    }, [map, metalnessMap, normalMap]);

    const doorMaterial = {
        map,
        metalnessMap,
        normalMap,
        metalness: 0.4,
        roughness: 0.5,
    };

    // 初始状态
    let open = false; // 控制门是否开启
    let targetRotationY = 0; // 目标Y轴旋转角度（弧度）

    useFrame((state, delta) => {
        if (doorGroupRef.current) {
            if (open && doorGroupRef.current.rotation.y > targetRotationY) {
                // 开门动画
                doorGroupRef.current.rotation.y -= delta * 3.2;
                if (doorGroupRef.current.rotation.y < targetRotationY) {
                    doorGroupRef.current.rotation.y = targetRotationY;
                }
            }
        }
    });

    useEffect(() => {
        if (doorRefBox.current) {
            doorRefBox.current.geometry.translate(-doorWidth * 0.5, 0, 0);
        }
    }, [])

    const toggleOpen = () => {
        open = !open;
        targetRotationY = open ? -Math.PI / 1.3 : 0; // 旋转90度开门
    };

    return <group ref={doorGroupRef} position={[doorWidth * 0.5, doorHeight * 0.5, -5]} onClick={toggleOpen}>
        <mesh>
            <Box args={[doorWidth, doorHeight, 0.1]} ref={doorRefBox}>
                <meshStandardMaterial attach="material" {...doorMaterial}/>
            </Box>
        </mesh>
    </group>
}


function Room() {
    const [map, metalnessMap, normalMap] = useTexture([
        `${BASE_URL}/T_CobbleStone_Smooth_D.PNG`,
        `${BASE_URL}/T_CobbleStone_Smooth_M.PNG`,
        `${BASE_URL}/T_CobbleStone_Smooth_N.PNG`,
    ])

    const repeat = new Vector2(4, 6);

    [map, metalnessMap, normalMap].forEach(texture => {
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(repeat.x, repeat.y);
    })

    const mixedTexture = {
        map,
        metalnessMap,
        normalMap,
        metalness: 0.4,
        roughness: 0.5,
        normalScale: new Vector2(2, 2),
    };

    return (
        <mesh>
            {/* 门模型 */}
            <Door/>

            {/* 地板 */}
            <Box args={[10 - wallThickness, wallThickness, 10 - wallThickness]}
                 position={[0, wallThickness / 2, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 天花板 */}
            <Box args={[10 - wallThickness, wallThickness, 10 - wallThickness]}
                 position={[0, wallHeight - wallThickness / 2, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>

            {/* 后墙 */}
            <Box args={[10, wallHeight, wallThickness]} position={[0, wallHeight / 2, 5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 左墙 */}
            <Box args={[wallThickness, wallHeight, 10]} position={[-5, wallHeight / 2, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 右墙 */}
            <Box args={[wallThickness, wallHeight, 10]} position={[5, wallHeight / 2, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>

            {/* 门左侧的墙壁部分 */}
            <Box args={[4.5, wallHeight, wallThickness]} position={[-2.75, wallHeight / 2, -5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 门右侧的墙壁部分 */}
            <Box args={[4.5, wallHeight, wallThickness]} position={[2.75, wallHeight / 2, -5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 门上方的墙壁部分 */}
            <Box args={[doorWidth, wallHeight - doorHeight, wallThickness]}
                 position={[0, (wallHeight + doorHeight) * 0.5, -5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
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
        // camera.position.clamp(new THREE.Vector3(-5, 2, -5), new THREE.Vector3(5, 4, 5));
    });

    // camera.position.set(0, 5, 10);

    return <OrbitControls
        ref={orbitRef} args={[camera, gl.domElement]} maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
    />
}


