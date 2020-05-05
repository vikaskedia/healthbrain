<template>
  <div>
    <b-card
      :border-variant="style == 1 ? 'info' : 'dark'"
      :header="style == 1 ? 'info' : 'dark'"
      :header-bg-variant="style == 1 ? 'info' : 'dark'"
      header-text-variant="white"
    >
      <template v-slot:header>
        <b-row align-h="between" :style="{height: style == 1 ? '50px' : '30px'}">
          <h5 v-if="style == 1" class="m-md-2">Recommendation Card</h5>
          <span style="font-weight: bold;" v-if="style == 2">Recommendation Card</span>
          <b-row class="mr-2">
            <b-button variant="primary" v-if="selected.length == 0" @click="showAddModal">Add</b-button>
            <b-button variant="danger" v-if="selected.length > 0" @click="multiDelete">Delete</b-button>
          </b-row>
        </b-row>
      </template>
      <b-card-text>
        <b-table
          ref="selectableTable"
          selectable
          bordered
          select-mode="multi"
          :items="items"
          @row-selected="onRowSelected"
          responsive="sm"
          :fields="fields"
          :small="style == 2"
        >
          <template v-slot:cell(action)="item">
            <b-button
              :size="style == 1 ? '' :'sm'"
              variant="outline-primary"
              @click="openEditModal(item)"
            >Edit</b-button>
            <b-button
              variant="outline-danger"
              @click="deleteRecommendation(item)"
              class="ml-2"
              :size="style == 1 ? '' : 'sm'"
            >Delete</b-button>
          </template>
        </b-table>
      </b-card-text>
    </b-card>

    <b-modal v-model="modalShow" id="modal-center" centered :title="modalTitle">
      <b-form @submit.stop.prevent>
        <label>Description:</label>

        <b-form-textarea
          id="textarea-state"
          v-model="data.description"
          :state="validation"
          rows="5"
        ></b-form-textarea>
        <b-form-invalid-feedback :state="validation">Description content is required.</b-form-invalid-feedback>
      </b-form>

      <template v-slot:modal-footer>
        <div class="float-right">
          <b-button size="sm" @click="modalShow=false">Close</b-button>
          <b-button
            class="ml-2"
            variant="primary"
            size="sm"
            @click="save"
            :disabled="!validation"
          >{{modalType == 1 ? "Save" : "Update"}}</b-button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import uniqid from "uniqid";
import store from "./store/index";

