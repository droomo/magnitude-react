
let base_url = 'https://dev1.droomo.com'

if (window.location.href.indexOf('127.0.0.1') > -1) {
    base_url = 'http://127.0.0.1:8000'
}

export const API = {
    base_url: base_url
}
