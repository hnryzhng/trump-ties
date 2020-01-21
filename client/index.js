


// TASKS
// add staffer name to each story text 
// correct textual errors

// GLOBAL VARIABLES

var scrollContainer = document.getElementById("scroll-container");
var scrollIntro = document.getElementById("scroll-intro")
var targetDiv = document.getElementById("target");
var scrollSection = document.getElementById("scroll-section");

var plotContainer = document.getElementById("plot-container");
var agencyDropdown = document.getElementById("agencies-dropdown");

var storyBlock = document.getElementById("story-block");
var nameBlock = document.getElementById("name-block");
var nextLink = document.getElementById("next-link");
var autoplayLink = document.getElementById("autoplay");
var stopAutoplayLink = document.getElementById("stop-autoplay");
var counter = document.getElementById("counter");
var stopBoolean = false;

var agencies = {
	"White House Office":null,
	"Defense":null,
	"State":null,
	"Agriculture":null,
	"Health and Human Services":null,
	"Homeland Security":null,
	"Energy":null,
	"Commerce":null,
	"Justice":null,
	"Transportation":null,
	"Education":null,
	"Housing and Urban Development":null,
	"Interior":null,
	"Labor":null,
	"Treasury":null
};
var organizations = {
	"Donald J. Trump for President, Inc.":null,
	"Republican National Committee": null,
	"The Heritage Foundation":null,
	"Freedom Partners Chamber of Commerce":null,
	"Jones Day":null,
	"American Enterprise Institute":null,
	"State of Indiana":null,
	"American Chemistry Council":null,
	"Koch Industries":null,
	"FreedomWorks for America":null,
	"Americans for Economic Freedom":null,
	"Judicial Education Project":null
};

function scrollController(data) {
	
	// CALL FUNCTIONS
	filteredRecords = scrollPopulate(data);
	scrollContainer.onscroll = activateTargetWrapper;
}

function scrollPopulate(data) {
	// populate scroll texts with filtered data array
	var filteredRecords = [];
	var namesArray = {};

	// further filter story data
	for (var i=0; i<data.length; i++) {
		var record = data[i];
		//if (record.story_block==="TRUE" && !(record.name in namesArray)) {
		if (!(record.name in namesArray) && record.story_text !== "") {	
			// add record if story block record not already in names and story text is not empty	
			filteredRecords.push(record) 
			namesArray[record.name] = null;	// add to namesArray to avoid adding redundant records

			// create and append element to scroll container
			var scrollBlock = document.createElement("DIV");
			var namePara = document.createElement("P");
			var bioPara = document.createElement("P");
			var nameText = document.createTextNode(record.name);
			var bioText = document.createTextNode(record.story_text);
			
			namePara.appendChild(nameText);
			bioPara.appendChild(bioText);

			scrollBlock.appendChild(namePara);
			scrollBlock.appendChild(bioPara);

			scrollSection.appendChild(scrollBlock);
			
			// set class 
			scrollBlock.className = "scroll-block";
			namePara.className = "scroll-name";
			bioPara.className = "scroll-text";	
			

			// if first element, make active by default by adding class
			// if (i===0) { para.classList.add("active-text"); };	
		};

	}; 

	return filteredRecords;

};

