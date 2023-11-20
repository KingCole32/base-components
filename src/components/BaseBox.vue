<script setup lang="ts">
import Color from '@/helpers/Color';

 const primaryColor = Color.primary
</script>

<template>
  <div class="box">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.box {
  background-color: white;
  border-radius: 6px;
  color: v-bind(primaryColor);
  display: block;
  padding: 1.25rem;
  margin: 1rem;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 3px 1px -2px rgb(0 0 0 / 20%), 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%);
}
</style>
