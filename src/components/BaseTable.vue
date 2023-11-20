<script lang="ts" setup>
import type { Ref } from "vue"
import { computed, nextTick, onBeforeUnmount, onMounted, type PropType, ref, useSlots, watch } from "vue"
import Color from "@/helpers/Color"
import type { ColumnDef } from "./BaseTypes"
import BaseTextInput from "./BaseTextInput.vue"
import BaseButton from "./BaseButton.vue"
import BaseIcon from "./BaseIcon.vue"


// note-colors can of course be defined on the parent element and work, but we then miss on in-script handling (and thus things like the outline highlighting)
// so please define colors via props, rather than style (this could be handled via code, but just adds unnecessary complexity)
const props = defineProps({
  // the simplest input this component requires is a simple array of object for the data,
  // where it will use field keys as headers with none of the extra fields controls,
  // but providing a proper header prop allows more control in how and what is displayed (human-readable name, sortable, etc)
  tableData: Array as PropType<Array<object>>,
  tableColumns: { type: Array as PropType<Array<ColumnDef>>, default: () => [] },
  // the table will check this field for a "true" result, and highlight the field, in the case that it is
  highlightField: { type: String, default: "" },
  // display props
  placeHolderText: { type: String, default: "No data" },
  square: Boolean,
  fullWidth: Boolean,
  noHeader: Boolean,
  noContainerY: Boolean,
  noContainerX: Boolean,
  hoverHighlight: { type: Boolean, default: true },
  allowSearch: Boolean,
  headerAlignment: { type: String, default: "start" },
  showColumnBorder: Boolean,
  resultsPerPage: { type: Number, default: 0 },
  pageSelectionLimit: { type: Number, default: 3 },
  width: { type: String, default: "100%" },
  height: { type: String, default: "fit-content" },
  // for my sanity, please pass colors as String, either as HTML color names, #_____ for hex, rgb(num, num, num), or rgba(num, num , num, num)
  header: { type: String, default: Color.background },
  border: { type: String, default: Color.border },
  rowColor: { type: String, default: Color.background },
  rowColorAlt: { type: String, default: Color.background }, // e.g. no alternating row color
  hoverColor: { type: String, default: Color.altBackground },
  // Below 3 fields are for BE pagination
  totalCount: { type: Number, default: 0 },
  showSelectedPage: { type: Number, default: 0 },
  selfPagination: { type: Boolean, default: false },
})

// necessary in order to expose slots and check against them
const slots = useSlots()

// this
const thisTableContainer: Ref<HTMLElement> = ref(Object.create({}))

const currentSortColumn: Ref<String> = ref("")
// for now, assume data is sorted as the user wants by default
const sortedTableData = ref(props.tableData || [])
const searchPattern = ref("")
const searchKey = ref("")
// sort and filtered data are separate because we always want to filter against all data in the proper order
const filteredData = computed(() => {
  if (searchKey.value && searchPattern.value) {
    return sortedTableData.value.filter((data: any) =>
      data[searchKey.value].toLowerCase().includes(searchPattern.value.toLowerCase())
    )
  } else return sortedTableData.value
})
const currentPage = ref<any>(props.showSelectedPage)
const pageResultLimit = computed(() => (props.resultsPerPage == 0 ? filteredData.value.length : props.resultsPerPage))
const totalCount = computed(() => (props.totalCount == 0 ? filteredData.value.length : props.totalCount))
const maxPage = computed(() => Math.ceil(totalCount.value / pageResultLimit.value))
// UI
const containerBorderX = ref(props.noContainerX ? "0" : "1px")
const containerBorderY = ref(props.noContainerY ? "0" : "1px")
const borderWidth = props.showColumnBorder ? "1px" : "0px"
const columnWidths: Ref<number[]> = ref([])

const headerRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.header)))
const borderRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.border)))
const rowColorRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.rowColor)))
const hoverColorRGB = computed(() =>
  Color.toString(Color.variableInputToRGBA(props.hoverHighlight ? props.hoverColor : props.rowColor))
)
const highlightColorRGB = Color.toString(Color.variableInputToRGBA(Color.highlight))

