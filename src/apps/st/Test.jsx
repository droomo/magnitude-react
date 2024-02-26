import React, {Suspense, useRef, VFC} from 'react';
import * as THREE from 'three';
import {OrbitControls, Plane, Stats, useTexture} from '@react-three/drei';
import {Canvas, useFrame} from '@react-three/fiber';


// ==============================================
const Objects = () => {
    const boxRef = useRef(null)

    useFrame(() => {
        boxRef.current.rotation.y += 0.01
    })

    const name = (type) => `http://127.0.0.1:9000/T_Brick_Clay_Beveled_${type}.PNG`

    const textureProps = useTexture({
        map: name('D'),
        // displacementMap: name('Displacement'),
        normalMap: name('N'),
        // roughnessMap: name('Roughness'),
        // aoMap: name('AmbientOcclusion')
    })

    return (
        <>
            <mesh ref={boxRef} position={[-1, 1, 0]} castShadow receiveShadow>
                <boxGeometry args={[1, 1, 1, 32, 32, 32]}/>
                <meshStandardMaterial {...textureProps}/>
            </mesh>
        </>
    )
}

export default function Texture() {
    return (
        <Canvas>
            // ・・・
            {/* object */}
            <Suspense fallback={null}>
                <Objects/>
            </Suspense>
            // ・・・
        </Canvas>
    )
}