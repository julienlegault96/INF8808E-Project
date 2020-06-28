function createHeatMapAxes(svg, width, height, margin, xHM, yHM) {
  svg.append("svg")
    .attr("width", width + 50 + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

 // Build X scales and axis:
  svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + 1.1 * height  + ")")
    .call(d3.axisBottom(xHM))

  svg.append("text")
    .text("year")
    .attr("transform", "translate(" + width/1.85 + "," + 1.22 * height + ")")
    .attr("font-size", "11px")

  // Build Y scales and axis:
  svg.append("g")
    .attr("transform", "translate(" + margin.left + ", 23 )")
    .call(d3.axisLeft(yHM))

  svg.append("text")
    .text("province")
    .attr("transform", "translate(0, 15 )")
    .attr("font-size", "11px")
}

function createHeatMapTitle(svg, width, title) {
 svg.append("text")
  .text(title)
  .attr("transform", "translate(" + width + ", 10 )")
  .attr("font-size", "13px")
}

// return province abbreviation to match HM axes
function getProvinceAbreviation(province) {
  switch(province) {
    case "Newfoundland and Labrador" : 
      return "NL"
      break;
    case "Prince Edward Island":
      return "PE"
      break;
    case "Nova Scotia":
      return "NS"
      break;
    case "New-Brunswick":
      return "NB"
      break;
    case "Quebec":
      return "QC"
      break;
    case "Ontario":
      return "ON"
      break;
    case "Manitoba":
      return "MB"
      break;
    case "Saskatchewan":
      return "SK"
      break;
    case "Alberta":
      return "AB"
      break;
    case "British-Columbia":
      return "BC"
      break;
    case "Yukon, Northwest Territories and Nunavut":
      return "TRs"
      break;
    default:
      break;
  }
}

// return year format to match HM axes
function convertYear(year) {
    return year.slice(2, 4)
}

function createHeatMapLegend(svg, width, height, margin) {
  
  var y = d3.scaleBand().range([ 0, height ]).domain([0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10 ,0.00]).padding(0.01);

  var defs = svg.append("defs")
  var linearGradient = defs.append('linearGradient')
		.attr('id', 'linear-gradient-green');

  linearGradient
  .attr("y1", "0%")
  .attr("x1", "0%")
  .attr("y2", "100%")
  .attr("x2", "0%");

  linearGradient.selectAll("stop")
  .data([
    {offset: "0%", color: "#a52a2a"},
    {offset: "10%", color: "#ae3f3f"},
    {offset: "20%", color: "#b75454"},
    {offset: "30%", color: "#c06969"},
    {offset: "40%", color: "#c97f7f"},
    {offset: "50%", color: "#d29494"},
    {offset: "60%", color: "#dba9a9"},
    {offset: "70%", color: "#e4bfbf"},
    {offset: "80%", color: "#edd4d4"},
    {offset: "90%", color: "#f6e9e9"},
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
  .attr("x", margin)
  .attr("y", 35)
  .attr("width", width/2 )
  .attr("height",height )
  .style("fill", "url(#linear-gradient-green)"); 
  
  svg.append("g")
  .attr("transform", "translate(" + margin + ", 35 )")
  .call(d3.axisLeft(y))

  svg.append("text")
  .text("Percentage")
  .attr("transform", "translate(240, 10 )")
  .attr("font-size", "11px")
  
  svg.append("text")
  .text("of Province Population")
  .attr("transform", "translate(240, 20 )")
  .attr("font-size", "11px")

  svg.append("text")
  .text("Involved in R&D (%)")
  .attr("transform", "translate(240, 30 )")
  .attr("font-size", "11px")
}

function createHeatMap(svg, data, x, y) {
  var myColor = d3.scaleLinear()
    .range(["#FFFFFF", "#a52a2a"])
    .domain([0, 0.70])

  var formatNumber = d3.format(",.0f")
  var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .style("stroke", "black")
    .offset([-8, 125])
    .html(function(d) {
      return  d["GEO"] + " [" + d["REF_DATE"] + "]" + "</b><br>" + 
      "percentage of the province population : "+ d["PERCENTAGE"] +"%" + "</b><br>"  +
      "amount of workers : <b>" + formatNumber(d["CURRENT_VALUE"]) + "</b><br>"  +
      "variation with previous year : <b>" + String(formatNumber(parseInt(d["CURRENT_VALUE"]) - parseInt(d["PREVIOUS_VALUE"])))
      })

  svg.call(tool_tip);

  svg.selectAll()
    .data(data, function(d) {return d["REF_DATE"] + ':' +  d["GEO"]})
    .enter()
    .append("rect")
    .attr("class","heatmap")
    .attr("x", function(d) { return x(convertYear(d["REF_DATE"])) + 31})
    .attr("y", function(d) { return y(getProvinceAbreviation(d["GEO"])) + 22})
    .attr("width", x.bandwidth() )
    .attr("height", y.bandwidth() )
    .attr("fill", function(d) {return myColor(parseFloat(d["PERCENTAGE"]))})
    .on("mouseover", tool_tip.show)
    .on("mouseleave", tool_tip.hide)
}
