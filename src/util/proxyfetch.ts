export let config = {
    "proxyUrl": "",
    "proxyEnabled" : true
}


export function getProxyUrl(url : string) : string {

    let result = url

    if (config.proxyEnabled && config.proxyUrl != "") {
        result = config.proxyUrl + encodeURIComponent(url)
    }
    
    return result
}


// TODO: 4 Add option to not use proxy
export function proxyfetch(url: string, options : RequestInit = {}, proxyForRelativeUrl = false): Promise<Response> {

    // For local testing:
    if (url.startsWith("http://localhost") || url.startsWith("https://localhost")) {
        return fetch(url, options)
    }

    if ((url.startsWith("http://") || url.startsWith("https://") || proxyForRelativeUrl) && config.proxyEnabled) {

        url = getProxyUrl(url)
    }

    return fetch(url, options)
}
