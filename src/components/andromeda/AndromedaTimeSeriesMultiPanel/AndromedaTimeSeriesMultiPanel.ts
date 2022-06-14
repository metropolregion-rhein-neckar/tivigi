import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import ChartCanvas from '../../newcharts/ChartCanvas/ChartCanvas';
import LineChart from '../..//newcharts/chart/LineChart/LineChart';
import BarChart from '../../newcharts/chart/BarChart/BarChart';
import NumericalAxis from '../../newcharts/axis/NumericalAxis/NumericalAxis';
import DatetimeAxis from '../../newcharts/axis/DatetimeAxis/DatetimeAxis';
import SmartButton from 'tivigi/src/components/SmartButton/SmartButton';
import { BoundingBox } from '../../newcharts/chartDataClasses';
import { loadTimeSeries } from 'tivigi/src/andromedaUtil/andromedaTimeSeriesFunctions';
import { Vector2 } from 'tivigi/src/util/Vector2';
import { Dataset } from '../../newcharts/Dataset';
import ChartLegend from '../../newcharts/ChartLegend/ChartLegend';
import { getAttributeMetadata } from 'tivigi/src/andromedaUtil/andromedaUtil';
import TableView from "tivigi/src/components/TableView/TableView"
import { TableData } from 'tivigi/src/components/TableView/TableData';
import { FieldConfig, FieldTextAlign } from 'tivigi/src/components/TableView/FieldConfig';
import { formatNumberString } from 'tivigi/src/util/formatters';
import DashboardPanel from 'tivigi/src/components/DashboardPanel/DashboardPanel';

import WithRender from './AndromedaTimeSeriesMultiPanel.html';

@WithRender
@Component({
    components: {

        //#### BEGIN Tivigi Components #####

        DashboardPanel,

        ChartCanvas,
        ChartLegend,

        LineChart,
        NumericalAxis,

        DatetimeAxis,
        BarChart,
        SmartButton,
        TableView
        //#### END Tivigi Components #####


    }
})
export default class AndromedaTimeSeriesMultiPanel extends Vue {

    //#region Props
    @Prop({ default: true })
    allowPanX!: boolean

    @Prop()
    bars: any

    @Prop()
    lines: any

    @Prop()
    initialExtent!: BoundingBox

    @Prop()
    legend: any

    @Prop({ default: "https://contextbroker.digitale-mrn.de" })
    brokerBaseUrl!: string

    @Prop({ default: 50 })
    scaleX!: number | string

    @Prop({ default: 50 })
    scaleY!: number | string

    @Prop({ default: false })
    snapToYear!: boolean

    @Prop({ default: "" })
    title!: string

    @Prop({ default: "" })
    subtitle!: string


    @Prop({ default: 0 })
    displayMode!: number

    @Prop({ default: true })
    showDisplayModeButtons!: boolean
    //#endregion Props


    extent: BoundingBox = this.initialExtent


    barsBuckets: any = []
    linesBuckets: any = []

    local: any = {}

    displayMode_internal = 0

    legend_internal: any = null

    numDecimalsDefault = 2

    attrMeta: any


    tableData!: TableData

    async created() {
        this.extent = this.initialExtent

        await this.loadData()
    }


    @Watch("displayMode")
    onDisplayModeChange() {
        this.displayMode_internal = this.displayMode
    }

    @Watch("displayMode_internal")
    onDisplayModeInternalChange() {
        this.$emit("update:displayMode", this.displayMode_internal)
    }

    @Watch("bars",{deep:true})
    @Watch("lines",{deep:true})
    onDataChange() {
        this.loadData()
    }

    @Watch("extent")
    async loadData() {

        this.attrMeta = await getAttributeMetadata(this.brokerBaseUrl)


        this.barsBuckets = await this.loadData2(this.bars)
        this.linesBuckets = await this.loadData2(this.lines)

        this.tableData = new TableData()

        //############### BEGIN Create year field #############
        const displayFunc = (row: any) => row.year
        const rawFunc = (row: any) => row.year

        const field = new FieldConfig("Jahr", "Jahr", displayFunc, rawFunc, FieldTextAlign.LEFT, undefined, undefined, true)

        this.tableData.fields.push(field)
        //############### END Create year field #############


        this.prepareTableData(this.barsBuckets, this.tableData)
        this.prepareTableData(this.linesBuckets, this.tableData)

    }




