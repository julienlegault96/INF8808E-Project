// File to generate panel containing bar chart for the different sectors and a pie chart for the different occupations
"use strict";

var sectors = ["Federal government", "Provincial government", "Business enterprise", "Higher education"]
var occupation = ["Researchers", "Technicians", "Support staff"]
var color = d3.scaleOrdinal(['#ffa600','#bc5090','#003f5c']);

const RECT_WIDTH = 10
const RECT_HEIGHT = 10

const TEXT_FONT_SIZE = 10
const TEXT_X_OFFSET = 15
const TEXT_Y_OFFSET = 9

// Update the textual information in the information panel based on the new data
function updatePanelInfo(panel, province, data, year) {
  if(province == "Northwest Territories"){
      province = "Yukon, Northwest Territories and Nunavut";
  }
  panel.select("#provinceName").text(province + " (" + year + ")")
  panel.select("#RD").text(getTotalPeopleInvolvedRD(data, province, year)) 
}

// Update the X and Y domains used by the horizontal bar chart when the data is modified. 
function updateDomains(province, data, year, x, y) {

  x.domain([0, getTotalPeopleInvolvedRD(data, province, year)])
  y.domain(sectors)
}

// Generate the bar chart in the panel 
function updatePanelBarChart(gBars, gAxis, data, x, y, yAxis, province, year) {

 gAxis.select(".y.axis").remove()
 yAxis.tickFormat(function(d) { 
   return d;
 }) 

 gAxis.append("g")
   .classed("y axis", true)
   .call(yAxis)

 gBars.selectAll(".bar").remove()
 var bars = gBars.selectAll(".bar")
   .data(sectors)
   .enter()
   .append("g")
   .classed("bar", true)

 bars.append("rect") 
   .attr("y", function(d) { return y(d) })
   .attr("height",  function(d) { return 25 })
   .attr("width", function(d)  { return x(getData(year, province, data, d, "Total personnel")) })
   .attr("fill", '#004c6d')
 
 bars.append("text")
   .attr("x", function(d) { return x(getData(year, province, data, d, "Total personnel")) + 5})
   .attr("y", function(d) { return y(d) + 18})
   .text(function(d) { return (getData(year, province, data, d, "Total personnel"))})
}

function getData(year, province, data, sector, occupation){
  if(province == "Northwest Territories"){
      province = "Yukon, Northwest Territories and Nunavut"
  }
  var value = data.filter(function(d) { return d.REF_DATE === year && d.GEO === province && d["Performing sector"] === sector && d["Occupational category"]===occupation})[0].VALUE;
  return parseInt(value)
}

// Generate the pie chart in the panel
function GeneratePie(gArc, pieRadius, data, province, year){
  var pie = d3.pie();
  var values = []
  occupation.forEach(element => {
      values.push(getData(year, province, data, "Total performing sectors", element))
  });

  // Generate the arcs
  var arc = d3.arc()
      .innerRadius(0)
      .outerRadius(pieRadius);
      
  //Generate groups
  var arcs = gArc.selectAll("arc")
  .data(pie(values))
  .enter()
  .append("g")
  .attr("class", "arc")
  
  //Draw arc paths
  arcs.append("path")
  .attr("fill", function(d, i) {
      return color(i);
  })
  .attr("d", arc);

  arcs.append('text')
  .attr("transform", function(d){ return "translate(" + arc.centroid(d) +")"; })
  .attr("text-anchor", "middle")
  .text(function(d, i) { return ((values[i]/getData(year, province, data, "Total performing sectors", "Total personnel"))*100).toFixed(1) + "%"});   
}

// Create legend for pie chart
function legend(svg, color) {
  
  svg.selectAll(".legend").remove();
  const boundingBox = svg.node().getBBox()

  const legendElement = svg.append('g').selectAll("g").data(occupation).enter().
    append('g').attr('class', 'legend').attr('transform', function (occupation, index) { // Place the elements relative to the top right of the graph
      const x = boundingBox.width/2;
      const y = 50 + index * 20;
      return 'translate(' + x + ',' + y + ')'
    })

  legendElement.append('rect').style('fill', (d, i) =>
    color(i)).attr('id', (i) => `colorlegend${i}`).
    attr('width', RECT_WIDTH).attr('height', RECT_HEIGHT).style('opacity', 1).style('outline', "thin solid black")

  legendElement.append('text').attr('x', TEXT_X_OFFSET).attr('y', TEXT_Y_OFFSET)
    .text((d) => d).attr('font-size', TEXT_FONT_SIZE)
  }