function activateTargetWrapper() {
	
	// CALL FUNCTION
	activateTargetEvent(filteredRecords);	// filteredRecords from scrollPopulate;

	function activateTargetEvent(filteredRecords) {
		
		var scrollList = document.querySelectorAll(".scroll-block");	// scroll-text elements
		//console.log("scroll list: ", scrollList);
		console.log("filtered records: ", filteredRecords);
		//console.log("scroll list: ", scrollList);
		
		// if a story text reaches the bottom of target div, have text turn active; else, default state for all story texts are inactive
		
		for (var i=0; i < scrollList.length; i++) {
			var scrollItem = scrollList[i]; 
			var scrollRect = scrollItem.getBoundingClientRect()
			var targetRect = targetDiv.getBoundingClientRect();
			//console.log("scroll element:", scrollItem);
			//console.log("scroll item bottom position:", scrollRect.bottom);
			//console.log("target div bottom:", targetRect.bottom);

			var record = filteredRecords[i];
			var currentId = record.name;

			if (scrollRect.top <= targetRect.bottom) {
				scrollItem.querySelector(".scroll-name").classList.add("active-text");
				scrollItem.querySelector(".scroll-text").classList.add("active-text");

				// highlight corresponding path on plot by activating mouseover
				var event = new MouseEvent("mouseover");	// simulate mouseover
				var labelElement = document.getElementById(currentId);	// id of ordinal label
				labelElement.dispatchEvent(event);
			}

			if (scrollRect.bottom <= targetRect.bottom) {
				scrollItem.querySelector(".scroll-name").classList.remove("active-text");
				scrollItem.querySelector(".scroll-text").classList.remove("active-text");	
				// remove corresponding path highlight
				var event = new MouseEvent("mouseout");
				var labelElement = document.getElementById(currentId);
				labelElement.dispatchEvent(event);
			}
		};
	};
};



