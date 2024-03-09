import {Group, MeshStandardMaterial, Object3DEventMap, RepeatWrapping, Vector2} from 'three';
import * as THREE from 'three';
import {API, material_map} from "../../const";
// @ts-ignore
import {Sky} from 'three/addons/objects/Sky.js'
import {PropRoom} from "./SceneRoom";
import {TextureLoader, Texture} from 'three';
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {Vector3} from "three/src/math/Vector3";

export const TEXTURE_BASE = API.texture_base_url;

// 门
export const doorWidth = 1;
export const doorHeight = 2 * doorWidth;

export const eyeHeight = doorHeight * 0.65;

export const wallThickness = 0.06;


export function loadThings(
    texturePaths: string[],
    onLoad: (objs: Texture[] | Group<THREE.Object3DEventMap>[]) => void,
    loader: TextureLoader | EXRLoader | FBXLoader = new TextureLoader()
) {
    const objs: Texture[] | Group<THREE.Object3DEventMap>[] = [];
    let loaded = 0;
    texturePaths.forEach((path, index) => {
        loader.load(path, (texture) => {
            objs[index] = texture;
            loaded++;
            if (loaded === texturePaths.length) {
                onLoad(objs);
            }
        });
    });
}


function addLight(scene: THREE.Scene, room: PropRoom) {

    const roomSize = room.depth * room.width * room.height;

    console.log(Math.pow(roomSize, 1 / 3))

    const roomLight = new THREE.PointLight(0xffffff, 2, Math.pow(roomSize, 1 / 3) * 2, 0.4);
    roomLight.position.set(0, doorHeight * 0.8, 0);
    scene.add(roomLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);
}


export function makeDoorEXR(room: PropRoom, doorOpenedAction: () => void): [
    THREE.Group,
    (clock: THREE.Clock) => void,
    () => void
] {
    const wallDepth = room.depth;

    const doorGroup = new THREE.Group();

    let open = false;
    let targetRotationY = 0;

    loadThings(
        [material_map.doorD, material_map.doorN,],
        ([map, normalMap]) => {
            const doorMaterial = new THREE.MeshStandardMaterial({
                map: map as Texture,
                normalMap: normalMap as Texture,
                metalness: 0.2,
                roughness: 0.8,
                emissive: new THREE.Color(0x333333)
            });

            const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1);
            doorGeometry.translate(doorWidth * 0.5, 0, 0);

            const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

            doorGroup.position.set(-doorWidth * 0.5, doorHeight * 0.5, wallDepth / 2);
            doorGroup.add(doorMesh);
        },
        new EXRLoader()
    )

    const changeDoorState = () => {
        open = !open;
        targetRotationY = open ? -Math.PI / 1.3 : 0;
    }

    function updateDoor(clock: THREE.Clock) {
        const delta = clock.getDelta();
        if (open) {
            if (doorGroup.rotation.y > targetRotationY) {
                doorGroup.rotation.y -= delta * 3.2;
                if (doorGroup.rotation.y < targetRotationY) {
                    doorGroup.rotation.y = targetRotationY;
                }
            } else {
                doorOpenedAction();
            }
        } else if (!open && doorGroup.rotation.y < 0) {
            doorGroup.rotation.y += delta * 3.2;
            if (doorGroup.rotation.y > 0) {
                doorGroup.rotation.y = 0;
            }
        }
    }

    return [doorGroup, updateDoor, changeDoorState];
}

function addGroundEXR(scene: THREE.Scene, isFormalTrial: boolean) {
    const repeat: [number, number] = isFormalTrial ? [20, 10] : [300, 100];
    const size: [number, number] = repeat.map(x => x * 2) as [number, number];
    loadThings(
        [material_map.groundD, material_map.groundN,],
        ([map, normal]) => {
            [map, normal].forEach(texture => {
                texture = texture as Texture
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(...repeat);
            });
            const material = new THREE.MeshStandardMaterial({
                map: map as Texture,
                normalMap: normal as Texture,
                metalness: 0.02,
                roughness: 0.85,
                normalScale: new THREE.Vector2(2, 2),
            });
            const planeGeometry = new THREE.PlaneGeometry(...size);
            const plane = new THREE.Mesh(planeGeometry, material);
            plane.rotation.x = -Math.PI / 2;
            plane.receiveShadow = true;
            scene.add(plane);
        },
        new EXRLoader()
    )
}

const createWall = (scene: THREE.Scene, width: number, height: number, depth: number, position: THREE.Vector3, material: THREE.Material) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    scene.add(mesh);
    return mesh;
};

