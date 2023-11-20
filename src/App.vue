<template>
  <BaseBox class="flex col mainBox">
    <!-- This page is for the sake of providing examples as well as an environment for checking the various base components -->
    <div class="flex col h-100 w-100 container">
      <div class="flex col">
        <h3>Buttons</h3>
        <div class="flex row h-fit w-100 a-center j-between button-border-container">
          <div>
            <BaseButton :color="Color.background" :background="Color.highlight">OK</BaseButton>
            <div class="element_label">default</div>
          </div>
          <div>
            <BaseButton outline :color="Color.highlight">OK</BaseButton>
            <div class="element_label">outline</div>
          </div>
          <div>
            <BaseButton round :color="Color.background" :background="Color.highlight">OK</BaseButton>
            <div class="element_label">round</div>
          </div>
          <div>
            <BaseButton outline round :color="Color.highlight">OK</BaseButton>
            <div class="element_label">outline round</div>
          </div>
          <div>
            <BaseButton text :color="Color.highlight">
              <BaseIcon :color="Color.icon" height="30" svgName="pencil"/>
            </BaseButton>
            <div class="element_label">text icon</div>
          </div>
          <div>
            <BaseButton square :color="Color.background" :background="Color.highlight">OK</BaseButton>
            <div class="element_label">square</div>
          </div>
        </div>

        <h3>Inputs</h3>
        <div class="flex col h-fit w-100 a-start border-container">
          <div class="flex row h-fit w-100">
            <div class="flex col h-fit w-100 a-start">
              <div>Text, character limit {{ somethingMaxLength }}, no numbers</div>
              <BaseTextInput
                v-model="something"
                placeholder="Default"
                :maxlength="somethingMaxLength"
                :errorCheck="isSomethingValid"
                errorMessage="No numbers"
              >
                <template #endElement>
                  <BaseButton outline round xSmall buttonHeight="24px" buttonWidth="24px" :color="Color.icon" @click="something = ''">
                    <BaseIcon :color="Color.icon" height="12" svgName="close" width="12" />
                  </BaseButton>
                </template>
              </BaseTextInput>
              <div class="w-fit h-fit">You wrote: <b>{{ something }}</b></div>
            </div>
            <div class="flex col h-fit w-100 a-start">
              <div>Number, raised</div>
              <BaseTextInput
                v-model="somethingNum"
                number
                raised
                placeholder="Default"
              >
                <template #endElement>
                  <BaseButton outline round xSmall buttonHeight="24px" buttonWidth="24px" :color="Color.icon" @click="somethingNum = 0">
                    <BaseIcon :color="Color.icon" height="12" svgName="close" width="12" />
                  </BaseButton>
                </template>
              </BaseTextInput>
              <div class="w-fit h-fit">You wrote: <b>{{ somethingNum }}</b></div>
            </div>
          </div>
          <div class="flex row h-fit w-100">
            <div class="flex col h-fit w-100 a-start">
              <div>Password, underline</div>
              <BaseTextInput
                v-model="somethingPass"
                password
                underline
                placeholder="Default"
              >
                <template #endElement>
                  <BaseButton outline round xSmall buttonHeight="24px" buttonWidth="24px" :color="Color.icon" @click="somethingPass = ''">
                    <BaseIcon :color="Color.icon" height="12" svgName="close" width="12" />
                  </BaseButton>
                </template>
              </BaseTextInput>
              <div class="w-fit h-fit">You wrote: <b>{{ somethingPass }}</b></div>
            </div>
          </div>
        </div>

        <h3>Multi-page table with dynamic fields</h3>
        <BaseTable
          selfPagination
          height="500px"
          class="pb-5"
          :tableColumns="tableHeaders"
          :tableData="tableData"
          :resultsPerPage="15"
        >
          <template #startElement="{ data }">
            <BaseButton @click="toggleSelect(data)">
              <BaseIcon v-if="data.selected" :color="Color.primary" svgName="checkbox-checked" height="18"/>
              <BaseIcon v-else :color="Color.primary" svgName="checkbox-unchecked" height="18"/>
            </BaseButton>
          </template>
          <template v-slot:[`ageData`]="{ data }">
            <b v-if="data.age < 40" style="color: red">{{ data.age }}</b>
            <div v-else>{{ data.age }}</div>
          </template>
          <template #endElement="{ data }">
            <BaseButton @click="openEdit(data)">
              <BaseIcon :color="Color.icon" svgName="clipboard"/>
            </BaseButton>
          </template>
        </BaseTable>

        <h3>Dialog overlays</h3>
        <div class="flex col w-fit h-fit border-container">
          <div class="flex row w-fit h-fit a-center j-center">
            <BaseButton :background="Color.primary" buttonHeight="40px" buttonWidth="40px" @click="tlShow = true"></BaseButton>
            <div class="spacer"></div>
            <BaseButton :background="Color.primary" buttonHeight="40px" buttonWidth="40px" @click="trShow = true"></BaseButton>
          </div>
          <div class="flex row w-fit h-fit a-center j-center">
            <div class="spacer"></div>
            <BaseButton :background="Color.primary" buttonHeight="40px" buttonWidth="40px" @click="mShow = true"></BaseButton>
            <div class="spacer"></div>
          </div>
          <div class="flex row w-fit h-fit a-center j-center">
            <BaseButton :background="Color.primary" buttonHeight="40px" buttonWidth="40px" @click="blShow = true"></BaseButton>
            <div class="spacer"></div>
            <BaseButton :background="Color.primary" buttonHeight="40px" buttonWidth="40px" @click="brShow = true"></BaseButton>
          </div>
        </div>
      </div>
    </div>
  </BaseBox>

  <!-- simple dialog for editing table values -->
  <BaseDialog v-if="currentData" v-model="showEditDialog" width="60%" height="70%">
    <div class="flex col h-100 w-100 px-4">
      <h3 class="text-center">{{ currentData.name }} (ID: {{ currentData.id }})</h3>
      <div class="flex row pt-2">
        <b class="pr-2">Age:</b>
        <span v-if="!showAgeEdit">{{ currentData.age }}</span>
        <BaseTextInput v-else v-model="currentData.age"></BaseTextInput>
        <BaseButton round @click="showAgeEdit = true"><BaseIcon :color="Color.icon" svgName="pencil" height="18"></BaseIcon></BaseButton>
      </div>
      <div class="flex row pt-2">
        <b class="pr-2">Description:</b>
        <span v-if="!showDescriptionEdit">{{ currentData.description }}</span>
        <BaseTextArea v-else v-model="currentData.description"></BaseTextArea>
        <BaseButton round @click="showDescriptionEdit = true"><BaseIcon :color="Color.icon" svgName="pencil" height="18"></BaseIcon></BaseButton>
      </div>
      <div class="flex row pt-2">
        <b class="pr-2">Date Added:</b>
        <span v-if="!showDateEdit">{{ currentData.addDate }}</span>
        <BaseTextInput v-else date v-model="currentData.addDate"></BaseTextInput>
        <BaseButton round @click="showDateEdit = true"><BaseIcon :color="Color.icon" svgName="pencil" height="18"></BaseIcon></BaseButton>
      </div>
      <div class="flex row w-100 h-100 a-end j-end pb-2">
        <BaseButton :background="Color.primary" :color="Color.background" @click="showEditDialog = false">OK</BaseButton>
      </div>
    </div>
  </BaseDialog>
  <BaseDialog top left v-model="tlShow">
    <div>
      <BaseButton @click="tlShow = false">Close</BaseButton>
    </div>
  </BaseDialog>
  <BaseDialog top right v-model="trShow">
    <div>
      <BaseButton @click="trShow = false">Close</BaseButton>
    </div>
  </BaseDialog>
  <BaseDialog v-model="mShow">
    <div>
      <BaseButton @click="mShow = false">Close</BaseButton>
    </div>
  </BaseDialog>
  <BaseDialog bottom left v-model="blShow">
    <div>
      <BaseButton @click="blShow = false">Close</BaseButton>
    </div>
  </BaseDialog>
  <BaseDialog bottom right v-model="brShow">
    <div>
      <BaseButton @click="brShow = false">Close</BaseButton>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { type Ref, ref, computed, onMounted, watch } from 'vue';
