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

export const API = {
    base_url: `${scheme}://${base_host}:7000`,
    texture_base_url: `${scheme}://${base_host}:9000`,
}

const TEXTURE_BASE = API.texture_base_url;

const page_data_doc = document.getElementById('page_data');
const page_data_str = page_data_doc?.innerText || '{}';
export const page_data = JSON.parse(page_data_str);

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

export const DELAY_TRIAL_START_MASK = 300; // ms
export const DELAY_INFORM_REACTION_TYPE = 1000; // ms
export const DELAY_TRIAL_DONE = 1000; // ms


export const material_map = {
    groundD: `${TEXTURE_BASE}/ground/outdoor/ground_D.EXR`,
    groundN: `${TEXTURE_BASE}/ground/outdoor/ground_N.EXR`,
    doorD: `${TEXTURE_BASE}/door/door_D.EXR`,
    doorN: `${TEXTURE_BASE}/door/door_N.EXR`,
    dadoD: `${TEXTURE_BASE}/wall/external/dado/model_D.EXR`,
    dadoN: `${TEXTURE_BASE}/wall/external/dado/model_N.EXR`,
    wallExternalD: `${TEXTURE_BASE}/wall/external/Decorative/T_Decorative_Wall_Tiles_vlqvfdj_1K_D.EXR`,
    wallExternalN: `${TEXTURE_BASE}/wall/external/Decorative/T_Decorative_Wall_Tiles_vlqvfdj_1K_N.EXR`,
    dadoModel: `${TEXTURE_BASE}/wall/external/dado/model.FBX`,
}

export const floorNameList = [
    "T_Stained_Patterned_Floor_xephfh3_1K_",
    "T_Painted_Cast_In_Situ_Concrete_ve4gdealw_1K_",
    "T_Decorative_Stone_Wall_xblncfx_1K_",
    "T_Concrete_Pavement_xeohbekga_1K_",
    "T_Stucco_Facade_vftlabg_1K_",
    "T_Stucco_Facade_wbzlche_1K_",
    "T_Concrete_Floor_wjvnbhe_1K_",
    "T_Wooden_Floor_wdipfjw_1K_",
    "T_Plywood_vf1oairg_1K_",
    "T_Stucco_Facade_vlsmbe1_1K_",
    "T_Grassy_Soil_xbreair_1K_",
    "T_Weathered_Concrete_Wall_vi4idbm_1K_",
    "T_Slate_Floor_Tiles_wfribhq_1K_",
    "T_Wood_Stamped_Concrete_Floor_vlkhdgn_1K_",
    "T_Slate_Flooring_wfqhbdh_1K_",
    "T_Stucco_Facade_vhhleat_1K_",
    "T_Stucco_Facade_wb0ieba_1K_",
    "T_Damaged_Concrete_Floor_vizbefe_1K_",
    "T_Worn_Wooden_Planks_whnfbg3_1K_",
    "T_Construction_Rubble_xephfcjs_1K_",
    "T_Stucco_Facade_vjptaaf_1K_",
    "T_Stucco_Facade_vftkefk_1K_",
    "T_Wooden_Planks_wcboeghs_1K_"
]

export const wallNameList = [
    "T_Painted_Wall_Plaster_xevifcds_1K_",
    "T_Stucco_Wall_ve4meimcw_1K_",
    "T_Worn_Paint_Wall_vjyifds_1K_",
    "T_Stucco_Wall_vigrejf_1K_",
    "T_Brick_Wall_xbjeffk_1K_",
    "T_Decorative_Wall_Tiles_vlqvfdj_1K_",
    "T_Flagstone_Wall_vkmfaek_1K_",
    "T_Plaster_Wall_xepmej1ga_1K_",
    "T_Brick_Wall_xertbj1_1K_",
    "T_Brick_Wall_vhhkfjp_1K_",
    "T_Stone_Wall_xblhejj_1K_",
    "T_Painted_Wall_Plaster_xepkaecs_1K_",
    "T_Concrete_Wall_vjyifdc_1K_",
    "T_Cob_Wall_vkodejq_1K_",
    "T_Flaked_Paint_Wall_vhqkdfx_1K_",
    "T_Stone_Wall_xboicaz_1K_"
]

const exr_loader = new EXRLoader();
const fbx_loader = new FBXLoader();
const texture_loader = new TextureLoader();

function loader_selector(file_name: string) {
    if (file_name.endsWith('.EXR')) {
        return exr_loader;
    } else if (file_name.endsWith('.FBX')) {
        return fbx_loader;
    }
    return texture_loader;
}

setTimeout(() => {
    for (const material_name of Object.values(material_map)) {
        loader_selector(material_name).load(material_name, function (texture) {
            console.log(`{${texture.uuid}} ${material_name} loaded`);
        });
    }
    for (const name of wallNameList) {
        const texture_name = `${TEXTURE_BASE}/wall/internal/${name}`
        for (const type of ['N', 'D']) {
            exr_loader.load(`${texture_name}${type}.EXR`, function (texture) {
                console.log(`{${texture.uuid}} ${texture_name} loaded`);
            });
        }
    }
    for (const name of floorNameList) {
        const texture_name = `${TEXTURE_BASE}/floor/${name}`
        for (const type of ['N', 'D']) {
            exr_loader.load(`${texture_name}${type}.EXR`, function (texture) {
                console.log(`{${texture.uuid}} ${texture_name} loaded`);
            });
        }
    }
})
