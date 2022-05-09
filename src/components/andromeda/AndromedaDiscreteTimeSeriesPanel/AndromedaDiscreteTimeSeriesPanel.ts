import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AndromedaTimeSeriesLoader } from '../../../andromedaUtil/AndromedaTimeSeriesLoader';
import { TableData } from 'tivigi/src/components/TableView/TableData';
import { ChartData, Dataset, DatasetBucket, SvgChartDatasetStyle } from '../../charts/DiscreteChart/chartUtil';
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA';
import { FieldConfig, FieldTextAlign } from 'tivigi/src/components/TableView/FieldConfig';
import { AndromedaAttributeDefinition, getAttributeMetadata } from '../../../andromedaUtil/andromedaUtil';
import { formatNumberString } from 'tivigi/src/util/formatters';
import TableView from 'tivigi/src/components/TableView/TableView'
import DashboardPanel from '../../DashboardPanel/DashboardPanel';
import SmartButton from 'tivigi/src/components/SmartButton/SmartButton';
import SvgChart from '../../charts/DiscreteChart/SvgChart/SvgChart';
import HtmlLegend from '../../charts/DiscreteChart/HtmlLegend/HtmlLegend';

import WithRender from './AndromedaDiscreteTimeSeriesPanel.html';
import './AndromedaDiscreteTimeSeriesPanel.scss'

@WithRender
@Component({
    components: {
        DashboardPanel,
        HtmlLegend,
        SmartButton,
        SvgChart,
        TableView
    }
})
export default class AndromedaDiscreteTimeSeriesPanel extends Vue {

    //#region Props

    @Prop()
    attributes!: Array<Array<AndromedaAttributeDefinition>>

    @Prop()
    brokerBaseUrl!: string

    @Prop()
    startTime!: string

    @Prop()
    endTime!: string

    @Prop({ default: 0 })
    initialDisplayMode!: number

    @Prop({ default: "" })
    title!: string

    @Prop({ default: "" })
    subtitle!: string

    @Prop({ default: null })
    displayMaxY!: number | null
    //#endregion Props


    loader = new AndromedaTimeSeriesLoader(this.brokerBaseUrl)

    displayMode = 0

    numDecimalsDefault = 2

    attrMeta: any

    tableData: TableData = new TableData()
    chartData: ChartData = new ChartData()

    @Watch("attributes")
    async onAttributesChange() {
        await this.init()
    }

    @Watch("displayMode")
    async onDisplayModeChange() {
        await this.init()
        //   this.$forceUpdate()
    }

    async created() {


        if (this.initialDisplayMode) {
            this.displayMode = this.initialDisplayMode
        }

        this.attrMeta = await getAttributeMetadata(this.brokerBaseUrl)


        await this.init()
    }





    async init() {

        const attrMeta = await getAttributeMetadata(this.brokerBaseUrl)

        for (const bucketDef of this.attributes) {
            for (const attrDef of bucketDef) {


                if (attrDef.label == undefined) {
                    if (attrMeta[attrDef.attrName] != undefined) {
                        attrDef.label = attrMeta[attrDef.attrName].metadata.label
                    }
                }
                else {
                    if (attrMeta[attrDef.attrName] != undefined) {
                        attrDef.label = attrDef.label.replaceAll("%%LABEL%%", attrDef.label = attrMeta[attrDef.attrName].metadata.label)
                    }
                }

            }
        }



        const attributesByEntityId: any = {}

        for (const bucketDef of this.attributes) {
            for (const attrDef of bucketDef) {

                if (attributesByEntityId[attrDef.entityId] == undefined) {
                    attributesByEntityId[attrDef.entityId] = Array<string>()
                }

                attributesByEntityId[attrDef.entityId].push(attrDef.attrName)
            }
        }

        await this.loader.load(attributesByEntityId, new Date(this.startTime), new Date(this.endTime))


        this.tableData = this.prepareTableData()
        this.chartData = this.prepareChartData()
    }




