var vm = new Vue({
  el: '#subtraction',
  data: {
    rawMinuend: null,
    rawSubtrahend: null
  },
  computed: {
    largeBase: function() {
      var base = 10
      while (true) {
        if (
          base * 10 >= Math.abs(this.minuend) &&
          base * 10 >= Math.abs(this.subtrahend)
        ) {
          return base
        }
        base *= 10
      }
    },
    maxInput: function() {
      return _.max([this.minuend, this.subtrahend])
    },
    maxShown: function() {
      return Math.ceil(this.maxInput / this.largeBase) * this.largeBase
    },
    minInput: function() {
      return _.min([this.minuend, this.subtrahend])
    },
    minShown: function() {
      return Math.floor(this.minInput / this.largeBase) * this.largeBase
    },
    minuend: function() {
      return this.rawMinuend || 0
    },
    minuendIsGreaterThanSubtrahend: function() {
      return this.minuend > this.subtrahend
    },
    smallBase: function() {
      return this.largeBase / 10
    },
    subtrahend: function() {
      return this.rawSubtrahend || 0
    }
  },
  methods: {
    newMinuendAndSubtrahend: function() {
      if (this.minuend === this.subtrahend) {
        return
      }
      showSubtraction()
    }
  }
})

var svg
var svgWidth
const numberLineXMargin = 20
const numberLineXLeft = numberLineXMargin
var numberLineXRight
const numberLineY = 150
const smallTickWidth = 1
const smallTickLength = 20
const smallTickYTop = numberLineY - smallTickLength
const largeTickWidth = 3
const largeTickLength = 40
const largeTickYTop = numberLineY - largeTickLength
const tickXOffset = (largeTickWidth + 1) / 2 + numberLineXMargin
var tickXMinimumValue
var tickXScalingFactor
const tickLabelY = numberLineY + 20
const specialNumberLabelY = largeTickYTop - 20
const specialWordLabelY = specialNumberLabelY - 20
const transitionDuration = 750

function showSubtraction() {
  updateSvgWidth(svg)

  var smallData = _.range(vm.minShown, vm.maxShown + 1, vm.smallBase)
  var largeData = _.filter(smallData, isAMultipleOfTheLargeBase)
  var smallData = _.difference(smallData, largeData)
  var checkpointData = getCheckpointData()
  var minuend = vm.minuend
  var subtrahend = vm.subtrahend
  var minShown = vm.minShown
  var maxShown = vm.maxShown
  var minuendIsGreaterThanSubtrahend = vm.minuendIsGreaterThanSubtrahend

  showNoData()
  setTimeout(function() {
    showAllData(
      smallData, largeData, checkpointData, minuend, subtrahend,
      minShown, maxShown
    )
    setTimeout(function() {
      showSubtrahend(
        smallData, largeData, checkpointData, minuend, subtrahend,
        minShown, maxShown, minuendIsGreaterThanSubtrahend
      )
      setTimeout(function() {
        showAllData(
          smallData, largeData, checkpointData, minuend, subtrahend,
          minShown, maxShown
        )
        setTimeout(function() {
          showMinuend(
            smallData, largeData, checkpointData, minuend, subtrahend,
            minShown, maxShown, minuendIsGreaterThanSubtrahend
          )
          setTimeout(function() {
            showAllData(
              smallData, largeData, checkpointData, minuend, subtrahend,
              minShown, maxShown
            )
          }, 2 * transitionDuration)
        }, 2 * transitionDuration)
      }, 2 * transitionDuration)
    }, 2 * transitionDuration)
  }, 1.1 * transitionDuration)
}

function updateSvgWidth(svg) {
  svgWidth = parseInt(svg.style('width'))
  numberLineXRight = svgWidth - numberLineXMargin
}

function isAMultipleOfTheLargeBase(number) {
  return number % vm.largeBase === 0
}

function getCheckpointData() {
  var checkpointData = []
  var n = vm.subtrahend
  var power = 0
  while (true) {
    if (vm.minuend > vm.subtrahend) {
      n += Math.pow(10, power)
    } else {
      n -= Math.pow(10, power)
    }
    if (n === vm.minuend) {
      break
    }
    checkpointData.push(n)
    if (n % Math.pow(10, power + 1) === 0) {
      power += 1
    }
    if (vm.minuend > vm.subtrahend) {
      if ((vm.minuend - n) < Math.pow(10, power)) {
        power -= 1
      }
    } else {
      if ((n - vm.minuend) < Math.pow(10, power)) {
        power -= 1
      }
    }
  }
  return checkpointData
}

function showNoData() {
  updateVisualization([], [], [])
}

