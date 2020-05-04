import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    reminders: [],
    reminderPanelStyle: {}
  },
  mutations: {
    addReminder(state, newData) {
      state.reminders.push(newData)
    },
    setReminderList(state, data) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const patientId = urlParams.get("patient_id");
      let newList = []
      state.reminders.forEach(item => {
        console.log(item)
        if (item.patientId != patientId) {
          newList.push(item)
        }
      })
      if (data.length > 0) {
        data.forEach(item => {
          newList.push(item)
        })
      }

      state.reminders = newList
    },
    saveStyle(state, data) {
      const { patientId, style } = data
      state.reminderPanelStyle[`${patientId}`] = style
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