    prepareChartData(): ChartData {

        let result = new ChartData()

        if (this.attributes.length == 0) {
            return result
        }



        const colors = Array<any>()

        colors.push({ start: new ColorRGBA([255, 255, 255, 255]), end: new ColorRGBA([50, 50, 220, 255]) })
        colors.push({ start: new ColorRGBA([220, 220, 100, 255]), end: new ColorRGBA([60, 60, 60, 255]) })
        colors.push({ start: new ColorRGBA([180, 180, 180, 255]), end: new ColorRGBA([0, 0, 0, 255]) })



        for (let bucketIndex = 0; bucketIndex < this.attributes.length; bucketIndex++) {

            const bucketDef = this.attributes[bucketIndex]

            const bucket = new DatasetBucket()

            let colorEnd = colors[bucketIndex].end
            let colorStart = colors[bucketIndex].start

            const colorDiff = colorEnd.sub(colorStart)


            for (let attrIndex = 0; attrIndex < bucketDef.length; attrIndex++) {

                const attrDef = bucketDef[attrIndex]

                const color_main = colorStart.add(colorDiff.mult((1.0 / bucketDef.length) * attrIndex)).round()

                const style =
                {
                    color: color_main.toHexString(),
                    strokeDasharray: "0",
                    chartType: "bars"
                }

                let label = attrDef.label
                let shortLabel = attrDef.shortLabel

                if (attrDef.compare) {
                    style.chartType = "crosses"

                    // label += " (Vergleich)"
                    // shortLabel += " (Vgl.)"
                }

                let numDecimals = this.numDecimalsDefault

                if (typeof attrDef.numDecimals == "number") {
                    numDecimals = attrDef.numDecimals
                }


                const attrPath = attrDef.entityId + "/" + attrDef.attrName

                const data = this.loader.data.data[attrPath]

                if (data == undefined) {
                    continue
                }

                const timeseries = data.timeseries

                const dataset = new Dataset(label, shortLabel, [], numDecimals, style)

                //#region Iterate over time series entries (temporal attribute instances)
                for (const ts in timeseries) {

                    const date = new Date(parseInt(ts))

                    const year = date.getFullYear().toString()

                    let dataPointLabel = year

                    // Add label:
                    if (!result.labelsX.includes(dataPointLabel)) {
                        result.labelsX.push(dataPointLabel)
                    }

                    let index = 0;

                    for (let label of result.labelsX) {
                        if (label == dataPointLabel) {
                            break
                        }
                        index++
                    }

                    dataset.points.push({ x: index + 1, y: timeseries[ts] })
                }
                //#endregion Iterate over time series entries (temporal attribute instances)

                bucket.datasets.push(dataset)
            }

            result.datasetBuckets.push(bucket)
        }



        return result
    }



    // Years as rows, indicators as columns:
    prepareTableData(): TableData {

        const result = new TableData()

        //############### BEGIN Create year field #############
        const displayFunc = (row: any) => row.year
        const rawFunc = (row: any) => row.year

        const field = new FieldConfig("Jahr", "Jahr", displayFunc, rawFunc, FieldTextAlign.LEFT, undefined, undefined, true)

        result.fields.push(field)
        //############### END Create year field #############



        //for (const attrPath in this.loader.data.data) {
        for (const bucketDef of this.attributes) {
            for (const attrDef of bucketDef) {

                let numDecimals = this.numDecimalsDefault

                let numDecimalsDatabase = this.attrMeta[attrDef.attrName].metadata.numDecimals

                if (typeof numDecimalsDatabase == "number") {
                    numDecimals = numDecimalsDatabase
                }


                const attrPath = attrDef.entityId + "/" + attrDef.attrName

                //############### BEGIN Create attribute field #############
                const displayFunc = (row: any) => formatNumberString(row[attrPath], numDecimals)

                const rawFunc = (row: any) => row[attrPath]

                const field = new FieldConfig(attrDef.label, attrDef.shortLabel, displayFunc, rawFunc, FieldTextAlign.RIGHT, undefined, undefined, true)

                result.fields.push(field)
                //############### END Create attribute field #############
            }
        }

        for (const attrPath in this.loader.data.data) {

            const data = this.loader.data.data[attrPath]

            if (!(data.timestamps instanceof Array)) {
                continue
            }

            for (const ts of data.timestamps) {

                const date = new Date(parseInt(ts))

                const year = date.getFullYear()

                let row: any = null

                // Try to find exisiting row with current year:
                for (let row2 of result.rows) {
                    if (row2.year == year) {
                        row = row2
                        break
                    }
                }

                if (row == null) {
                    row = {
                        year: year
                    }


                    result.rows.push(row)
                }

                row[attrPath] = data.timeseries[ts]
            }

        }

        return result
    }
}