var minuend = 0
var subtrahend = 0
d3.select('#minuend').on('input', function() {
  minuend = this.value
  d3.select('#difference').text(minuend - subtrahend)
})
d3.select('#subtrahend').on('input', function() {
  subtrahend = this.value
  d3.select('#difference').text(minuend - subtrahend)
})
