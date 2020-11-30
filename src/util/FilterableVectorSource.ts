import * as ol from 'ol'
import { Coordinate } from 'ol/coordinate'
import { Geometry } from 'ol/geom'
import VectorSource from 'ol/source/Vector'
export class FilterableVectorSource extends VectorSource {


    filterConfig : any = {
       // "land" : "Deutschland"
    }


    passesFilter(feature: ol.Feature): boolean {

        let props = feature.getProperties()

        for(let key in this.filterConfig) {      
            if (props[key] != this.filterConfig[key]) {
                return false
            }
        }      

        return true
    }


    getFeaturesAtCoordinate(coordinate : Coordinate) : ol.Feature<Geometry>[] {
        let allFeatures = super.getFeaturesAtCoordinate(coordinate)

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

        let result = new Array<ol.Feature<Geometry>>()

        for (let feature of allFeatures) {

            if (this.passesFilter(feature)) {
                result.push(feature)
            }


        }

        return result
    }


    setFilter(filterConfig : any) {
        this.filterConfig = filterConfig
        this.changed()
    }


}
