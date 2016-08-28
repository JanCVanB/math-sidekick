var minuend = 0
var subtrahend = 0

d3.select('#minuend').on('input', function() {
  minuend = parseInt(this.value)
  minuend = minuend ? minuend : 0
})
d3.select('#subtrahend').on('input', function() {
  subtrahend = parseInt(this.value)
  subtrahend = subtrahend ? subtrahend : 0
})
d3.select('#difference').on('click', function() {
  onNewMinuendAndSubtrahend()
})

var svg
var svgWidth
const numberLineXMargin = 20
const numberLineXLeft = numberLineXMargin
var numberLineXRight
const numberLineY = 150
const onesTickWidth = 1
const onesTickLength = 20
const onesTickYTop = numberLineY - onesTickLength
const tensTickWidth = 3
const tensTickLength = 40
const tensTickYTop = numberLineY - tensTickLength
const tickXOffset = (tensTickWidth + 1) / 2 + numberLineXMargin
var tickXMinimumValue
var tickXScalingFactor
const tickLabelY = numberLineY + 20
const specialNumberLabelY = tensTickYTop - 20
const specialWordLabelY = specialNumberLabelY - 20
const transitionDuration = 750

function onNewMinuendAndSubtrahend() {
  updateSvgWidth(svg)

  var minInput = _.min([minuend, subtrahend])
  var maxInput = _.max([minuend, subtrahend])
  var minTen
  var maxTen
  if (minInput < 0) {
    minTen = minInput - (10 + minInput % 10)
  } else {
    minTen = minInput - (minInput % 10)
  }
  if (maxInput <= 0) {
    maxTen = maxInput - (maxInput % 10)
  } else {
    maxTen = maxInput + (10 - maxInput % 10)
  }
  var minExist = minTen
  var maxExist = maxTen
  if (minExist === 0 && maxShown === 0) {
    minExist = -10
    maxExist = 10
  }
  var onesData = _.range(minExist, maxExist + 1)
  var tensData = _.filter(onesData, isAMultipleOfTen)
  if (tensData.length === 0) {
    tensData = [minShown, maxShown]
  }
  var onesData = _.difference(onesData, tensData)

  var minShown = minExist
  var maxShown = maxExist
  updateTickXScaling(minShown, maxShown)

  var minuendZoomLeftPad = minuend === minInput ? 1 : 3
  var minuendZoomRightPad = minuend === minInput ? 3 : 1
  var subtrahendZoomLeftPad = subtrahend === minInput ? 1 : 3
  var subtrahendZoomRightPad = subtrahend === minInput ? 3 : 1

  updateVisualization([], [])
  setTimeout(function() {
    updateVisualization(onesData, tensData)
    setTimeout(function() {
      updateTickXScaling(_.max([minShown, subtrahend - subtrahendZoomLeftPad]),
                         _.min([maxShown, subtrahend + subtrahendZoomRightPad]))
      updateVisualization(onesData, tensData)
      setTimeout(function() {
        updateTickXScaling(minShown, maxShown)
        updateVisualization(onesData, tensData)
        setTimeout(function() {
          updateTickXScaling(_.max([minShown, minuend - minuendZoomLeftPad]),
                             _.min([maxShown, minuend + minuendZoomRightPad]))
          updateVisualization(onesData, tensData)
          setTimeout(function() {
            updateTickXScaling(minShown, maxShown)
            updateVisualization(onesData, tensData)
          }, 2 * transitionDuration)
        }, 2 * transitionDuration)
      }, 2 * transitionDuration)
    }, 2 * transitionDuration)
  }, 1.1 * transitionDuration)
}

function updateSvgWidth(svg) {
  svgWidth = svg.style('width')
  numberLineXRight = parseInt(svgWidth, 10) - numberLineXMargin
}

function isAMultipleOfTen(number) {
  return number % 10 === 0
}

function updateTickXScaling(minShown, maxShown) {
  tickXMinimumValue = minShown
  tickXScalingFactor = (parseInt(svgWidth, 10) - 2 * tickXOffset) / (maxShown - minShown)
}

function updateVisualization(onesData, tensData) {
  var onesTickClass = getTickClass(1)
  var tensTickClass = getTickClass(10)
  var onesTickLabelClass = getTickLabelClass(1)
  var tensTickLabelClass = getTickLabelClass(10)
  var minuendLabelClass = getSpecialLabelClass('minuend')
  var subtrahendLabelClass = getSpecialLabelClass('subtrahend')
  var startLabelClass = getSpecialLabelClass('start')
  var finishLabelClass = getSpecialLabelClass('finish')
  var onesTicks = svg.selectAll('.' + onesTickClass).data(onesData)
  var tensTicks = svg.selectAll('.' + tensTickClass).data(tensData)
  var onesTickLabels = svg.selectAll('.' + onesTickLabelClass).data(onesData)
  var tensTickLabels = svg.selectAll('.' + tensTickLabelClass).data(tensData)
  var minuendData = []
  var subtrahendData = []
  if (onesData.length > 0) {
    minuendData = [minuend]
    subtrahendData = [subtrahend]
  }
  var minuendLabel = svg.selectAll('.' + minuendLabelClass).data(minuendData)
  var subtrahendLabel = svg.selectAll('.' + subtrahendLabelClass).data(subtrahendData)
  var startLabel = svg.selectAll('.' + startLabelClass).data(subtrahendData)
  var finishLabel = svg.selectAll('.' + finishLabelClass).data(minuendData)

  updateTicks(onesTicks, 1)
  updateTicks(tensTicks, 10)
  updateTickLabels(onesTickLabels)
  updateTickLabels(tensTickLabels)
  updateSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel)

  enterTicks(onesTicks, 1)
  enterTicks(tensTicks, 10)
  enterTickLabels(onesTickLabels, 1)
  enterTickLabels(tensTickLabels, 10)
  enterSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel)

  exitTicks(onesTicks)
  exitTicks(tensTicks)
  exitTickLabels(onesTickLabels)
  exitTickLabels(tensTickLabels)
  exitSpecialLabels(minuendLabel, subtrahendLabel, startLabel, finishLabel)
}

function getTickClass(multiple) {
  if (multiple == 1) {
    return 'onesTick'
  } else if (multiple === 10) {
    return 'tensTick'
  }
}

function getTickLabelClass(multiple) {
  if (multiple == 1) {
    return 'onesTickLabel'
  } else if (multiple === 10) {
    return 'tensTickLabel'
  }
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
                             finishLabel) {
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
    return onesTickYTop
  } else if (multiple === 10) {
    return tensTickYTop
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
                            finishLabel) {
  var minuendLabelClass = getSpecialLabelClass('minuend')
  var subtrahendLabelClass = getSpecialLabelClass('subtrahend')
  var startLabelClass = getSpecialLabelClass('start')
  var finishLabelClass = getSpecialLabelClass('finish')
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
                           finishLabel) {
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
