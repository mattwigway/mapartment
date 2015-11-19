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

export default class Mapartment extends Component {
  componentDidMount () {
    // get query and stop tree information
    let baseUrl = this.props.baseUrl

    Promise.all([
      fetch(`${baseUrl}/query.json`).then(r => r.json()),
      fetch(`${baseUrl}/stop_trees.dat`).then(r => r.arrayBuffer())
    ])
    .then(res => {
      let bc = new Browsochrones()
      bc.setQuery(res[0])
      bc.setStopTrees(res[1])

      this.setState({bc})
    })
  }

  render () {
    if (this.state == null || this.state.bc == null) return <span>loading . . .</span>
    return <span>map</span>
  }
}
