const BASE_URL = 'https://customwidget.github.io/Data-Binding-Example/Bar-Race-Country'

var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

(function () {
  const barRaceCountry = document.createElement('template')
  barRaceCountry.innerHTML = `
      <style>
        #title {
          width: 100%;
          height: 6%;
          text-align: center;
          font-weight: bold;
          color: #ffffff;
          font-family: "72-web";
          font-size: 16px;
        }
        #year {
          text-align: center;
          font-family: "72-web";
          font-size: 16px;
          font-weight: bold;
          color: gray;
        }
        #chart {
          width: 100%;
          height: 94%;
        }
      </style>
      <div id="root" style="width: 100%; height: 100%;">
        <div id="title" >NPS Survey <span id="year"></span></div>
        <div id="chart" />
      </div>
    `
  class BarRaceCountry extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(barRaceCountry.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')
      this._chart = this._shadowRoot.getElementById('chart')
      this._year = this._shadowRoot.getElementById('year')

      this._props = {}

      this._interval = undefined

      this.render()
    }

    onCustomWidgetResize (width, height) {
      this.render()
    }

    async render () {
      await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.0.0/echarts.min.js')

      const span = this._year

      if (this._myChart) {
        echarts.dispose(this._myChart)
      }
      if (this._interval) {
        clearInterval(this._interval)
      }
      const myChart = this._myChart = echarts.init(this._chart, 'dark')

      const updateFrequency = 2000
      const dimension = 1 // Life Expectancy
      const countryColors = {
        Australia: '#9dc3e6',
        Canada: '#9dc3e6',
        China: '#9dc3e6',
        Cuba: '#9dc3e6',
        Finland: '#9dc3e6',
        France: '#9dc3e6',
        Germany: '#9dc3e6',
        Iceland: '#9dc3e6',
        India: '#9dc3e6',
        Japan: '#9dc3e6',
        'North Korea': '#9dc3e6',
        'South Korea': '#9dc3e6',
        'New Zealand': '#9dc3e6',
        Norway: '#9dc3e6',
        Poland: '#9dc3e6',
        Russia: '#9dc3e6',
        Turkey: '#9dc3e6',
        'United Kingdom': '#9dc3e6',
        'United States': '#9dc3e6'
      }
      await getScriptPromisify(`${BASE_URL}/data/emoji-flags@1.3.0/data.js`)
      await getScriptPromisify(`${BASE_URL}/data/life-expectancy-table.js`)
      const flags = window.barRaceCountryFlags
      let data = window.barRaceCountryFlagsTable
      data = data.filter((line, index) => {
        if (index === 0) { return true }
        const year = line[4]
        return year >= 1950 && year < 1950 + 24
      }).filter((line, index) => {
        if (index === 0) { return true }
        const country = line[3]
        return [
          'Canada',
          'China',
          'Germany',
          'India',
          'Japan',
          'United States'
        ].indexOf(country) !== -1
      })
      data.forEach(line => {
        const year = line[4]
        if (isNaN(year)) { return }
        const month = year - 1950
        if (month < 12) {
          line[4] = `2015.${month + 1}`
        } else {
          line[4] = `2016.${month + 1 - 12}`
        }
      })
      const years = []
      for (let i = 0; i < data.length; ++i) {
        if (years.length === 0 || years[years.length - 1] !== data[i][4]) {
          years.push(data[i][4])
        }
      }
      function getCode (countryName) {
        if (!countryName) {
          return ''
        }
        // https://unicode.org/emoji/charts/full-emoji-list.html#country-flag
        return (
          flags.find(function (item) {
            return item.name === countryName
          }) || {}
        ).code
      }
      const startIndex = 1
      const startYear = years[startIndex]
      span.textContent = startYear
      const option = {
        grid: {
          top: 10,
          bottom: 30,
          left: 150,
          right: 80
        },
        xAxis: {
          max: 'dataMax',
          axisLabel: {
            formatter: function (n) {
              return Math.round(n) + ''
            }
          }
        },
        dataset: {
          source: data.slice(1).filter(function (d) {
            return d[4] === startYear
          })
        },
        yAxis: {
          type: 'category',
          inverse: true,
          axisLabel: {
            show: true,
            fontSize: 14,
            formatter: function (value) {
              return `${value}  {${getCode(value)}|}`
            },
            rich: {
              CA: { backgroundColor: { image: `${BASE_URL}/assets/ca-flag.png` } },
              CN: { backgroundColor: { image: `${BASE_URL}/assets/ch-flag.png` } },
              DE: { backgroundColor: { image: `${BASE_URL}/assets/gm-flag.png` } },
              IN: { backgroundColor: { image: `${BASE_URL}/assets/in-flag.png` } },
              JP: { backgroundColor: { image: `${BASE_URL}/assets/ja-flag.png` } },
              US: { backgroundColor: { image: `${BASE_URL}/assets/us-flag.png` } }
            }
          },
          animationDuration: 300,
          animationDurationUpdate: 300
        },
        series: [
          {
            realtimeSort: true,
            seriesLayoutBy: 'column',
            type: 'bar',
            itemStyle: {
              color: function (param) {
                return countryColors[param.value[3]] || '#5470c6'
              }
            },
            encode: {
              x: dimension,
              y: 3
            },
            label: {
              show: true,
              precision: 1,
              position: 'right',
              valueAnimation: true,
              fontFamily: 'monospace'
            }
          }
        ],
        // Disable init animation.
        animationDuration: 0,
        animationDurationUpdate: updateFrequency,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear'
        // graphic: {
        //   elements: [
        //     {
        //       type: 'text',
        //       right: 60,
        //       bottom: 10,
        //       style: {
        //         text: startYear,
        //         font: 'bolder 80px monospace',
        //         fill: 'rgba(100, 100, 100, 0.8)'
        //       },
        //       z: 100
        //     }
        //   ]
        // }
      }
      // console.log(option);
      myChart.setOption(option)
      // for (let i = startIndex; i < years.length - 1; ++i) {
      //   (function (i) {
      //     setTimeout(function () {
      //       updateYear(years[i + 1])
      //     }, (i - startIndex) * updateFrequency)
      //   })(i)
      // }
      let i = 0
      this._interval = setInterval(function () {
        i++
        i = i % years.length
        if (i === 0) { i++ }
        // console.log(years[i])
        updateYear(years[i])
      }, updateFrequency)
      function updateYear (year) {
        const source = data.slice(1).filter(function (d) {
          return d[4] === year
        })
        // console.log(source)
        option.series[0].data = source
        // option.graphic.elements[0].style.text = year
        span.textContent = year
        myChart.setOption(option)
      }
    }
  }

  customElements.define('com-sap-sample-echarts-bar-race-country', BarRaceCountry)
})()
