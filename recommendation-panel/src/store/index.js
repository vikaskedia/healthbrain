import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";


Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // For doc read file:///gt/sc-prog-repos/healthbrain/recommendation-card/src/store/index.js   
    recommendations: [],
    recommendationPanelStyle: {}
  },
  mutations: {
    addRecommendation(state, newData) {
      state.recommendations.push(newData)
    },
    setRecommendationList(state, data) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const patientId = urlParams.get("patient_id");
      let newList = []
      state.recommendations.forEach(item => {
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

      state.recommendations = newList
    },
    saveStyle(state, data) {
      const { patientId, style } = data
      state.recommendationPanelStyle[`${patientId}`] = style
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