function showAllData(
  smallData, largeData, checkpointData, minuend, subtrahend, minShown, maxShown
) {
  updateTickXScaling(minShown, maxShown)
  updateVisualization(smallData, largeData, checkpointData, minuend, subtrahend)
}

function showSubtrahend(
  smallData, largeData, checkpointData, minuend, subtrahend, minShown, maxShown,
  minuendIsGreaterThanSubtrahend
) {
  if (minuendIsGreaterThanSubtrahend) {
    var subtrahendZoomLeftPad = 1
    var subtrahendZoomRightPad = 3
  }
  else {
    var subtrahendZoomLeftPad = 3
    var subtrahendZoomRightPad = 1
  }
  var numberSmallerThanSubtrahend = _.max([minShown,
    subtrahend - subtrahendZoomLeftPad
  ])
  var numberLargerThanSubtrahend = _.min([maxShown,
    subtrahend + subtrahendZoomRightPad
  ])
  updateTickXScaling(numberSmallerThanSubtrahend, numberLargerThanSubtrahend)
  updateVisualization(smallData, largeData, checkpointData, minuend, subtrahend)
}

function showMinuend(
  smallData, largeData, checkpointData, minuend, subtrahend, minShown, maxShown,
  minuendIsGreaterThanSubtrahend
) {
  if (minuendIsGreaterThanSubtrahend) {
    var minuendZoomLeftPad = 3
    var minuendZoomRightPad = 1
  }
  else {
    var minuendZoomLeftPad = 1
    var minuendZoomRightPad = 3
  }
  var numberSmallerThanMinuend = _.max([minShown, minuend - minuendZoomLeftPad])
  var numberLargerThanMinuend = _.min([maxShown, minuend + minuendZoomRightPad])
  updateTickXScaling(numberSmallerThanMinuend, numberLargerThanMinuend)
  updateVisualization(smallData, largeData, checkpointData, minuend, subtrahend)
}

function updateTickXScaling(minShown, maxShown) {
  tickXMinimumValue = minShown
  tickXScalingFactor = (svgWidth - 2 * tickXOffset) / (maxShown - minShown)
}

function updateVisualization(
  smallData, largeData, checkpointData, minuend, subtrahend
) {
  var smallTickClass = getTickClass(1)
  var largeTickClass = getTickClass(10)
  var tickLabelClass = getTickLabelClass()
  var minuendLabelClass = getSpecialLabelClass('minuend')
  var subtrahendLabelClass = getSpecialLabelClass('subtrahend')
  var startLabelClass = getSpecialLabelClass('start')
  var finishLabelClass = getSpecialLabelClass('finish')
  var checkpointLabelClass = getSpecialLabelClass('checkpoint')
  var smallTicks = svg.selectAll('.' + smallTickClass).data(smallData)
  var largeTicks = svg.selectAll('.' + largeTickClass).data(largeData)
  var tickLabels = svg.selectAll('.' + tickLabelClass).data(largeData)
  if (smallData.length > 0) {
    var minuendData = [minuend]
    var subtrahendData = [subtrahend]
  }
  else {
    var minuendData = []
    var subtrahendData = []
  }
  var minuendLabel = svg.selectAll('.' + minuendLabelClass).data(minuendData)
  var subtrahendLabel = svg.selectAll('.' + subtrahendLabelClass).data(subtrahendData)
  var startLabel = svg.selectAll('.' + startLabelClass).data(subtrahendData)
  var finishLabel = svg.selectAll('.' + finishLabelClass).data(minuendData)
  var checkpointLabel = svg.selectAll('.' + checkpointLabelClass).data(checkpointData)

  updateTicks(smallTicks, 1)
  updateTicks(largeTicks, 10)
  updateTickLabels(tickLabels)
  updateSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel,
                      checkpointLabel)

  enterTicks(smallTicks, 1)
  enterTicks(largeTicks, 10)
  enterTickLabels(tickLabels, 10)
  enterSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel,
                     checkpointLabel)

  exitTicks(smallTicks)
  exitTicks(largeTicks)
  exitTickLabels(tickLabels)
  exitSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel,
                    checkpointLabel)
}

function getTickClass(multiple) {
  if (multiple == 1) {
    return 'smallTick'
  } else if (multiple === 10) {
    return 'largeTick'
  }
}

function getTickLabelClass() {
  return 'tickLabel'
}

function getSpecialLabelClass(id) {
  if (id === 'minuend') {
    return 'minuendLabel'
  } else if (id === 'subtrahend') {
    return 'subtrahendLabel'
  } else if (id === 'start') {
    return 'startLabel'
  } else if (id === 'finish') {
    return 'finishLabel'
  } else if (id === 'checkpoint') {
    return 'checkpointLabel'
  }
}

