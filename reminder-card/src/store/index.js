import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    reminders: []
  },
  mutations: {
    addReminder(state, newData) {
      state.reminders.push(newData)
    },
    setReminderList(state, data) {
      state.reminders = data
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
