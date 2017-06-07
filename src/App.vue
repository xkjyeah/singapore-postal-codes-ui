<template>
  <div id="app">
    <div class="search-box">
        <input type="tel" v-model="searchQuery" placeholder="Search here!"
          @input="updateResults" ref="searchQueryBox"/>
        <button @click="searchQuery = '', $refs.searchQueryBox.focus()" v-show="searchQuery" class="clear-query-button">
          x
        </button>
    </div>
    <div class="search-results">
      <div class="search-list" @click="viewingMap = false"
          :class="{
            'viewing-map': viewingMap,
            }">
        <div v-if="!searchResults.length && validQuery && searchQuery && !inFlight" class="no-results">
          Sorry! Nothing found!
        </div>
        <div class="result-item" v-else
            v-for="(v, i) in searchResults"
            :class="{
              'active': v === selected,
              }">
          <table class="the-table">
            <tbody>
              <tr>
                <th>Block No.</th>
                <td>{{v.BLK_NO}}</td>
                <td rowspan="4" class="view-map-button">
                  <a href="#" @click.stop.prevented="zoomTo(v)" >
                    View <br/> in <br/> Map
                  </a>
                </td>
              </tr>
              <tr v-if="v.ROAD_NAME !== 'NIL'">
                <th>Road Name</th>
                <td>{{v.ROAD_NAME}}</td>
              </tr>
              <tr v-if="v.BUILDING !== 'NIL'">
                <th>Building.</th>
                <td>{{v.BUILDING}}</td>
              </tr>
              <tr v-if="v.POSTAL !== 'NIL'">
                <th>Postal Code</th>
                <td>{{v.POSTAL}}</td>
              </tr>
              <!-- <tr> -->
              <!-- <td colspan="2">{{v}}</td></tr> -->
            </tbody>
          </table>
        </div>

        <div class="no-results">
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          Search results powered by OneMap

          <br/>
          <br/>
          Bugs? Feature requests? <a href="https://github.com/xkjyeah/singapore-postal-codes-ui">File them at Github!</a>
          
          <br/>
          <br/>
          <div class="icon-attributions">
            <div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
            <div>Icons made by <a href="http://www.flaticon.com/authors/madebyoliver" title="Madebyoliver">Madebyoliver</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
          </div>
        </div>
      </div>
      <gmap-map class="search-map" :center="mapCenter" :zoom="mapZoom"
        ref="searchMap" @zoom_changed="mapZoom = $event" :options="mapOptions">
        <gmap-marker :position="mapCenter" />

        <div slot="visible">
          <div class="show-in-maps">
            <a class="button" :href="gmapsHref" target="_blank">
              Show in Maps
            </a>
          </div>
        </div>
      </gmap-map>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'
import querystring from 'querystring'

export default {
  name: 'app',
  data () {
    return {
      searchQuery: '',
      selected: null,
      searchResults: [],
      mapCenter: {lat:1.38, lng:103.8},
      mapZoom: 14,
      inFlight: false,
      viewingMap: false,
      mapOptions: {
        mapTypeControl: false,
      }
    }
  },
  computed: {
    gmapsHref () {
      return `https://www.google.com/maps/search/?api=1&query=${this.mapCenter.lat},${this.mapCenter.lng}`
    },
    validQuery () {
      return this.searchQuery.length === 6 || !/^[0-9]+$/.test(this.searchQuery)
    }
  },
  mounted() {
    this.$refs.searchMap.resizePreserveCenter()
  },
  methods: {
    updateResults: _.throttle(function () {
      this.viewingMap = false
      if (this.validQuery) {
        this.inFlight = true;
        axios.get(`https://developers.onemap.sg/commonapi/search?` + querystring.stringify({
          searchVal: this.searchQuery,
          returnGeom: 'Y',
          getAddrDetails: 'Y'
        }))
        .then((response) => {
          this.searchResults = response.data.results;
          this.inFlight = false;
        })
      } else {
        this.searchResults = []
      }
    }, 500, {leading: false, trailing: true}),

    zoomTo (result) {
      this.mapCenter = {
        lat: parseFloat(result.LATITUDE),
        lng: parseFloat(result.LONGITUDE)
      };

      this.$refs.searchMap.panTo(this.mapCenter)
      this.mapZoom = 18
      this.viewingMap = true
      this.selected = result
    }
  }
}
</script>

<style lang="scss">

* {
  font-family: Calibri, sans-serif;
}

body {
  background-color: #DDDDDD;
}

#app {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;

  max-width: 400px;
  width: 100%;
  margin: 0 auto;

  .search-box {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    border: solid 1px #888;
    border-radius: 0.5em;
    background-color: #FFF;
    padding: 0.5em;

    input {
      box-sizing: border-box;
      flex: 1 0 auto;
      font-size: 150%;
      font-family: monospace;
      background-color: #FFF;
      border: none;
      overflow: hidden;
    }
    .clear-query-button {
      border: none;
      background-color: #FFF;
    }
  }

  .search-results {
    flex: 1 1 auto;
    position: relative;
    overflow-x: hidden;

    .search-map, .search-list {
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
    }

    .search-map.visible {
      z-index: 2000;
    }

    .search-list {
      overflow-y: auto;
      box-shadow: 0 0 1em rgba(0,0,0,0.5);
      z-index: 1000;
      background-color: rgba(240, 240, 240, 0.9);
      transform: translateX(0);
      transition: all 0.1s ease;

      &.viewing-map {
        transform: translateX(calc(100% - 3em));
      }

      .icon-attributions {
        font-size: 50%;
      }

      .no-results {
        text-align: center;
      }
      .result-item {
        padding: 0.5em 1em;

        &.active {
          background-color: #DEF;
        }

        .the-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em auto;

          th { width: 100px; text-align: left }
          td.view-map-button { width: 80px; text-align: center; }
          td { text-align: left }

          th,td {
            border: solid 1px #CCC;
          }
        }
      }
    }
  }
  .show-in-maps {
    display: flex;
    flex-direction: row;
    justify-content: center;
    position: absolute;
    left: 0; right: 0;
    bottom: 1em;

    .button {
      flex: 0 0 auto;
      padding: 0.5em 2em;
      display: block;
      background: #69F;
      color: #000;
      border: solid 0.5px black;
      font-size: 120%;
      text-decoration: none;
      box-shadow: 0 0 1em rgba(0,0,0,0.5);
    }
  }
}
</style>
