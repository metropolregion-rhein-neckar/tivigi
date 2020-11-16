import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { proxyfetch } from 'tivigi/src/util/proxyfetch';
import AbstractData from 'tivigi/src/components/data/AbstractData/AbstractData';


@Component({})
export default class DataJsonFetch extends AbstractData {

  
    @Prop()
    url!: string

    setup() {
        proxyfetch(this.url).then(response => response.json()).then((data) => {
            
            this.register(data)
        })
    }
}
