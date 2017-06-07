<template>
  <div id="app">
    <div class="search-box">
      <input type="tel" v-model="searchQuery" placeholder="Search here!"
        @input="updateResults"/>
    </div>
    <div class="search-results">
      <div class="search-list" @click="viewingMap = false"
          :class="{
            'viewing-map': viewingMap,
            }">
        <div v-if="!searchResults.length" class="no-results">
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
              <tr>
                <th>Road Name</th>
                <td>{{v.ROAD_NAME}}</td>
              </tr>
              <tr v-if="v.BUILDING !== 'NIL'">
                <th>Building.</th>
                <td>{{v.BUILDING}}</td>
              </tr>
              <tr>
                <th>Postal Code</th>
                <td>{{v.POSTAL}}</td>
              </tr>
              <!-- <tr> -->
              <!-- <td colspan="2">{{v}}</td></tr> -->
            </tbody>
          </table>
        </div>

        <div class="no-results">
          Search results powered by OneMap

          <div class="icon-attributions">
            <div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
            <div>Icons made by <a href="http://www.flaticon.com/authors/madebyoliver" title="Madebyoliver">Madebyoliver</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
          </div>
        </div>
      </div>
      <gmap-map class="search-map" :center="mapCenter" :zoom="mapZoom"
        ref="searchMap" @zoom_changed="mapZoom = $event" :options="mapOptions">
        <gmap-marker :position="mapCenter" />
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
      viewingMap: false,
      mapOptions: {
        mapTypeControl: false,
      }
    }
  },
  mounted() {
    this.$refs.searchMap.resizePreserveCenter()
  },
  methods: {
    updateResults: _.throttle(function () {
      if (this.searchQuery) {
        axios.get(`https://developers.onemap.sg/commonapi/search?` + querystring.stringify({
          searchVal: this.searchQuery,
          returnGeom: 'Y',
          getAddrDetails: 'Y'
        }))
        .then((response) => {
          this.searchResults = response.data.results;
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

    input {
      box-sizing: border-box;
      padding: 0.5em;
      width: 100%;
      font-size: 150%;
      font-family: monospace;
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
}
</style>
