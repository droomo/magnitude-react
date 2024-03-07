import * as THREE from "three";
import {Group, RepeatWrapping, Texture, TextureLoader, Vector2} from "three";
import {doorHeight, doorWidth, TEXTURE_BASE, wallThickness} from "../Scene/scene.lib";
import {PropRoom} from "../Scene/SceneRoom";
import {material_map} from "../../const";
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

export function makeDoor(room: PropRoom, doorOpenedAction: () => void): [THREE.Group, (clock: THREE.Clock) => void] {
    const wallDepth = room.depth;

    const textureLoader = new THREE.TextureLoader();
    const doorTextures = [
        textureLoader.load(`${TEXTURE_BASE}/door/door.png`),
        textureLoader.load(`${TEXTURE_BASE}/door/doorM.png`),
        textureLoader.load(`${TEXTURE_BASE}/door/doorN.png`),
    ];

    doorTextures.forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

    const doorMaterial = new THREE.MeshStandardMaterial({
        map: doorTextures[0],
        metalnessMap: doorTextures[1],
        normalMap: doorTextures[2],
        metalness: 0.4,
        roughness: 0.5
    });

    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1);
    doorGeometry.translate(doorWidth * 0.5, 0, 0);

    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    const doorGroup = new THREE.Group();
    doorGroup.position.set(-doorWidth * 0.5, doorHeight * 0.5, wallDepth / 2);
    doorGroup.add(doorMesh);

    let open = false;
    let targetRotationY = 0;

    function updateDoor(clock: THREE.Clock) {
        const delta = clock.getDelta();
        if (open) {
            if (doorGroup.rotation.y > targetRotationY) {
                doorGroup.rotation.y -= delta * 3.2;
                if (doorGroup.rotation.y < targetRotationY) {
                    doorGroup.rotation.y = targetRotationY;
                }
            } else {
                doorOpenedAction()
            }
        } else if (!open && doorGroup.rotation.y < 0) {
            doorGroup.rotation.y += delta * 3.2;
            if (doorGroup.rotation.y > 0) {
                doorGroup.rotation.y = 0;
            }
        }
    }

    const onKeyDown = (event: { key: any; }) => {
        switch (event.key) {
            case 'e':
                open = !open;
                targetRotationY = open ? -Math.PI / 1.3 : 0; // 旋转90度开门
        }
    };

    window.addEventListener('keydown', onKeyDown);

    return [doorGroup, updateDoor];
}


export function addGround(scene: THREE.Scene) {
    const loader = new TextureLoader();

    const baseColorTexture = loader.load(`${TEXTURE_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_BaseColor.png`);
    const metalnessTexture = loader.load(`${TEXTURE_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_MetallicRoughness.png`);
    const normalTexture = loader.load(`${TEXTURE_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_Normal.png`);
    const aoTexture = loader.load(`${TEXTURE_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_Occlusion.png`);

    [baseColorTexture, metalnessTexture, normalTexture, aoTexture].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
    });

    const material = new THREE.MeshStandardMaterial({
        map: baseColorTexture,
        metalnessMap: metalnessTexture,
        normalMap: normalTexture,
        aoMap: aoTexture,
        metalness: 0.4,
        roughness: 0.5,
        normalScale: new THREE.Vector2(2, 2),
    });
    const planeGeometry = new THREE.PlaneGeometry(6e2, 2e2);
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
}

