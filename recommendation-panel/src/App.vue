<template>
  <div>
    <b-card
      :border-variant="style == 1 ? '' : 'dark'"
      :header="style == 1 ? '' : 'dark'"
      :header-bg-variant="style == 1 ? '' : 'dark'"
      :header-text-variant="style == 1 ? 'black' : 'white'"
    >
      <template v-slot:header>
        <b-row align-h="between" :style="{height: style == 1 ? '50px' : '30px'}">
          <h5 v-if="style == 1" class="m-md-2">Recommendation Panel</h5>
          <span style="font-weight: bold;" v-if="style == 2">Recommendation Panel</span>
          <b-row class="mr-2">
            <b-button variant="primary" v-if="selected.length == 0" @click="showAddModal">Add</b-button>
            <b-button variant="danger" v-if="selected.length > 0" @click="multiDelete">Delete</b-button>

            <b-dropdown v-model="style" :text="`Style ${style}`" right class="ml-2">
              <b-dropdown-item @click="style=1" :active="style == 1">Style1</b-dropdown-item>
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item @click="style=2" :active="style == 2">Style2</b-dropdown-item>
            </b-dropdown>
          </b-row>
        </b-row>
      </template>
      <b-card-text>
        <b-table
          ref="selectableTable"
          selectable
          select-mode="multi"
          :items="items"
          @row-selected="onRowSelected"
          responsive="sm"
          :fields="fields"
          :small="style == 2"
        >
          <!-- Example scoped slot for select state illustrative purposes -->
          <template v-slot:cell(action)="item">
            <b-button
              variant="outline-primary"
              :size="style == 1 ? '' :'sm'"
              @click="openEditModal(item)"
            >Edit</b-button>
            <b-button
              variant="outline-danger"
              @click="deleteRecommendation(item)"
              class="ml-2"
              :size="style == 1 ? '' :'sm'"
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
import store from "./store/index.js";
import axios from "axios";
const API_URL = "http://localhost:3000/recommendations";

export default {
  name: "RecommendationPanel",
  data() {
    return {
      fields: ["description", "createdAt", "action"],
      modalShow: false,
      data: {
        description: ""
      },
      selected: [],
      modalType: 1, // 1: add, 2: edit
      style: 1
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
      return store.state.recommendations;
    }
  },
  mounted() {
    this.onEventListener();
    this.getRecommendationsFromServer();
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
      if (this.modalType == 1) {
        const today = new Date();
        this.data["createdAt"] = today.toDateString();
        this.data["id"] = uniqid();

        store.commit("addRecommendation", this.data);
        localStorage.setItem(
          "event_recommendation_panel",
          JSON.stringify(this.items)
        );
        await axios.post(API_URL, this.data);
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
          "event_recommendation_panel",
          JSON.stringify(newList)
        );
        await axios.put(`${API_URL}/${this.data.id}`, this.data);
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
      await axios.delete(`${API_URL}/${data.id}`);

      store.commit("setRecommendationList", newList);
      localStorage.setItem(
        "event_recommendation_panel",
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
          await axios.delete(`${API_URL}/${item.id}`);
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
      setInterval(function() {
        const event_recommendation_card = localStorage.getItem(
          "event_recommendation_card"
        );
        if (event_recommendation_card != null) {
          const newList = JSON.parse(event_recommendation_card);
          store.commit("setRecommendationList", newList);
          localStorage.removeItem("event_recommendation_card");
        }
      }, 100);
    },
    async getRecommendationsFromServer() {
      const { data } = await axios.get(API_URL);
      store.commit("setRecommendationList", data);
    }
  }
};
</script>

<style>
</style>
