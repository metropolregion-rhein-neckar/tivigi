import * as ol from 'ol'
import { FeatureLike } from 'ol/Feature'
import * as ol_layer from 'ol/layer'


export class MapQueryResultEntry {
    constructor(public layer: ol_layer.Layer, public features: Array<ol.Feature> = []) {

    }
}

export class MapQueryResultSet {
    entries = Array<MapQueryResultEntry>()

    add(feature: ol.Feature, layer: ol_layer.Layer) {

        for (let entry of this.entries) {
            if (entry.layer == layer) {
                if (!entry.features.includes(feature)) {
                    entry.features.push(feature)
                    return
                }
            }
        }

        let entry = new MapQueryResultEntry(layer)
        this.entries.push(entry)

        entry.features.push(feature)
    }


    numFeatures(): number {
        let result = 0

        for (let entry of this.entries) {
            result += entry.features.length
        }

        return result
    }
}


// This function collects all "sub-features" from a cluster source feature:
export function getClusteredFeaturesRecursive(feature: FeatureLike): Array<FeatureLike> {

    let result = Array<FeatureLike>()

    if (feature.getProperties().features instanceof Array) {

        for (let f2 of feature.getProperties().features) {
            result = result.concat(getClusteredFeaturesRecursive(f2))
        }
    }
    else {

        result.push(feature)
    }

    return result
}

