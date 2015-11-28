/**
 * Main entry point for mapartment.
 * @author mattwigway

 *    Copyright 2015 Matthew Wigginton Conway
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, {Component, PropTypes} from 'react'
import Browsochrones from 'browsochrones'
import L from 'leaflet'
import { Map, TileLayer } from 'react-leaflet'
import MapartmentLayer from './mapartment-layer'

export default class Mapartment extends Component {
  static propTypes = {
    mapboxToken: PropTypes.string
  }

  componentDidMount () {
    // get query and stop tree information
    let baseUrl = this.props.baseUrl

    Promise.all([
      fetch(`${baseUrl}/query.json`).then(r => r.json()),
      fetch(`${baseUrl}/stop_trees.dat`).then(r => r.arrayBuffer())
    ])
    .then(res => {
      let bcFactory = function () {
        let bc = new Browsochrones()
        bc.setQuery(res[0])
        bc.setStopTrees(res[1])
        return bc
      }

      this.setState({bcFactory})
    })
  }

  render () {
    if (this.state == null || this.state.bcFactory == null) return <span>loading . . .</span>

    let bc = this.state.bcFactory()
    let pos = L.Map.prototype.unproject(L.point(bc.query.west + bc.query.width / 2, bc.query.north + bc.query.height / 2), bc.query.zoom) 

    return <div style={{width: '100%', height: '100%'}}>
      <Map center={pos} zoom={12}>
        <TileLayer
          url={'https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + this.props.mapboxToken}
          attribution='Data &copy; OpenStreetMap contributors; tiles &copy; Mapbox' />
        <MapartmentLayer bcFactory={this.state.bcFactory} addresses={['641 S St NW', '1200 18th St NW']}/>
      </Map>
    </div>
  }
}
