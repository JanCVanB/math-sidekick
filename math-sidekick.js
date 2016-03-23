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
const specialLabelY = tensTickYTop - 20
const transitionDuration = 750

function updateSvgWidth(svg) {
  svgWidth = svg.style('width')
  numberLineXRight = parseInt(svgWidth, 10) - numberLineXMargin
}

function updateTickXScaling(minShown, maxShown) {
  tickXMinimumValue = minShown
  tickXScalingFactor = (parseInt(svgWidth, 10) - 2 * tickXOffset) / (maxShown - minShown)
}

function getNumberTickX(d) {
  return (d - tickXMinimumValue) * tickXScalingFactor + tickXOffset
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
  }
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

function exitTicks(ticks) {
  ticks
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('y2', numberLineY)
    .remove()
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

function updateTickLabels(labels) {
  labels
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
}

function exitTickLabels(labels) {
  labels
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#fff')
    .remove()
}

function enterSpecialLabels(minuendLabel, subtrahendLabel) {
  var minuendLabelClass = getSpecialLabelClass('minuend')
  var subtrahendLabelClass = getSpecialLabelClass('subtrahend')
  minuendLabel
    .enter()
    .append('text')
    .attr('class', minuendLabelClass)
    .attr('x', getNumberTickX)
    .attr('y', specialLabelY)
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
    .attr('y', specialLabelY)
    .attr('text-anchor', 'middle')
    .text(function(d) {
      return d
    })
    .attr('fill', '#fff')
    .transition()
    .duration(transitionDuration)
    .attr('fill', '#000')
}

function updateSpecialLabels(minuendLabel, subtrahendLabel) {
  minuendLabel
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
  subtrahendLabel
    .transition()
    .duration(transitionDuration)
    .attr('x', getNumberTickX)
}

function exitSpecialLabels(minuendLabel, subtrahendLabel) {
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
}

function isAMultipleOfTen(number) {
  return number % 10 === 0
}

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

  updateVisualization([], [])
  setTimeout(function() {
    updateVisualization(onesData, tensData)
    setTimeout(function() {
      updateTickXScaling(_.max([minShown, minInput - 1]), _.min([maxShown, minInput + 3]))
      updateVisualization(onesData, tensData)
      setTimeout(function() {
        updateTickXScaling(minShown, maxShown)
        updateVisualization(onesData, tensData)
        setTimeout(function() {
          updateTickXScaling(_.max([minShown, maxInput - 3]), _.min([maxShown, maxInput + 1]))
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

function updateVisualization(onesData, tensData) {
  var onesTickClass = getTickClass(1)
  var tensTickClass = getTickClass(10)
  var onesTickLabelClass = getTickLabelClass(1)
  var tensTickLabelClass = getTickLabelClass(10)
  var minuendLabelClass = getSpecialLabelClass('minuend')
  var subtrahendLabelClass = getSpecialLabelClass('subtrahend')
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

  updateTicks(onesTicks, 1)
  updateTicks(tensTicks, 10)
  updateTickLabels(onesTickLabels)
  updateTickLabels(tensTickLabels)
  updateSpecialLabels(minuendLabel, subtrahendLabel)

  enterTicks(onesTicks, 1)
  enterTicks(tensTicks, 10)
  enterTickLabels(onesTickLabels, 1)
  enterTickLabels(tensTickLabels, 10)
  enterSpecialLabels(minuendLabel, subtrahendLabel)

  exitTicks(onesTicks)
  exitTicks(tensTicks)
  exitTickLabels(onesTickLabels)
  exitTickLabels(tensTickLabels)
  exitSpecialLabels(minuendLabel, subtrahendLabel)
}

initializeVisualization()
