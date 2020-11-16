import { Component, Prop, Vue } from 'vue-property-decorator';

import PropertyGrid from '../PropertyGrid/PropertyGrid';
import Slideshow from '../Slideshow/Slideshow'
import Slide from '../Slideshow/Slide'


import './PropertyGridWithSlideshow.scss'

import WithRender from './PropertyGridWithSlideshow.html';
import { getValueType } from 'tivigi/src/components/PropertyGrid/PropertyGridUtil';


@WithRender
@Component({
    components: { PropertyGrid, Slide, Slideshow }
})
export default class PropertyGridWithSlideshow extends Vue {

    @Prop()
    value: any;

    @Prop()    
    fieldsConfig: any;


    @Prop({ default: [] })
    fieldsBlacklist!: Array<string>

    
    slideshowImageUrls() : Array<string> {
        let result = new Array<string>()

        for (let kvp of Object.entries(this.value)) {
            let type = getValueType(kvp[0], this.fieldsConfig)

            //console.log(type)
            if (type == "image_urls") {
                if (kvp[1] instanceof Array) {
                    for(let piece of kvp[1]) {
                        result.push(piece)
                    }
                }
                /*
                let pieces = (kvp[1] as string).split(";")

                for(let piece of pieces) {
                    result.push(piece)
                } 
                */
            }
        }

        return result
    }
    
}
