import {RepeatWrapping, Vector2} from 'three';
import * as THREE from 'three';
import {API} from "../const";
// @ts-ignore
import {Sky} from 'three/addons/objects/Sky.js'
import {TypeRoomSize} from "./SceneRoom";

export const TEXTURE_BASE = API.texture_base_url

// 门
const doorWidth = 1;
const doorHeight = 2 * doorWidth;

// 贴图重复
const repeat = new Vector2(17, 14);


export function addGround(scene: THREE.Scene) {
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const loader = new THREE.TextureLoader();

    const baseColorTexture = loader.load(`${TEXTURE_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_BaseColor.png`);
    const metalnessTexture = loader.load(`${TEXTURE_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_MetallicRoughness.png`);
    const normalTexture = loader.load(`${TEXTURE_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_Normal.png`);
    const aoTexture = loader.load(`${TEXTURE_BASE}/wild_grass/MI_Wild_Grass_pjwce0_4K_Occlusion.png`);

    [baseColorTexture, metalnessTexture, normalTexture, aoTexture].forEach(texture => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeat.x, repeat.y);
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

    const plane = new THREE.Mesh(planeGeometry, material);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
}


export function addLight(scene: THREE.Scene) {

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

export function makeCamera(): [THREE.PerspectiveCamera, () => void] {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, doorHeight * 0.6, 10);
    camera.lookAt(0, 0, 0);

    let movingDirection: number = 0;
    const moveSpeed = 0.05;
    const onKeyDown = (event: { key: any; }) => {
        switch (event.key) {
            case 'w':
                movingDirection = 1;
                break;
            case 's':
                movingDirection = 2;
                break;
            case 'a':
                movingDirection = 3;
                break;
            case 'd':
                movingDirection = 4;
                break;
            default:
                break;
        }
    };

    const onKeyUp = () => {
        movingDirection = 0;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const moveCamera = function () {
        switch (movingDirection) {
            case 1:
                camera.translateZ(-moveSpeed);
                break;
            case 2:
                camera.translateZ(moveSpeed);
                break;
            case 3:
                camera.translateX(-moveSpeed);
                break;
            case 4:
                camera.translateX(moveSpeed);
                break;
            default:
                break;
        }
    }

    return [camera, moveCamera];
}

export function makeDoor(size: TypeRoomSize): [THREE.Group, (clock: THREE.Clock) => void] {
    const wallDepth = size.depth;

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
        if (open && doorGroup.rotation.y > targetRotationY) {
            doorGroup.rotation.y -= delta * 3.2;
            if (doorGroup.rotation.y < targetRotationY) {
                doorGroup.rotation.y = targetRotationY;
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

function loadTextures(texturePaths: string[], onLoad: (textures: THREE.Texture[]) => void) {
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];
    let loaded = 0;

    texturePaths.forEach((path, index) => {
        loader.load(path, (texture) => {
            textures[index] = texture;
            loaded++;
            if (loaded === texturePaths.length) {
                onLoad(textures);
            }
        });
    });
}

export function addWalls(scene: THREE.Scene, size: TypeRoomSize) {
    // 墙壁
    const wallThickness = 0.12;
    const wallHeight = size.height;
    const wallWidth = size.width;
    const wallDepth = size.depth;

    const wallRoughness = 0.8;
    const wallMetalness = 0.1;
    const halfWallWidth = (wallWidth - doorWidth) * 0.5;

    const texturePaths = [
        `${TEXTURE_BASE}/wall/1/wall_BaseColor.png`,
        `${TEXTURE_BASE}/wall/1/wall_MetallicRoughness.png`,
        `${TEXTURE_BASE}/wall/1/wall_Normal.png`,
        `${TEXTURE_BASE}/wall/1/wall_Occlusion.png`,
    ];

    loadTextures(texturePaths, (originalTextures) => {

        const prepareTextures = (repeat: Vector2, offset = new THREE.Vector2(0, 0)) => {
            return originalTextures.map(texture => {
                const clonedTexture = texture.clone();
                clonedTexture.wrapS = RepeatWrapping;
                clonedTexture.wrapT = RepeatWrapping;
                clonedTexture.repeat.set(repeat.x, repeat.y);
                clonedTexture.offset.set(offset.x, offset.y);
                return clonedTexture;
            });
        };

        const makeMaterial = (textureArray: THREE.Texture[]) => {
            return new THREE.MeshStandardMaterial({
                map: textureArray[0],
                metalnessMap: textureArray[1],
                normalMap: textureArray[2],
                aoMap: textureArray[3],
                metalness: wallMetalness,
                roughness: wallRoughness,
                normalScale: new Vector2(2, 2),
            });
        }

        const mainTextures = prepareTextures(repeat);

        const halfRepeat = new Vector2(
            (wallWidth - doorWidth) / 2 / wallWidth * repeat.x,
            doorHeight / wallHeight * repeat.y
        );
        const halfWallBLTextures = prepareTextures(halfRepeat, new Vector2(0, doorHeight / wallHeight));
        const halfWallBRTextures = prepareTextures(halfRepeat, new Vector2((doorWidth * repeat.x - wallWidth) / (2 * wallWidth), doorHeight / wallHeight));
        const halfWallTTextures = prepareTextures(new Vector2(repeat.x, (wallHeight - doorHeight) / wallHeight * repeat.y));


        const createWall = (width: number, height: number, depth: number, position: THREE.Vector3, material: THREE.Material) => {
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(position.x, position.y, position.z);
            scene.add(mesh);
        };
        const material = makeMaterial(mainTextures)
        createWall(wallWidth, wallHeight, wallThickness, new THREE.Vector3(0, wallHeight / 2, -wallDepth / 2), material);
        createWall(wallThickness, wallHeight, wallDepth, new THREE.Vector3(-wallWidth / 2, wallHeight / 2, 0), material);
        createWall(wallThickness, wallHeight, wallDepth, new THREE.Vector3(wallWidth / 2, wallHeight / 2, 0), material);
        createWall(wallWidth, wallThickness, wallDepth, new THREE.Vector3(0, wallHeight - wallThickness / 2, 0), material);

        createWall(halfWallWidth, doorHeight, wallThickness, new THREE.Vector3(-(halfWallWidth + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5), makeMaterial(halfWallBLTextures));
        createWall(halfWallWidth, doorHeight, wallThickness, new THREE.Vector3((halfWallWidth + doorWidth) * 0.5, doorHeight * 0.5, wallDepth * 0.5), makeMaterial(halfWallBRTextures));
        createWall(wallWidth, wallHeight - doorHeight, wallThickness, new THREE.Vector3(0, (wallHeight + doorHeight) * 0.5, wallDepth * 0.5), makeMaterial(halfWallTTextures));
    })
}

export function addSky(scene: THREE.Scene, renderer: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera) {
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