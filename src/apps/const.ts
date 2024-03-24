import * as THREE from "three";
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {Group, Texture, TextureLoader} from "three";

THREE.Cache.enabled = true;

let base_host = 'xr.droomo.com'
let scheme = 'https'

if (window.location.href.indexOf(base_host) === -1) {
    scheme = 'http'
    base_host = window.location.hostname
}

export const API: {
    base_url: string,
    texture_base_url: string,
    ws_url: string,
} = {
    base_url: `${scheme}://${base_host}:8023`,
    ws_url: `wss://${base_host}:8023`,
    texture_base_url: `${scheme}://${base_host}:19000`,
}

const TEXTURE_BASE = API.texture_base_url;

const page_data_doc = document.getElementById('page_data');
const page_data_str = page_data_doc?.innerText || '{}';
export const page_data = JSON.parse(page_data_str);

export const api_subject = `${API.base_url}${page_data['api_subject']}`

export function getCsrfToken() {
    return getCookie('csrftoken')
}

export function getCookie(name: string) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const cookieName = cookie.split('=')[0];
        const cookieValue = cookie.split('=')[1];
        if (cookieName === name) {
            return cookieValue;
        }
    }
    return undefined;
}

export const getTimestamp = function () {
    return window.performance.now();
}

export const DELAY_TRIAL_START_MASK = 1000; // ms

export const floorNameList = [
    "T_Wood_Stamped_Concrete_Floor_vlkhdgn_1K",
    // "T_Concrete_Pavement_xeohbekga_1K",
    // "T_Stucco_Facade_vftlabg_1K",
    // "T_Slate_Flooring_wfqhbdh_1K", // 太重复
    // "T_Stained_Patterned_Floor_xephfh3_1K", // too many repeat
    // "T_Painted_Cast_In_Situ_Concrete_ve4gdealw_1K", // 太单调
    // "T_Decorative_Stone_Wall_xblncfx_1K", // 横向条纹
    // "T_Stucco_Facade_wbzlche_1K", // 太单调纯色
    // "T_Concrete_Floor_wjvnbhe_1K", // 太花哨
    // "T_Wooden_Floor_wdipfjw_1K", // 横向条纹
    // "T_Plywood_vf1oairg_1K", // 摩尔纹
    // "T_Stucco_Facade_vlsmbe1_1K", // 太单调纯色
    // "T_Grassy_Soil_xbreair_1K", // 草地
    // "T_Weathered_Concrete_Wall_vi4idbm_1K", // 太花哨
    // "T_Slate_Floor_Tiles_wfribhq_1K", // 太花哨
    // "T_Stucco_Facade_vhhleat_1K", // 太单调纯色
    // "T_Stucco_Facade_wb0ieba_1K", // 太单调纯色
    // "T_Damaged_Concrete_Floor_vizbefe_1K", // 太重复
    // "T_Worn_Wooden_Planks_whnfbg3_1K", // 纵向条纹
    // "T_Construction_Rubble_xephfcjs_1K", // 太重复
    // "T_Stucco_Facade_vjptaaf_1K", // 太单调纯色
    // "T_Stucco_Facade_vftkefk_1K", // 太单调纯色
    // "T_Wooden_Planks_wcboeghs_1K" // 横向条纹
]

export const wallNameList = [
    "T_Painted_Wall_Plaster_xepkaecs_1K",
    // "T_Stucco_Wall_vigrejf_1K",
    // "T_Stucco_Wall_ve4meimcw_1K",
    "T_Brick_Wall_vhhkfjp_1K", // 砖头
    // "T_Painted_Wall_Plaster_xevifcds_1K",// 太重复
    // "T_Worn_Paint_Wall_vjyifds_1K", // 太重复
    // "T_Brick_Wall_xbjeffk_1K", // 砖头
    // "T_Decorative_Wall_Tiles_vlqvfdj_1K", // 岩石板
    // "T_Flagstone_Wall_vkmfaek_1K",// 岩石
    // "T_Plaster_Wall_xepmej1ga_1K", // 太重复
    // "T_Brick_Wall_xertbj1_1K", // 砖头
    // "T_Stone_Wall_xblhejj_1K",// 岩石板
    // "T_Concrete_Wall_vjyifdc_1K",// 太重复
    // "T_Cob_Wall_vkodejq_1K",// 太重复
    // "T_Flaked_Paint_Wall_vhqkdfx_1K",// 太重复
    // "T_Stone_Wall_xboicaz_1K"// 岩石板
]

const exr_loader = new EXRLoader();

export function getFloorUrl(name: string, type: string) {
    return `${TEXTURE_BASE}/floor/${name}_${type}.EXR`
}

export function getWallUrl(name: string, type: string) {
    return `${TEXTURE_BASE}/wall/internal/${name}_${type}.EXR`
}

const roomWall = {
    wall: {
        D: getWallUrl(wallNameList[0], 'D'),
        N: getWallUrl(wallNameList[0], 'N'),
    },
    floor: {
        D: getFloorUrl(floorNameList[0], 'D'),
        N: getFloorUrl(floorNameList[0], 'N'),
    },
    ceiling: {
        D: getWallUrl(wallNameList[0], 'D'),
        N: getWallUrl(wallNameList[0], 'N'),
    },
}

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


export let mapWall = new THREE.Texture();
export let normalWall = new THREE.Texture();
export let mapFloor = new THREE.Texture();
export let normalFloor = new THREE.Texture();
loadThings(
    [roomWall.wall.D, roomWall.wall.N, roomWall.floor.D, roomWall.floor.N],
    ([map, normal, mapf, normalf]) => {
        mapWall = map as Texture;
        normalWall = normal as Texture;
        mapFloor = mapf as Texture;
        normalFloor = normalf as Texture;
    },
    exr_loader
);

export enum BlockType {
    Space = 'S',
    Distance = 'D'
}

export const DEBUG = window.location.search.toLowerCase().includes('debug')

window.oncontextmenu = function (e) {
    e.preventDefault();
}

export const WS_CONTROL_COMMAND: {[key: string]: string} = {
    start_session: 'start_session',
    enter_shape: 'enter_shape',
    enter_room: 'enter_room',
    start_test_exp: 'start_test',
    start_formal_exp: 'start_exp',
    start_exp_event: 'start_exp_event',
    done_trial_event: 'done_trial_event',
    loss_session: 'loss_session',
    subject_done: 'subject_done',
    subject_login: 'subject_login',
    update_trial: 'update_trial',
}

const texture = new THREE.TextureLoader().load(`${TEXTURE_BASE}/src/disc.png`);
texture.colorSpace = THREE.SRGBColorSpace;
export const pointsMaterial = new THREE.PointsMaterial({
    color: 0x0080ff,
    map: texture,
    size: 0.2,
    alphaTest: 0.7
});
