import * as ol from 'ol'
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
