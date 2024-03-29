import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import ChartCanvas from '../../newcharts/ChartCanvas/ChartCanvas';
import LineChart from '../..//newcharts/chart/LineChart/LineChart';
import BarChart from '../../newcharts/chart/BarChart/BarChart';
import NumericalAxis from '../../newcharts/axis/NumericalAxis/NumericalAxis';
import DatetimeAxis from '../../newcharts/axis/DatetimeAxis/DatetimeAxis';
import SmartButton from 'tivigi/src/components/SmartButton/SmartButton';
import { BoundingBox } from '../../newcharts/chartDataClasses';
import { loadTimeSeries, TimeSeriesLoaderTask } from 'tivigi/src/andromedaUtil/andromedaTimeSeriesFunctions';
import { Vector2 } from 'tivigi/src/util/Vector2';
import { Dataset } from '../../newcharts/Dataset';
import ChartLegend from '../../newcharts/ChartLegend/ChartLegend';
import { getAttributeMetadata } from 'tivigi/src/andromedaUtil/andromedaUtil';
import TableView from "tivigi/src/components/TableView/TableView"
import { TableData } from 'tivigi/src/components/TableView/TableData';
import { FieldConfig, FieldTextAlign } from 'tivigi/src/components/TableView/FieldConfig';
import { formatNumberString } from 'tivigi/src/util/formatters';
import DashboardPanel from 'tivigi/src/components/DashboardPanel/DashboardPanel';
import SmartTable from 'tivigi/src/components/SmartTable/SmartTable';
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
        SmartTable,
        TableView

        //#### END Tivigi Components #####


    }
})
export default class AndromedaTimeSeriesMultiPanel extends Vue {

    //#region Props
    @Prop({ default: true })
    allowPanX!: boolean

    @Prop({ default: true })
    autoscaleX!: boolean

    @Prop({ default: true })
    autoscaleY!: boolean

    @Prop()
    bars: any

    @Prop()
    barStyle!: string

    @Prop()
    colors: any

    @Prop()
    lines: any

    @Prop()
    initialExtent!: BoundingBox

    @Prop()
    legend: any

    @Prop({ default: "https://contextbroker.digitale-mrn.de" })
    brokerBaseUrl!: string

    @Prop({ default: false })
    showMovingLabel!: boolean

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

    @Prop({ default: false })
    preload!: boolean

    @Prop()
    forceXLabelScale!: string

    @Prop({default:false})
    showPanButtons!:boolean
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



    comments = []
    sourceInfo = []


    async created() {
        this.extent = this.initialExtent


        await this.loadData()
    }


