import React, {useEffect, useMemo, useRef} from 'react';
import {Canvas, PrimitiveProps, useFrame, useLoader, useThree} from '@react-three/fiber';
import type {OrbitControls as OrbitControlsImpl} from 'three-stdlib'
import {OrbitControls, Box, PerspectiveCamera, Sky} from '@react-three/drei';
import {useTexture} from '@react-three/drei';
import {
    RepeatWrapping,
    TextureLoader,
    Vector2,
    Mesh,
    Group,
    DirectionalLightHelper,
    type DirectionalLight,
} from 'three';
import * as THREE from 'three';
import {API} from "../const";
import StatsComponent from "./StatsComponent";

const TEXT_BASE = API.texture_base_url

// 墙壁
const wallThickness = 0.12;
const wallHeight = 10;
const wallWidth = 13;
const wallDepth = 12;

const frontWallHeight = wallHeight * 100;
const frontWallWidth = wallWidth * 100;

// 门
const doorWidth = 1;
const doorHeight = 2 * doorWidth;

// 贴图重复
const repeat = new Vector2(17, 14);

function Ground() {
    const textures = useLoader(TextureLoader, [
        `${TEXT_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_BaseColor.png`,
        `${TEXT_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_MetallicRoughness.png`,
        `${TEXT_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_Normal.png`,
        `${TEXT_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_Occlusion.png`,
    ]);

    const mixedTexture = useMemo(() => {
        textures.forEach(texture => {
            texture.wrapS = RepeatWrapping;
            texture.wrapT = RepeatWrapping;
            texture.repeat.set(repeat.x, repeat.y);
        });

        return {
            map: textures[0],
            metalnessMap: textures[1],
            normalMap: textures[2],
            aoMap: textures[3],
            metalness: 0.4,
            roughness: 0.5,
            normalScale: new Vector2(2, 2),
        };
    }, [textures]);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} castShadow receiveShadow>
            <planeGeometry attach="geometry" args={[1000, 1000]}/>
            <meshStandardMaterial attach="material" {...mixedTexture}/>
        </mesh>
    );
}


export default function Scene(props: any) {

    const light = useRef<DirectionalLight>(null!);

    console.log(light)

    // useHelper(light, DirectionalLightHelper, 1, "red");

    // useEffect(() => {
    //     if (light.current && light.current.target) {
    //         // 设置光源指向场景中心，这里以(0, 0, 0)为例
    //         light.current.target.position.set(0, 0, 0);
    //         // 更新光源的目标位置，这对于光源正确照射和阴影生成很重要
    //         light.current.target.updateMatrixWorld();
    //     }
    // }, []);


    return (
        <Canvas>
            <StatsComponent/>
            <PerspectiveCamera makeDefault position={[0, doorHeight * 0.6, 10]}/>
            {/*<OrbitControls/>*/}
            <CameraController/>
            <ambientLight intensity={1}/>

            {/*<directionalLight*/}
            {/*    ref={light}*/}
            {/*    position={[5, 5, 5]} // 光源位置*/}
            {/*    castShadow // 允许投射阴影*/}
            {/*    shadow-mapSize-width={512} // 阴影贴图宽度*/}
            {/*    shadow-mapSize-height={512} // 阴影贴图高度*/}
            {/*    shadow-camera-near={0.5} // 阴影摄像机近裁剪面*/}
            {/*    shadow-camera-far={500} // 阴影摄像机远裁剪面*/}
            {/*/>*/}
            {/* 设置光源的目标对象，确保光源朝向某个点 */}
            {/*<primitive*/}
            {/*    object={light.current?.target}*/}
            {/*/>*/}

            {/*<pointLight position={[0, 3, -6]} intensity={1}/>*/}
            {/*<pointLight position={[0, doorHeight, 0]} intensity={1}/>*/}
            <Ground/>
            <Room/>

            <Sky
                distance={450000}
                sunPosition={[5, 100, -20]}
                inclination={0}
                azimuth={100}
                {...props}
            />
        </Canvas>
    );
}

