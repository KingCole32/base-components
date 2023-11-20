<!--simple, easily expandable input component; unlike vuetify, will bow to any style defined on the parent for easier instanced control-->
<script lang="ts" setup>
import type { Ref } from "vue"
import { computed, onMounted, ref, watch } from "vue"
import Color from "@/helpers/Color"
import BaseButton from "./BaseButton.vue"

// additionally, this component has optional slots for adding more involved content↓
// startElement (an element placed before the text box) and endElement (one at the end)
const props = defineProps({
  modelValue: [String, Number],
  disabled: Boolean,
  square: Boolean,
  underline: Boolean,
  raised: Boolean,
  noFocus: Boolean,
  tall: Boolean,
  xTall: Boolean,
  // type is done this way in order to make use of parameter suggestions in the editor without requiring we all know all the types (default is "text")
  email: Boolean,
  number: Boolean,
  password: Boolean,
  url: Boolean,
  date: Boolean,
  topLabelText: String,
  placeholder: { type: String, default: "" },
  errorCheck: Boolean,
  errorMessage: { type: String, default: "Error" },
  // for my sanity, please pass colors as string, either as HTML color names, #_____ for hex, rgb(num, num, num), or rgba(num, num , num, num)
  color: { type: String, default: "black" },
  background: { type: String, default: "white" },
  outline: { type: String, default: "grey" },
  maxlength: { type: Number, default: -1 },
  min: { type: String, default: "" },
  containerHeight: { type: String, default: "28px" }
})

// this is used to a) define the emit and b)add v-model behavior on the custom element
// essentially passing changes on the native fields value up to the parent
const emit = defineEmits(["update:modelValue"])

// this
let thisInputField: Ref<HTMLInputElement> = ref(Object.create({}))
let thisInputFieldContainer: Ref<HTMLElement> = ref(Object.create({}))

const showContainerHighlight = ref(false)
const fieldType = ref(
  props.email
    ? "email"
    : props.number
    ? "number"
    : props.password
    ? "password"
    : props.url
    ? "url"
    : props.date
    ? "date"
    : "text"
)
const heightPadding = ref(props.tall ? "4px 2px" : props.xTall ? "12px 4px" : "0")
const noFocusAdjustment = ref(
  props.noFocus
  ? "0 0 0 0"
  : props.raised
  ? "-2px -2px -2px -2px"
  : props.underline ?
  "-2px -2px -1px -2px"
  : "-1px -1px -1px -1px")

// colors
const textColorRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.color)))
const backgroundColorRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.background)))
const outlineColorRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.outline)))
const highlightColor = computed(() => (props.errorCheck ? "red" : "DodgerBlue"))
const inputContainerClass: Ref<string> = ref("baseTextInputContainer")

watch(
  () => showContainerHighlight.value,
  (newVal) => {
    if (!thisInputFieldContainer.value || props.noFocus) return
    if (newVal) thisInputFieldContainer.value.classList.add("focus")
    else thisInputFieldContainer.value.classList.remove("focus")
  }
)

onMounted(() => {
  // adding styles per prop flag makes element changes from props more transparent; also benefits from having a lower importance than
  if (props.disabled) {
    inputContainerClass.value = inputContainerClass.value + " baseDisabled--textInput"
  }
  if (props.square) {
    inputContainerClass.value = inputContainerClass.value + " baseSquare--textInput"
  }
  if (props.underline) {
    inputContainerClass.value = inputContainerClass.value + " baseUnderline--textInput"
  }
  if (props.raised) {
    inputContainerClass.value = inputContainerClass.value + " baseRaised--textInput"
  }
})

const incrementModel = (increment: number) => {
  if (props.disabled) return
  // we use the value of the input rather than the actual model value, as we don't explicitly require the model
  const currentValue = thisInputField.value.value ? Number.parseInt(thisInputField.value.value) : 0
  if (currentValue + increment >= 0) {
    emit("update:modelValue", currentValue + increment)
  }
}

const preventNegativeIncrement = (event: any) => {
  if (event.target.value <= 0) {
    event.preventDefault()
  } else {
    const currentValue = thisInputField.value.value ? Number.parseInt(thisInputField.value.value) : 0
    emit("update:modelValue", currentValue - 1)
  }
}
</script>

