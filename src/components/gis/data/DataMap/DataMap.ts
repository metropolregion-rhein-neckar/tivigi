import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as ol from 'ol'
import * as ol_interaction from 'ol/interaction'
import AbstractData from '../../../data/AbstractData/AbstractData'
import { getUrlState, setUrlState } from 'tivigi/src/util/urlStateKeeping';


@Component({})
export default class DataMap extends AbstractData {

    @Prop({ default: 17 })
    resolution!: number

    map!: ol.Map


    beforeDestroy() {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        // TODO: 4 Understand why the component stops working if we add this
        //this.map.getLayers().un("add", this.onLayerAdded);
        //this.map.getLayers().un("remove", this.onLayerRemoved);
    }


    setup() {

        //######################## BEGIN Create object ########################
        this.map = new ol.Map({

            interactions: ol_interaction.defaults({ keyboard: false }),

            view: new ol.View({
                center: [0, 0],
                zoom: 19

            })
        })
        //######################## END Create object ########################

        // This is required for URL status synchronization:
        this.map.set("name", this.name);

        
        // Register event handler to inform the parent component about the current map resolution:
        this.map.on('moveend', this.onMapMoveEnd);
   

        // Register event handlers to update the list of active layers in the URL state.
        // NOTE: We *set* the URL state here in the DataMap component, but we do no *read* it here,
        // i.e. the DataMap component does not load the layers specified in the URL state on its own.
        // It can't do this because it does not have the information to instantiate these layers.
        // It can only know the layer's IDs from the URL state. 
        // Actual re-adding of the layers specified in the URL state is done by other components.
        // This is somewhat of a design/architecture inconsistency, and it might be worth thinking
        // about whether this should be changed and how it could be done. However, it is not a
        // high priority issue.
        
        this.map.getLayers().on("add", this.onLayerAdded);
        this.map.getLayers().on("remove", this.onLayerRemoved);
        

        this.map.addInteraction(new ol_interaction.KeyboardZoom())

        this.register(this.map)
    }


    // TODO: 4 Where is this used?
    onMapMoveEnd() {
        let res = this.map.getView().getResolution()
        this.$emit('update:resolution', res)
    }


    onLayerAdded(evt: any) {

        let addedLayer = evt.element

        let id = addedLayer.get("id")

        if (id == undefined) {
            return
        }

        let state = getUrlState()

        let name = this.map.get("name")

        if (state[name] == undefined) {
            state[name] = {}
        }

        if (state[name].layers == undefined) {
            state[name].layers = new Array<string>()
        }

        if (state[name].layers.includes(id)) {
            return
        }


        state[name].layers.push(id)

        setUrlState(state)
    }


    onLayerRemoved(evt: any) {

        let addedLayer = evt.element

        let id = addedLayer.get("id")

        if (id == undefined) {
            return
        }


        let state = getUrlState()

        let name = this.map.get("name")

        if (state[name] == undefined) {
            return
        }

        if (state[name].layers == undefined) {
            return
        }

        const index = state[name].layers.indexOf(id);

        if (index == -1) {
            return
        }

        state[name].layers.splice(index, 1)


        setUrlState(state)
    }
}
