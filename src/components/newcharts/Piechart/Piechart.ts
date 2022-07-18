import { Vector2 } from 'tivigi/src/util/Vector2';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
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

    //#region Props
    @Prop({ default: () => "8888ffff" })
    color1!: string

    @Prop({ default: () => "dddd00ff" })
    color2!: string

    @Prop({ default: () => [] })
    data!: Array<PiechartDataItem>

    @Prop({ default: 360 })
    degreesEnd!: number

    @Prop({ default: 0 })
    degreesStart!: number

    @Prop({ default: 0 })
    degreesRotate!: number

    @Prop({ default: 75 })
    innerRadius!: number

    @Prop({ default: 90 })
    outerRadius!: number

    @Prop()
    legend!: Array<Array<ChartLegendItem>>

    @Prop()
    total!: number | undefined
    //#endregion Props


    colStart = new ColorRGBA(this.color1)
    colEnd = new ColorRGBA(this.color2)

    viewBoxSize = new Vector2(200, 200)



    renderData: any = undefined


    created() {
        this.prepareRenderData()
    }


    getBackgroundPath(): string {

        return this.makeArcPath(0, 360, this.outerRadius, this.innerRadius)
    }


    @Watch("data")
    prepareRenderData() {


        const legend = Array<Array<ChartLegendItem>>()

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

        legend.push([])

        const range_deg = this.degreesEnd - this.degreesStart



        for (let index = 0; index < this.data.length; index++) {

            let value_deg = (this.data[index].value / total) * range_deg

            let step = 0

            if (this.data.length > 1) {
                step = index / (this.data.length - 1)
            }


            const color_main = this.colStart.add(colorDiff.mult(step)).round()


            const arcPath = this.makeArcPath(increment, increment + value_deg, this.outerRadius, this.innerRadius)


            const textLabelRadius = this.innerRadius + (this.outerRadius - this.innerRadius) / 2

            const percent = (this.data[index].value / total) * 100

            result.push({
                path: arcPath,
                style: { fill: color_main.toHexString() },
                percent: percent,
                value: this.data[index].value,
                displayValue : formatNumberString(percent,1) + " %",
                label: this.data[index].label,
                class: "Piechart__DataItem",
                textPos : this.polarToCartesian(textLabelRadius, increment + value_deg / 2)
            })


            legend[0].push({
                label: this.data[index].label,
                color: color_main.toHexString()
            })

            increment += value_deg

        }

        this.renderData = result

        this.$emit("update:legend", legend)

        this.$forceUpdate()
    }



    getTooltipText(renderData: any): string {

        if (renderData.percent == undefined) {
            return ""
        }


        let result = renderData.label + ':<br/><strong>' + formatNumberString(renderData.percent) + ' %</strong>'

        result += ' (' + formatNumberString(renderData.value) + ')'

        return result
    }


    getTranslation() {
        return `transform:translate(${this.viewBoxSize.x / 2}px, ${this.viewBoxSize.y / 2}px)`
    }



    getViewBoxString(): string {
        return `0 0 ${this.viewBoxSize.x} ${this.viewBoxSize.y}`
    }


    makeArcPath(start_deg: number, end_deg: number, radius_outer: number, radius_inner: number) {

        // ATTENTION: 
        // A circle arc must be defined through two *distinct* points, start and end,
        // and they MUST NOT BE IDENTICAL. Now, if we want to draw a full circle of 360 degrees,
        // start and end point *are* identical, which causes the rendering of the arc to fail
        // at least in Chromium-based browsers. To solve this, we split the arc paths into two
        // segments (from "start" to "halfway" and from "halfway" to "end"). 
        // This way, distinct start and end points for each path segment are guaranteed.

        // As a side effect, this also slightly simplifies the calculation of the path string 
        // in another aspect, since with this solution, the "large arc flag" (the 4th parameter of 
        // the "A" command in the SVG path string) is always "0" (we always take the short route
        // around the circle).

        const halfway_deg = start_deg + (end_deg - start_deg) / 2

        const start_outer_px = this.polarToCartesian(radius_outer, start_deg + this.degreesRotate)
        const start_inner_px = this.polarToCartesian(radius_inner, start_deg + this.degreesRotate)

        const halfway_outer_px = this.polarToCartesian(radius_outer, halfway_deg + this.degreesRotate)
        const halfway_inner_px = this.polarToCartesian(radius_inner, halfway_deg + this.degreesRotate)

        const end_outer_px = this.polarToCartesian(radius_outer, end_deg + this.degreesRotate)
        const end_inner_px = this.polarToCartesian(radius_inner, end_deg + this.degreesRotate)



        let path = `M ${start_inner_px.x} ${start_inner_px.y} `

        path += ` A ${radius_inner} ${radius_inner} 0 0 1 ${halfway_inner_px.x} ${halfway_inner_px.y}`
        path += ` A ${radius_inner} ${radius_inner} 0 0 1 ${end_inner_px.x} ${end_inner_px.y}`
        path += ` L ${end_outer_px.x} ${end_outer_px.y}`
        path += ` A ${radius_outer} ${radius_outer} 0 0 0 ${halfway_outer_px.x} ${halfway_outer_px.y}`
        path += ` A ${radius_outer} ${radius_outer} 0 0 0 ${start_outer_px.x} ${start_outer_px.y}`
        path += ` L ${start_inner_px.x} ${start_inner_px.y}`

        return path
    }



    polarToCartesian(radius: number, angleInDegrees: number) {

        let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: (radius * Math.cos(angleInRadians)), y: (radius * Math.sin(angleInRadians))
        };
    }
}


