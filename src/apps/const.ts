let base_host = 'dev1.droomo.com'
let scheme = 'https'

if (window.location.href.indexOf(base_host) === -1) {
    scheme = 'http'
    base_host = window.location.hostname
}

export const API = {
    base_url: `${scheme}://${base_host}:8000/`,
    texture_base_url: `${scheme}://${base_host}:9000/`,
}
