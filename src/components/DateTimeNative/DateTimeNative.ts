import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import moment from 'moment'

import './DateTimeNative.scss'

import WithRender from './DateTimeNative.html';

@WithRender
@Component({
    components: {}
})
export default class DateTimeNative extends Vue {


    // NOTE: If "v-model" is used, the "value" prop holds the value:
    @Prop({ default: null })
    value!: string

    time = ""
    date = ""


    @Watch('value')
    onValueChange() {

        // TODO: 2 What if value is not a valid datetime string?
      
        let datetime = moment(this.value)
  
        this.date = datetime.format('YYYY-MM-DD');      
        this.time = datetime.format("HH:mm")
    }


    mounted() {
        this.onValueChange()
    }


    onInput() {

        let value = this.date + "T" + this.time + ":00"

        this.$emit('input', value)

    }
}
