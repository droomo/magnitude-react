import * as THREE from 'three';
import {TypeRoom} from "./SceneExp";
import {mapFloor, mapWall, normalFloor, normalWall,} from "../../const";

export const wallThickness = 0.06;

export function makeLight(room: TypeRoom): THREE.Light[] {
    const zOffset = -room.depth / 2 + 0.15;

    const group: THREE.Light[] = [];
    const roomLight = new THREE.PointLight(
        0xffffff, (room.width - 3) / 30 + 2, room.width, (24 - room.width) / 40 + 0.1
    );
    roomLight.position.set(0, room.height * 0.5, zOffset);
    const ambientLight = new THREE.AmbientLight(0xffffff, (room.width - 3) / 30 + 2);
    group.push(roomLight, ambientLight);
    return group
}

const createWall = (width: number, height: number, depth: number, position: THREE.Vector3, material: THREE.Material) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(Math.PI, 0, 0)
    mesh.position.set(position.x, position.y, position.z);
    return mesh;
};

const prepareTextures = (
    [map, normal]: THREE.Texture[],
    repeat: THREE.Vector2,
    offset: THREE.Vector2 = new THREE.Vector2(0, 0)
) => {
    return [map, normal].map(texture => {
        const clonedTexture = texture.clone() as THREE.Texture;
        clonedTexture.wrapS = THREE.RepeatWrapping;
        clonedTexture.wrapT = THREE.RepeatWrapping;
        clonedTexture.repeat.set(repeat.x, repeat.y);
        clonedTexture.offset.set(offset.x, offset.y);
        return clonedTexture;
    });
};

const makeMaterial = ([map, normalMap]: THREE.Texture[], metalness: number, roughness: number) => {
    return new THREE.MeshStandardMaterial({
        map,
        normalMap,
        metalness,
        roughness,
        normalScale: new THREE.Vector2(1, 1),
        emissive: new THREE.Color(0x333333)
    });
}

export function create3DText(text: string): THREE.Mesh {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 300 * text.length;
    canvas.height = 300;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = `${text === "+" ? 200: 100}px MS YaHei`;
    context.fillStyle = 'rgba(255, 255, 255, 1.0)';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const textTexture = new THREE.Texture(canvas);
    textTexture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({map: textTexture});
    const geometry = new THREE.PlaneGeometry(text.length, 1);
    const textMesh = new THREE.Mesh(geometry, material);
    textMesh.position.set(0, 1.5, -5);

    return textMesh;
}


export function createWalls(room: TypeRoom, done: (walls: THREE.Mesh[]) => void) {
    const walls: THREE.Mesh[] = [];

    // 墙壁
    const wallHeight = room.height;
    const wallWidth = room.width;
    const wallDepth = room.depth;

    const repeatTimes = 5;
    const repeatBack = new THREE.Vector2(repeatTimes, repeatTimes * wallHeight / wallWidth);
    const repeatLR = new THREE.Vector2(repeatBack.y * wallDepth / wallHeight, repeatBack.y);
    const repeatFloor = new THREE.Vector2(repeatBack.x, repeatLR.x);
    const repeatCeiling = new THREE.Vector2(repeatFloor.x, repeatFloor.y);

    const wallMetalness = 0.02;
    const wallRoughness = 0.96;

    const zOffset = -wallDepth / 2 + 0.15;

    const textureCeiling = prepareTextures([mapWall, normalWall], repeatCeiling);
    const materialCeiling = makeMaterial(textureCeiling, wallMetalness, wallRoughness);
    const wall0 = createWall(wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight + wallThickness / 2, zOffset), materialCeiling);
    const textureLR = prepareTextures([mapWall, normalWall], repeatLR);
    const textureFB = prepareTextures([mapWall, normalWall], repeatBack);
    const materialLR = makeMaterial(textureLR, wallMetalness, wallRoughness);
    const materialFB = makeMaterial(textureFB, wallMetalness, wallRoughness);
    const wall1 = createWall(wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, zOffset), materialLR);
    const wall2 = createWall(wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, zOffset), materialLR);
    // back
    const wall3 = createWall(wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2 + zOffset), materialFB);
    // front
    const wall4 = createWall(wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, wallDepth / 2 + zOffset), materialFB);

    // floor
    const material = makeMaterial(prepareTextures([mapFloor, normalFloor], repeatFloor), wallMetalness, wallRoughness);
    const wall5 = createWall(wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, 0, zOffset), material);

    walls.push(wall0, wall1, wall2, wall3, wall4, wall5);

    done(walls);
}

export const webGlConfig = {
    powerPreference: 'high-performance',
    antialias: true,
    failIfMajorPerformanceCaveat: true,
    logarithmicDepthBuffer: true,
}