// data
type headerObj = {
  fieldName: string
  dataKey: string
  isSortable?: boolean
  isVisible?: boolean
  alignment?: string
}
// prefer a defined set of header info, but, lacking that, use the data keys as headers with no frills
const columnDefs = computed((): headerObj[] => {
  const tableDataFields = props.tableData && props.tableData.length > 0 ? Object.keys(props.tableData[0]) : []

  if (props.tableColumns.length > 0 && props.tableData && props.tableData.length > 0) {
    if (props.tableColumns.length == tableDataFields.length) {
      return props.tableColumns.map(
        (x, index) =>
          ({
            fieldName: x.name,
            dataKey: tableDataFields[index],
            isSortable: x.isSortable != null && x.isSortable != undefined ? x.isSortable : false,
            isVisible: x.isVisible != null && x.isVisible != undefined ? x.isVisible : true,
            alignment: x.alignment != null && x.alignment != undefined ? x.alignment : "start",
          } as headerObj)
      )
      // column def/data object mistmatch case
    } else {
      console.error(
        `ERROR: Data and header mismatch. Please verify you pass the same number of headers as fields. \n Headers: 
        \n${props.tableColumns.map((x) => x.name)}
        \nData: \n${tableDataFields}`
      )

      return []
    }
  } else if (props.tableData && props.tableData.length > 0) {
    return tableDataFields.map(
      (x) =>
        ({
          fieldName: x.substring(0, 1).toUpperCase() + x.substring(1, x.length),
          dataKey: x,
          isSortable: false,
          isVisible: true,
          alignment: "start",
        } as headerObj)
    )
  } else {
    console.warn("Warning: Table data is empty. Please verify contents.")
    return []
  }
})

watch(
  () => props.tableData,
  (newVal: any) => {
    sortedTableData.value = newVal
    if (newVal != null && newVal.length > 0) adjustHeaderWidths()
  }
)
watch(
  () => filteredData.value.length,
  (newVal) => {
    if (newVal <= pageResultLimit.value) currentPage.value = 0
  }
)

onMounted(() => {
  // TODO investigate- this seems to occasionally not fire for some reason, causing columns to initially display "squished"
  nextTick(() => {
    adjustHeaderWidths()
  })

  if (props.highlightField != "" && columnDefs.value.filter((x) => x.fieldName == props.highlightField).length != 1) {
    console.error(
      `ERROR: Data field defined for highlighting (${props.highlightField}) doesn't exist in passed tableData.`
    )
  }

  if (slots["startHeaderElement"] && !slots["startElement"]) {
    console.warn(
      "WARNING: Table start header slot was filled, but no complimentary row slot was defined. The slot will be ignored."
    )
  }

  if (slots["endHeaderElement"] && !slots["endElement"]) {
    console.warn(
      "WARNING: Table end header slot was filled, but no complimentary row slot was defined. The slot will be ignored."
    )
  }

  // TODO this may possibly need better logic to prevent the adjust from firing a billion times when user is resizing window
  addEventListener("resize", adjustHeaderWidths)

  if (props.square) {
    thisTableContainer.value.classList.add("baseSquare--table")
  }
})

onBeforeUnmount(() => {
  removeEventListener("resize", adjustHeaderWidths)
})

const applySort = (field: String) => {
  // if clicking on the same column a second time, reverse the sorting of that column
  if (sortedTableData.value && field == currentSortColumn.value) {
    currentSortColumn.value = ""
    sortedTableData.value = sortedTableData.value.sort((x, y) => {
      // @ts-ignore TODO read about here: https://blog.logrocket.com/how-to-use-keyof-operator-typescript/
      if (String(x[field]).toLowerCase() < String(y[field]).toLowerCase()) return 1
      // @ts-ignore TODO read about here: https://blog.logrocket.com/how-to-use-keyof-operator-typescript/
      else if (String(x[field]).toLowerCase() > String(y[field]).toLowerCase()) return -1
      else return 0
    })
    // otherwise, sort on whatever field was clicked
  } else {
    currentSortColumn.value = field
    sortedTableData.value = sortedTableData.value.sort((x, y) => {
      // @ts-ignore TODO read about here: https://blog.logrocket.com/how-to-use-keyof-operator-typescript/
      if (String(x[field]).toLowerCase() > String(y[field]).toLowerCase()) return 1
      // @ts-ignore TODO read about here: https://blog.logrocket.com/how-to-use-keyof-operator-typescript/
      else if (String(x[field]).toLowerCase() < String(y[field]).toLowerCase()) return -1
      else return 0
    })
  }
}

