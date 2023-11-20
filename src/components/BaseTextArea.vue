<!-- simple, easily expandable textarea component; unlike vuetify, will bow to most style defined on the parent for easier instanced control-->
<script lang="ts" setup>
import type { Ref } from "vue"
import { computed, onMounted, ref, watch } from "vue"
import Color from "@/helpers/Color"

// additionally, this component has optional slots for adding more involved content↓
// startElement (an element placed before the text box), and endElement (one at the end)
const props = defineProps({
  modelValue: String,
  disabled: Boolean,
  autocomplete: { type: Boolean, default: true },
  autocorrect: { type: Boolean, default: true },
  spellcheck: { type: Boolean, default: true },
  autofocus: Boolean,
  autoresize: { type: Boolean, default: true },
  readonly: Boolean,
  square: Boolean,
  raised: Boolean,
  noFocus: Boolean,
  topLabelText: String,
  placeholder: { type: String, default: "" },
  rows: { type: Number, default: 1 }, // this is effectively the default height that the textarea will default to (1 row = avg char height)
  errorCheck: Boolean,
  errorMessage: { type: String, default: "Error" },
  // for my sanity, please pass colors as string, either as HTML color names, #_____ for hex, rgb(num, num, num), or rgba(num, num , num, num)
  color: { type: String, default: Color.primary },
  background: { type: String, default: Color.background },
  outline: { type: String, default: Color.border },
})

const emit = defineEmits(["update:modelValue"])

// this
let thisTextAreaField: Ref<HTMLInputElement> = ref(Object.create({}))
let thisTextAreaFieldContainer: Ref<HTMLElement> = ref(Object.create({}))

const showContainerHighlight = ref(false)

// colors
const textColorRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.color)))
const backgroundColorRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.background)))
const outlineColorRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.outline)))
const highlightColor = computed(() => (props.errorCheck ? Color.danger : Color.highlight))
const textContainerClass: Ref<string> = ref("baseTextAreaFieldContainer")

watch(
  () => showContainerHighlight.value,
  (newVal) => {
    if (!thisTextAreaFieldContainer || props.noFocus) return
    if (newVal) thisTextAreaFieldContainer.value.classList.add("focus")
    else thisTextAreaFieldContainer.value.classList.remove("focus")
  }
)

const handleInput = (_event: Event) => {
  emit(
    "update:modelValue",
    _event.target && (_event.target as HTMLInputElement).value ? (_event.target as HTMLInputElement).value : ""
  )
}

// done this way to make the resizing independent of any other events
watch(
  () => props.modelValue,
  (newVal) => {
    if (props.autoresize) {
      thisTextAreaField.value.style.height = "auto"
      if (newVal && newVal != "") thisTextAreaField.value.style.height = thisTextAreaField.value.scrollHeight + "px"
    }
  }
)

onMounted(() => {
  // adding styles per prop flag makes element changes from props more transparent; also benefits from having a lower importance than
  if (props.disabled) {
    textContainerClass.value = textContainerClass.value + " baseDisabled--textArea"
  }
  if (props.square) {
    textContainerClass.value = textContainerClass.value + " baseSquare--textArea"
  }
  if (props.raised) {
    textContainerClass.value = textContainerClass.value + " baseRaised--textArea"
  }
  // TODO unimplemented as it's not in the mock-up, but requires trivial work to add, if needed
  // if (props.underline) {
  //   textContainerClass.value = textContainerClass.value + " baseRaised--textArea"
  // }
})
</script>

<template>
  <div class="fullyExpand">
    <div :style="'color:' + (props.disabled ? 'grey' : 'black')" class="inputLabel">
      {{ props.topLabelText }}
    </div>
    <div ref="thisTextAreaFieldContainer" :class="textContainerClass">
      <div>
        <slot name="startElement"></slot>
      </div>
      <div style="width: 100%; padding-left: 5px">
        <textarea
          ref="thisTextAreaField"
          :autocomplete="props.autocomplete ? 'on' : 'off'"
          :autocorrect="props.autocorrect ? 'on' : 'off'"
          :autofocus="props.autofocus"
          :disabled="props.disabled"
          :placeholder="props.placeholder"
          :readonly="props.readonly"
          :rows="props.rows"
          :spellcheck="props.spellcheck"
          :value="props.modelValue"
          class="baseTextAreaField"
          @blur="showContainerHighlight = false"
          @focus="showContainerHighlight = true"
          @input="handleInput($event)"
        />
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
.baseTextAreaFieldContainer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border: solid rgb(v-bind(outlineColorRGB)) 1px;
  padding: 12px 4px;
  background: rgb(v-bind(backgroundColorRGB));
  border-radius: 4px;
}

.baseTextAreaFieldContainer.baseDisabled--textArea {
  background: lightgrey;
}

.focus {
  border: solid v-bind(highlightColor) 2px;
  margin: 3px; /** margin needs to be decreased, or else the element moves due to border thickness increase */
}

.baseTextAreaFieldContainer.baseSquare--textArea {
  border-radius: 0;
}

.baseTextAreaFieldContainer.baseUnderline--textArea {
  border-radius: 0;
  border: 0;
  border-bottom: solid grey 1px;
}

.baseTextAreaFieldContainer.baseRaised--textArea {
  border: 0;
  box-shadow: 0 2px 3px 0 rgb(0 0 0 / 40%);
}

.baseTextAreaField {
  resize: none;
  outline-width: 0;
  border: 0;
  color: rgb(v-bind(textColorRGB));
  background-color: rgba(0, 0, 0, 0); /** aka let it be whatever color the container is */
  /** strangely, textareas add some extra margin space on the bottom */
  width: 100%;
  font-family: Roboto, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu, Cantarell, "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif;
  font-size: 15px;
}

.baseTextAreaField:disabled {
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
  margin-bottom: -6px;
}

.fullyExpand {
  max-height: 100%;
  max-width: 100%;
}
</style>
