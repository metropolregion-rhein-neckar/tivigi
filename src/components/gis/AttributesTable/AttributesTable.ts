import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//################# BEGIN OpenLayers imports ###############
import * as ol from 'ol'
import * as ol_layer from 'ol/layer'
import VectorSource from 'ol/source/Vector';
import { FeatureLike } from 'ol/Feature';
//################# END OpenLayers imports ###############

//################# BEGIN Tivigi imports #################
import TableView from '../../TableView/TableView'
import { FieldConfig } from 'tivigi/src/util/FieldConfig';
import FeatureHighlightTool from 'tivigi/src/components/gis/FeatureHighlightTool/FeatureHighlightTool'
import FeatureSelectTool from 'tivigi/src/components/gis/FeatureSelectTool/FeatureSelectTool'

//################# END Tivigi imports #################

import './AttributesTable.scss'

import WithRender from './AttributesTable.html';


@WithRender
@Component({
    components: {
        FeatureHighlightTool,
        FeatureSelectTool,
        TableView        
    },
})
export default class AttributesTable extends Vue {

    //################### BEGIN Props #####################
    @Prop({ default: null })
    fieldsConfig!: Array<FieldConfig>


    @Prop()
    layer!: ol_layer.Vector

    @Prop()
    map!: ol.Map

    
    selectedCol: FieldConfig | null = null

    hoverFeature: ol.Feature | null = null
    selectedFeature: ol.Feature | null = null
    //################### END Props #####################


    pFieldsConfig = this.fieldsConfig
    
    pLayer: ol_layer.Vector = this.layer
    pSelectedCol: FieldConfig | null = this.selectedCol
    
  

    data: Array<any> = []

    @Watch("selectedFeature") 
    onSelectedFeatureChange() {
        console.log("change")
    }


    @Watch('fieldsConfig')
    onFieldsConfigChange() {
        this.pFieldsConfig = this.fieldsConfig
    }
    

    @Watch('layer')
    onLayerChange() {

        this.pLayer = this.layer

        this.init()
    }


    

    beforeDestroy() {

        if (!(this.pLayer instanceof ol_layer.Layer)) {
            return
        }

    
        let source = this.pLayer.getSource()

        source.un('change', this.onSourceChange)
    }


    mounted() {
        this.init()
    }


    init() {

        if (!(this.pLayer instanceof ol_layer.Layer)) {
            return
        }

        let source = this.pLayer.getSource()

        if (!(source instanceof VectorSource)) {
            console.log("Not a vector source: " + this.pLayer.get('title'))
            return
        }

        source.on('change', this.onSourceChange)

        this.onSourceChange()
    }


    onSourceChange() {

        if (!(this.pLayer instanceof ol_layer.Layer)) {
            return
        }

        this.data = []

        for (let f of this.pLayer.getSource().getFeatures()) {
            this.addFeature(f)
        }

        this.updateFieldsConfig()
    }



    addFeature(feature: FeatureLike) {


        // Handle cluster layer features:
        if (feature.getProperties().features instanceof Array) {

            for (let f2 of feature.getProperties().features) {
                this.addFeature(f2)
            }

            return
        }

        this.data.push(feature)
    }


    updateFieldsConfig() {

        if (this.fieldsConfig != undefined) {
            this.pFieldsConfig = this.fieldsConfig
            return
        }


        this.pFieldsConfig = []


        let propConfig = this.layer.get('propertyLabels')

        if (propConfig != undefined) {

            for (let key in propConfig) {

                let label = propConfig[key]

                // Support for complex field definitions:
                if (propConfig[key].label != undefined) {
                    label = propConfig[key].label
                }
                
                this.pFieldsConfig.push(new FieldConfig(label, 
                    (feature: any) => { return feature != undefined ? feature.getProperties()[key] : "" }, 
                    (feature: any) => { return feature != undefined ? feature.getProperties()[key] : ""}))
            }
        }
        else {

            //################# BEGIN Update TableView field config ###############
            if (this.data.length > 0) {

                let f0 = this.data[0]

                for (let key in f0.getProperties()) {

                    if (key == 'geometry') {
                        continue
                    }
                    this.pFieldsConfig.push(new FieldConfig(key, 
                        (feature: any) => { return feature.getProperties()[key] }, 
                        (feature: any) => { return feature.getProperties()[key] }))
                }
            }
            //################# END Update TableView field config ###############
        }
    }
}