function Door() {
    const doorRefBox = useRef<Mesh>(null);
    const doorGroupRef = useRef<Group>(null);

    const [map, metalnessMap, normalMap] = useTexture([
        `${TEXT_BASE}/door/door.png`,
        `${TEXT_BASE}/door/doorM.png`,
        `${TEXT_BASE}/door/doorN.png`,
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
            } else if (!open && doorGroupRef.current.rotation.y < 0) {
                // 关门动画
                doorGroupRef.current.rotation.y += delta * 3.2;
                if (doorGroupRef.current.rotation.y > 0) {
                    doorGroupRef.current.rotation.y = 0;
                }
            }
        }
    });

    useEffect(() => {
        if (doorRefBox.current) {
            doorRefBox.current.geometry.translate(doorWidth * 0.5, 0, 0);
        }
    }, [])

    const toggleOpen = () => {
        open = !open;
        targetRotationY = open ? -Math.PI / 1.3 : 0; // 旋转90度开门
    };

    return <group ref={doorGroupRef} position={[-doorWidth * 0.5, doorHeight * 0.5, wallDepth / 2]}
                  onClick={toggleOpen}>
        <mesh>
            <Box args={[doorWidth, doorHeight, 0.1]} ref={doorRefBox}>
                <meshStandardMaterial attach="material" {...doorMaterial}/>
            </Box>
        </mesh>
    </group>
}


