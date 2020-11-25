import { Component, Vue, Prop } from 'vue-property-decorator';

import * as ol from 'ol'
import { Coordinate } from 'ol/coordinate';
import * as ol_proj from 'ol/proj'

import MapOverlay from 'tivigi/src/components/gis/MapOverlay/MapOverlay'

import WithRender from './MyLocationTool.html';

import './MyLocationTool.scss'


@WithRender
@Component({
    components: {        
        MapOverlay
    }
})


export default class MyLocationTool extends Vue {

    @Prop()
    map!: ol.Map;

    @Prop({ default: 15 })
    zoom! : number

    coords: Coordinate = [0, 0];



    mounted() {
        this.showLocation()
    }


    showLocation() {
        if (navigator.geolocation != undefined) {

            navigator.geolocation.getCurrentPosition(this.onGeolocationSuccess, this.onGeolocationError);

        } else {
            alert('Ihr Browser unterstützt keine Geolocation.')            
        }
    }


    // NOTE: The type of 'position' should be 'Position', but specifying this causes a build error
    onGeolocationSuccess(position: any) {

        this.map.getView().setCenter(ol_proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', this.map.getView().getProjection()))
        this.map.getView().setZoom(this.zoom)

        this.coords = [position.coords.longitude, position.coords.latitude]

        this.$emit("locationsuccess", position)
    }


    // NOTE: The type of 'error' should be 'PositionError', but specifying this causes a build error
    onGeolocationError(error: any) {
        alert("Ihr Standort konnte nicht ermittelt werden.")

        this.$emit("locationerror", error)

    }
}
