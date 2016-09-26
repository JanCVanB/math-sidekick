var svg
var svgWidth
const numberLineXMargin = 20
const numberLineXLeft = numberLineXMargin
var numberLineXRight
const numberLineWidth = 4
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
          base * 10 > Math.abs(this.minuend) &&
          base * 10 > Math.abs(this.subtrahend)
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
      return roundUp(this.maxInput, this.largeBase)
    },
    minInput: function() {
      return _.min([this.minuend, this.subtrahend])
    },
    minShown: function() {
      return roundDown(this.minInput, this.largeBase)
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
        showNoData()
      } else {
        showSubtraction()
      }
    }
  }
})

function roundUp(number, base) {
  return Math.ceil(number / base) * base
}

function roundDown(number, base) {
  return Math.floor(number / base) * base
}

function showNoData() {
  updateVisualization([], [], [])
}

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

  var minuendZoomBounds = getMinuendZoomBounds()
  var minuendZoomLeft = minuendZoomBounds.left
  var minuendZoomRight = minuendZoomBounds.right
  var subtrahendZoomBounds = getSubtrahendZoomBounds()
  var subtrahendZoomLeft = subtrahendZoomBounds.left
  var subtrahendZoomRight = subtrahendZoomBounds.right

  showNoData()
  setTimeout(function() {
    showAllData(
      smallData, largeData, checkpointData, minuend, subtrahend,
      minShown, maxShown
    )
    setTimeout(function() {
      showSubtrahend(
        smallData, largeData, checkpointData, minuend, subtrahend,
        minShown, maxShown, subtrahendZoomLeft, subtrahendZoomRight
      )
      setTimeout(function() {
        showAllData(
          smallData, largeData, checkpointData, minuend, subtrahend,
          minShown, maxShown
        )
        setTimeout(function() {
          showMinuend(
            smallData, largeData, checkpointData, minuend, subtrahend,
            minShown, maxShown, minuendZoomLeft, minuendZoomRight
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
  if (
    isAMultipleOfTheLargeBase(vm.subtrahend) &&
    vm.minuend > vm.subtrahend + vm.largeBase
  ) {
    var firstCheckpointBase = vm.largeBase
  } else {
    var firstCheckpointBase = vm.smallBase
  }
  if (vm.minuend > vm.subtrahend) {
    var roundingDirection = roundUp
  } else {
    var roundingDirection = roundDown
  }
  var firstCheckpoint = roundingDirection(vm.subtrahend, firstCheckpointBase)
  var nextCheckpoint = firstCheckpoint
  var currentBase = vm.smallBase
  while (true) {
    if (vm.minuend > vm.subtrahend) {
      if (nextCheckpoint > vm.minuend) {
        break
      }
    } else {
      if (nextCheckpoint < vm.minuend) {
        break
      }
    }
    checkpointData.push(nextCheckpoint)
    if (isAMultipleOfTheLargeBase(nextCheckpoint)) {
      currentBase = vm.largeBase
    }
    if (Math.abs(vm.minuend - nextCheckpoint) < vm.largeBase) {
      currentBase = vm.smallBase
    }
    if (vm.minuend > vm.subtrahend) {
      nextCheckpoint += currentBase
    } else {
      nextCheckpoint -= currentBase
    }
    if (nextCheckpoint === vm.minuend) {
      break
    }
  }
  return checkpointData
}

function getMinuendZoomBounds() {
  var minuendZoomLeftPad = vm.minuendIsGreaterThanSubtrahend ? 3 : 1
  var minuendZoomRightPad = vm.minuendIsGreaterThanSubtrahend ? 1 : 3
  var minuendZoomLeft = vm.minuend - minuendZoomLeftPad * vm.smallBase
  var minuendZoomRight = vm.minuend + minuendZoomRightPad * vm.smallBase
  if (minuendZoomLeft < vm.minShown) {
    minuendZoomLeft = vm.minShown
    minuendZoomRight = vm.minShown + 4 * vm.smallBase
  }
  if (minuendZoomRight > vm.maxShown) {
    minuendZoomRight = vm.maxShown
    minuendZoomLeft = vm.maxShown - 4 * vm.smallBase
  }
  return { left: minuendZoomLeft, right: minuendZoomRight }
}

function getSubtrahendZoomBounds() {
  var subtrahendZoomLeftPad = vm.minuendIsGreaterThanSubtrahend ? 1 : 3
  var subtrahendZoomRightPad = vm.minuendIsGreaterThanSubtrahend ? 3 : 1
  var subtrahendZoomLeft = vm.subtrahend - subtrahendZoomLeftPad * vm.smallBase
  var subtrahendZoomRight = vm.subtrahend + subtrahendZoomRightPad * vm.smallBase
  if (subtrahendZoomLeft < vm.minShown) {
    subtrahendZoomLeft = vm.minShown
    subtrahendZoomRight = vm.minShown + 4 * vm.smallBase
  }
  if (subtrahendZoomRight > vm.maxShown) {
    subtrahendZoomRight = vm.maxShown
    subtrahendZoomLeft = vm.maxShown - 4 * vm.smallBase
  }
  return { left: subtrahendZoomLeft, right: subtrahendZoomRight }
}

function showAllData(
  smallData, largeData, checkpointData, minuend, subtrahend, minShown, maxShown
) {
  updateTickXScaling(minShown, maxShown)
  updateVisualization(smallData, largeData, checkpointData, minuend, subtrahend)
}

function showSubtrahend(
  smallData, largeData, checkpointData, minuend, subtrahend, minShown, maxShown,
  subtrahendZoomLeft, subtrahendZoomRight
) {
  updateTickXScaling(subtrahendZoomLeft, subtrahendZoomRight)
  updateVisualization(smallData, largeData, checkpointData, minuend, subtrahend)
}

function showMinuend(
  smallData, largeData, checkpointData, minuend, subtrahend, minShown, maxShown,
  minuendZoomLeft, minuendZoomRight
) {
  updateTickXScaling(minuendZoomLeft, minuendZoomRight)
  updateVisualization(smallData, largeData, checkpointData, minuend, subtrahend)
}

function updateTickXScaling(minShown, maxShown) {
  tickXMinimumValue = minShown
  tickXScalingFactor = (svgWidth - 2 * tickXOffset) / (maxShown - minShown)
}

function updateVisualization(
  smallData, largeData, checkpointData, minuend, subtrahend
) {
  var smallTickClass = getTickClass('small')
  var largeTickClass = getTickClass('large')
  var minuendTickClass = getSpecialTickClass('minuend')
  var subtrahendTickClass = getSpecialTickClass('subtrahend')
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
  var minuendTick = svg.selectAll('.' + minuendTickClass).data(minuendData)
  var subtrahendTick = svg.selectAll('.' + subtrahendTickClass).data(subtrahendData)
  var minuendLabel = svg.selectAll('.' + minuendLabelClass).data(minuendData)
  var subtrahendLabel = svg.selectAll('.' + subtrahendLabelClass).data(subtrahendData)
  var startLabel = svg.selectAll('.' + startLabelClass).data(subtrahendData)
  var finishLabel = svg.selectAll('.' + finishLabelClass).data(minuendData)
  var checkpointLabel = svg.selectAll('.' + checkpointLabelClass).data(checkpointData)

  updateTicks(smallTicks, 'small')
  updateTicks(largeTicks, 'large')
  updateSpecialTicks(minuendTick, subtrahendTick)
  updateTickLabels(tickLabels)
  updateSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel,
                      checkpointLabel)

  enterTicks(smallTicks, 'small')
  enterTicks(largeTicks, 'large')
  enterSpecialTicks(minuendTick, subtrahendTick)
  enterTickLabels(tickLabels)
  enterSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel,
                     checkpointLabel)

  exitTicks(smallTicks)
  exitTicks(largeTicks)
  exitSpecialTicks(minuendTick, subtrahendTick)
  exitTickLabels(tickLabels)
  exitSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel,
                    checkpointLabel)
}

function getTickClass(tickType) {
  if (tickType === 'small') {
    return 'smallTick'
  } else if (tickType === 'large') {
    return 'largeTick'
  }
}

function getSpecialTickClass(tickType) {
  if (tickType === 'minuend') {
    return 'minuendTick'
  } else if (tickType === 'subtrahend') {
    return 'subtrahendTick'
  }
}

function getTickLabelClass() {
  return 'tickLabel'
}

function getSpecialLabelClass(labelType) {
  if (labelType === 'minuend') {
    return 'minuendLabel'
  } else if (labelType === 'subtrahend') {
    return 'subtrahendLabel'
  } else if (labelType === 'start') {
    return 'startLabel'
  } else if (labelType === 'finish') {
    return 'finishLabel'
  } else if (labelType === 'checkpoint') {
    return 'checkpointLabel'
  }
}

function updateTicks(ticks, tickType) {
  var tickYTop = getTickYTop(tickType)
  ticks
    .transition()
    .duration(transitionDuration)
    .attr('x1', getNumberTickX)
    .attr('x2', getNumberTickX)
    .attr('y1', getNumberTickYBottom)
    .attr('y2', tickYTop)
}

function getNumberTickX(d) {
  return (d - tickXMinimumValue) * tickXScalingFactor + tickXOffset
}

function getNumberTickYBottom() {
  return numberLineY - numberLineWidth / 2
}

function updateSpecialTicks(minuendTick, subtrahendTick) {
  var tickYTop = getTickYTop('large')
  minuendTick
    .transition()
    .duration(transitionDuration)
    .attr('x1', getNumberTickX)
    .attr('x2', getNumberTickX)
    .attr('y1', getNumberTickYBottom)
    .attr('y2', tickYTop)
  subtrahendTick
    .transition()
    .duration(transitionDuration)
    .attr('x1', getNumberTickX)
    .attr('x2', getNumberTickX)
    .attr('y1', getNumberTickYBottom)
    .attr('y2', tickYTop)
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

function enterTicks(ticks, tickType) {
  var tickClass = getTickClass(tickType)
  var tickWidth = getTickWidth(tickType)
  var tickYTop = getTickYTop(tickType)
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

function getTickWidth(tickType) {
  if (tickType === 'small') {
    return 1
  } else if (tickType === 'large') {
    return 3
  }
}

function getTickYTop(tickType) {
  if (tickType === 'small') {
    return smallTickYTop
  } else if (tickType === 'large') {
    return largeTickYTop
  }
}

function enterSpecialTicks(minuendTick, subtrahendTick) {
  var minuendTickClass = getSpecialTickClass('minuend')
  var subtrahendTickClass = getSpecialTickClass('subtrahend')
  var tickWidth = getTickWidth('large')
  var tickYTop = getTickYTop('large')
  minuendTick
    .enter()
    .append('line')
    .attr('class', minuendTickClass)
    .attr('x1', getNumberTickX)
    .attr('x2', getNumberTickX)
    .attr('y1', numberLineY)
    .attr('y2', numberLineY)
    .attr('stroke', '#903')
    .attr('stroke-width', tickWidth)
    .transition()
    .duration(transitionDuration)
    .attr('y2', tickYTop)
  subtrahendTick
    .enter()
    .append('line')
    .attr('class', subtrahendTickClass)
    .attr('x1', getNumberTickX)
    .attr('x2', getNumberTickX)
    .attr('y1', numberLineY)
    .attr('y2', numberLineY)
    .attr('stroke', '#093')
    .attr('stroke-width', tickWidth)
    .transition()
    .duration(transitionDuration)
    .attr('y2', tickYTop)
}

function enterTickLabels(labels) {
  var labelClass = getTickLabelClass()
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

function exitSpecialTicks(minuendTick, subtrahendTick) {
  minuendTick
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('y2', numberLineY)
    .remove()
  subtrahendTick
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
    .attr('stroke-width', numberLineWidth)
}

initializeVisualization()
