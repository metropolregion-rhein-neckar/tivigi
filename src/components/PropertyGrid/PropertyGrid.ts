import { Component, Prop, Vue } from 'vue-property-decorator';

import './PropertyGrid.scss'

import WithRender from './PropertyGrid.html';
import { getValueType } from 'tivigi/src/components/PropertyGrid/PropertyGridUtil';
import anchorme from "anchorme"
import { formatNumberString } from 'tivigi/src/util/formatters';
import { getFieldLabel } from 'tivigi/src/util/featureAttributeUtils';

@WithRender
@Component
export default class PropertyGrid extends Vue {

    @Prop()
    value: any;

    @Prop()
    fieldsConfig: any;

    @Prop({ default: true })
    showImages!: boolean

    @Prop({ default: [] })
    fieldsBlacklist!: Array<string>


    get entries(): Array<any> {

        if (this.value == null) {
            return [];
        }

        let result = Array()

        for(let entry of Object.entries(this.value)) {
            
            let blubb = entry[1]

            if (entry instanceof String) {
                blubb = entry.trim()
            }

            if (blubb == "" || blubb == null || blubb == undefined) {
                continue
            }

            let newEntry = [entry[0], blubb]            

            result.push(newEntry)
        }

        return result
    }


    getLabel(key: string): string {

        return getFieldLabel(key, this.fieldsConfig)
        /*
        if (this.fieldsConfig == undefined || this.fieldsConfig[key] == undefined) {
            return key
        }

        let config = this.fieldsConfig[key]

        if (typeof config == "string") {
            return config
        }

        if (!config['label']) {
            return key
        }

        return config['label']
        */
    }


    getValueHtml(key: string): string {

        // TODO: Implement prop to enable/disable anchorme for all fields

        let type = getValueType(key, this.fieldsConfig)

        let anchorme_options = {
            input: this.value[key],
            options: {
                attributes: {
                    target: "_blank"
                }
            }
        }
   

        switch (type) {
            case 'email': {
                return '<a href="mailto:' + this.value[key] + '" title="E-Mail schreiben">' + this.value[key] + '</a>'
                break;
            }

            case 'image_url':              
            case 'image_urls': {
                return '<input type="text" readonly="readonly" value="' + this.value[key] + '" title="' +  this.value[key] +  '"/>'
                
                // TODO: 4 Reimplement
                /*
                if (this.showImages) {
                    return '<img class="PropertyGrid__ValueImage" src="' + this.value[key] + '"/>'
                }
                else {
                    return '<input type="text" readonly="readonly" value="' + this.value[key] + '" title="' +  this.value[key] +  '"/>'                    
                }
                */
                break;
            }


            case 'euros-format-german': {
                return formatNumberString(this.value[key], 2, ',', '.', "€")
                break;
            }


            case 'url': {
                return '<a href="' + this.urlHrefString(this.value[key]) + '" target="new" title="Webseite in neuem Tab öffnen">' + this.urlLabelString(this.value[key]) + '</a>'
                break;
            }

            
            default: {

                return anchorme(anchorme_options)
                    
                break;
            }
        }

        return this.value[key]
    }


    urlLabelString(url: string) {

        if (url == undefined || url == null) {
            return ""
        }

        let result = url

        result = url.replace(/\&/, "<wbr/>")
        result = url.replace(/\?/, "<wbr/>")
        result = url.replace(/\//g, "/<wbr/>")

        return result
    }

    // TODO: 3 Better URL checking and fixing (regex?)
    // TODO: 3 Use Anchorme library for this
    urlHrefString(url: string) {

        if (url == undefined || url == null) {
            return ""
        }
        
        let result = url

        if (result.startsWith("http://")) {
            return result
        }

        if (result.startsWith("https://")) {
            return result
        }

        result = "http://" + result;

        return result
    }
}
