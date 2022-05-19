var getScriptPromisify = (src) => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

(function () {
  const calendar = document.createElement('template')
  calendar.innerHTML = `
      <style>
        #title {
          width: 50%;
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
        <div id="title" >2016.12 Sales</div>
        <div id="chart" />
      </div>
    `
  class Calendar extends HTMLElement {
    constructor () {
      super()

      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(calendar.content.cloneNode(true))

      this._root = this._shadowRoot.getElementById('root')
      this._chart = this._shadowRoot.getElementById('chart')
      this._year = this._shadowRoot.getElementById('year')

      this._props = {}

      this.render()
    }

    onCustomWidgetResize (width, height) {
      this.render()
    }

    async render () {
      await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.0.0/echarts.min.js')

      if (this._myChart) {
        echarts.dispose(this._myChart)
      }
      const myChart = this._myChart = echarts.init(this._chart, 'dark')

      function getVirtulData (year) {
        year = year || '2016'
        const date = +echarts.number.parseDate(year + '-01-01')
        const end = +echarts.number.parseDate(+year + 1 + '-01-01')
        const dayTime = 3600 * 24 * 1000
        const data = []
        for (let time = date; time < end; time += dayTime) {
          data.push([
            echarts.format.formatTime('yyyy-MM-dd', time),
            Math.floor(Math.random() * 1000)
          ])
        }
        console.log(data[data.length - 1])
        return data
      }
      const option = {
        tooltip: {
          position: 'top'
        },
        visualMap: [
        ],
        calendar: [
          {
            orient: 'vertical',
            yearLabel: {
              margin: 40,
              show: false
            },
            monthLabel: {
              margin: 20
            },
            cellSize: 40,
            left: 0,
            range: '2016-01'
          }
        ],
        series: [
          {
            type: 'effectScatter',
            coordinateSystem: 'calendar',
            calendarIndex: 0,
            symbolSize: function (val) {
              return val[1] / 40
            },
            data: getVirtulData('2016')
          }
        ]
      }
      // console.log(option);
      myChart.setOption(option)
    }
  }

  customElements.define('com-sap-sample-echarts-calendar', Calendar)
})()
