// TODO: 3 Rename this component. It does not switch a layer's style, but only the the "selected attribute"


import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

//############## BEGIN OpenLayers imports ##############

import * as ol_layer from 'ol/layer'
import VectorSource from 'ol/source/Vector';
//############## END OpenLayers imports ##############



import WithRender from './StyleSwitcher.html';


@WithRender
@Component({
    components: {},
})
export default class StyleSwitcher extends Vue {

    //################# BEGIN Props #################
    @Prop()
    layer!: ol_layer.Layer
    //################# END Props ####################


    get attribute(): string {
        return this.layer.get('attribute')
    }


    set attribute(newval: string) {
        this.layer.set('attribute', newval)
        this.layer.getSource().changed()
    }


    get attributes(): Array<string> {
        if (this.layer == undefined) {
            return []
        }

        let a = this.layer.get('attributes')

        if (a instanceof Array) {
            return a
        }
        return []
    }


    get isVectorLayer(): boolean {
        let source = this.layer.getSource()

        return (source instanceof VectorSource)
    }



    @Watch('layer')
    onLayerChange() {
        this.init()
    }



    init() {

        if (this.layer == undefined) {
            return
        }

        if (this.attributes) {
            this.attribute = this.attributes[this.attributes.length - 1]
        }

        this.attribute = this.layer.get('attribute')
    }


    created() {
       this.init()
    }


    getPropertyLabel(fieldName: string) {

        let propLabels = this.layer.get('propertyLabels')

        if (propLabels == undefined) {

            return fieldName
        }

        let label = propLabels[fieldName]

        if (label == undefined) {

            return fieldName
        }

        if (label instanceof String) {

            return label
        }

        if (label instanceof Object) {
            let l = label.label

            if (l == undefined) {

                return fieldName
            }

            return l
        }
        else {
            return label
        }

        return fieldName
    }
}



