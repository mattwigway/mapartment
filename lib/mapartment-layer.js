/**
 * Mapartment leaflet layer.
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

import React, { PropTypes, Component } from 'react'
import { Marker, Popup } from 'react-leaflet'
import geocode from './geocode'
import IsochroneLayer from './isochrone-layer'

export default class MapartmentLayer extends Component {
  static propTypes = {
    addresses: PropTypes.array,
    baseUrl: PropTypes.string
  }

  constructor (props) {
    super(props)
    // copy addresses
    this.state = { addresses: this.props.addresses.map(a => {return { address: a, coordinates: null }} ) }
  }

  componentDidMount () {
    // geocode addresses
    // todo bounding box
    Promise
      .all(this.state.addresses.map(a => geocode(a.address)))
      .then(res => {
        res.forEach((coord, idx) => this.state.addresses[idx].coordinates = coord)
        this.setState(this.state) // trigger render
      })
  }

  render () {
    if (this.state.addresses.length === 0) return (<span></span>)

    // geocode addresses
    let willDraw = true

    // only draw the map if we have coordinates for each address
    this.state.addresses.forEach(a => {
      if (!a.coordinates) willDraw = false
    })

    if (willDraw) {
      return (<span>
          <IsochroneLayer map={this.props.map} bc={this.props.bc} addresses={this.state.addresses} baseUrl={this.props.baseUrl} />
    
          {this.state.addresses.map(a => (
            <Marker position={a.coordinates} key={a.address} map={this.props.map}>
              <Popup><span>{a.address}</span></Popup>
            </Marker>
            ))}
        </span>)
    }
    else return <span></span>
  }
}