const prepareTextures = (
    [map, normal]: Texture[],
    repeat: Vector2,
    offset: Vector2 = new THREE.Vector2(0, 0)
) => {
    return [map, normal].map(texture => {
        const clonedTexture = texture.clone() as Texture;
        clonedTexture.wrapS = RepeatWrapping;
        clonedTexture.wrapT = RepeatWrapping;
        clonedTexture.repeat.set(repeat.x, repeat.y);
        clonedTexture.offset.set(offset.x, offset.y);
        return clonedTexture;
    });
};

const makeMaterial = ([map, normalMap]: Texture[], metalness: number, roughness: number) => {
    return new THREE.MeshStandardMaterial({
        map,
        normalMap,
        metalness,
        roughness,
        normalScale: new Vector2(2, 2),
        emissive: new THREE.Color(0x333333)
    });
}


export function checkCollisionAndMove(raycaster: THREE.Raycaster, direction: Vector3, distance: number, camera: THREE.Camera, walls: THREE.Object3D[]) {
    raycaster.set(camera.position, direction);

    const intersections = raycaster.intersectObjects(walls);

    if (intersections.length > 0 && intersections[0].distance < distance + wallThickness * 19) {
        // console.log("Collision detected, can't move");
    } else {
        const newPosition = direction.clone().multiplyScalar(distance).add(camera.position);
        camera.position.copy(newPosition);
    }
}

export function loadFBXModel(pathModel: string, pathD: string, pathN: string, onLoad: (model: Group<Object3DEventMap>, material: MeshStandardMaterial) => void) {
    loadThings(
        [pathD, pathN,],
        ([d, n]) => {
            loadThings(
                [pathModel,],
                ([model]) => {
                    onLoad(model as Group<THREE.Object3DEventMap>, new THREE.MeshStandardMaterial({
                        map: d as Texture,
                        normalMap: n as Texture,
                        normalScale: new Vector2(2, 2),
                    }));
                },
                new FBXLoader()
            )
        },
        new EXRLoader()
    )
}

interface WallShading {
    D: string,
    N: string,
}

