<script lang="ts" setup>
import type { Ref } from "vue"
import { computed, onMounted, ref, useSlots } from "vue"
import Color from "@/helpers/Color"

// note- colors can of course be defined on the parent element and work, but we then miss on in-script handling (and thus things like the outline highlighting)
// so please define colors via props, rather than style (this could be handled via code, but just adds unecessary complexity)
const props = defineProps({
  modelValue: Boolean,
  square: Boolean,
  fullscreen: Boolean,
  noOverlay: Boolean,
  // flag, rather than a value, so we can ideally avoid having a lot of variable padding in dialogs (like we have in other apps)
  noPadding: Boolean,
  disableBackground: Boolean,
  persistent: Boolean,
  // these also work in combination, such that the default is "center center", and combos like "top left" will work as expected
  top: Boolean,
  bottom: Boolean,
  left: Boolean,
  right: Boolean,
  // for additional fine positioning of the dialog, when needed (e.g. to use as a snackbar)
  xOffset: { type: String, default: "0px" },
  yOffset: { type: String, default: "0px" },
  width: { type: String, default: "fit-content" },
  height: { type: String, default: "fit-content" },
  cardClass: { type: String, default: "" }, // otherwise classes defined on the element will basically be ignored due to root != main component
  // for my sanity, please pass colors as string, either as HTML color names, #_____ for hex, rgb(num, num, num), or rgba(num, num , num, num)
  background: { type: String, default: Color.background },
  border: { type: String, default: "" },
})

const emit = defineEmits(["update:modelValue", "click"])

const slots = useSlots()

// this
const thisDialogOverly: Ref<HTMLElement> = ref(Object.create({})) // in vue3, refs need to be initialized like normal vars, which get auto-assigned on mount
const thisDialog: Ref<HTMLElement> = ref(Object.create({}))

// some redundancy, but easier to use whatever shorthand the user entered in basic use cases
const dialogBackgroundRGB = computed(() => Color.toString(Color.variableInputToRGBA(props.background)))
// by default, make the boarder the same color as the background
// const dialogBorderRGB = computed(() =>
//   Color.toString(Color.variableInputToRGBA(props.border != "" ? props.border : props.background))
// )
const xTransform = ref(props.left || props.right ? "0" : "-50%")
const yTransform = ref(props.top || props.bottom ? "0" : "-50%")
const innerPadding = ref(props.noPadding ? "0" : "8px")
const thisCardClass: Ref<string> = ref("baseDialog")

const overlayAlpha = ref(props.noOverlay ? "0" : "0.5")

onMounted(() => {
  if (props.top && props.bottom) {
    console.warn("WARNING: Two props affecting the x-axis were set, so one will be ignored. Was this intentional?")
  } else if (props.left && props.right) {
    console.warn("WARNING: Two props affecting the y-axis were set, so one will be ignored. Was this intentional?")
  }

  if (props.square) {
    thisCardClass.value = thisCardClass.value + " baseSquare--dialog"
  }
  if (props.fullscreen) {
    thisCardClass.value = thisCardClass.value + " baseFullscreen--dialog"
  }
  if (props.top) {
    thisCardClass.value = thisCardClass.value + " baseTop--dialog"
  }
  if (props.bottom) {
    thisCardClass.value = thisCardClass.value + " baseBottom--dialog"
  }
  if (props.left) {
    thisCardClass.value = thisCardClass.value + " baseLeft--dialog"
  }
  if (props.right) {
    thisCardClass.value = thisCardClass.value + " baseRight--dialog"
  }
})

const dismissDialog = () => {
  if (props.disableBackground) return
  if (!props.persistent) {
    emit("update:modelValue", false)
  } else {
    thisDialog.value.classList.toggle("basePersistentShake--dialog")
  }
}
</script>

<template>
  <div
    v-if="props.modelValue && !props.disableBackground"
    ref="thisDialogOverly"
    class="baseDialogOverlay"
    @click="dismissDialog"
    data-testid="base-dialog-background-overlay"
  ></div>
  <div
    v-if="props.modelValue"
    ref="thisDialog"
    :class="cardClass + thisCardClass"
    @click="$emit('click')"
    data-testid="base-dialog"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.baseDialogOverlay {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 500;
  /* purposely using vh/vh here because we don't care if the overlay extends past screen bounds */
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, v-bind(overlayAlpha));
}

.baseDialog {
  position: fixed;
  z-index: 501;
  padding: v-bind(innerPadding);
  margin: v-bind(yOffset) v-bind(xOffset);
  left: 50%;
  right: auto;
  top: 50%;
  bottom: auto;
  transform: translate(v-bind(xTransform), v-bind(yTransform));
  background: rgb(v-bind(dialogBackgroundRGB));
  width: v-bind(width);
  height: v-bind(height);
  /*border: solid 1px rgb(v-bind(dialogBorderRGB));*/
  border-radius: 8px;
  box-shadow: 0 8px 4px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
  max-height: 80%;
  overflow-y: auto;
}

.baseDialog.baseSquare--dialog {
  border-radius: 0px;
  transform: translate;
}

.baseDialog.baseTop--dialog {
  top: 0;
  bottom: auto;
}

.baseDialog.baseBottom--dialog {
  top: auto;
  bottom: 0;
}

.baseDialog.baseLeft--dialog {
  left: 0;
  right: auto;
}

.baseDialog.baseRight--dialog {
  left: auto;
  right: 0;
}

.baseDialog.baseFullscreen--dialog {
  left: 0;
  top: 0;
  transform: none;
  width: 100%;
  height: 100%;
}

.baseDialog.basePersistentShake--dialog {
  animation: shake 0.05s;
}

/* commonly, this is done via transforms, but this would mess up the element transform, in this case, so imitate it via padding trick */
@keyframes shake {
  0% {
    padding: 8px;
  }
  100% {
    padding: 12px;
  }
}
</style>