import BaseBox from './components/BaseBox.vue';
import BaseDialog from './components/BaseDialog.vue';
import BaseTextInput from './components/BaseTextInput.vue';
import BaseButton from './components/BaseButton.vue';
import BaseTable from './components/BaseTable.vue';
import BaseIcon from './components/BaseIcon.vue';
import Color from "@/helpers/Color"
import type { ColumnDef } from './components/BaseTypes';
import BaseTextArea from './components/BaseTextArea.vue';

// input-related
const somethingMaxLength: Ref<number> = ref(10)
const something: Ref<string> = ref("")
const somethingPass: Ref<string> = ref("")
const somethingNum: Ref<number> = ref(0)
const isSomethingValid = computed(() => something.value.match(/\d/gm) != null)

// table-ralted
type SomeTableData = {
  id: number,
  name: string,
  description: string,
  addDate: string,
  age : number,
  selected: boolean
}
// data columns assume the same order as the data, though purposeful key matching could be added if more control is necessary
const tableHeaders: Ref<Array<ColumnDef>> = ref([
  { name: "ID", isSortable: false },
  { name: "Name", isSortable: true },
  { name: "Description", isSortable: true },
  { name: "Add Date", isSortable: true },
  { name: "Age (40+)", isSortable: true },
  { name: "selected", isVisible: false },
])
const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non nulla non libero porta tincidunt id eget urna. Quisque euismod laoreet bibendum. Proin auctor felis dui, a tristique ex tempus id. Aliquam erat volutpat. Suspendisse vitae vulputate nunc. Proin maximus est neque, vel condimentum mauris commodo sit amet. Ut eu neque porttitor, vehicula justo ac, vulputate lacus. Curabitur suscipit, dolor at ultricies tempor, libero magna sollicitudin nisi, vitae sagittis tortor velit ut eros. Etiam et pellentesque dui. Sed sed neque id turpis eleifend rhoncus porttitor vel dolor. Phasellus ullamcorper metus eu imperdiet fermentum. Seven more words for even one hundred."
const loremArray = loremIpsum.split(" ") // because it's easier to take and manipulate meaningful parts from an array of strings
const tableData: Ref<Array<SomeTableData>> = ref([])
const currentData: Ref<SomeTableData | null> = ref(null)