// since these elements periodically can't be trusted to handle sizing themselves for whatever reason, readjust on the fly (data width takes precedence over header wdth)
const adjustHeaderWidths = () => {
  let totalInnerWidth = 0
  columnWidths.value = []
  //columns aren't filtered for visibility here because they're just not displayed, regardless, in the table
  columnDefs.value.forEach((column) => {
    const headerColumnElement = document.getElementById("header" + column.dataKey)
    if (headerColumnElement) {
      columnWidths.value.push(headerColumnElement.offsetWidth)
      totalInnerWidth += headerColumnElement.offsetWidth
      // hidden fields won't get picked up by getElementById, causing the check to fail, so only fire the error on null elements that SHOULD be visible, too
    } else if (column.isVisible) {
      console.error(`Error: Couldn't find a column name by data key (${column.dataKey}), unable to update table layout`)
    }
  })

  // in the event that the data takes less horizontal space than the table itself, stretch the fields to fill the space
  const totalOuterWidth = thisTableContainer.value.clientWidth
  if (totalInnerWidth < totalOuterWidth) {
    const stretchedWidth = totalOuterWidth / columnWidths.value.length
    columnDefs.value.forEach((column, i) => {
      columnWidths.value[i] = stretchedWidth
    })
  }
}

// because TS still doesn't like that syntax for generalized objects
const getDataRowClass = (dataRow: object) => {
  if (props.highlightField == "") return ""
  // @ts-ignore TODO read about here: https://blog.logrocket.com/how-to-use-keyof-operator-typescript/
  return dataRow[props.highlightField] == true ? "selected" : ""
}

const getPaginatedData = (): any => {
  if (!props.selfPagination) return filteredData.value
  else {
    return filteredData.value.slice(
      currentPage.value * pageResultLimit.value,
      currentPage.value * pageResultLimit.value + pageResultLimit.value
    )
  }
}

const changeCurrentPage = (newPage: number, event: Event) => {
  event.preventDefault()
  currentPage.value = newPage

  // Need to BE pagination
  emit("loadDataFromLimit", newPage + 1)

  // this is where we would add a toggle for the scroll-to-top-on-page-change behavior, but I doubt PO/QA would request it, so making this default
  thisTableContainer.value.scrollTo(thisTableContainer.value.scrollLeft, 0)
}

const emit = defineEmits(["selectedRow", "loadDataFromLimit"])
const selectedRow = (selectedRow: any) => {
  selectedRow.prevent
  emit("selectedRow", selectedRow)
}
</script>

