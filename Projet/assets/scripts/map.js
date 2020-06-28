// File to generate map and deal with transition
"use strict";

// Initializes the background of the map that must be used and the position of the initial display. 
function initTileLayer(L, map) {
  map.setView([55, -95], 4);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
    minZoom: 1,
    maxZoom: 10,
    }).addTo(map);
}

// Initializes the SVG context to be used on top of the Leaflet map. 
function initSvgLayer(map) {
  var svgElement = d3.select(map.getPanes().overlayPane).append("svg")
  svgElement.style("width", '1200px').style("height", '800px');
  svgElement.append("g").attr("class", "leaflet-zoom-hide")
  return svgElement
}

// Creates the circles for the provinces with radius and opacity depending on the number of people involved in R&D and the percentage
function CreateCircles(data, g, path, topology, r, showPanel, year, population, opacityScale) {

    g.selectAll("circle")
    .data(topojson.feature(topology, topology.objects.canada).features)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("id", function(d) { return d.id})
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("r", function(d) {return r(getTotalPeopleInvolvedRD(data, d.properties.name, year)/8000)})
    .attr("fill", "brown")
    .attr("fill-opacity", function(d){return opacityScale(getTotalPeopleInvolvedRD(data, d.properties.name, year)/getProvincePopulation(population, d.properties.name, year)*100)})
    .attr("stroke", "brown")
    .attr("stroke-width", 1)
    .on("click", function(d) {
        showPanel(d.properties.name)
        reset(g)
        d3.select(this).classed("selected", true)
      })
    // adjust north Territories so circle is in the middle to encapsulate all 3 provinces together
    d3.select('#NT').attr("transform", function(d) { return "translate(" + path.centroid(d)[0]+ ","+ (path.centroid(d)[1]+100) + ")";})

}

// Reinitialize the map display when the information panel is closed. 
function reset(g) {
    g.selectAll(".selected").classed("selected", false)
  }

// Get the number of people involved in R&D depending on the province and year for all sector and occupation
function getTotalPeopleInvolvedRD(data, name, year){
    if(name == "Northwest Territories"){
        name = "Yukon, Northwest Territories and Nunavut"
    }
    var value = data.filter(function(d) { return d.REF_DATE === year && d.GEO === name && d["Performing sector"] === "Total performing sectors" && d["Occupational category"]==="Total personnel"})[0].VALUE;
    return parseInt(value)
}

// Gets the population of a specific province and year
function getProvincePopulation(populationData, name, year){
    if(name == "Northwest Territories"){
        name = "Yukon, Northwest Territories and Nunavut"
    }
    var value = populationData.filter(function(d) { return d.REF_DATE === year && d.GEO === name })[0].VALUE;
    return parseInt(value)
}

// Complete a transition between the years
function transition(g, topology, data, year, r) {

    g.selectAll("circle").data(topojson.feature(topology, topology.objects.canada).features)
      .transition()
      .duration(1000)
      .attr("r", function(d) {return r(getTotalPeopleInvolvedRD(data, d.properties.name, year)/8000)})
  }
  
  function createMapOpacityLegend(svg, width, height, margin) {
  
    var y = d3.scaleBand().range([ 0, height ]).domain([1.00 ,0.90 ,0.80 ,0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10 ,0.00]).padding(0.01);
  
    var defs = svg.append("defs")
    var linearGradient = defs.append('linearGradient')
      .attr('id', 'linear-gradient');
  
    linearGradient
    .attr("y1", "0%")
    .attr("x1", "0%")
    .attr("y2", "100%")
    .attr("x2", "0%");
  
    linearGradient.selectAll("stop")
    .data([
      {offset: "0%", color: "#A52A2A"},
      {offset: "30%", color: "#b95149"},
      {offset: "50%", color: "#cb746a"},
      {offset: "60%", color: "#dc968d"},
      {offset: "70%", color: "#eab9b2"},
      {offset: "80%", color: "#f5dcd8"},
      {offset: "100%", color: "#ffffff"}
    ])
    .enter().append("stop")
    .attr("offset", function(d) { 
      return d.offset; 
    })
    .attr("stop-color", function(d) { 
      return d.color; 
    });
  
    svg.append("rect")
    .attr("x", 31)
    .attr("y", 55)
    .attr("width", width/2 )
    .attr("height",height )
    .style("fill", "url(#linear-gradient)"); 
    
    svg.append("g")
    .attr("transform", "translate(" + margin.left + ", 55 )")
    .call(d3.axisLeft(y))
  
    svg.append("text")
    .text("Percentage of")
    .attr("transform", "translate(0, 15 )")
    .attr("font-size", "11px")
    
    svg.append("text")
    .text("individuals involved")
    .attr("transform", "translate(0, 30 )")
    .attr("font-size", "11px")

    svg.append("text")
    .text("in R&D per capita")
    .attr("transform", "translate(0, 45 )")
    .attr("font-size", "11px")
  }