import { Vector2 } from 'tivigi/src/util/Vector2';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA';
import { formatNumberString } from 'tivigi/src/util/formatters';
import { ChartLegendItem } from '../ChartLegend/ChartLegendItem';


import "./Piechart.scss"
import WithRender from './Piechart.html';


interface PiechartDataItem {
    value: number,
    label: string
}

@WithRender
@Component({
    components: {

    }
})
export default class Piechart extends Vue {

    @Prop({ default: () => "8888ffff" })
    color1!: string

    @Prop({ default: () => "dddd00ff" })
    color2!: string

    @Prop({ default: () => [] })
    data!: Array<PiechartDataItem>

    @Prop({ default: 90 })
    outerRadius!: number

    @Prop({ default: 75 })
    innerRadius!: number

    @Prop({ default: 0 })
    degreesStart!: number

    @Prop({ default: 360 })
    degreesEnd!: number

    @Prop({ default: 0 })
    degreesRotate!: number

    @Prop()
    legend!: Array<ChartLegendItem>

    @Prop()
    total!: number | undefined



    colStart = new ColorRGBA(this.color1)
    colEnd = new ColorRGBA(this.color2)

    viewBoxSize = new Vector2(200, 200)



    renderData:any=undefined

    created() {
        this.renderData = this.prepareRenderData()
    }

    prepareRenderData() {


        const legend = Array<ChartLegendItem>()

        const result = []

        const colorDiff = this.colEnd.sub(this.colStart)


        let increment = this.degreesStart

        let total = this.total

        if (total == undefined) {
            total = 0

            for (let item of this.data) {
                total += item.value
            }
        }

        const range_deg = this.degreesEnd - this.degreesStart

        for (let index = 0; index < this.data.length; index++) {

            const value_deg = (this.data[index].value / total) * range_deg

            let step = 0

            if (this.data.length > 1) {
                step = index / (this.data.length - 1)
            }


            const color_main = this.colStart.add(colorDiff.mult(step)).round()


            result.push({
                path: this.makeArcPath(increment, increment + value_deg, this.outerRadius, this.innerRadius),
                style: { fill: color_main.toHexString() },
                percent: (this.data[index].value / total) * 100,
                value: this.data[index].value,
                label: this.data[index].label,
                class: "Piechart__DataItem"
            })


            legend.push({
                label:this.data[index].label,
                color: color_main.toHexString()
            })

            increment += value_deg

        }

        if (increment < this.degreesEnd) {
            result.push({
                path: this.makeArcPath(increment, this.degreesEnd, this.outerRadius, this.innerRadius),
                style: { fill: "#eee" }
            })
        }

        this.$emit("update:legend", legend)

        return result
    }



    getTooltipText(renderData: any): string {

        if (renderData.percent == undefined) {
            return ""
        }


        let result = renderData.label + ':<br/><strong>' + formatNumberString(renderData.percent) + ' %</strong>'

        result += ' (' + formatNumberString(renderData.percent) + ')'

        return result
    }


    getTranslation() {
        return `transform:translate(${this.viewBoxSize.x / 2}px, ${this.viewBoxSize.y / 2}px)`
    }



    getViewBoxString(): string {
        return `0 0 ${this.viewBoxSize.x} ${this.viewBoxSize.y}`
    }


    makeArcPath(start_deg: number, end_deg: number, radius_outer: number, radius_inner: number) {

        let start_outer_px = this.polarToCartesian(radius_outer, start_deg + this.degreesRotate)
        let end_outer_px = this.polarToCartesian(radius_outer, end_deg + this.degreesRotate)

        let start_inner_px = this.polarToCartesian(radius_inner, start_deg + this.degreesRotate)
        let end_inner_px = this.polarToCartesian(radius_inner, end_deg + this.degreesRotate)


        let largeArcFlag = end_deg - start_deg > 180 ? 1 : 0



        let path = `M ${start_inner_px.x} ${start_inner_px.y} A ${radius_inner} ${radius_inner} 0 ${largeArcFlag} 1 ${end_inner_px.x} ${end_inner_px.y}`

        path += `L ${end_outer_px.x} ${end_outer_px.y} A ${radius_outer} ${radius_outer} 0 ${largeArcFlag} 0 ${start_outer_px.x} ${start_outer_px.y}`

        path += `L ${start_inner_px.x} ${start_inner_px.y}`


        return path
    }



    polarToCartesian(radius: number, angleInDegrees: number) {

        let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: (radius * Math.cos(angleInRadians)), y: (radius * Math.sin(angleInRadians))
        };
    }
}