    async loadData2(source: Array<any>) {

        if (source == undefined) {
            return
        }


        let min = new Vector2(this.extent.minx, this.extent.miny)
        let max = new Vector2(this.extent.maxx, this.extent.maxy)

        let size = max.sub(min)


        let tasks: any = []

        for (const bucket of source) {

            for (const seriesCfg of bucket) {

                if (seriesCfg.entityId == undefined) {
                    continue
                }

                const task2 = {
                    entityId: seriesCfg.entityId,
                    attrs: [seriesCfg.attrName],

                }

                tasks.push(task2)

            }
        }

        let dateStart = new Date(this.extent.minx - size.x)
        let dateEnd = new Date(this.extent.maxx + size.x)



        const response = await loadTimeSeries(this.brokerBaseUrl, tasks, dateStart, dateEnd)



        // ATTENTION: This only works as expected if there is only one entity ID and only one attribute
        // name in the task!

        let newBarBuckets = []

        for (const bc of source) {

            let bucket = []


            for (const sc of bc) {

                let points = []

                if (response[sc.entityId] == undefined) {
                    continue
                }

                const data = response[sc.entityId][sc.attrName]

                if (data == undefined) {

                    continue
                }


                for (const ts in data) {

                    if (this.snapToYear) {

                        let date = new Date(parseInt(ts))

                        let yearDateString = date.getFullYear() + "-01-01T00:00:00Z"
                        let yearDate = new Date(yearDateString)

                        points.push({ x: parseInt(yearDate.getTime().toString()), y: data[ts] })
                    }
                    else {
                        points.push({ x: parseInt(ts), y: data[ts] })
                    }
                }



                let label = this.attrMeta[sc.attrName].metadata.label
                let shortLabel = this.attrMeta[sc.attrName].metadata.shortLabel

                if (sc.labelSuffix != undefined) {

                    if (label != undefined) {
                        label += sc.labelSuffix
                    }

                    if (shortLabel != undefined) {
                        shortLabel += sc.labelSuffix                        
                    }
                }

                let series = new Dataset(label)

                let numDecimalsDatabase = this.attrMeta[sc.attrName].metadata.numDecimals

                if (typeof numDecimalsDatabase == "number") {
                    series.numDecmials = numDecimalsDatabase
                }

                if (shortLabel != undefined) {
                    series.shortLabel = shortLabel
                }

                series.points = points


                bucket.push(series)
            }

            newBarBuckets.push(bucket)
        }


        // ATTENTION: We can't work with "source = []" here because we want to modify the *original array*
        // that was passed to the function as the argument "source", and NOT assign a new empty array to
        //  the *variable name* "source", which wouldn't change the originally passed array at all:

        //dest.length = 0
        //dest.push(...newBarBuckets)

        return newBarBuckets
    }


    @Watch("legend_internal")
    onLegendChange() {

        this.$emit("update:legend", this.legend_internal)
    }



    // Years as rows, indicators as columns:
    prepareTableData(data: any, result: TableData) {

        if (data == undefined) {
            return
        }


        //#region Define table fields 
        for (const bucket of data) {

            for (const ds of bucket) {

                const dataset = ds as Dataset

                // ATTENTION: This requires that the label of each Dataset is unique!
                let attrPath = dataset.label

                const displayFunc = (row: any) => formatNumberString(row[attrPath], dataset.numDecmials)

                const rawFunc = (row: any) => row[attrPath]


                let shortLabel = dataset.label


                if (dataset.shortLabel) {
                    shortLabel = dataset.shortLabel                    
                }

                const field = new FieldConfig(dataset.label, shortLabel, displayFunc, rawFunc, FieldTextAlign.RIGHT, undefined, undefined, true)

                result.fields.push(field)
            }
        }
        //#endregion Define table fields 



        for (const bucket of data) {

            for (const ds of bucket) {
                const dataset = ds as Dataset

                for (const p of dataset.points) {

                    const date = new Date(p.x)

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

                    const attrPath = dataset.label
                    row[attrPath] = p.y
                }
            }
        }
    }
}

