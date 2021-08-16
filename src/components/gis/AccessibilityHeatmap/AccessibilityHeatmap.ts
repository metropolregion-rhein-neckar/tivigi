import { Component, Prop, Vue, Watch, } from 'vue-property-decorator';

import { createLayerFromConfig } from 'tivigi/src/util/mapLayerLoading';

import * as ol from 'ol/'

import WithRender from './AccessibilityHeatmap.html';



@WithRender
@Component({
    components: {
    },
})
export default class ActiveLayers extends Vue {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop()
    goatApi!:string;
    //################# END Props #################

    heatmapActive: boolean=false;
    activeLayers:any = null;
    heatmapLayer: any = null;
    heatmapId:string = "heatmap_default"

    // source layer config
    wmsConfig:any  = {
                        baseUrl: "https://geoserver.digitale-mrn.de/geoserver/metropolatlas/wms",
                        title: "Erreichbarkeit",
                        type: "wms-single",
                        level: 2,
                        properties:{
                                "percentile_accessibility": "Erreichbarkeits Score"
                        },
                        urlParams: {
                            layers: this.heatmapId
                        }   
                    }



    @Watch('map')
    async onMapChange(){
        await this.init()
    }

    async mounted(){
        await this.init()
    }

    async init() {


        if (!(this.map instanceof ol.Map)) {
            return
        }


        this.map.getLayers().on("remove", this.addHeatmap)
        this.map.getLayers().on("add", this.addHeatmap)
    }
    
    async addHeatmap(){

        let layerIds:Array<any> = this.getLayers()

        // Abort and remove heatmap if nothing selected
        if(layerIds.length == 0){

            this.map.getLayers().getArray()
                        .filter(layer => layer.get('id') === this.heatmapId)
                        .forEach(layer => this.map.removeLayer(layer));

            this.activeLayers = []
            this.heatmapActive = false

            return
        }

        if(this.activeLayers != null){
            this.activeLayers.sort() 
            layerIds.sort()
        }
        // heatmap got removed
        if(this.activeLayers != null && layerIds.toString() == this.activeLayers.toString()){
            this.heatmapActive = false
            return
        }
        // set active Layers
        this.activeLayers = layerIds
       
        // this just updates the table in the database
        await new GOAT(this.goatApi, layerIds).requestHeatmaps()


        this.heatmapLayer = createLayerFromConfig(this.wmsConfig, this.map.getView().getProjection())
        this.heatmapLayer.set("id", this.heatmapId)


        //######## Check again if heatmap active. Neccessary, otherwise heatmap will be loaded 5 times#############
        for (let layer of this.map.getLayers().getArray()) {
            if (layer.get('id') == this.heatmapId) {
                this.heatmapActive = true
            }
        }
        //console.log(this.heatmapActive)
        if(this.heatmapActive){

            // ignore type error, getLayers()--> collecltion of type Baselayer --> Baselayer has not getSource --> but heatmap is not a Baselayer
            this.map.getLayers().getArray()
            .filter(layer => layer.get('id') === this.heatmapId)
            //@ts-expect-error: Let's ignore a compile error like this unreachable code 
            .forEach(layer => layer.getSource().updateParams({'TIMESTAMP': new Date().getTime()}));

            //this.map.addLayer(this.heatmapLayer)

        }
        else{
            this.heatmapActive = true;
            this.map.addLayer(this.heatmapLayer)
        }

    }
    
    getLayers() {

        let layerIds: any = []

        if (!(this.map instanceof ol.Map)) {
            return layerIds
        }

        for (let layer of this.map.getLayers().getArray()) {

            let showLegend = true

            if (layer.get('showLegend') != undefined) {
                showLegend = layer.get('showLegend')
            }

            if (showLegend && layer.get('id') != this.heatmapId) {
                layerIds.push(layer.get('id'))
            }

            if(this.heatmapActive == false && layer.get('id') == this.heatmapId){
                this.heatmapActive = true
            }
        }


        return layerIds
    
    }

    
}



class GOAT{
    constructor(public baseUrl:string, public ids:Array<string>){ }

    payload:any = {"scenario_id_input":0,
                    "pois":{},
                    "heatmap_type":"heatmap_gravity",
                    "modus_input":"default",
                    "return_type":"geobuf"}

    createPayload(){
        for(let id of this.ids){

            this.payload.pois[id] = {"sensitivity":300000,"weight":1}

        }
    }
  
    async requestHeatmaps(){

        this.createPayload()
        let result = await fetch(this.baseUrl,{method: 'POST', 
                                                mode: 'cors',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                    // 'Content-Type': 'application/x-www-form-urlencoded',
                                                },                                 
                                                body:JSON.stringify(this.payload)})
                                            }
    
}
