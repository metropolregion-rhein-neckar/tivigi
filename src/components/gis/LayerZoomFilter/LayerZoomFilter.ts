import { Component, Prop, Vue, Watch, } from 'vue-property-decorator';

import * as ol from 'ol/'

import WithRender from './LayerZoomFilter.html';
import FloatingWindow from 'tivigi/src/components/FloatingWindow/FloatingWindow'



@WithRender
@Component({
    components: {
        FloatingWindow
    },
})
export default class ActiveLayers extends Vue {

    //################# BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop({default:12})
    minZoom!:number

    @Prop({default:[]})
    exceptions!:Array<string>
    //################# END Props #################

    zoomBool:boolean = false

    

    @Watch('map')
    onMapChange(){
         this.init()
    }

    mounted(){
         this.init()
    }

    init() {

        if (!(this.map instanceof ol.Map)) {
            return
        }
        this.map.getLayers().on("add", this.setMinZoom)
        this.map.on('moveend', this.updateIndication)
        this.map.getLayers().on("remove", this.updateIndication)
        this.map.getLayers().on("add", this.updateIndication)


    }
    
   
    setMinZoom(){
        if (!(this.map instanceof ol.Map)) {
            return
        }        
        
        for (let layer of this.map.getLayers().getArray()) {

            if(!this.exceptions.includes(layer.get('id'))){
                layer.setMinZoom(this.minZoom)
            }
        }
    }

    updateIndication(){

        if (!(this.map instanceof ol.Map)) {
            return
        }
        
        let currZoom:any = this.map.getView().getZoom()

        let activeLayers:any = []
        
        for (let layer of this.map.getLayers().getArray()) {

            if(!this.exceptions.includes(layer.get('id'))){
                
                activeLayers.push(layer.get('title'))

            }

        }

        if(activeLayers.length == 0 || this.minZoom <= currZoom){
            this.zoomBool = true
        }
        else{
            this.zoomBool = false
        }
    }
    
}


