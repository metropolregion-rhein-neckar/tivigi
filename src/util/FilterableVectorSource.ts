import * as ol from 'ol'
import { Coordinate } from 'ol/coordinate'
import { Geometry } from 'ol/geom'
import VectorSource from 'ol/source/Vector'
export class FilterableVectorSource extends VectorSource {

    filterConfig : any = {}


    getAllFeatures() {
        return super.getFeatures()
    }

    getFeaturesAtCoordinate(coordinate : Coordinate) : ol.Feature<Geometry>[] {
        let allFeatures = super.getFeaturesAtCoordinate(coordinate)

        if (this.filterConfig == null) {
       //     return allFeatures
        }

        let result = new Array<ol.Feature<Geometry>>()

        for (let feature of allFeatures) {

            if (this.passesFilter(feature)) {
                result.push(feature)
            }
        }

        return result
    }
  

    getFeaturesInExtent(extent : any) : ol.Feature<Geometry>[]{
        let allFeatures = super.getFeaturesInExtent(extent)

        if (this.filterConfig == null) {
            return allFeatures
        }

        let result = new Array<ol.Feature<Geometry>>()

        for (let feature of allFeatures) {

            if (this.passesFilter(feature)) {
                result.push(feature)
            }
        }

        return result
    }


    getFeatures(): ol.Feature<Geometry>[] {
        let allFeatures = super.getFeatures()

        if (this.filterConfig == null) {
            return allFeatures
        }


        let result = new Array<ol.Feature<Geometry>>()

        for (let feature of allFeatures) {

            if (this.passesFilter(feature)) {
                result.push(feature)
            }
        }

        return result
    }


    getFilter(): any {
        return this.filterConfig
    }


    passesFilter(feature: ol.Feature): boolean {

        if (this.filterConfig == null) {
            return true
        }


        let props = feature.getProperties()

        for(let key in this.filterConfig) { 
            if (this.filterConfig[key] == undefined || this.filterConfig[key] == null) {
                continue
            }
            
            if (props[key] != this.filterConfig[key]) {
                return false
            }
        }      

        return true
    }


    setFilter(filterConfig : any) {
        this.filterConfig = filterConfig
        this.changed()
    }
}