function renderViz() {
	// PARALLEL COORDINATE PLOT
	var margin = {top: 30, right: 40, bottom: 20, left: 350};
	var width = 720 - margin.left - margin.right;
	var height = 375 - margin.top - margin.bottom;


	var dimensions = [
		{
			name: "former_org_name",
			type: "string",
			scale: d3.scalePoint().range([0,height]),
			yAxis: d3.axisLeft()
		},
		{
			name: "name",
			type: "string",
			scale: d3.scalePoint().range([0,height]),
			yAxis: d3.axisLeft()
		},
		{
			name: "agency_name",
			type: "string",
			scale: d3.scalePoint().range([0,height]),
			yAxis: d3.axisLeft()
		}
	];

	var dimensionsTwo = [
		{
			name: "former_org_name",
			type: "string",
			scale: d3.scalePoint().range([0,height]),
			yAxis: d3.axisLeft()
		},
		{
			name: "name",
			type: "string",
			scale: d3.scalePoint().range([0,height]),
			yAxis: d3.axisRight()
		}
	];


	var canvas = d3.select("#plot-container").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.call(responsiveScale)	// responsive scaling of canvas (viewPort)
				.append("g")
					.attr("transform", "translate("+margin.left+","+margin.top+")");

	// add tooltip
	var tooltipDiv = d3.select("body").append("div")
					.attr("class", "tooltip")
					.style("opacity", 0);

	// scale for dimensions
	var xScale = d3.scalePoint()
					.domain(dimensions.map(function(d){return d.name}))
					.range([0,width]);
	// line path generator: draw line to points of values that are defined, d[1] is y-value of a point
	var line = d3.line()
					.defined(function(d) { return !isNaN(d[1]); });

	//var yAxis = d3.axisLeft();

	// responsive scaling of canvas (viewPort)
	function responsiveScale(svg) {
		// grab container (viewPort) of svg (viewBox)
		// grab width and height
		// compute aspect ratio for resizing viewBox later
		var container = d3.select(svg.node().parentNode),
		width = parseInt(svg.style('width'), 10),
		height = parseInt(svg.style('height'), 10),
		aspect = width / height;

		// initial page load: viewBox size
		// preserve aspect ratio 
		// resize svg 
		svg.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('preserveAspectRatio', 'xMinYMid')
			.call(resize);

		// event listener: for window resize
		// multiple listeners for same event requires namespace (resize.identifier)
		d3.select(window).on('resize.'+container.attr('id'), 
			resize
		);

		// function to resize chart
		function resize() {
			// grabs width of container 
			// resizes svg to width
			// resizes svg to height while maintaining aspect ratio
			var width = parseInt(container.style('width'));
			svg.attr('width', width);
			svg.attr('height', Math.round(width/aspect));
		}

	};

	// PROCESS: load and process data
	d3.csv("data.csv", function(error,dataArray){
		if (error) {throw Error("Data file could not be loaded");};

		function renderPlot(data, isDropdown=false) {


			// use two dimensions if agency selected from dropdown
			if (isDropdown == true) {  dimensions = dimensionsTwo; };

			// group elements for each dimension and assign class
			var dimension = canvas.selectAll(".dimension")
								.data(dimensions)
								.enter().append("g")
									.attr("class", "dimension")
									.attr("transform", function(d) {return "translate("+xScale(d.name)+")";})	// translate each dimension along x axis
			

			// for each dimension, map domain of sorted values to range
			dimensions.forEach(function(dim){
				dim.scale.domain(data.map(function(d) { return d[dim.name]; }).sort())
			});

			// render background line paths for context
			canvas.append("g")
					.attr("class", "background")
				.selectAll("path")
					.data(data)
					.enter().append("path")
					.attr("d", draw)
					.attr("class", function(d) {
						// dotted line if staffer is departed
						if (d["departed"] === "TRUE") {
							return "dashed"; 
						} else {
							return "solid";
						}
					});


			// render foreground line paths for focus
			canvas.append("g")
					.attr("class", "foreground")
				.selectAll("path")
					.data(data)
					.enter().append("path")
					.attr("d", draw)
					.attr("class", function(d) {
						// dotted line if staffer is departed
						if (d["departed"] === "TRUE") {
							return "dashed"; 
						} else {
							return "solid";
						}
					});

			// axis, axis titles
			// group axis of each dimension, create axis for each dimension, and put axis labels
			dimension.append("g")
					.attr("class", "axis")
					.each(function(d) { d3.select(this).call( d.yAxis.scale(d.scale)); })
					.append("text")
					.attr("class", "title")
					.attr("text-anchor", "middle")
					.attr("y", -9)
					.text(function(d) { return d.name});

			// ordinal labels
			var ordinal_labels = canvas.selectAll(".axis text")	
									.attr("class", "labelsText")
									.attr("id", function(d){return d})	// assign ids to labels
									.on("mouseover", mouseover)
									.on("mouseout", mouseout);

			// projections
			var projections = canvas.selectAll(".background path, .foreground path")
									.classed("inactive", true)	// default inactive paths
									.on("mouseover", mouseover)
									.on("mouseout", mouseout)
			function mouseover(d) {
				canvas.classed("active", true);

				// event listener: highlight selected projection 
				projections.classed("inactive", function(p) { 

					currentElements = [p, p.name, p.agency_name, p.former_org_name];	// p is line path, rest are labels
					// turn labels from all other projections inactive
					if (currentElements.indexOf(d) === -1) {	// if not hovering over a current projection element
						return true;						// then turn inactive
					} else {

						var nameLabelEl = document.getElementById(p.name);
						var agencyLabelEl = document.getElementById(p.agency_name);
						var orgLabelEl = document.getElementById(p.former_org_name);

						// highlight labels of active projection
						// if record cell is not empty and element exists 
						if (p.name !== "" && nameLabelEl !== null) {nameLabelEl.style.fill = "steelblue";}
						if (p.agency_name !== "" && agencyLabelEl !== null) {agencyLabelEl.style.fill =  "steelblue";}
						if (p.former_org_name !== "" && orgLabelEl !== null) {orgLabelEl.style.fill =  "steelblue";}
						
						// return false for inactive: highlight elements of active projection
						// console.log(d);	
						return false;
					}
				});

				// event listener: show tooltip if hover over staffer name

				/**
				projections.each(function(p) {
					if (d == p.name) {
						// if current element (d) is a staffer name, tooltip appears
						tooltipDiv.transition()
								.duration(200)
								.style("opacity", .9);

						tooltipContent = p.story_text;

						tooltipDiv.html(tooltipContent)
								.style("left", (d3.event.pageX) + "px")
								.style("top", (d3.event.pageY - 28) + "px");
					}
				});
				**/


			}

			function mouseout(d) {
				canvas.classed("active", false);
				projections.classed("inactive", true);
				ordinal_labels.classed("inactive", false);

				projections.attr("fill", function(p) {

						var nameLabelEl = document.getElementById(p.name);
						var agencyLabelEl = document.getElementById(p.agency_name);
						var orgLabelEl = document.getElementById(p.former_org_name);

						// highlight labels of active projection
						// if record cell is not empty and element exists 
						if (p.name !== "" && nameLabelEl !== null) {nameLabelEl.style.fill = "black";}
						if (p.agency_name !== "" && agencyLabelEl !== null) {agencyLabelEl.style.fill =  "black";}
						if (p.former_org_name !== "" && orgLabelEl !== null) {orgLabelEl.style.fill =  "black";}


				});


				// d3.select(this).attr("fill", "black");

				// event listener: hide tooltip  if mouseout of staffer name
				tooltipDiv.transition()
						.duration(100)
						.style("opacity", 0);

			}

		};											


		function draw(d) {
			return line(dimensions.map(function(dimension) {
				return [xScale(dimension.name), dimension.scale(d[dimension.name])];
			}))
		};

		function selectAgencyEvent () {
			/**
			update plot and story block upon selecting agency filter from dropdown
			**/

			// d3 update chart
			// ref 1: http://bl.ocks.org/williaster/10ef968ccfdc71c30ef8
			// ref 2 *: https://stackoverflow.com/questions/23048351/dynamically-updating-the-parallel-coordiante-data
			// maybe need to call svg or axes again with transition method
			
			agencyDropdown.addEventListener("change", function() {
				var agency = agencyDropdown.value;
				console.log("agency: ", agency);

				// remove previous scroll texts
				while (scrollSection.firstChild) {
					// while there is a first child of scroll block, remove until no more children (scroll text paragraphs)
					scrollSection.removeChild(scrollSection.firstChild);
				}

				// change scroll intro to agency name
				scrollIntro.querySelector("h1").innerHTML = agency;

				// event: scroll back to top
				$("#scroll-container").animate({scrollTop:0}, "fast");
				
				// filter data for particular agency
				data = filterData(dataArray, agency);	// get records under agency

				// scrollController to populate scrollContainer and event listeners
				scrollController(data);
				
				// render plot
				canvas.selectAll("*").remove();	// remove prev elements from canvas

				renderPlot(data, isDropdown=true);	// isDropdown true flag for two axes


			});
		};

		// INITIAL LOAD: CALL FUNCTIONS TO RENDER PLOT AND SCROLL TEXTS
		data = filterData(dataArray);
		renderPlot(data);
		scrollController(data);
		selectAgencyEvent();	// function: agency dropdown event

	});

};

