import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import WithRender from './AnalogGauge.html';
import "./AnalogGauge.scss"

@WithRender
@Component
export default class AnalogGauge extends Vue {



    //########## BEGIN Props ##########
    @Prop({ default: "" })
    label!: string;

    @Prop({ default: 1 })
    max!: number;

    @Prop({ default: 0 })
    min!: number;

    @Prop({ default: 0 })
    value!: number;
    //########## END Props ##########

    //######## BEGIN Configuration members #########
    cfg_maxAngle_deg: number = 180;
    cfg_minAngle_deg: number = 0;
    cfg_numMarkingSteps: number = 10;
    cfg_markingsRadius: number = 83;
    //######## END Configuration members #########

    //######## BEGIN State members #########
    updateInterval_ms: number = 30;
    needleAngle_deg: number = 0;
    //######## END State members #########

    //############### BEGIN get/set properties #################
    get markings(): Array<any> {

        let result = new Array();

        let stepSize = (this.max - this.min) / this.cfg_numMarkingSteps;
        for (let ii = this.min; ii <= this.max; ii += stepSize) {

            let a = (this.cfg_minAngle_deg + this.getFraction(ii) * (this.cfg_maxAngle_deg - this.cfg_minAngle_deg)) * (Math.PI / 180.0);

            result.push({
                x: -Math.cos(a) * this.cfg_markingsRadius,
                y: -Math.sin(a) * this.cfg_markingsRadius,
                v: ii
            });
        }

        return result;
    }
    //############### END get/set properties #################


    @Watch('value')
    updateNeedle() {

        let targetAngle_deg = this.cfg_minAngle_deg + this.getFraction(this.value) * (this.cfg_maxAngle_deg - this.cfg_minAngle_deg);

        let diff = targetAngle_deg - this.needleAngle_deg;

        if (Math.abs(diff) < (this.max - this.min) * 0.01) {
            this.needleAngle_deg = targetAngle_deg;
        }
        else {
            this.needleAngle_deg += diff * 0.05;
            window.setTimeout(this.updateNeedle, this.updateInterval_ms);
        }
    }


    created() {

        this.needleAngle_deg = this.cfg_minAngle_deg;

        if (this.max <= this.min) {
            console.warn("Vuety UI Analog Gauge: 'min' should be smaller than 'max'!");
        }
    }

    mounted() {
        this.updateNeedle()
    }

    getFraction(v: number): number {
        return ((v - this.min) / (this.max - this.min));
    }

}
