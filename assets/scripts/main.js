/**
 * Main file allowing to display the required chart. 
 */
(function (L, d3, topojson) {
  "use strict";

  /***** Configuration *****/
  var margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 300 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  var yearsAbrv = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13"]
  var provincesAbrv = ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK", "TRs"]

  var year = "2000";
  
  var panel = d3.select("#panel");
  var heatmap = d3.select("#HeatMap");
  var sankey = d3.select("#Sankey");
  var mapVis = d3.select("#geo");
  var map = L.map('map', {
    'worldCopyJump': true, zoomControl: false
  });
  // Disable zoom on map
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.dragging.disable();

  var barChartMargin = {
    top: 25,
    right: 40,
    bottom: 0,
    left: 115
  };

  var barChartWidth = 350 - barChartMargin.left - barChartMargin.right;
  var barChartHeight = 175 - barChartMargin.top - barChartMargin.bottom;
  
  /***** Scales *****/
  var r = d3.scaleSqrt().range([5, 20]);
  var opacityScale = d3.scaleSqrt().range([0.05, 1])
  var x = d3.scaleLinear().range([0, barChartWidth]);
  var y = d3.scaleBand().range([0, barChartHeight]).padding(0.1);
  var pieRadius = 80;

  var yAxis = d3.axisLeft(y);

  var xHM = d3.scaleBand().range([ 0, width ]).domain(yearsAbrv).padding(0.01);
  var yHM = d3.scaleBand().range([ 0, height ]).domain(provincesAbrv).padding(0.01);

  /***** Creation of bar chart elements *****/
  var barChartSvg = panel.select("#barChart")
    .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
    .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom + 35);

  var titleBarChart = barChartSvg.append("text")
  titleBarChart.html("Distribution by performing sector").attr('y', '10').attr('class', "chartTitle");


  var barChartGroup = barChartSvg.append("g")
    .attr("transform", "translate(" + barChartMargin.left + "," + barChartMargin.top + ")");
  
  var barChartBarsGroup = barChartGroup.append("g");
  var barChartAxisGroup = barChartGroup.append("g")

   /***** Creation of pie chart elements *****/
  var pieChartSvg = panel.select("#pieChart")
  .attr("width", 265)
  .attr("height", 210);

  var titlePieChart = pieChartSvg.append("text")
  titlePieChart.html("Distribution by occupational category").attr('y', '10').attr('class', "chartTitle");
  var pieChartGroup = pieChartSvg.append("g")
    .attr("transform", "translate(" + pieRadius + "," + (pieRadius + 20) + ")");

  var pieChartArcGroup = pieChartGroup.append("g");

 /***** Creation of heatmap elements *****/
 var heatMapLegend = heatmap.select("#hmLegend")
 createHeatMapLegend(heatMapLegend, 50, height, 275)

 var govHeatMapSvg = heatmap.select("#hmGov")
 createHeatMapAxes(govHeatMapSvg, width, height, margin, xHM, yHM)
 createHeatMapTitle(govHeatMapSvg, width/3, "Government Workers")

 var privateHeatMapSvg = heatmap.select("#hmPrivate")
 createHeatMapAxes(privateHeatMapSvg, width, height, margin, xHM, yHM)
 createHeatMapTitle(privateHeatMapSvg, width/3, "Business enterprise Workers")

 var academicHeatMapSvg = heatmap.select("#hmAcademic")
 createHeatMapAxes(academicHeatMapSvg, width, height, margin, xHM, yHM)
 createHeatMapTitle(academicHeatMapSvg, width/3, "Higher Education Workers")

 var researcherHeatMapSvg = heatmap.select("#hmResearcher")
 createHeatMapAxes(researcherHeatMapSvg, width, height, margin, xHM, yHM)
 createHeatMapTitle(researcherHeatMapSvg, width/2, "Researchers")

 var techniciansHeatMapSvg = heatmap.select("#hmTechnician")
 createHeatMapAxes(techniciansHeatMapSvg, width, height, margin, xHM, yHM)
 createHeatMapTitle(techniciansHeatMapSvg, width/2, "Technicians")

 var spHeatMapSvg = heatmap.select("#hmSP")
 createHeatMapAxes(spHeatMapSvg, width, height, margin, xHM, yHM)
 createHeatMapTitle(spHeatMapSvg, width/2, "Support Staff")

/***** Creation of sankey chart elements *****/
var sankeyDiagramSvg = sankey.select("#sankeyDiagram")
var sankeyTitleSvg = sankey.select("#sankeyTitle")
var sankeySvg = sankey.select("#sankey")
createSankeyTitle(sankeyTitleSvg, 1050, "Allocation of R&D Workers")
addNodeName(sankeySvg, "Researchers", 800, 275)
addNodeName(sankeySvg, "Technicians", 800, 560)
addNodeName(sankeySvg, "Support Staff", 800, 700)
addNodeName(sankeySvg, "Business enterprise", 1520, 275)
addNodeName(sankeySvg, "Higher education", 1520, 550)
addNodeName(sankeySvg, "Provincial government", 1520, 670)
addNodeName(sankeySvg, "Federal government", 1520, 715)

  /***** Data loading *****/
  var promises = [];
  promises.push(d3.csv("./data/population.csv"));
  promises.push(d3.csv("./data/27100023.csv"));
  promises.push(d3.json("./data/canada.topo.json"));
  promises.push(d3.csv("./data/researchers.csv"));
  promises.push(d3.csv("./data/private.csv"));
  promises.push(d3.csv("./data/academic.csv"));
  promises.push(d3.csv("./data/technicians.csv"));
  promises.push(d3.csv("./data/gov.csv"));
  promises.push(d3.csv("./data/support.csv"));
  promises.push(d3.csv("./data/sankey.csv"));

  Promise.all(promises).then(function(files) {
    var population = files[0];
    var data = files[1];
    var canada = files[2];
    var researchers = files[3];
    var business = files[4];
    var academic = files[5];
    var technicians = files[6];
    var gov = files[7];
    var support = files[8];
    var sankeyData = files[9];

    /***** Add  data to HeatMap *****/
    createHeatMap(researcherHeatMapSvg, researchers, xHM, yHM)
    createHeatMap(privateHeatMapSvg, business, xHM, yHM)
    createHeatMap(academicHeatMapSvg, academic, xHM, yHM)
    createHeatMap(techniciansHeatMapSvg, technicians, xHM, yHM)
    createHeatMap(govHeatMapSvg, gov, xHM, yHM)
    createHeatMap(spHeatMapSvg, support, xHM, yHM)

    /***** Add  data to SankeyChart *****/
    createSankeyChart(sankeyDiagramSvg, sankeyData)
    
  
    /***** Map initialization *****/
    initTileLayer(L, map);
    var mapSvg = initSvgLayer(map);
    var g = undefined;
    if (mapSvg) {
      g = mapSvg.select("g");
    }
    
    var path = createPath();
    CreateCircles(data, g, path, canada, r, showPanel, year, population, opacityScale);
    var mapLegend = mapVis.select("#opacityLegend")
    createMapOpacityLegend(mapLegend, 50, height, margin)

    /***** Update Circle depending on year selected *****/
     var sliderMap = document.getElementById("sliderMap");
     sliderMap.oninput = function() {
       var sliderValue = this.value;
       year = getYear(sliderValue);
       transition(g, canada, data, year, r);
       panel.style("display", "none");
     };
     
  // Display the panel for a specific province.
   function showPanel(provinceName) {
     panel.style("display", "block");
     updatePanelInfo(panel, provinceName, data, year);
     updateDomains(provinceName, data, year, x, y);
     updatePanelBarChart(barChartBarsGroup, barChartAxisGroup, data, x, y, yAxis, provinceName, year)

     GeneratePie(pieChartArcGroup, pieRadius, data, provinceName, year);
     legend(pieChartArcGroup, color);
   }
   
   /***** Close panel management *****/
   panel.select("button")
   .on("click", function () {
     reset(g);
     panel.style("display", "none");
   });

  })
  
  // Projects a point in the map.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  // Traces a set of coordinates in the map
  function createPath() {
    var transform = d3.geoTransform({point: projectPoint});
    return d3.geoPath().projection(transform);
  }
  
})(L, d3, topojson)

// Display depending on tabs
document.getElementsByClassName('tablinks')[0].click()
function openTab(evt, visName) {

  // Get all elements with class="tabcontent" and hide them
  var tabcontent = document.getElementsByClassName("tabcontent");
  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  var tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(visName).style.display = "block";
  evt.currentTarget.className += " active";
} 

// Get the year selected on the slider
function getYear(sliderValue){
  var year;
  if (sliderValue.length == 1){
    year = "200"+ sliderValue;
  } else {
    year = "20"+ sliderValue;
  }
  return year;  
}

