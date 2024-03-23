import {RepeatWrapping, Vector2} from 'three';
import {API, mapFloor, mapWall, normalFloor, normalWall,} from "../../const";
import {Texture} from 'three';
import * as THREE from 'three';
import {TypeRoom} from "./SceneRoomPractice";

export const TEXTURE_BASE = API.texture_base_url;

export const eyeHeight = 1.75;

export const wallThickness = 0.06;

export function addLight(scene: THREE.Scene, room: TypeRoom) {
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


export function createWalls(room: TypeRoom, done: (walls: THREE.Group) => void) {
    const wallGroup: THREE.Group = new THREE.Group();

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

    const textureCeiling = prepareTextures([mapWall, normalWall], repeatCeiling);
    const materialCeiling = makeMaterial(textureCeiling, wallMetalness, wallRoughness);
    const wall0 = createWall(wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight + wallThickness / 2, 0), materialCeiling);
    const textureLR = prepareTextures([mapWall, normalWall], repeatLR);
    const textureFB = prepareTextures([mapWall, normalWall], repeatBack);
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

    wallGroup.add(wall0, wall1, wall2, wall3, wall4, wall5);

    done(wallGroup);
}

export const webGlConfig = {
    powerPreference: 'high-performance',
    antialias: true,
    failIfMajorPerformanceCaveat: true,
    logarithmicDepthBuffer: true,
}
