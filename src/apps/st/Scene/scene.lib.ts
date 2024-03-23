import {Group, RepeatWrapping, Vector2} from 'three';
import * as THREE from 'three';
import {API} from "../../const";
import {PropRoom} from "./SceneRoom";
import {TextureLoader, Texture} from 'three';
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";

export const TEXTURE_BASE = API.texture_base_url;

export const eyeHeight = 1.75;

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


export function addLight(scene: THREE.Scene, room: PropRoom) {
    const roomLight = new THREE.PointLight(
        0xffffff, (room.width - 4) / 12 + 2, room.width, (16 - room.width) / 30 + 0.1
    );
    roomLight.position.set(0, room.height * 0.5, 0);
    scene.add(roomLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, (room.width - 4) / 24 + 2);
    scene.add(ambientLight);
}


const createWall = (width: number, height: number, depth: number, position: THREE.Vector3, material: THREE.Material) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(Math.PI, 0, 0)
    mesh.position.set(position.x, position.y, position.z);
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
        normalScale: new Vector2(1, 1),
        emissive: new THREE.Color(0x333333)
    });
}


interface WallShading {
    D: string,
    N: string,
}

export function createWalls(
    room: PropRoom,
    wall: {
        wall: WallShading,
        floor: WallShading,
        ceiling: WallShading,
    },
    walls: THREE.Mesh[] = []
) {
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
        [wall.wall.D, wall.wall.N, wall.floor.D, wall.floor.N],
        ([map, normal, mapFloor, normalFloor]) => {
            map = map as Texture;
            normal = normal as Texture;
            mapFloor = mapFloor as Texture;
            normalFloor = normalFloor as Texture;

            const textureCeiling = prepareTextures([map, normal], repeatCeiling);
            const materialCeiling = makeMaterial(textureCeiling, wallMetalness, wallRoughness);
            const wall0 = createWall(wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight - wallThickness / 2, 0), materialCeiling);
            const textureLR = prepareTextures([map, normal], repeatLR);
            const textureFB = prepareTextures([map, normal], repeatBack);
            const materialLR = makeMaterial(textureLR, wallMetalness, wallRoughness);
            const materialFB = makeMaterial(textureFB, wallMetalness, wallRoughness);
            const wall1 = createWall(wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, 0), materialLR);
            const wall2 = createWall(wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0), materialLR);
            // back
            const wall3 = createWall(wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2), materialFB);
            // front
            const wall4 = createWall(wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, wallDepth / 2), materialFB);

            // floor
            const material = makeMaterial(prepareTextures([mapFloor, normalFloor], repeatFloor), wallMetalness, wallRoughness);
            const wall5 = createWall(wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, 0, 0), material);

            walls.push(wall0, wall1, wall2, wall3, wall4, wall5);
        },
        exr_loader
    );

}

export const webGlConfig = {
    powerPreference: 'high-performance',
    antialias: true,
    failIfMajorPerformanceCaveat: true,
    logarithmicDepthBuffer: true,
}