    @Watch("initialExtent", { deep: true })
    async onInitialExtentChange() {
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

    @Watch("bars", { deep: true })
    @Watch("lines", { deep: true })
    @Watch("extent")
    async loadData() {

        if (this.extent == undefined || this.extent == null) {
            return
        }



        this.comments = []
        this.sourceInfo = []

       
        let blubb = this.bars.concat(this.lines)

        this.attrMeta = await getAttributeMetadata(this.brokerBaseUrl)


        const data = await this.loadData2(blubb)



        // Remove doubles:
        this.comments = Array.from(new Set([...this.comments]))

        // Remove doubles:
        this.sourceInfo = Array.from(new Set([...this.sourceInfo]))





        this.barsBuckets = this.prepareData(this.bars, data)
        this.linesBuckets = this.prepareData(this.lines, data)
        /*
        this.attrMeta = await getAttributeMetadata(this.brokerBaseUrl)
        this.barsBuckets = await this.loadData2(this.bars)
        this.linesBuckets = await this.loadData2(this.lines)
        */

        this.tableData = new TableData()

        //############### BEGIN Create year field #############
        const displayFunc = (row: any) => row.year
        const rawFunc = (row: any) => row.year

        const field = new FieldConfig("Jahr", "Jahr", displayFunc, rawFunc, FieldTextAlign.LEFT, undefined, undefined, true)

        this.tableData.fields.push(field)
        //############### END Create year field #############


        this.prepareTableData(this.barsBuckets, this.tableData)
        this.prepareTableData(this.linesBuckets, this.tableData)

        this.$forceUpdate()
    }


    prepareData(source: any, response: any) {

        // ATTENTION: This only works as expected if there is only one entity ID and only one attribute
        // name in the task!

        if (source == undefined) {
            return
        }

        let newBarBuckets = []

        for (const bc of source) {

            let bucket = []


            for (const sc of bc) {

                let points = []

                if (sc.entityId == undefined) {
                    continue
                }

                if (response[sc.entityId] == undefined) {
                    console.error("Fehler beim Laden: Entity nicht in der Antwort enthalten: " + sc.entityId)
                    continue
                }

                const data = response[sc.entityId][sc.attrName]

                if (data == undefined) {

                    console.error("Fehler beim Laden: Entity/Attribut nicht in der Antwort enthalten: " + sc.entityId + "/" + sc.attrName)
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


                let label = sc.attrName
                let shortLabel = sc.attrName
                let numDecimals = 2

                if (this.attrMeta[sc.attrName].metadata != undefined) {

                    if (this.attrMeta[sc.attrName].metadata.label != undefined) {
                        label = this.attrMeta[sc.attrName].metadata.label
                    }

                    if (this.attrMeta[sc.attrName].metadata.shortLabel != undefined) {

                        shortLabel = this.attrMeta[sc.attrName].metadata.shortLabel
                    }
                    else {
                        shortLabel = label
                    }

                    let numDecimalsDatabase = this.attrMeta[sc.attrName].metadata.numDecimals

                    if (typeof numDecimalsDatabase == "number") {
                        numDecimals = numDecimalsDatabase
                    }
                }


                if (sc.labelSuffix != undefined) {

                    if (label != undefined) {
                        label += sc.labelSuffix
                    }

                    if (shortLabel != undefined) {
                        shortLabel += sc.labelSuffix
                    }
                }



                let series = new Dataset(label)

                series.numDecimals = numDecimals

                if (shortLabel != undefined) {
                    series.shortLabel = shortLabel
                }

                series.points = points


                bucket.push(series)
            }

            newBarBuckets.push(bucket)
        }

        return newBarBuckets
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


            if (bucket == undefined) {
                continue
            }
            for (const seriesCfg of bucket) {

                if (seriesCfg.entityId == undefined) {
                    continue
                }

                if (seriesCfg.entityId != undefined && seriesCfg.entityId != "") {
                    const task2: TimeSeriesLoaderTask = {
                        entityId: seriesCfg.entityId,
                        attrs: [seriesCfg.attrName],

                        aggrMethod: seriesCfg.aggrMethod,
                        aggrPeriodDuration: seriesCfg.aggrPeriodDuration
                    }

                    tasks.push(task2)


                    const attrMeta = this.attrMeta[seriesCfg.attrName]

                    if (attrMeta != undefined && attrMeta.metadata != undefined) {
                        

                        if (attrMeta.metadata.comments instanceof Array) {
                           
                            this.comments = this.comments.concat(attrMeta.metadata.comments)
                        }


                        if (attrMeta.metadata.sources instanceof Array) {
                            this.sourceInfo = this.sourceInfo.concat(attrMeta.metadata.sources)
                        }
                    }

            
                }
            }
        }

        let preloadWidth = 0

        if (this.preload) {
            preloadWidth = size.x
        }


        const dateStart = new Date(this.extent.minx - preloadWidth)
        const dateEnd = new Date(this.extent.maxx + preloadWidth)

        return loadTimeSeries(this.brokerBaseUrl, tasks, dateStart, dateEnd)
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

                const displayFunc = (row: any) => formatNumberString(row[attrPath], dataset.numDecimals)

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