export function makeScene(
    room: PropRoom, wall: {
        wall: WallShading,
        floor: WallShading,
        ceiling: WallShading,
    },
    renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera,
    isFormalTrial: boolean
): [THREE.Scene, THREE.Object3D[]] {
    const scene = new THREE.Scene();

    if (!isFormalTrial) {
        addGroundEXR(scene, isFormalTrial);
        addSky(scene, renderer, camera);
    }
    addLight(scene, room);

    const walls: THREE.Object3D[] = [];

    // 墙壁
    const wallHeight = room.height;
    const wallWidth = isFormalTrial ? room.width : 10.3;
    const wallDepth = room.depth;

    const repeatTimes = 5;
    const repeatBack = new Vector2(repeatTimes, repeatTimes * wallHeight / wallWidth);
    const repeatLR = new Vector2(repeatBack.y * wallDepth / wallHeight, repeatBack.y);
    const repeatFloor = new Vector2(repeatBack.x, repeatLR.x);
    const repeatCeiling = new Vector2(repeatFloor.x, repeatFloor.y);

    const wallMetalness = 0.1;
    const wallRoughness = 0.8;

    const exr_loader = new EXRLoader();
    loadThings(
        [wall.ceiling.D, wall.ceiling.N],
        ([map, normal]) => {
            map = map as Texture;
            normal = normal as Texture;
            const textureCeiling = prepareTextures([map, normal], repeatCeiling);
            const materialCeiling = makeMaterial(textureCeiling, wallMetalness, wallRoughness);
            const wall4 = createWall(scene, wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight - wallThickness / 2, 0), materialCeiling);
            walls.push(wall4);
        },
        exr_loader
    );
    loadThings(
        [wall.wall.D, wall.wall.N],
        ([map, normal]) => {
            map = map as Texture;
            normal = normal as Texture;
            const textureLR = prepareTextures([map, normal], repeatLR);
            const textureBack = prepareTextures([map, normal], repeatBack);
            const materialLR = makeMaterial(textureLR, wallMetalness, wallRoughness);
            const materialBack = makeMaterial(textureBack, wallMetalness, wallRoughness);
            const wall1 = createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, 0), materialLR);
            const wall2 = createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0), materialLR);
            const wall3 = createWall(scene, wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2), materialBack);
            walls.push(wall1, wall2, wall3);
        },
        exr_loader
    );
    loadThings(
        [wall.floor.D, wall.floor.N],
        ([map, normal]) => {
            map = map as Texture;
            normal = normal as Texture;
            const material = makeMaterial(prepareTextures([map, normal], repeatFloor), wallMetalness, wallRoughness);
            const wall5 = createWall(scene, wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, 0, 0), material);
            walls.push(wall5);
        },
        exr_loader
    );

    if (!isFormalTrial) {
        loadThings(
            [
                material_map.wallExternalD,
                material_map.wallExternalN,
            ],
            ([mapWE, normalWE]) => {
                mapWE = mapWE as Texture;
                normalWE = normalWE as Texture;

                loadFBXModel(material_map.dadoModel, material_map.dadoD, material_map.dadoN, (dado, material) => {
                    dado.scale.set(.03, .01, .03);

                    dado.traverse((child) => {
                        if ((child as THREE.Mesh).isMesh) {
                            (child as THREE.Mesh).material = material;
                            (child as THREE.Mesh).geometry.computeBoundingBox();
                        }
                    });

                    const bbox = new THREE.Box3().setFromObject(dado);
                    const width = bbox.max.x - bbox.min.x;

                    dado.rotateX(-Math.PI / 2);
                    dado.position.z = room.depth / 2 + wallThickness;
                    dado.position.x = width / 2 + doorWidth / 2;
                    scene.add(dado);

                    const dado_left = dado.clone();
                    dado_left.position.x = -width / 2 - doorWidth / 2;
                    scene.add(dado_left);
                });

                const mainTextures = prepareTextures([mapWE, normalWE], repeatFloor);
                const material = makeMaterial(mainTextures, wallMetalness, wallRoughness)
                const wall6 = createWall(scene, wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2), material);
                const wall7 = createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, 0), material);
                const wall8 = createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0), material);
                const wall9 = createWall(scene, wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight - wallThickness / 2, 0), material);
                walls.push(wall6, wall7, wall8, wall9);

                // frontal walls

                const wallHeightF = isFormalTrial ? 10 : wallHeight;
                const wallWidthF = isFormalTrial ? 20 : wallWidth;
                const halfWallWidthF = (wallWidthF - doorWidth) * 0.5;

                const repeatF = new Vector2(repeatTimes * wallWidthF / wallWidth, (repeatTimes / wallWidth * wallHeight) * wallHeightF / wallHeight);

                const halfRepeat = new Vector2(
                    (wallWidthF - doorWidth) / 2 / wallWidthF * repeatF.x,
                    doorHeight / wallHeightF * repeatF.y
                );
                const bottomOffsetY = -doorHeight / wallHeightF * repeatF.y;
                const halfWallBLTextures = prepareTextures(
                    [mapWE, normalWE],
                    halfRepeat,
                    new Vector2(0, bottomOffsetY)
                );
                const halfWallBRTextures = prepareTextures(
                    [mapWE, normalWE],
                    halfRepeat,
                    new Vector2((doorWidth * repeatF.x - wallWidthF) / (2 * wallWidthF), bottomOffsetY)
                );
                const halfWallTTextures = prepareTextures(
                    [mapWE, normalWE],
                    new Vector2(repeatF.x, (wallHeightF - doorHeight) / wallHeightF * repeatF.y),
                );

                // External wall lower part, left(view of +z to -z).
                const walla1 = createWall(scene, halfWallWidthF, doorHeight, wallThickness,
                    new THREE.Vector3(-(halfWallWidthF + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5),
                    makeMaterial(halfWallBLTextures, wallMetalness, wallRoughness)
                );
                // External wall lower part, right(view of +z to -z).
                const walla2 = createWall(scene, halfWallWidthF, doorHeight, wallThickness,
                    new THREE.Vector3((halfWallWidthF + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5),
                    makeMaterial(halfWallBRTextures, wallMetalness, wallRoughness)
                );
                // External wall upper half.
                const walla3 = createWall(scene, wallWidthF, wallHeightF - doorHeight, wallThickness,
                    new THREE.Vector3(0, (wallHeightF + doorHeight) * 0.5, wallDepth * 0.5),
                    makeMaterial(halfWallTTextures, wallMetalness, wallRoughness)
                );
                walls.push(walla1, walla2, walla3);

            },
            new EXRLoader()
        )
    }

    return [scene, walls];
}

function addSky(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
    // See: https://threejs.org/examples/webgl_shaders_sky.html

    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const sun = new THREE.Vector3();

    const effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: 2,
        azimuth: 180,
        exposure: renderer.toneMappingExposure
    };

    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = effectController.turbidity;
        uniforms['rayleigh'].value = effectController.rayleigh;
        uniforms['mieCoefficient'].value = effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        uniforms['sunPosition'].value.copy(sun);

        renderer.toneMappingExposure = effectController.exposure;
        renderer.render(scene, camera);

    }

    guiChanged();

}

export const webGlConfig = {
    powerPreference: 'high-performance',
    antialias: true,
    failIfMajorPerformanceCaveat: true
}