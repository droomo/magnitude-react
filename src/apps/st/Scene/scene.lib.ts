import {Group, MeshStandardMaterial, Object3DEventMap, RepeatWrapping, Vector2} from 'three';
import * as THREE from 'three';
import {API} from "../../const";
// @ts-ignore
import {PropRoom} from "./SceneRoom";
import {TextureLoader, Texture} from 'three';
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

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
    const roomLight = new THREE.PointLight(
        0xffffff, (room.width - 4) / 12 + 2, room.width, (16 - room.width) / 30 + 0.1
    );
    roomLight.position.set(0, room.height * 0.8, 0);
    scene.add(roomLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, (room.width - 4) / 24 + 2);
    scene.add(ambientLight);
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
): THREE.Scene {
    const scene = new THREE.Scene();

    addLight(scene, room);

    // 墙壁
    const wallHeight = room.height;
    const wallWidth = room.width;
    const wallDepth = room.depth;

    const repeatTimes = 5;
    const repeatBack = new Vector2(repeatTimes, repeatTimes * wallHeight / wallWidth);
    const repeatLR = new Vector2(repeatBack.y * wallDepth / wallHeight, repeatBack.y);
    const repeatFloor = new Vector2(repeatBack.x, repeatLR.x);
    const repeatCeiling = new Vector2(repeatFloor.x, repeatFloor.y);

    const wallMetalness = 0.02;
    const wallRoughness = 0.96;

    const exr_loader = new EXRLoader();
    loadThings(
        [wall.ceiling.D, wall.ceiling.N],
        ([map, normal]) => {
            map = map as Texture;
            normal = normal as Texture;
            const textureCeiling = prepareTextures([map, normal], repeatCeiling);
            const materialCeiling = makeMaterial(textureCeiling, wallMetalness, wallRoughness);
            createWall(scene, wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight - wallThickness / 2, 0), materialCeiling);
        },
        exr_loader
    );
    loadThings(
        [wall.wall.D, wall.wall.N],
        ([map, normal]) => {
            map = map as Texture;
            normal = normal as Texture;
            const textureLR = prepareTextures([map, normal], repeatLR);
            const textureFB = prepareTextures([map, normal], repeatBack);
            const materialLR = makeMaterial(textureLR, wallMetalness, wallRoughness);
            const materialFB = makeMaterial(textureFB, wallMetalness, wallRoughness);
            createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, 0), materialLR);
            createWall(scene, wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0), materialLR);
            // back
            createWall(scene, wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2), materialFB);
            // front
            createWall(scene, wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, wallDepth / 2), materialFB);
        },
        exr_loader
    );
    loadThings(
        [wall.floor.D, wall.floor.N],
        ([map, normal]) => {
            map = map as Texture;
            normal = normal as Texture;
            const material = makeMaterial(prepareTextures([map, normal], repeatFloor), wallMetalness, wallRoughness);
            createWall(scene, wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, 0, 0), material);
        },
        exr_loader
    );

    return scene
}

export const webGlConfig = {
    powerPreference: 'high-performance',
    antialias: true,
    failIfMajorPerformanceCaveat: true,
    logarithmicDepthBuffer: true,
}