const RECOMMENDATION_API_URL = "http://localhost:3000/recommendations";
const STYLE_API_URL = "http://localhost:3000/style";
const ADD_DIALOG = 1;
export default {
  name: "RecommendationCard",
  data() {
    return {
      modalShow: false,
      data: {
        description: ""
      },
      selected: [],
      modalType: 1, // 1: add, 2: edit    // Refactor: Define const, do not use magic-constants.
      style: 1,
      timer: -1
    };
  },
  computed: {
    validation() {
      return this.data.description.length > 0;
    },
    modalTitle() {
      return this.modalType == 1 ? "Add Recommendation" : "Edit Recommendation";
    },
    items() {
      return store.state.recommendations.filter(item => {
        return item.patientId == this.id;
      });
    },
    fields() {
      if (this.selected.length > 0) {
        return ["description", "createdAt"];
      } else {
        return ["description", "createdAt", "action"];
      }
    },
    id() {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const patientId = urlParams.get("patient_id");
      return patientId;
    }
  },
  mounted() {
    this.onEventListener();
    this.getRecommendationsFromServer();
    this.loadStyle();
  },
  watch: {
    /* Bug:
      Style is not specific to patient ID
    
      Question:
      Why is this needed?
    */
    style() {
      store.commit("saveStyle", { patientId: this.id, style: this.style });
    }
  },
  methods: {
    onRowSelected(items) {
      this.selected = items;
    },
    showAddModal() {
      this.modalShow = true;
      this.modalType = 1;
      this.data = { description: "" };
    },
    async save() {
      if (this.modalType == ADD_DIALOG) {
        const today = new Date();
        this.data["createdAt"] = today.toDateString();
        this.data["id"] = uniqid();
        this.data["patientId"] = this.id;

        /* 
          When a new recommendation is added the data is being saved at 3 places:
          1. vuex store
          2. localstorage
          3. Server by calling API 

          There is a possibility that 3rd step will fail. In that case a error message needs to be shown to the user and the data removed from vuex store and localstorage.
        
        */
        store.commit("addRecommendation", this.data);
        localStorage.setItem(
          "event_recommendation_card",
          JSON.stringify(this.items)
        );

        await fetch(RECOMMENDATION_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8"
          },
          body: JSON.stringify(this.data)
        });
      } else {
        let newList = [];
        this.items.forEach(item => {
          if (item.id == this.data.id) {
            newList.push({
              id: this.data.id,
              description: this.data.description,
              createdAt: this.data.createdAt
            });
          } else {
            newList.push(item);
          }
        });
        store.commit("setRecommendationList", newList);
        localStorage.setItem(
          "event_recommendation_card",
          JSON.stringify(newList)
        );

        await fetch(`${RECOMMENDATION_API_URL}/${this.data.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8"
          },
          body: JSON.stringify(this.data)
        });
      }
      this.modalShow = false;
    },
    openEditModal(item) {
      this.data = {
        id: this.items[item.index]["id"],
        description: this.items[item.index]["description"],
        createdAt: this.items[item.index]["createdAt"]
      };
      this.modalShow = true;
      this.modalType = 2;
    },
    async deleteRecommendation(item) {
      let newList = [];
      this.items.forEach((data, index) => {
        if (index != item.index) {
          newList.push(data);
        }
      });

      const data = this.items[item.index];

      await fetch(`${RECOMMENDATION_API_URL}/${data.id}`, { method: "DELETE" });

      store.commit("setRecommendationList", newList);
      localStorage.setItem(
        "event_recommendation_card",
        JSON.stringify(newList)
      );
    },
    multiDelete() {
      let newList = [];
      let index = 0;
      this.items.forEach(async item => {
        let isDeleted = false;
        this.selected.forEach(selectedItem => {
          if (item.id == selectedItem.id) {
            isDeleted = true;
          }
        });

        if (isDeleted) {
          await fetch(`${RECOMMENDATION_API_URL}/${item.id}`, {
            method: "DELETE"
          });
        } else {
          newList.push(item);
        }

        if (++index == this.items.length) {
          store.commit("setRecommendationList", newList);
          localStorage.setItem(
            "event_recommendation_card",
            JSON.stringify(newList)
          );
        }
      });
    },
    onEventListener() {
      this.timer = setInterval(function() {
        const event_recommendation_panel = localStorage.getItem(
          "event_recommendation_panel"
        );
        if (event_recommendation_panel != null) {
          const newList = JSON.parse(event_recommendation_panel);
          store.commit("setRecommendationList", newList);
          localStorage.removeItem("event_recommendation_panel");
        }
      }, 100);
    },
    async getRecommendationsFromServer() {
      const response = await fetch(
        `${RECOMMENDATION_API_URL}?patientId=${this.id}`
      );
      if (response.ok) {
        let json = await response.json();
        /*
          Question:
          What if the data returned from the server is same as the data in the vuex store.
          Current code does not check if server-data=vuex-data and without checking updates vuex data
          This may result in all view components getting re-rendered without need.
        */
        store.commit("setRecommendationList", json);
        /* 
          Bug:
          localstorage needs to be updated with the result of the API call
          Reason: Say locastorage has 3 entries the API returns 0 entries. 
          On refresh it will flash 3 entries and then go back to 0 entries.
        */
        /* 
          Edge-case:
          Localstroage has 3 entries. Server has 0 entries. API call fails. 
          Now doctor is working on wrong data.
          When API calls need to show to doctor "Error is loading latest data. Click here to refresh"
        */

} else {
        console.log(response.status);
      }
    },
    async loadStyle() {
      const response = await fetch(STYLE_API_URL);
      if (response.ok) {
        const json = await response.json();
        this.style = json.value;
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
};
</script>

<style>
</style>