<template>
  <div class="maxWidth fitContentHeight">
    <div
      :style="'color:' + (props.disabled ? 'grey' : 'black')"
      class="inputLabel font-bold"
      data-testid="framework-base-input-label"
    >
      {{ props.topLabelText }}
    </div>
    <div ref="thisInputFieldContainer" :class="inputContainerClass">
      <div>
        <slot name="startElement"></slot>
      </div>
      <div class="baseTextInputFieldContainer">
        <input
          ref="thisInputField"
          class="baseTextInput"
          :type="fieldType"
          inputmode="numeric"
          :placeholder="props.placeholder"
          :value="props.modelValue"
          @input="
            $emit(
              'update:modelValue',
              $event.target && ($event.target as HTMLInputElement).value
                ? ($event.target as HTMLInputElement).value
                : ''
            )
          "
          :disabled="props.disabled"
          @focus="showContainerHighlight = true"
          @blur="showContainerHighlight = false"
          data-testid="framework-base-input-text"
          :maxlength="props.maxlength"
          :min="props.min"
          @keydown.down.prevent="preventNegativeIncrement($event)"
        />
        <!-- @input="$emit.." allows us to pass up the changed value to the parent -->
      </div>
      <div v-if="fieldType === 'number'" class="numberInputArrowsContainer">
        <BaseButton x-small text color="grey" class="numberInputArrow" @click="incrementModel(1)"> &#9650; </BaseButton>
        <BaseButton x-small text color="grey" class="numberInputArrow" @click="incrementModel(-1)">
          &#9660;
        </BaseButton>
      </div>
      <div>
        <slot name="endElement"></slot>
      </div>
    </div>
    <!-- don't show error messages on disabled fields -->
    <div v-if="props.errorCheck && !props.disabled" class="inputErrMsg">
      {{ props.errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.baseTextInputContainer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: solid rgb(v-bind(outlineColorRGB)) 1px;
  background: rgb(v-bind(backgroundColorRGB));
  border-radius: 4px;
}

.baseTextInputContainer.baseDisabled--textInput {
  background: lightgrey;
}

.baseTextInputContainer.baseSquare--textInput {
  border-radius: 0;
}

.baseTextInputContainer.baseUnderline--textInput {
  border-radius: 0;
  border: 0;
  border-bottom: solid grey 1px;
}

.baseTextInputContainer.baseRaised--textInput {
  border: 0;
  box-shadow: 0 2px 3px 0 rgb(0 0 0 / 40%);
}

.focus {
  border: 2px solid v-bind(highlightColor) !important; /* otherwise this won't take priority over "base" classes
  /* margin needs to be decreased, or else the element moves due to border thickness increase */
  padding: v-bind(noFocusAdjustment); 
  margin: v-bind(noFocusAdjustment); 
}

.baseTextInput {
  outline-width: 0;
  border: 0;
  color: rgb(v-bind(textColorRGB));
  background-color: rgba(0, 0, 0, 0); /** aka let it be whatever color the container is */
  /* font is getting overwritten by native input styling, so reestabilsh the font type in the input element's style */
  font-family: Roboto, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu, Cantarell, "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif;
  font-size: 15px;
  margin: 4px;
  padding: v-bind(heightPadding);
  width: 98%; /** for some reason, 100% doesn't clip input properly */
  text-overflow: clip;
}

.baseTextInput:disabled {
  background: rgba(0, 0, 0, 0);
  color: grey;
}

.floatingLabel {
  position: absolute;
  padding: 1px;
  top: 0;
  left: 4px;
}

.inputErrMsg {
  color: red;
  padding-left: 4px;
  font-size: 80%;
}

.inputLabel {
  padding-left: 4px;
}

.numberInputArrowsContainer {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding-right: 2px;
}

.numberInputArrow {
  margin: -2px;
  padding: -2px;
  font-size: 60%;
}

.fitContentHeight {
  max-height: fit-content;
}

.maxWidth {
  max-width: 100%;
}

div.baseTextInputFieldContainer {
  width: 100%;
  height: v-bind(containerHeight);
  display: flex;
  align-items: center;
  padding-left: 5px;
}

/* additional style handling to affect or hide native input behavior */

/* to hide the native number field incrementer */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
