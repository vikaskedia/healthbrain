import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {    
    /* 
      Goal: When doctor reloads a patient file give instant view of the patient file. 
      If API takes 1 second to get data from server then the doctor will get view of patient file 1 second faster.
      
      Q) How is this implemented?
      When page is loaded this state is initialized by plugin createPersistedState. The vuex-persistedstate plugin loads data from localstorage into vuex 
      Once componet has mounted then in file:///gt/sc-prog-repos/healthbrain/recommendation-card/src/App.vue     
      getRecommendationsFromServer(); is called. The API updates data inside vuex only if api returns a different data set

      Where is the functions to execute when component is mounted specified?
      In file  file:///gt/sc-prog-repos/healthbrain/recommendation-card/src/App.vue 
      mounted() {
        this.onEventListener();
        this.getRecommendationsFromServer();
        this.loadStyle();
      }
   */
     recommendations: [],
     recommendationCardStyle: {}
  },
  mutations: {
    addRecommendation(state, newData) {
      state.recommendations.push(newData)
      /* Question:
        Should the DB update and localstorage update happen here?
      */
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

    /*
      Refactor:
      Savestyle is done by user preferences app. This app already exists and is completely seperate.
    */

    saveStyle(state, data) {
      const { patientId, style } = data
      state.recommendationCardStyle[`${patientId}`] = style
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
