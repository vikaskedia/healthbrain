<template>
  <div>
    <b-card
      border-variant="info"
      header="info"
      header-bg-variant="info"
      header-text-variant="white"
    >
      <template v-slot:header>
        <b-row align-h="between">
          <h5 class="mb-0">Recommendation Card</h5>
          <b-row class="mr-2">
            <b-button variant="primary" @click="showAddModal">Add</b-button>
            <b-button
              class="ml-2"
              variant="danger"
              v-if="selected.length > 0"
              @click="multiDelete"
            >Delete</b-button>
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
        >
          <!-- Example scoped slot for select state illustrative purposes -->
          <template v-slot:cell(action)="item">
            <b-button variant="outline-primary" @click="openEditModal(item)">Edit</b-button>
            <b-button
              variant="outline-danger"
              @click="deleteRecommendation(item)"
              class="ml-2"
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
export default {
  name: "RecommendationCard",
  data() {
    return {
      fields: ["description", "createdAt", "action"],
      modalShow: false,
      data: {
        description: ""
      },
      selected: [],
      modalType: 1 // 1: add, 2: edit
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
          "event_recommendation_card",
          JSON.stringify(this.items)
        );
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

      store.commit("setRecommendationList", newList);
      localStorage.setItem(
        "event_recommendation_card",
        JSON.stringify(newList)
      );
    },
    multiDelete() {
      let newList = [];
      this.items.forEach(item => {
        let isDeleted = false;
        this.selected.forEach(selectedItem => {
          if (item.id == selectedItem.id) {
            isDeleted = true;
          }
        });
        if (!isDeleted) {
          newList.push(item);
        }
      });

      store.commit("setRecommendationList", newList);
      localStorage.setItem(
        "event_recommendation_card",
        JSON.stringify(newList)
      );
    },
    onEventListener() {
      setInterval(function() {
        const event_recommendation_panel = localStorage.getItem(
          "event_recommendation_panel"
        );
        if (event_recommendation_panel != null) {
          const newList = JSON.parse(event_recommendation_panel);
          store.commit("setRecommendationList", newList);
          localStorage.removeItem("event_recommendation_panel");
        }
      }, 100);
    }
  }
};
</script>

<style>
</style>