// draw line path for each record "d" in "data" array (d) 
// dimensions.map goes through all dimension records, which means points for all dimensions of particular record are iterated through since d3 line path function can take in list of arrays with x,y coords
// return x, y coordinates point for line to go through (x: dimension name converted by ordinal scale to integer, y: dimension value for particular record "d" converted by defined scale for particular dimension)


function filterData(dataArray, agency=null) {
	/** 
	filter records only if staffer has ties to specified agencies and organizations
	**/

	var data = []
	for (var i=0; i< dataArray.length; i++) {
		var record = dataArray[i];

		if (agency === null) {
			// initial plot
			// if agency param is null, then push records with story block set to true 
			if (record.story_block === "TRUE") {
				data.push(record);
			};
		} else {
			// agency specific plot
			// if agency param is not null, then push records with specified agency	
			if (record.agency_name === agency) {
				// Too many records to filter: HHS,Commerce,Treasury
				data.push(record);
			};
		};
	};

	return data;
}

function populateDropdown() {

	var agencyList = Object.keys(agencies)
	console.log("agency list: ", agencyList);

	for (var i=0; i<agencyList.length; i++) {
		var agency = agencyList[i];
		var listNode = document.createElement("OPTION");
		var textNode = document.createTextNode(agency);
		listNode.appendChild(textNode);
		agencyDropdown.appendChild(listNode);
		//agencyDropdown.append('<option value='+agency+'>'+agency+'</option>');
	}
};


function main() {
	populateDropdown();
	renderViz();
};

$(document).ready(main());


