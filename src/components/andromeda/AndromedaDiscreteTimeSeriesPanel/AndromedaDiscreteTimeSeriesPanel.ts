import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AndromedaTimeSeriesLoader } from '@/andromedaUtil/AndromedaTimeSeriesLoader';
import ContinuousTimeSeriesChart from '@/components/ContinuousTimeSeriesChart/ContinuousTimeSeriesChart';
import { TableData } from 'tivigi/src/components/TableView/TableData';
import { ChartData, Dataset, DatasetBucket, SvgChartDatasetStyle } from '../DiscreteChart/chartUtil';
import { ColorRGBA } from 'tivigi/src/util/ColorRGBA';
import { FieldConfig, FieldTextAlign } from 'tivigi/src/components/TableView/FieldConfig';
import { AndromedaAttributeDefinition, getAllYears } from '@/AndromedaDashboardUtil';
import { formatNumberString } from 'tivigi/src/util/formatters';
import TableView from 'tivigi/src/components/TableView/TableView'
import DashboardPanel from '../DashboardSpeyer/DashboardPanel/DashboardPanel';
import SmartButton from 'tivigi/src/components/SmartButton/SmartButton';
import SvgChart from '../DiscreteChart/SvgChart/SvgChart';
import HtmlLegend from '../DiscreteChart/HtmlLegend/HtmlLegend';


import WithRender from './AndromedaDiscreteTimeSeriesPanel.html';
import './AndromedaDiscreteTimeSeriesPanel.scss'

@WithRender
@Component({
    components: {
        ContinuousTimeSeriesChart,
        DashboardPanel,
        HtmlLegend,
        SmartButton,
        SvgChart,
        TableView
    }
})
export default class AndromedaDiscreteTimeSeriesPanel extends Vue {

    //#region Properties
    @Prop({ default: () => Array<string>() })
    attributes!: Array<AndromedaAttributeDefinition>

    @Prop()
    brokerBaseUrl!: string

    @Prop()
    startTime!: string

    @Prop()
    endTime!: string

    @Prop()
    chartMode!: string

    @Prop({ default: false })
    chartCropToYRange!: boolean

    @Prop()
    firstYear!: string | undefined

    @Prop()
    lastYear!: string | undefined

    @Prop({ default: 0 })
    initialDisplayMode!: number

    @Prop({ default: "" })
    title!: string

    @Prop({ default: "" })
    subtitle!: string
    //#endregion


    loader!: AndromedaTimeSeriesLoader

    displayMode = 0


    tableData: TableData = new TableData()
    chartData: ChartData = new ChartData()


    async created() {

        const attrNames = Array<string>()

        for (const attrDef of this.attributes) {
            attrNames.push(attrDef.entityId + "/" + attrDef.attrName)
        }

        this.loader = new AndromedaTimeSeriesLoader(this.brokerBaseUrl, attrNames)

        const left = Date.parse(this.startTime)
        const right = Date.parse(this.endTime)


        await this.loader.load(left, right)

        this.tableData = this.prepareTableData()

        this.chartData = this.prepareChartData()

        //this.$forceUpdate()

    }