<template>
  <div class="baseTableRoot" data-testid="base-table-root-container">
    <!-- TODO make the drop-down element next, improve the search/possibly make it a a sep component -->
    <div v-if="allowSearch && tableData && tableData.length > 0" class="searchField">
      <BaseTextInput v-model="searchPattern" class="searchTextInput" outline="lightGrey" placeholder="Search...">
        <template #startElement>
          <select id="searchKey" v-model="searchKey" class="selectBox" name="searchKey">
            <option
              v-for="column in columnDefs.filter((x) => x.isVisible)"
              :key="column.dataKey"
              :value="column.dataKey"
            >
              {{ column.fieldName }}
            </option>
          </select>
        </template>
      </BaseTextInput>
      <BaseButton
        button-height="24px"
        button-width="24px"
        :color="Color.icon"
        outline
        round
        xSmall
        @click.stop="searchPattern = ''"
      >
        <BaseIcon color="grey" height="12" svgName="close" width="12" />
      </BaseButton>
    </div>

    <div ref="thisTableContainer" class="baseTableContainer">
      <div v-if="!tableData || tableData.length < 1" class="text-center">{{ placeHolderText }}</div>
      <table v-else class="baseTable" style="width: 100%">
        <thead v-if="!props.noHeader">
          <tr>
            <th v-if="slots['startElement']">
              <slot :data="currentPage" name="startHeaderElement"></slot>
            </th>
            <th
              v-for="(column, index) in columnDefs.filter((x) => x.isVisible)"
              :id="'header' + column.dataKey"
              :key="column.dataKey + index.toString()"
            >
              <div class="flex-center">
                <!-- 3rd layer of customization: allow for dynamic, scoped slots per header field, based on the user-defined column key name -->
                <span v-if="!slots[column.dataKey + 'Header']">{{ column.fieldName }}</span>
                <slot v-else :name="column.dataKey + 'Header'"></slot>
                <BaseIcon
                  v-if="column.isSortable"
                  class="sortIcons"
                  :color="Color.icon"
                  height="12"
                  svgName="sort"
                  width="12"
                  @click.stop="applySort(column.dataKey)"
                />
              </div>
            </th>
            <th v-if="slots['endElement']">
              <slot :data="currentPage" name="endHeaderElement"></slot>
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- pagination, if any, via filteredData.slice -->
          <tr
            v-for="(dataRow, index) in getPaginatedData()"
            :key="'row' + index"
            :class="getDataRowClass(dataRow)"
            @click.stop="selectedRow(dataRow)"
          >
            <!-- startElement slot -->
            <td v-if="slots['startElement']">
              <slot :data="dataRow" :index="index" name="startElement"></slot>
            </td>
            <td
              v-for="(data, key, columnIndex) in dataRow"
              :id="'data' + index + key"
              :key="'row' + index + key"
              :style="{
                width: columnWidths[columnIndex ? columnIndex : 0] + 'px',
                display: !columnDefs[columnIndex ? columnIndex : 0].isVisible ? 'none' : 'inhereit',
              }"
            >
              <div
                v-if="!slots[columnDefs[columnIndex ? columnIndex : 0].dataKey + 'Data']"
                :style="'text-align:' + columnDefs[columnIndex ? columnIndex : 0].alignment"
              >
                {{ data }}
              </div>
              <!-- 3rd layer of customization: allow for dynamic, scoped slots per data fields, based on the user-defined column key name, returning all row data-->
              <slot
                v-else
                :name="columnDefs[columnIndex ? columnIndex : 0].dataKey + 'Data'"
                :data="dataRow"
                :style="'text-align:' + columnDefs[columnIndex ? columnIndex : 0].alignment"
              >
              </slot>
            </td>
            <!-- end element slot -->
            <td v-if="slots['endElement']">
              <slot :data="dataRow" :index="index" name="endElement"></slot>
            </td>
          </tr>
          <!-- dummy row in order to add footer that can also contain column sizing data in case of an empty table-->
          <!--          <tr>
  <td v-if="slots['startElement']" style="height: 0; visibility: hidden"></td>
  <td
    v-for="(data, key, columnIndex) in sortedTableData[0]"
    id="fillerData"
    :key="'fillerDataRow' + key"
    :style="{
      width: columnWidths[columnIndex] + 'px',
      display: !columnDefs[columnIndex].isVisible ? 'none' : 'inhereit',
      padding: '1px',
      border: 'none',
    }"
  >
    <div style="height: 0; visibility: hidden">{{ data }}</div>
  </td>
  <td v-if="slots['endElement']" style="height: 0; visibility: hidden"></td>
</tr>-->
        </tbody>
      </table>
    </div>
    <div v-if="maxPage > 1" class="pageButtons" data-testid="base-table-pagination-container">
      <BaseButton
        v-if="maxPage > pageSelectionLimit"
        id="firstPageButton"
        background="white"
        color="black"
        :disabled="currentPage === 0"
        :no-shadow="false"
        round
        noPadding
        data-testid="base-table-pagination-button-first"
        @click.stop="changeCurrentPage(0, $event)"
      >
        <BaseIcon class="arrow" svgName="arrow_left_double" />
      </BaseButton>
      <BaseButton
        id="previousPageButton"
        background="white"
        color="black"
        :disabled="currentPage === 0"
        :no-shadow="false"
        round
        noPadding
        data-testid="base-table-pagination-button-previous"
        @click.stop="changeCurrentPage(currentPage - 1, $event)"
      >
        <BaseIcon class="arrow" svgName="arrow_left" />
      </BaseButton>
      <span v-for="(page, index) in maxPage" :key="index" class="flex a-end">
        <!-- we use the index for actual setting as it is zero-based, whereas "page" is 1 -->
        <BaseButton
          v-show="index > currentPage - pageSelectionLimit && index < currentPage + pageSelectionLimit"
          :id="`pageButton-${index}`"
          :background="currentPage === index ? Color.highlight : 'white'"
          :color="currentPage === index ? 'white' : Color.highlight"
          fontWeight="normal"
          class="iconButton"
          round
          xSmall
          :data-testid="`base-table-pagination-button-page-${index + 1}`"
          @click.stop="changeCurrentPage(index, $event)"
        >
          <BaseIcon text>{{ page }}</BaseIcon>
        </BaseButton>
      </span>
      <BaseButton
        id="nextPageButton"
        background="white"
        color="black"
        :disabled="currentPage === maxPage - 1"
        :no-shadow="false"
        round
        noPadding
        data-testid="base-table-pagination-button-next"
        @click.stop="changeCurrentPage(currentPage + 1, $event)"
      >
        <BaseIcon class="arrow" svgName="arrow_right" />
      </BaseButton>
      <BaseButton
        v-if="maxPage > pageSelectionLimit"
        id="lastPageButton"
        background="white"
        :color="Color.primary"
        :disabled="currentPage === maxPage - 1"
        :no-shadow="false"
        round
        noPadding
        data-testid="base-table-pagination-button-last"
        @click.stop="changeCurrentPage(maxPage - 1, $event)"
      >
        <BaseIcon class="arrow" svgName="arrow_right_double" />
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.baseTableRoot {
  max-width: v-bind(width);
  max-height: v-bind(height);
  height: 100%;
  width: 100%;
}

