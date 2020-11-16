import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

//################# BEGIN OpenLayers imports #################
import * as ol from 'ol/'
import * as ol_layer from 'ol/layer'
import * as ol_source from 'ol/source'
import { CollectionEvent } from 'ol/Collection';
import BaseLayer from 'ol/layer/Base';
//################# END OpenLayers imports #################

import ProgressBar from '../../ProgressBar/ProgressBar'

import WithRender from './MapLoadingProgressBar.html';


@WithRender
@Component({
    components: {
        ProgressBar
    }
})
export default class MapLoadingProgressBar extends Vue {

    //################ BEGIN Props #################
    @Prop()
    map!: ol.Map;

    @Prop({ default: () => { return true } })
    showPercent!: boolean

    @Prop({ default: () => { return false } })
    fadeout!: boolean
    //################ END Props #################

    total = 0
    complete = 0
    progress = 0
    done = false

    sources = new Set<ol_source.Source>()


    @Watch('map')
    onMapChange() {
        this.init()
    }


    beforeDestroy() {


        if (this.map instanceof ol.Map) {
            this.map.getLayers().un("add", this.onLayerAdd)
        }


        for (let source of this.sources) {
            source.un('tileloadstart', this.onTileLoadStart)
            source.un('tileloadend', this.onTileLoadEnd)
            source.un('tileloaderror', this.onTileLoadError)
        }
    }


    init() {

        this.progress = 0

        if (!(this.map instanceof ol.Map)) {
            return
        }

        this.map.getLayers().on("add", this.onLayerAdd)

        for (let layer of this.map.getLayers().getArray()) {
            this.registerLayer(layer)
        }
    }


    mounted() {
        this.init()
    }


    onLayerAdd(evt: CollectionEvent<BaseLayer>) {
        this.registerLayer(evt.element)
    }


    onTileLoadStart() {

        if (this.done) {
            this.complete = 0
            this.total = 0
            this.progress = 0

            this.done = false
        }

        this.total++

        this.updateProgress()
    }


    onTileLoadEnd() {

        this.complete++
  
        this.updateProgress()
    }


    onTileLoadError() {

        this.complete++
      
        this.updateProgress()
    }


    registerLayer(layer: BaseLayer) {

        let source = (layer as ol_layer.Layer).getSource()

        if (source != null) {
            this.sources.add(source)

            source.on('tileloadstart', this.onTileLoadStart)
            source.on('tileloadend', this.onTileLoadEnd)
            source.on('tileloaderror', this.onTileLoadError)
        }
    }


    updateProgress() {

        if (this.total <= 0) {
            this.progress = 0
        }
        else {

            if (this.complete == this.total) {
                this.done = true
            }

            this.progress = Math.max(this.progress, this.complete / this.total)
        }
    }
}
