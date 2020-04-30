<template>
  <div>
    <b-row class="mt-2 ml-2 mr-2">
      <b-col cols="8">
        <recommendation-panel></recommendation-panel>
      </b-col>
      <b-col cols="4">
        <recommendation-card></recommendation-card>
      </b-col>
    </b-row>
    <b-row class="mt-2 ml-2 mr-2">
      <b-col cols="8">
        <reminder-panel></reminder-panel>
      </b-col>
      <b-col cols="4">
        <reminder-card></reminder-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import RecommendationCard from "recommendation-card";
import RecommendationPanel from "recommendation-panel";
import ReminderCard from "reminder-card";
import ReminderPanel from "reminder-panel";
export default {
  name: "App",
  components: {
    RecommendationCard,
    RecommendationPanel,
    ReminderCard,
    ReminderPanel
  }
};
</script>

<style>
</style>
