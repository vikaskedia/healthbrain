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
          <h5 v-if="style == 1" class="m-md-2">Reminder Card</h5>
          <span style="font-weight: bold;" v-if="style == 2">Reminder Card</span>
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
              @click="deleteReminder(item)"
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

const REMINDER_API_URL = "http://localhost:3000/reminders";
const STYLE_API_URL = "http://localhost:3000/style";
const ADD_DIALOG = 1;
export default {
  name: "ReminderCard",
  data() {
    return {
      modalShow: false,
      data: {
        description: ""
      },
      selected: [],
      modalType: 1, // 1: add, 2: edit
      style: 1,
      timer: -1
    };
  },
  computed: {
    validation() {
      return this.data.description.length > 0;
    },
    modalTitle() {
      return this.modalType == 1 ? "Add Reminder" : "Edit Reminder";
    },
    items() {
      return store.state.reminders.filter(item => {
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
    this.getRemindersFromServer();
    this.loadStyle();
  },
  watch: {
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

        store.commit("addReminder", this.data);
        localStorage.setItem("event_reminder_card", JSON.stringify(this.items));

        await fetch(REMINDER_API_URL, {
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
        store.commit("setReminderList", newList);
        localStorage.setItem("event_reminder_card", JSON.stringify(newList));

        await fetch(`${REMINDER_API_URL}/${this.data.id}`, {
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
    async deleteReminder(item) {
      let newList = [];
      this.items.forEach((data, index) => {
        if (index != item.index) {
          newList.push(data);
        }
      });

      const data = this.items[item.index];

      await fetch(`${REMINDER_API_URL}/${data.id}`, { method: "DELETE" });

      store.commit("setReminderList", newList);
      localStorage.setItem("event_reminder_card", JSON.stringify(newList));
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
          await fetch(`${REMINDER_API_URL}/${item.id}`, {
            method: "DELETE"
          });
        } else {
          newList.push(item);
        }

        if (++index == this.items.length) {
          store.commit("setReminderList", newList);
          localStorage.setItem("event_reminder_card", JSON.stringify(newList));
        }
      });
    },
    onEventListener() {
      this.timer = setInterval(function() {
        const event_reminder_panel = localStorage.getItem(
          "event_reminder_panel"
        );
        if (event_reminder_panel != null) {
          const newList = JSON.parse(event_reminder_panel);
          store.commit("setReminderList", newList);
          localStorage.removeItem("event_reminder_panel");
        }
      }, 100);
    },
    async getRemindersFromServer() {
      const response = await fetch(`${REMINDER_API_URL}?patientId=${this.id}`);
      if (response.ok) {
        let json = await response.json();
        store.commit("setReminderList", json);
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
