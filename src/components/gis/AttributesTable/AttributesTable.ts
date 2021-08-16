import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//################# BEGIN OpenLayers imports ###############
import * as ol from 'ol'
import * as ol_layer from 'ol/layer'
import VectorSource from 'ol/source/Vector';
import { FeatureLike } from 'ol/Feature';
//################# END OpenLayers imports ###############

//################# BEGIN Tivigi imports #################
import TableView from '../../TableView/TableView'
import TableView2 from '../../TableView2/TableView2'
import { TableData } from 'tivigi/src/components/TableView2/TableData';
import { FieldConfig, FieldTextAlign } from '../../TableView2/FieldConfig';
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
        TableView,
        TableView2
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
    //################### END Props #####################


    selectedCol: FieldConfig | null = null

    hoverFeature: ol.Feature | null = null
    selectedFeature: ol.Feature | null = null
    pFieldsConfig = this.fieldsConfig
    pLayer: ol_layer.Vector = this.layer
    pSelectedCol: FieldConfig | null = this.selectedCol
    data: Array<any> = []

    tableData = new TableData()


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


        const source = this.pLayer.getSource()

        source.un('change', this.onSourceChange)
    }


    mounted() {
        this.init()
    }


    init() {

        if (!(this.pLayer instanceof ol_layer.Layer)) {
            return
        }

        const source = this.pLayer.getSource()

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

        console.log("source change")

        let features = Array<FeatureLike>()

        for (let f of this.pLayer.getSource().getFeatures()) {
            features = features.concat(this.addFeatureRecursive(f))
        }

        this.data = features

        this.pFieldsConfig = this.makeFieldsConfig()

        this.tableData = this.prepareTableData()
    }




    addFeatureRecursive(feature: FeatureLike) : Array<FeatureLike> {

        let result = Array<FeatureLike>()

        // Handle cluster layer features:
        if (feature.getProperties().features instanceof Array) {

            for (let f2 of feature.getProperties().features) {
               result = result.concat(this.addFeatureRecursive(f2))
            }

            return result
        }

        result.push(feature)

        return result
    }



    addFeatureRecursive2(feature: FeatureLike) : Array<FeatureLike> {

        let result = Array<FeatureLike>()

        // Handle cluster layer features:
        if (feature.getProperties().features instanceof Array) {

            for (let f2 of feature.getProperties().features) {
               result = result.concat(this.addFeatureRecursive(f2))
            }

            return result
        }

        result.push(feature)

        return result
    }






    prepareTableData(): TableData {

        const result = new TableData()

        result.fields = this.makeFieldsConfig()


        let features = Array<FeatureLike>()
        for (let f of this.pLayer.getSource().getFeatures()) {
            features = features.concat(this.addFeatureRecursive(f))
        }

        for(const f of features) {
     
            result.rows.push(f)
        }
       

        return result
    }




    makeFieldsConfig(): Array<FieldConfig> {

        let result = new Array<FieldConfig>()

        if (this.fieldsConfig != undefined) {
            return this.fieldsConfig
        }

        let propConfig = this.layer.get('propertyLabels')

        if (propConfig != undefined) {

            for (let key in propConfig) {

                let label = propConfig[key]

                // Support for complex field definitions:
                if (propConfig[key].label != undefined) {
                    label = propConfig[key].label
                }

                result.push(new FieldConfig(label,
                    (feature: any) => { return feature != undefined ? feature.getProperties()[key] : "" },
                    (feature: any) => { return feature != undefined ? feature.getProperties()[key] : "" }, FieldTextAlign.LEFT))
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
                    result.push(new FieldConfig(key,
                        (feature: any) => { return feature.getProperties()[key] },
                        (feature: any) => { return feature.getProperties()[key] }, FieldTextAlign.LEFT))
                }
            }
            //################# END Update TableView field config ###############
        }

        return result
    }
}
