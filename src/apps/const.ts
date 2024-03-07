import * as THREE from "three";
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
