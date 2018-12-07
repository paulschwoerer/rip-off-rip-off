<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "app"
});
</script>

<style lang="scss">
@import "./scss/vars";

a {
  color: inherit;
}

body {
  margin: 0;
  font-family: sans-serif;
  background: $colorRed;
}

@font-face {
  src: url("./assets/fonts/Games.ttf");
  font-family: Games;
  font-weight: normal;
}
</style>
