import * as ol from 'ol'
import * as ol_layer from 'ol/layer'

let defaults = ['Name', 'name', 'NAME', 'kreis_name', 'gemeinde_name', 'gen', 'GEN']


export function getFeatureLabelField(layer: ol_layer.Vector, feature : ol.Feature|null = null) : string|null {

    // First, try to fetch a configured label field from the layer object:
    let labelField = layer.get('gfiLabelField')

    if (labelField != undefined) {
        return labelField
    }

    // If this fails, check whether one from the list of defaults exists on the passed feature:

    if (feature == null) {
        return null
    }

    for (let key of defaults) {
        if (feature.getProperties()[key] != undefined) {
            return key
        }
    }

    return null
}




export function getFieldLabel(key: string, fieldsConfig : any): string {

    if (fieldsConfig == undefined || fieldsConfig == null || fieldsConfig[key] == undefined) {
        return key
    }

    let config = fieldsConfig[key]

    if (typeof config == "string") {
        return config
    }

    if (!config['label']) {
        return key
    }

    return config['label']
}
