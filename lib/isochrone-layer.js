/** The layer that shows the isochrones */

import React, {Component, PropTypes} from 'react'
import L from 'leaflet'
import { CanvasTileLayer } from 'react-leaflet'
import Color from 'color'

// qualitative scheme from http://colorbrewer2.org/
const COLORS = [
  '#7fc97f',
  '#beaed4',
  '#fdc086',
  '#ffff99',
  '#386cb0'
].map(c => new Color(c))

export default class IsochroneLayer extends Component {
  static propTypes = {
    addresses: PropTypes.array,
    bc: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = { surfaces: [] }
  }

  /** get travel time surfaces */
  componentDidMount () {
    Promise.all(
      this.props.addresses
        .map(a => {
          // convert coordinates to leaflet point, project
          let pj = L.Map.prototype.project(a.coordinates, this.props.bc.query.zoom)
          pj.x -= this.props.bc.query.west
          pj.y -= this.props.bc.query.north

          // cast to int
          pj.x |= 0
          pj.y |= 0

          if (pj.x < 0 || pj.x > this.props.bc.query.width || pj.y < 0 || pj.y > this.props.bc.query.height) {
            console.log('location outside map bounds')
            return
          }

          return fetch(`${this.props.baseUrl}/${pj.x}/${pj.y}.dat`)
            .then(res => res.arrayBuffer())
            .then(res => {
              return {
                x: pj.x,
                y: pj.y,
                address: a,
                origin: res
              }
            })
        })
        .filter(a => a !== undefined)
    )
    .then(res => {
      this.state.surfaces = res.map(r => {
        this.props.bc.setOrigin(r.origin, r.x, r.y)
        return {
          address: r.address,
          surface: this.props.bc.generateSurface()
        }
      })

      this.setState(this.state)
    })
  }

  getTimes (x, y, scale) {
    x = x * scale | 0
    y = y * scale | 0

    let q = this.props.bc.query

    x -= q.west
    y -= q.north

    if (x < 0 || x > q.width || y < 0 || y > q.height) return this.state.surfaces.map(s => 255)

    return this.state.surfaces.map(s => s.surface.surface[y * q.width + x])
  }

  drawTile (canvas, tilePoint, zoom) {
    let xbase = tilePoint.x * 256
    let ybase = tilePoint.y * 256

    let ctx = canvas.getContext('2d')
    let id = ctx.createImageData(256, 256)

    let scale = Math.pow(2, this.props.bc.query.zoom - zoom)

    for (let y = 0, pixel = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++, pixel++) {
        let xo = x + xbase
        let yo = y + ybase
        let times = this.getTimes(xo, yo, scale)
        let max = times.reduce((a, b) => Math.max(a, b))

        // opacity shows minimum travel time
        let alpha
        if (max > 60) alpha = 0
        else if (max > 45) alpha = 70
        else if (max > 30) alpha = 120
        else if (max > 15) alpha = 175
        else alpha = 210
        id.data[pixel * 4 + 3] = alpha

        // save some cycles
        if (max > 60) continue

        // blend the colors
        let color = new Color('#ffffff')

        // figure out ratios, making sure they sum to one
        let ratios = times.map(t => max - t)
        let sum = ratios.reduce((a, b) => a + b)
        ratios = ratios.map(r => r / sum)
        ratios.forEach((r, idx) => color = color.mix(COLORS[idx], r))

        id.data[pixel * 4] = color.red()
        id.data[pixel * 4 + 1] = color.green()
        id.data[pixel * 4 + 2] = color.blue()
      }
    }

    ctx.putImageData(id, 0, 0)
    console.log(`tile ${tilePoint.x}, ${tilePoint.y} done`)
  }

	render () {
    if (this.state.surfaces.length === 0) return <span></span>

    return <CanvasTileLayer map={this.props.map} drawTile={(canvas, tilePoint, zoom) => this.drawTile(canvas, tilePoint, zoom)} async={false} tileDrawn={() => {}} />
  }
}