function updateTicks(ticks, multiple) {
  var tickYTop = getTickYTop(multiple)
  x = ticks
    .transition()
    .duration(transitionDuration)
    .attr('x1', getNumberTickX)
    .attr('x2', getNumberTickX)
    .attr('y1', numberLineY)
    .attr('y2', tickYTop)
}

function getNumberTickX(d) {
  return (d - tickXMinimumValue) * tickXScalingFactor + tickXOffset
}

function updateTickLabels(labels) {
  labels
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
}

function updateSpecialLabels(minuendLabel, subtrahendLabel, startLabel,
                             finishLabel, checkpointLabel) {
  minuendLabel
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
  subtrahendLabel
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
  startLabel
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
  finishLabel
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
  checkpointLabel
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
}

function enterTicks(ticks, multiple) {
  var tickClass = getTickClass(multiple)
  var tickWidth = getTickWidth(multiple)
  var tickYTop = getTickYTop(multiple)
  ticks
    .enter()
    .append('line')
    .attr('class', tickClass)
    .attr('x1', getNumberTickX)
    .attr('x2', getNumberTickX)
    .attr('y1', numberLineY)
    .attr('y2', numberLineY)
    .attr('stroke', '#000')
    .attr('stroke-width', tickWidth)
    .transition()
    .duration(transitionDuration)
    .attr('y2', tickYTop)
}

function getTickWidth(multiple) {
  if (multiple == 1) {
    return 1
  } else if (multiple === 10) {
    return 3
  }
}

function getTickYTop(multiple) {
  if (multiple === 1) {
    return smallTickYTop
  } else if (multiple === 10) {
    return largeTickYTop
  }
}

function enterTickLabels(labels, multiple) {
  var labelClass = getTickLabelClass(multiple)
  labels
    .enter()
    .append('text')
    .attr('class', labelClass)
    .attr('x', getNumberTickX)
    .attr('y', tickLabelY)
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return d
    })
    .attr('fill', '#fff')
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#000')
}

function enterSpecialLabels(minuendLabel, subtrahendLabel, startLabel,
                            finishLabel, checkpointLabel) {
  var minuendLabelClass = getSpecialLabelClass('minuend')
  var subtrahendLabelClass = getSpecialLabelClass('subtrahend')
  var startLabelClass = getSpecialLabelClass('start')
  var finishLabelClass = getSpecialLabelClass('finish')
  var checkpointLabelClass = getSpecialLabelClass('checkpoint')
  checkpointLabel
    .enter()
    .append('text')
    .attr('class', checkpointLabelClass)
    .attr('x', getNumberTickX)
    .attr('y', specialNumberLabelY)
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return d
    })
    .attr('fill', '#fff')
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#ccc')
  minuendLabel
    .enter()
    .append('text')
    .attr('class', minuendLabelClass)
    .attr('x', getNumberTickX)
    .attr('y', specialNumberLabelY)
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return d
    })
    .attr('fill', '#fff')
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#000')
  subtrahendLabel
    .enter()
    .append('text')
    .attr('class', subtrahendLabelClass)
    .attr('x', getNumberTickX)
    .attr('y', specialNumberLabelY)
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return d
    })
    .attr('fill', '#fff')
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#000')
  startLabel
    .enter()
    .append('text')
    .attr('class', startLabelClass)
    .attr('x', getNumberTickX)
    .attr('y', specialWordLabelY)
    .attr('text-anchor', 'middle')
    .text('Start')
    .attr('fill', '#fff')
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#093')
  finishLabel
    .enter()
    .append('text')
    .attr('class', finishLabelClass)
    .attr('x', getNumberTickX)
    .attr('y', specialWordLabelY)
    .attr('text-anchor', 'middle')
    .text('Finish')
    .attr('fill', '#fff')
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#903')
}

function exitTicks(ticks) {
  ticks
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('y2', numberLineY)
    .remove()
}

function exitTickLabels(labels) {
  labels
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#fff')
    .remove()
}

function exitSpecialLabels(minuendLabel, subtrahendLabel, startLabel,
                           finishLabel, checkpointLabel) {
  minuendLabel
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#fff')
    .remove()
  subtrahendLabel
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#fff')
    .remove()
  startLabel
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#fff')
    .remove()
  finishLabel
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#fff')
    .remove()
  checkpointLabel
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#fff')
    .remove()
}

function initializeVisualization() {
  svg = d3.select('.main-content')
    .append('svg')
    .attr('width', '100%')
    .attr('height', 300)
  updateSvgWidth(svg)
  svg
    .append('line')
    .attr('x1', numberLineXLeft)
    .attr('x2', numberLineXRight)
    .attr('y1', numberLineY)
    .attr('y2', numberLineY)
    .attr('stroke', '#000')
    .attr('stroke-width', 3)
}

initializeVisualization()
