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
      state.reminders = data
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
