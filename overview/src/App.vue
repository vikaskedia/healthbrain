<template>
  <div>
    <b-row>
      <b-col cols="8">
        <template v-for="(component, i) in leftComponents">
          <component :key="i" v-bind:is="component" class="mt-2"></component>
        </template>
      </b-col>
      <b-col cols="4">
        <template v-for="(component, i) in rightComponents">
          <component :key="i" v-bind:is="component" class="mt-2"></component>
        </template>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import packageJson from "../package.json";

let components = {};
let leftComponentList = [];
let rightComponentList = [];

try {
  // Check dependencies for left-side panels
  if (packageJson["dependencies"]["recommendation-panel"] != null) {
    const comp = require("recommendation-panel");
    components["recommendation-panel"] = comp;
    leftComponentList.push("recommendation-panel");
  }

  if (packageJson["dependencies"]["reminder-panel"] != null) {
    const comp = require("reminder-panel");
    components["reminder-panel"] = comp;
    leftComponentList.push("reminder-panel");
  }

  // Check dependencies from right-side panels
  if (packageJson["dependencies"]["recommendation-card"] != null) {
    const comp = require("recommendation-card");
    components["recommendation-card"] = comp;
    rightComponentList.push("recommendation-card");
  }

  if (packageJson["dependencies"]["reminder-card"] != null) {
    const comp = require("reminder-card");
    components["reminder-card"] = comp;
    rightComponentList.push("reminder-card");
  }
} catch (ex) {
  console.log(ex);
}

export default {
  name: "App",
  components: components,
  data() {
    return {
      leftComponents: leftComponentList,
      rightComponents: rightComponentList
    };
  }
};
</script>

<style>
</style>