    prepareChartData(): ChartData {


        let result = new ChartData()

        let styles_main: Array<SvgChartDatasetStyle> = []

        let styles_compare: Array<SvgChartDatasetStyle> = []

        const colorStart_main = new ColorRGBA([255, 255, 255, 255])
        const colorEnd_main = new ColorRGBA([50, 50, 220, 255])

        const colorStart_compare = new ColorRGBA([220, 220, 100, 255])
        const colorEnd_compare = new ColorRGBA([60, 60, 60, 255])


        //########## BEGIN Create colors array ##########

        let colorDiff_main = colorEnd_main.sub(colorStart_main)
        let colorDiff_compare = colorEnd_compare.sub(colorStart_compare)

        for (let ii = 0; ii <= this.attributes.length; ii++) {

            const color_main = colorStart_main.add(colorDiff_main.mult((1.0 / this.attributes.length) * ii)).round()
            const color_compare = colorStart_compare.add(colorDiff_compare.mult((1.0 / this.attributes.length) * ii)).round()

            styles_main.push(
                {
                    color: color_main.toHexString(),
                    strokeDasharray: "0",
                    chartType: "bars"
                })

            styles_compare.push(
                {
                    color: color_compare.toHexString(),
                    strokeDasharray: "0",
                    chartType: "crosses"
                })
        }
        //########## END Create colors array ############

        if (this.attributes.length == 0) {
            return result
        }




        const numDecimalPlaces = 2




        //#region Stacked bars
        if (this.chartMode == "stacks") {


            let styleIndex = 0

            const bucket = new DatasetBucket()

            for (const attrDef of this.attributes) {

                const style = styles_main[styleIndex]

                const attrPath = attrDef.entityId + "/" + attrDef.attrName

                const data = this.loader.data.data[attrPath]



                const timeseries = data.timeseries

                const dataset = new Dataset(attrDef.label, attrDef.shortLabel, [], numDecimalPlaces, style)

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

                styleIndex++
            }

            result.datasetBuckets.push(bucket)
        }
        //#endregion Stacked bars



        //#region Stacked bars for primary and compare
        else if (this.chartMode == "compare_stacks") {

            const entityIds = Array<string>()

            const attrNames = Array<string>()


            for (const attrDef of this.attributes) {

                if (!entityIds.includes(attrDef.entityId)) {
                    entityIds.push(attrDef.entityId)
                }

                if (!attrNames.includes(attrDef.attrName)) {
                    attrNames.push(attrDef.attrName)
                }
            }

            let styleIndex = 0

            for (const entityId of entityIds) {

                const bucket = new DatasetBucket()

                for (const attrDef of this.attributes) {

                    if (attrDef.entityId != entityId) {
                        continue
                    }

                    const style = styles_main[styleIndex]

                    const attrPath = attrDef.entityId + "/" + attrDef.attrName

                    const data = this.loader.data.data[attrPath]



                    const timeseries = data.timeseries

                    const dataset = new Dataset(attrDef.label, attrDef.shortLabel, [], numDecimalPlaces, style)

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

                    styleIndex++
                }

                result.datasetBuckets.push(bucket)
            }
        }
        //#endregion Stacked bars for primary and compare



        //#region Bars next to each other
        else {


            let styleIndex = 0

            //################# BEGIN Loop over indicators #####################
            for (const attrDef of this.attributes) {

                const bucket = new DatasetBucket()

                const style = styles_main[styleIndex]


                const attrPath = attrDef.entityId + "/" + attrDef.attrName

                const data = this.loader.data.data[attrPath]



                const timeseries = data.timeseries

                const dataset = new Dataset(attrDef.label, attrDef.shortLabel, [], numDecimalPlaces, style)

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


                result.datasetBuckets.push(bucket)

                styleIndex++
            }
            //################# END Loop over indicators #####################

        }
        //#endregion Bars next to each other


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


        const numDecimalPlaces = 2

        //for (const attrPath in this.loader.data.data) {
        for (const attrDef of this.attributes) {

            const attrPath = attrDef.entityId + "/" + attrDef.attrName

            //############### BEGIN Create attribute field #############
            const displayFunc = (row: any) => formatNumberString(row[attrPath], numDecimalPlaces)

            const rawFunc = (row: any) => row[attrPath]

            const field = new FieldConfig(attrDef.label, attrDef.shortLabel, displayFunc, rawFunc, FieldTextAlign.LEFT, undefined, undefined, true)

            result.fields.push(field)
            //############### END Create attribute field #############
        }


        for (const attrPath in this.loader.data.data) {

            const data = this.loader.data.data[attrPath]

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

        /*
        let entities = [entity, compareEntity]


        if (!indicators || indicators.length == 0) {
            return result
        }


        //############### BEGIN Create year name field #############
        const displayFunc = (yearRow: any) => {
            try {
                return yearRow.year
            }
            catch {
                return ""
            }
        }


        const rawFunc = (yearRow: any) => {
            try {
                return yearRow.year
            }
            catch {
                return ""
            }
        }

        const nameField = new FieldConfig("Jahr", "Jahr", displayFunc, rawFunc, FieldTextAlign.LEFT, undefined, undefined, true)

        result.fields.push(nameField)
        //############### END Create indicator name field ###############
        let attributes = []

        for (const indi of indicators) {
            attributes.push(indi.code)
        }

        // TODO: 1 Get years for all entities

        let years = getAllYears(entities[0], attributes)

        if (years == undefined) {
            return result
        }

        for (let year_string of years) {


            const year = year_string

            if (firstYear != undefined && year < firstYear) {
                continue
            }

            if (lastYear != undefined && year > lastYear) {
                continue
            }

            result.rows.push({ year: year })
        }

        for (const entity of entities) {

            if (entity == undefined) {

                // NOTE: This happens if the entity is not loaded yet. 
                // It is not a problem because this code is called again each time the props 
                // "entity", "compareEntity" or "indicators" change (e.g. when they are loaded).

                continue
            }

            for (const indicator of indicators) {

                //############### BEGIN Create year name field #############
                const displayFunc = (yearRow: any) => {

                    try {
                        for (const instance of entity[indicator.code].value) {

                            if (instance.year == yearRow.year) {
                                return formatNumberString(instance.value, indicator.numDecimalPlaces)
                            }
                        }

                    }
                    catch {
                        return ""
                    }
                }


                const rawFunc = (yearRow: any) => {
                    try {
                        for (const instance of entity[indicator.code].value) {

                            if (instance.year == yearRow.year) {
                                return instance.value
                            }
                        }

                    }
                    catch {
                        return ""
                    }
                }


                let label = indicator.label
                let shortLabel = indicator.shortLabel

                if (entity == compareEntity) {
                    label += " (Vgl.)"
                    shortLabel += " (Vgl.)"
                }


                const indicatorValueField = new FieldConfig(label, shortLabel, displayFunc, rawFunc, FieldTextAlign.RIGHT, undefined, undefined, true)

                result.fields.push(indicatorValueField)
                //############### END Create indicator name field ###############
            }

        }
        return result
*/
    }
}

