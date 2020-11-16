import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import * as ol_layer from 'ol/layer'

//################# BEGIN Tivigi imports #################
import AttributesTable from 'tivigi/src/components/gis/AttributesTable/AttributesTable'
import PopupMenu from 'tivigi/src/components/PopupMenu/PopupMenu'
import FloatingWindow from 'tivigi/src/components/FloatingWindow/FloatingWindow'
import Legend from 'tivigi/src/components/gis/Legend/Legend'
import Superbutton from 'tivigi/src/components/Superbutton/Superbutton'
import { proxyfetch } from 'tivigi/src/util/proxyfetch';
//################# END Tivigi imports #################

import anchorme from "anchorme"; 

import './LayerMetadataPanel.scss'

import WithRender from './LayerMetadataPanel.html';


@WithRender
@Component({
    components: {
        AttributesTable,
        FloatingWindow,
        Legend,
        PopupMenu,
        Superbutton
    },
})
export default class LayerMetadataPanel extends Vue {

    //################# BEGIN Props #################
    @Prop()
    layer!: ol_layer.Layer

    @Prop()
    ckanApiUrl!: string
    //################# END Props ####################


    metadata: any | null = null

    get abstract(): string {
        try {


            let result: string = this.metadata.result.notes

            result = result.replace(/(?:\r\n|\r|\n)/g, '<br/>');

            let options = {
                input: result,
                options: {
                    attributes: {
                        target: "_blank"
                    }
                }
            }

            return anchorme(options)            
        }
        catch {
            return ""
        }
    }




    get license(): string {
        try {
            return "<a href='" + this.metadata.result.license_url + "' target='_new'>" + this.metadata.result.license_title + "</a>"
        }
        catch {
            return "Keine Angabe"
        }
    }
	
	
	get source(): string | undefined{
		try {
			for (let extra of this.metadata.result.extras) {
				if (extra["key"] == "source") {
					return extra['value']
				}
			}
		}
		catch {
            return "Keine Angabe"
        }
	}

    get source_url(): string {
        try {

            let options = {
                input: this.metadata.result.url,
                options: {
                    attributes: {
                        target: "_blank"
                    }
                }
            }

            return anchorme(options)
            //return this.metadata.result.url
        }
        catch {
            return "Keine Angabe"
        }
    }


    created() {
        this.getInfoFromCkan()
    }
  

    getInfoFromCkan() {

        try {
            // TODO: Remove depencendy on config here

            let ckanUrl = this.ckanApiUrl + "action/package_show?id=" + this.layer.get('id')

            proxyfetch(ckanUrl).then(response => response.json()).then((metadata) => {
                this.metadata = metadata
            })
        }
        catch {
            console.log("problem")
        }
    }
}



