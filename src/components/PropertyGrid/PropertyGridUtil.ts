export function getValueType(key : string, fieldsConfig : any = undefined ) : string|undefined {
        
    let result = undefined

    if (key.startsWith("image_urls_")) {
        result = "image_urls"
    }

    if (fieldsConfig == undefined) {
        return result
    }
    
    if (fieldsConfig[key] == undefined) {
        return result
    }

    let config = fieldsConfig[key]

    if (config['type'] == undefined) {
        return result        
    }

    return config['type']    
}
