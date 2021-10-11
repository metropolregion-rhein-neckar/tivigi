import { Component, Prop } from 'vue-property-decorator';
import * as ol from 'ol'
import * as ol_interaction from 'ol/interaction'
import { getUrlState, setUrlState } from 'tivigi/src/util/urlStateKeeping';
import { DragPan, MouseWheelZoom, defaults } from 'ol/interaction';
import { platformModifierKeyOnly } from 'ol/events/condition';
import { Attribution, defaults as defaultControls } from 'ol/control';
import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';


@Component({})
export default class DataMap extends AbstractData {

    //############## BEGIN Props ###############
    @Prop({ default: 17 })
    resolution!: number

    @Prop({ default: "map" })
    name!: string

    @Prop({ default: true })
    setUrlState!: boolean

    @Prop({ default: false })
    touchScreenMode!: boolean
    //############## END Props ###############



    map!: ol.Map


    beforeDestroy() {

        if (!(this.map instanceof ol.Map)) {
            return
        }

        // TODO: 4 Understand why the component stops working if we add this
        //this.map.getLayers().un("add", this.onLayerAdded);
        //this.map.getLayers().un("remove", this.onLayerRemoved);
    }


    mounted() {
        this.setup()
    }


    setup() {

        if (this.data != undefined) {
            return
        }


        // See https://openlayers.org/en/latest/examples/two-finger-pan-scroll.html

        // TODO: 3 Perhaps remove setting of interactions from here and do it in MapPanel only?

        const interactions_default = ol_interaction.defaults({ keyboard: false })

        const interactions_touchscreen = defaults({ dragPan: false, mouseWheelZoom: false }).extend([
            new DragPan({
                condition: function (event) {
                    return this.getPointerCount() === 2 || platformModifierKeyOnly(event);
                },
            }),
            new MouseWheelZoom({
                condition: platformModifierKeyOnly,
            })])


        //let interactions = this.touchScreenMode ? interactions_touchscreen : interactions_default


        const attribution = new Attribution({
            collapsible: false,
        });

        //######################## BEGIN Create map object ########################
        this.map = new ol.Map({

            interactions: interactions_default,
            controls: defaultControls({ attribution: false }).extend([attribution]),

            view: new ol.View({
                center: [0, 0],
                zoom: 19

            })
        })
        //######################## END Create map object ########################



        // This is required for URL status synchronization:
        this.map.set("name", this.name);

        // This is required to have the MapPanel component dispay a respective notification message:
        this.map.set("touchScreenMode", true)
        this.map.set("setUrlState", this.setUrlState)


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

        this.$emit("update:data", this.map)
    }


    // TODO: 4 Where is this used?
    onMapMoveEnd() {
        let res = this.map.getView().getResolution()
        this.$emit('update:resolution', res)
    }


    onLayerAdded(evt: any) {


        if (!this.setUrlState) {
            return
        }

        const addedLayer = evt.element

        const id = addedLayer.get("id")

        if (id == undefined) {
            return
        }

        const state = getUrlState()

        const name = this.map.get("name")

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

        if (this.setUrlState) {

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


            //      setUrlState(state)
        }
    }
}
