<script lang="ts" setup>
import { computed, toRefs } from "vue"

// this component is mostly for handling icons outside the scope of mdi icons (instead relying on a local set) like locally-stored svg's or text-as-icons
const props = defineProps({
  text: {type: Boolean, default: false}, // ignore all svg-related handling and instead apply a style that adjusts text to behave more like an icon (sizing)
  filled: { type: Boolean, default: false },
  svgName: { type: String, default: "" },
  height: { type: [Number, String], default: 24 },
  width: { type: [Number, String], default: 24 },
  color: { type: [String], default: "currentColor" }
})

const name = computed(() => {
  return props.filled == true ? props.svgName + "-filled" : props.svgName
})
</script>

<template>
  <i :style="{ height: height + 'px' }" class="flex a-center j-center">
    <span v-if="text" class="text-icon">
      <slot></slot>
    </span>
    <svg v-else :height="height" :width="width">
      <use v-bind="{ 'xlink:href': '/img/base-icon.svg#' + name }" />
    </svg>
  </i>
</template>

<style scoped>
i {
  fill: v-bind(color);
  color: v-bind(color);
}

.text-icon {
  font-style: normal;
  line-height: .5;
  padding: 1px 3px 4px 2px;
}
</style>
