import * as THREE from "three";
import {EXRLoader} from "three/examples/jsm/loaders/EXRLoader";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {TextureLoader} from "three";

THREE.Cache.enabled = true;

let base_host = 'dev1.droomo.com'
let scheme = 'https'

if (window.location.href.indexOf(base_host) === -1) {
    scheme = 'http'
    base_host = window.location.hostname
}

export const API: {
    base_url: string,
    texture_base_url: string,
} = {
    base_url: `${scheme}://${base_host}:8023`,
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
export const DELAY_INFORM_REACTION_TYPE = 1000; // ms
export const DELAY_TRIAL_DONE = 1000; // ms


export const material_map = {
    walkGroundD: `${TEXTURE_BASE}/floor/T_Wood_Stamped_Concrete_Floor_vlkhdgn_1K_D.EXR`,
    walkGroundN: `${TEXTURE_BASE}/floor/T_Wood_Stamped_Concrete_Floor_vlkhdgn_1K_N.EXR`,
    groundD: `${TEXTURE_BASE}/ground/outdoor/ground_D.EXR`,
    groundN: `${TEXTURE_BASE}/ground/outdoor/ground_N.EXR`,
    doorD: `${TEXTURE_BASE}/door/door_D.EXR`,
    doorN: `${TEXTURE_BASE}/door/door_N.EXR`,
    dadoD: `${TEXTURE_BASE}/wall/external/dado/model_D.EXR`,
    dadoN: `${TEXTURE_BASE}/wall/external/dado/model_N.EXR`,
    wallExternalD: `${TEXTURE_BASE}/wall/external/Decorative/T_Decorative_Wall_Tiles_vlqvfdj_1K_D.EXR`,
    wallExternalN: `${TEXTURE_BASE}/wall/external/Decorative/T_Decorative_Wall_Tiles_vlqvfdj_1K_N.EXR`,
    dadoModel: `${TEXTURE_BASE}/wall/external/dado/model.FBX`,
    bookModel: `${TEXTURE_BASE}/book/book.FBX`,
    bookN: `${TEXTURE_BASE}/book/bookN.EXR`,
    bookD: `${TEXTURE_BASE}/book/bookD.EXR`,
}

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
    // "T_Brick_Wall_vhhkfjp_1K", // 砖头
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
const fbx_loader = new FBXLoader();
const texture_loader = new TextureLoader();

export function loader_selector(file_name: string) {
    if (file_name.endsWith('.EXR')) {
        return exr_loader;
    } else if (file_name.endsWith('.FBX')) {
        return fbx_loader;
    }
    return texture_loader;
}

export function getFloorUrl(name: string, type: string) {
    return `${TEXTURE_BASE}/floor/${name}_${type}.EXR`
}

export function getWallUrl(name: string, type: string) {
    return `${TEXTURE_BASE}/wall/internal/${name}_${type}.EXR`
}

const floor_url_list = [
    ...floorNameList.map(name => getFloorUrl(name, 'D')),
    ...floorNameList.map(name => getFloorUrl(name, 'N'))
]
const wall_url_list = [
    ...wallNameList.map(name => getWallUrl(name, 'D')),
    ...wallNameList.map(name => getWallUrl(name, 'N'))
]
for (const url of [...floor_url_list, ...wall_url_list]) {
    exr_loader.load(url, function (texture) {
        console.log(`{${texture.uuid}} ${url} loaded`);
    });
}

export function getRandomElement(arr: string[]) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

export enum BlockType {
    Space = 'S',
    Distance = 'D'
}

export const DEBUG = window.location.search.toLowerCase().includes('debug')

if (window.location.pathname.includes('intro')) {
    for (const material_name of Object.values(material_map)) {
        loader_selector(material_name).load(material_name, function (texture) {
            console.log(`{${texture.uuid}} ${material_name} loaded`);
        });
    }
}

window.oncontextmenu=function(e){
    e.preventDefault();
}