//
//
// export function addWalls(scene: THREE.Scene, room: PropRoom) {
//     // 墙壁
//     const wallHeight = room.height;
//     const wallWidth = room.width;
//     const wallDepth = room.depth;
//
//     // 前墙壁
//     const wallHeightF = 10;
//     const wallWidthF = 20;
//     const halfWallWidthF = (wallWidthF - doorWidth) * 0.5;
//
//     const wallRoughness = 0.8;
//     const wallMetalness = 0.1;
//
//     loadThings(
//         [material_map.dadoModel],
//         ([dado]) => {
//             loadThings(
//                 [material_map.dadoD, material_map.dadoN,],
//                 ([map, normalMap]) => {
//                     dado = dado as Group<THREE.Object3DEventMap>;
//
//                     const material = new THREE.MeshStandardMaterial({
//                         map: map as Texture,
//                         normalMap: normalMap as Texture,
//                         normalScale: new Vector2(2, 2),
//                     });
//
//                     dado.scale.set(.03, .01, .03);
//
//                     dado.traverse((child) => {
//                         if ((child as THREE.Mesh).isMesh) {
//                             (child as THREE.Mesh).material = material;
//                             (child as THREE.Mesh).geometry.computeBoundingBox();
//                         }
//                     });
//
//                     const bbox = new THREE.Box3().setFromObject(dado);
//                     const width = bbox.max.x - bbox.min.x;
//
//                     dado.rotateX(-Math.PI / 2);
//                     dado.position.z = room.depth / 2 + wallThickness - 0.07;
//                     dado.position.x = width / 2 + doorWidth / 2;
//                     scene.add(dado);
//
//                     const dado_left = dado.clone();
//                     dado_left.position.x = -width / 2 - doorWidth / 2;
//                     scene.add(dado_left);
//                 },
//                 new EXRLoader()
//             )
//         },
//         new FBXLoader()
//     );
//
//     const texturePaths = [
//         `${TEXTURE_BASE}/wall/1/wall_BaseColor.png`,
//         `${TEXTURE_BASE}/wall/1/wall_MetallicRoughness.png`,
//         `${TEXTURE_BASE}/wall/1/wall_Normal.png`,
//         `${TEXTURE_BASE}/wall/1/wall_Occlusion.png`,
//     ];
//
//     loadThings(texturePaths, (originalTextures) => {
//
//         const prepareTextures = (repeat: Vector2, offset = new THREE.Vector2(0, 0)) => {
//             return originalTextures.map(texture => {
//                 const clonedTexture = texture.clone() as Texture;
//                 clonedTexture.wrapS = RepeatWrapping;
//                 clonedTexture.wrapT = RepeatWrapping;
//                 clonedTexture.repeat.set(repeat.x, repeat.y);
//                 clonedTexture.offset.set(offset.x, offset.y);
//                 return clonedTexture;
//             });
//         };
//
//         const makeMaterial = (textureArray: Texture[]) => {
//             return new THREE.MeshStandardMaterial({
//                 map: textureArray[0],
//                 metalnessMap: textureArray[1],
//                 normalMap: textureArray[2],
//                 aoMap: textureArray[3],
//                 metalness: wallMetalness,
//                 roughness: wallRoughness,
//                 normalScale: new Vector2(2, 2),
//             });
//         }
//
//         const mainTextures = prepareTextures(repeat);
//
//         const halfRepeat = new Vector2(
//             (wallWidthF - doorWidth) / 2 / wallWidthF * repeat.x,
//             doorHeight / wallHeightF * repeat.y
//         );
//         const halfWallBLTextures = prepareTextures(halfRepeat, new Vector2(0, doorHeight / wallHeightF));
//         const halfWallBRTextures = prepareTextures(halfRepeat, new Vector2((doorWidth * repeat.x - wallWidthF) / (2 * wallWidthF), doorHeight / wallHeightF));
//         const halfWallTTextures = prepareTextures(new Vector2(repeat.x, (wallHeightF - doorHeight) / wallHeightF * repeat.y));
//
//
//         const createWall = (width: number, height: number, depth: number, position: THREE.Vector3, material: THREE.Material) => {
//             const geometry = new THREE.BoxGeometry(width, height, depth);
//             const mesh = new THREE.Mesh(geometry, material);
//             mesh.position.set(position.x, position.y, position.z);
//             scene.add(mesh);
//         };
//         const material = makeMaterial(mainTextures)
//         createWall(wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2), material);
//         createWall(wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, 0), material);
//         createWall(wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0), material);
//         createWall(wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight - wallThickness / 2, 0), material);
//
//         createWall(halfWallWidthF, doorHeight, wallThickness, new THREE.Vector3(-(halfWallWidthF + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5), makeMaterial(halfWallBLTextures));
//         createWall(halfWallWidthF, doorHeight, wallThickness, new THREE.Vector3((halfWallWidthF + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5), makeMaterial(halfWallBRTextures));
//         createWall(wallWidthF, wallHeightF - doorHeight, wallThickness, new THREE.Vector3(0, (wallHeightF + doorHeight) * 0.5, wallDepth * 0.5), makeMaterial(halfWallTTextures));
//     })
// }