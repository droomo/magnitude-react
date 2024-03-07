import {Group, RepeatWrapping, Vector2} from 'three';
import * as THREE from 'three';
import {API, getFloorUrl, getWallUrl, material_map} from "../../const";
// @ts-ignore
import {Sky} from 'three/addons/objects/Sky.js'
import {PropRoom} from "./SceneRoom";
import {TextureLoader, Texture} from 'three';
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

export const TEXTURE_BASE = API.texture_base_url

// 门
export const doorWidth = 1;
export const doorHeight = 2 * doorWidth;

export const wallThickness = 0.12;


function loadThings(
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
    const pointLight = new THREE.PointLight(0xffffff, 3, 15, 0.1);
    pointLight.position.set(0, doorHeight / 2, room.depth / 2 + 10);
    scene.add(pointLight);

    const roomLight = new THREE.PointLight(0xffffff, 2, 15, 0.1);
    roomLight.position.set(0, doorHeight * 0.8, 0);
    scene.add(roomLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}


export function makeDoorEXR(room: PropRoom, doorOpenedAction: () => void): [THREE.Group, (clock: THREE.Clock) => void] {
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

            const onKeyDown = (event: { key: any; }) => {
                switch (event.key) {
                    case 'e':
                        open = !open;
                        targetRotationY = open ? -Math.PI / 1.3 : 0; // 旋转90度开门
                }
            };

            window.addEventListener('keydown', onKeyDown);
        },
        new EXRLoader()
    )

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

    return [doorGroup, updateDoor];
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
                metalness: 0.2,
                roughness: 0.6,
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
};

const prepareTextures = ([map, normal]: Texture[], repeat: Vector2, offset = new THREE.Vector2(0, 0)) => {
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

export function makeScene(
    room: PropRoom, wallName: string, floorName: string,
    renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera,
    isFormalTrial: boolean
) {
    const scene = new THREE.Scene();
    addGroundEXR(scene, isFormalTrial);

    // 墙壁
    const wallHeight = room.height;
    const wallWidth = isFormalTrial ? room.width : 10.3;
    const wallDepth = room.depth;

    const repeat = new Vector2(10, 10);

    // 前墙壁
    const wallHeightF = isFormalTrial ? 10 : wallHeight;
    const wallWidthF = isFormalTrial ? 20 : wallWidth;
    const halfWallWidthF = (wallWidthF - doorWidth) * 0.5;

    const wallMetalness = 0.1;
    const wallRoughness = 0.8;

    loadThings(
        [material_map.dadoModel],
        ([dado]) => {
            loadThings(
                [material_map.dadoD, material_map.dadoN,],
                ([map, normalMap]) => {
                    dado = dado as Group<THREE.Object3DEventMap>;

                    const material = new THREE.MeshStandardMaterial({
                        map: map as Texture,
                        normalMap: normalMap as Texture,
                        normalScale: new Vector2(2, 2),
                    });

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
                    dado.position.z = room.depth / 2 + wallThickness - 0.05;
                    dado.position.x = width / 2 + doorWidth / 2;
                    scene.add(dado);

                    const dado_left = dado.clone();
                    dado_left.position.x = -width / 2 - doorWidth / 2;
                    scene.add(dado_left);
                },
                new EXRLoader()
            )
        },
        new FBXLoader()
    );

    const texturePaths = [
        material_map.wallExternalD,
        material_map.wallExternalN,
    ];

    loadThings(
        texturePaths,
        ([map, normal]) => {
            map = map as Texture;
            normal = normal as Texture;

            if (isFormalTrial) {
                const exr_loader = new EXRLoader();
                loadThings(
                    [getWallUrl(wallName, 'D'), getWallUrl(wallName, 'N'),],
                    ([map, normal]) => {
                        map = map as Texture;
                        normal = normal as Texture;
                        const mainTextures = prepareTextures([map, normal], repeat);
                        const material = makeMaterial(mainTextures, wallMetalness, wallRoughness)
                        createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, 0), material);
                        createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0), material);
                        createWall(scene, wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2), material);
                        createWall(scene, wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight - wallThickness / 2, 0), material);
                    },
                    exr_loader
                );
                loadThings(
                    [getFloorUrl(floorName, 'D'), getFloorUrl(floorName, 'N'),],
                    ([map, normal]) => {
                        map = map as Texture;
                        normal = normal as Texture;
                        const material = makeMaterial(prepareTextures([map, normal], repeat), wallMetalness, wallRoughness);
                        createWall(scene, wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, 0, 0), material);
                    },
                    exr_loader
                );

            } else {
                const mainTextures = prepareTextures([map, normal], repeat);
                const material = makeMaterial(mainTextures, wallMetalness, wallRoughness)
                createWall(scene, wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2), material);
                createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, 0), material);
                createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0), material);
                createWall(scene, wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight - wallThickness / 2, 0), material);
            }

            const halfRepeat = new Vector2(
                (wallWidthF - doorWidth) / 2 / wallWidthF * repeat.x,
                doorHeight / wallHeightF * repeat.y
            );
            const halfWallBLTextures = prepareTextures([map, normal], halfRepeat, new Vector2(0, doorHeight / wallHeightF));
            const halfWallBRTextures = prepareTextures([map, normal], halfRepeat, new Vector2((doorWidth * repeat.x - wallWidthF) / (2 * wallWidthF), doorHeight / wallHeightF));
            const halfWallTTextures = prepareTextures([map, normal], new Vector2(repeat.x, (wallHeightF - doorHeight) / wallHeightF * repeat.y));

            createWall(scene, halfWallWidthF, doorHeight, wallThickness,
                new THREE.Vector3(-(halfWallWidthF + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5),
                makeMaterial(halfWallBLTextures, wallMetalness, wallRoughness)
            );
            createWall(scene, halfWallWidthF, doorHeight, wallThickness,
                new THREE.Vector3((halfWallWidthF + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5),
                makeMaterial(halfWallBRTextures, wallMetalness, wallRoughness)
            );
            createWall(scene, wallWidthF, wallHeightF - doorHeight, wallThickness,
                new THREE.Vector3(0, (wallHeightF + doorHeight) * 0.5, wallDepth * 0.5),
                makeMaterial(halfWallTTextures, wallMetalness, wallRoughness)
            );
        },
        new EXRLoader()
    )
    addLight(scene, room);
    addSky(scene, renderer, camera);

    return scene;
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