// dialog-related
const showEditDialog = ref(false)
const showAgeEdit = ref(false)
const showDescriptionEdit = ref(false)
const showDateEdit = ref(false)
const tlShow = ref(false)
const trShow = ref(false)
const mShow = ref(false)
const blShow = ref(false)
const brShow = ref(false)

// auto convert whatever format date selector spits out to a set format
watch(
  () => currentData.value?.addDate,
  (newVal: any) => {
    if (currentData.value && newVal) currentData.value.addDate = new Date(newVal).toLocaleDateString("ja", { year: "numeric", month: "2-digit", day: "2-digit" })
  }
)

onMounted(() => {
  for (let index = 0; index <= 40; index++) {
    const randomName = loremArray[Math.floor(Math.random() * 100)].replace(/[^\w]/g, "")
    // normally this isn't safe because we don't know how long the array is, but this time, we'll cheat since we know it's length 100
    const arraySliceStart = Math.floor(Math.random() * 100)
    let arraySliceEnd = arraySliceStart + Math.floor(Math.random() * 10)
    if (arraySliceEnd > 100) arraySliceEnd = 100;
    const today = new Date()
    // make a random date +/- up to 100 days from day
    const randomDate = new Date(
      today.setDate(today.getDate() + Math.floor(Math.random() * 100))).toLocaleDateString("ja", { year: "numeric", month: "2-digit", day: "2-digit" }
    )

    tableData.value.push({
      id: index,
      name: randomName.charAt(0).toUpperCase() + randomName.slice(1),
      description: loremArray.slice(arraySliceStart, arraySliceEnd).join(" "),
      addDate: randomDate,
      age: Math.floor(Math.random() * 100),
      selected: false 
    } as SomeTableData)
  }
})

const toggleSelect = (data: SomeTableData) => {
  const dataIndex = tableData.value.findIndex(x => x.id == data.id)
  tableData.value[dataIndex].selected = !tableData.value[dataIndex].selected
}

const openEdit = (data: SomeTableData) => {
  showEditDialog.value = true
  currentData.value = data
}

</script>

<style lang="scss">
#app {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.mainBox {
  height: 95%;
  width: 95%;
  max-width: 800px;
  overflow: hidden;
}

.container {
  overflow-y: scroll;
}


.button-border-container {
  padding: 4px;
  border-radius: 4px;
  border: 1px solid lightgray;

  & div{
    display: flex;
    flex-direction: column;
    width: fit-content;
    height: fit-content;
    align-items: center;
    justify-content: end;
    height: 80px;
  }
}

.border-container {
  padding: 4px;
  border-radius: 4px;
  border: 1px solid lightgray;
}

.element_label {
  font-size: 80%;
  line-height: 1.5;
}

.spacer {
  height: 40px;
  width: 40px;
  margin: 4px;
}
</style>