function Room() {
    const wallRoughness = 0.8;
    const wallMetalness = 0.1;
    const halfWallWidth = (wallWidth - doorWidth) * 0.5;

    const texturePaths = [
        `${TEXT_BASE}/wall/1/wall_BaseColor.png`,
        `${TEXT_BASE}/wall/1/wall_MetallicRoughness.png`,
        `${TEXT_BASE}/wall/1/wall_Normal.png`,
        `${TEXT_BASE}/wall/1/wall_Occlusion.png`,
    ];

    const textures = useTexture(texturePaths);

    const prepareTextures = (textures: any[], repeat: Vector2, offset = new Vector2(0, 0)) => {
        return textures.map(texture => {
            const clonedTexture = texture.clone();
            clonedTexture.wrapS = RepeatWrapping;
            clonedTexture.wrapT = RepeatWrapping;
            clonedTexture.repeat.set(repeat.x, repeat.y);
            clonedTexture.offset.set(offset.x, offset.y);
            return clonedTexture;
        });
    };

    const [mixedTexture, mixedTextureFrontHalfWallBottomLeft, mixedTextureFrontHalfWallBottomRight, mixedTextureFrontHalfWallTop] = useMemo(() => {
        const mainTextures = prepareTextures(textures, repeat);

        const halfRepeat = new Vector2(
            (wallWidth - doorWidth) / 2 / wallWidth * repeat.x,
            doorHeight / wallHeight * repeat.y
        );
        const halfWallBottomLeftTextures = prepareTextures(textures, halfRepeat, new Vector2(0, doorHeight / wallHeight));
        const halfWallBottomRightTextures = prepareTextures(textures, halfRepeat, new Vector2((doorWidth * repeat.x - wallWidth) / (2 * wallWidth), doorHeight / wallHeight));
        const halfWallTopTextures = prepareTextures(textures, new Vector2(repeat.x, (wallHeight - doorHeight) / wallHeight * repeat.y));

        const makeMaterialProps = (textureArray: any[]) => ({
            map: textureArray[0],
            metalnessMap: textureArray[1],
            normalMap: textureArray[2],
            aoMap: textureArray[3],
            metalness: wallMetalness,
            roughness: wallRoughness,
            normalScale: new Vector2(2, 2),
        });

        return [
            makeMaterialProps(mainTextures),
            makeMaterialProps(halfWallBottomLeftTextures),
            makeMaterialProps(halfWallBottomRightTextures),
            makeMaterialProps(halfWallTopTextures),
        ];
    }, [textures, repeat.x, repeat.y, doorWidth, doorHeight, wallWidth, wallHeight, wallMetalness, wallRoughness]);


    return (
        <mesh>
            {/* 门模型 */}
            <Door/>

            {/* 地板 */}
            {/*<Box args={[wallWidth - wallThickness, wallThickness, wallDepth - wallThickness]}*/}
            {/*     position={[0, wallThickness / 2, 0]}>*/}
            {/*    <meshStandardMaterial attach="material" {...mixedTexture}/>*/}
            {/*</Box>*/}
            {/* 天花板 */}
            <Box args={[wallWidth - wallThickness, wallThickness, wallDepth - wallThickness]}
                 position={[0, wallHeight - wallThickness / 2, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>

            {/* 后墙 */}
            <Box args={[wallWidth, wallHeight, wallThickness]}
                 position={[0, wallHeight * 0.5, -wallDepth * 0.5]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 左墙 */}
            <Box args={[wallThickness, wallHeight, wallDepth]}
                 position={[-wallWidth * 0.5, wallHeight * 0.5, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>
            {/* 右墙 */}
            <Box args={[wallThickness, wallHeight, wallDepth]}
                 position={[wallWidth * 0.5, wallHeight * 0.5, 0]}>
                <meshStandardMaterial attach="material" {...mixedTexture}/>
            </Box>

            {/* 门上方的墙壁部分 */}
            <Box args={[wallWidth, wallHeight - doorHeight, wallThickness]}
                 position={[0, (wallHeight + doorHeight) * 0.5, wallDepth * 0.5]}>
                <meshStandardMaterial attach="material" {...mixedTextureFrontHalfWallTop}/>
            </Box>

            {/* 门左侧的墙壁部分 */}
            <Box args={[halfWallWidth, doorHeight, wallThickness]}
                 position={[-(halfWallWidth + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5]}>
                <meshStandardMaterial attach="material" {...mixedTextureFrontHalfWallBottomLeft}/>
            </Box>
            {/* 门右侧的墙壁部分 */}
            <Box args={[halfWallWidth, doorHeight, wallThickness]}
                 position={[(halfWallWidth + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5]}>
                <meshStandardMaterial attach="material" {...mixedTextureFrontHalfWallBottomRight}/>
            </Box>

        </mesh>
    );
}


function CameraController() {
    const {camera, gl} = useThree();
    const orbitRef = useRef<OrbitControlsImpl>(null);
    const moveSpeed = 0.05; // 调整移动速度

    const [movingDirection, setMovingDirection] = React.useState<'forward' | 'backward' | 'left' | 'right' | null>(null);

    const moveForward = (distance: number) => {
        camera.translateZ(-distance);
    }

    const target = new THREE.Vector3(0, doorHeight * 0.6, 0);

    const moveRight = (distance: number) => {
        camera.translateX(distance);
    }

    useFrame(() => {
        const controls = orbitRef.current;

        // 示例：简单地保持摄像机的Y轴位置，防止上下移动超出预设范围
        // camera.position.clamp(new THREE.Vector3(-5, 2, -5), new THREE.Vector3(5, 4, 5));

        switch (movingDirection) {
            case 'forward':
                moveForward(moveSpeed);
                break;
            case 'backward':
                moveForward(-moveSpeed);
                break;
            case 'left':
                moveRight(-moveSpeed);
                break;
            case 'right':
                moveRight(moveSpeed);
                break;
        }
        // camera.lookAt(target);
        // camera.position.set(camera.position.x, doorHeight * 0.6, camera.position.z)
    });

    useEffect(() => {

        const onKeyDown = (event: { key: any; }) => {
            switch (event.key) {
                case 'w': // W键向前移动
                    setMovingDirection('forward');
                    break;
                case 's': // S键向后移动
                    setMovingDirection('backward');
                    break;
                case 'a': // A键向左移动
                    setMovingDirection('left');
                    break;
                case 'd': // D键向右移动
                    setMovingDirection('right');
                    break;
                default:
                    setMovingDirection(null);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', () => {
            setMovingDirection(null)
        });

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [camera]);

    return <OrbitControls
        ref={orbitRef} args={[camera, gl.domElement]} maxPolarAngle={Math.PI / 2}
        minPolarAngle={0}
    />
}

