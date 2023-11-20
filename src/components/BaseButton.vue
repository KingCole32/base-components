<!-- simple, easily expandable button component; unlike vuetify, will bow to any style defined on the parent for easier instanced control -->
<script lang="ts" setup>
import type { Ref } from "vue"
import { computed, onMounted, ref } from "vue"
import Color from "@/helpers/Color"

// Note: colors can of course be defined on the parent element and work, but we then miss on in-script handling (and thus things like the outline highlighting)
// so please define colors via props, rather than style (this could be handled via code, but just adds unnecessary complexity)
const props = defineProps({
  disabled: Boolean,
  noShadow: { type: Boolean, default: true },
  noMargin: { type: Boolean, default: false },
  noPadding: { type: Boolean, default: false }, // in general, this is useful for icons
  round: Boolean,
  square: Boolean,
  outline: Boolean,
  text: Boolean,
  xSmall: Boolean,
  small: Boolean,
  large: Boolean,
  xLarge: Boolean,
  fontWeight: { type: String, default: "bold" },
  color: { type: String, default: Color.primary },
  background: { type: String, default: "" },
  buttonHeight: { type: String, default: "fit-content" },
  buttonWidth: { type: String, default: "fit-content" },
  resetStyle: { type: Boolean, default: false },
})

const buttonPaddingSize = computed(() =>
  props.noPadding? "0 0" : props.xSmall ? "0 4px" : props.small ? "2px 4px" : props.large ? "6px 10px" : props.xLarge ? "8px 12px" : "4px 8px"
)
const buttonMarginSize = computed(() => (props.noMargin ? "0" : "4px"))

const thisButton: Ref<HTMLButtonElement> = ref(Object.create({}))
const buttonColorRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.color)))
const buttonBackgroundRGB = computed(() =>
  props.background ? Color.toString(Color.variableInputToRGBA(props.background)) : "none"
)
const buttonClass: Ref<string> = ref("baseButton")
const buttonWidth = computed(() => props.buttonWidth)
const buttonHeight = computed(() => props.buttonHeight)

onMounted(() => {
  // adding styles per prop flag makes element changes from props more transparent; also benefits from having a lower importance than
  if (props.noShadow) {
    buttonClass.value = buttonClass.value + " baseNoShadow--button"
  } else {
    buttonClass.value = buttonClass.value + " baseShadow--button"
  }
  if (props.round) {
    buttonClass.value = buttonClass.value + " baseRound--button"
  }
  if (props.square) {
    buttonClass.value = buttonClass.value + " baseSquare--button"
  }
  if (props.outline) {
    buttonClass.value = buttonClass.value + " baseOutline--button"
  }
  if (props.text) {
    buttonClass.value = buttonClass.value + " baseText--button"
  }
  if (props.resetStyle) {
    buttonClass.value = buttonClass.value + " resetStyle"
  }
})
</script>

<template>
  <button type="button" ref="thisButton" :disabled="props.disabled" :class="buttonClass">
    <slot></slot>
  </button>
</template>

<style scoped>
.baseButton {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  position: relative;
  width: v-bind(buttonWidth);
  min-width: fit-content;
  /* min-width: calc(1.2em + 0.7rem); did I add this? not sure why I would, as this makes width ineffective at some point */
  height: v-bind(buttonHeight);
  border: solid 1px rgb(v-bind(buttonBackgroundRGB));
  color: rgb(v-bind(buttonColorRGB));
  background: rgb(v-bind(buttonBackgroundRGB));
  padding: v-bind(buttonPaddingSize);
  margin: v-bind(buttonMarginSize);
  border-radius: 4px;
  font-weight: v-bind(fontWeight);
  font-size: 1rem;
  text-align: center;
  cursor: pointer;
}

.baseButton:hover:enabled {
  filter: brightness(85%);
}

.baseButton:active:enabled {
  filter: brightness(65%);
}

.baseButton:disabled {
  color: ghostwhite;
  background: lightgray;
  border-color: lightgray;
}

.baseButton.baseNoShadow--button {
  box-shadow: none;
}

.baseButton.baseShadow--button {
  box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
}

.baseButton.baseRound--button {
  border: none;
  outline: none;
  border-radius: 50%;
}

.baseButton.baseSquare--button {
  border-radius: 0;
}

.baseButton.baseOutline--button {
  border: solid 2px rgb(v-bind(buttonColorRGB));
  color: rgb(v-bind(buttonColorRGB));
  background: none;
}

.baseButton.baseText--button {
  border: none;
  box-shadow: none;
  background: none;
  color: rgb(v-bind(buttonColorRGB));
}

.baseOutline--button:hover,
.baseText--button:hover {
  background: rgba(v-bind(buttonColorRGB), 0.3);
}

.baseOutline--button:active {
  background: rgba(v-bind(buttonColorRGB), 0.3);
}

.baseOutline--button:disabled {
  border-color: lightgray;
  color: lightgray;
}

.baseOutline--button:disabled:hover {
  background: none;
}

.baseText--button:active {
  background: rgba(v-bind(buttonColorRGB), 0.5);
  box-shadow: none !important;
}

.resetStyle {
  border: none;
  box-shadow: none;
  background: none;
}
</style>