.baseTableContainer {
  overflow: scroll;
  border-top: solid v-bind(containerBorderY) rgb(v-bind(borderRGB));
  border-bottom: solid v-bind(containerBorderY) rgb(v-bind(borderRGB));
  border-left: solid v-bind(containerBorderX) rgb(v-bind(borderRGB));
  border-right: solid v-bind(containerBorderX) rgb(v-bind(borderRGB));
  background: rgb(v-bind(rowColorRGB));
  border-radius: 8px;
  width: 100%;
  height: 100%;
}

.baseTableContainer.baseSquare--table {
  border-radius: 0;
}

.searchField {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 8px;
}

.selectBox {
  min-width: 70px;
  max-width: 100px;
  height: 100%;
  background: lightgray;
  outline-color: rgb(v-bind(highlightColorRGB));
  border-radius: 3px 0 0 3px;
}

.pageButtons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: v-bind(width);
  height: fit-content;
  padding-top: 8px;
  z-index: 10;
}

.iconButton {
  height: 22px;
  width: 22px;
}

.sortIcon {
  color: rgb(v-bind(borderRGB));
  filter: brightness(60%);
  cursor: pointer;
  padding-left: 2px;
}

table {
  position: relative;
  border-collapse: collapse;
}

thead {
  z-index: 5;
  min-width: fit-content;
  border-bottom: solid 1px rgb(v-bind(borderRGB));
}

th {
  text-wrap: nowrap;
  position: sticky;
  z-index: 5;
  top: 0;
  padding: 8px 12px;
  border-left: solid v-bind(borderWidth) rgb(v-bind(borderRGB));
  background: rgb(v-bind(headerRGB));
  text-align: v-bind(headerAlignment);
}

th:first-child {
  border-left: none;
}

tbody {
  /* display: block; */
  overflow: scroll;
}

tr {
  background: rgb(v-bind(rowColorRGB));
  border-bottom: solid 1px rgb(v-bind(borderRGB));
}

tr:last-child {
  border-bottom: none;
}

tr:hover {
  background: rgb(v-bind(hoverColorRGB));
}

tr.selected {
  background: rgb(v-bind(hoverColorRGB));
}

td {
  padding: 8px 12px;
  white-space: nowrap;
  border-left: solid v-bind(borderWidth) rgb(v-bind(borderRGB));
}

td:first-child {
  border-left: none;
}

.circle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f06;
  color: #fff;
  font-size: 1rem;
  border: none;
  outline: none;
  cursor: pointer;
  text-align: center;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  line-height: 1.2;
  padding: 0.1em;
  width: auto;
  min-width: calc(1.2em + 0.7rem);
  height: calc(1.2em + 0.7rem);
}

.circle-btn::before {
  content: "";
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: -1;
  width: 100%;
  height: 100%;
  background-color: inherit;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.circle-btn:hover {
  background-color: #d04;
}

.circle-btn:active {
  background-color: #b03;
}

.arrow {
  margin-top: 1px;
}

.sortIcons {
  width: 8px;
  margin-left: 10px;
  cursor: pointer;
}

.flex-center {
  display: flex;
  align-items: center;
}
</style>
