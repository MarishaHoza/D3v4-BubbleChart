




function bubbleChart() {

  // set start variables for the svg canvas

  var width = 940;
  //var for responsive width
  //var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var height = 400;
  var padding = 150;
  var tooltip = floatingTooltip('gates_tooltip', 240);
  var center = {
    x: width / 2,
    y: height / 2
  }

  // set placeholder variables to use for the svg render
  var svg = null;
  var bubbles = null;
  var texts = null;
  var ratios = null;
  var nodes = [];

  // set up force layout and simulation
  var forceStrength = 0.05;

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * 0.025;
  }

  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(function(d) {
      return (d.xScale)
    }))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .force('collide', d3.forceCollide().radius(function(d) { return d.radius + 2; }).iterations(2))
    .on('tick', ticked);

  // temporarily stop the simulation as it currently has no nodes
  simulation.stop();


  // create nodes
  function createNodes(shownData) {

    // add new key value pair containing the combined word usage (number)
    let addMax = shownData.map(function(d) {
      var theData = Object.assign({}, d);
      theData.total = ( Number(d.bWeight) + Number(d.gWeight) );
      return theData;
    })

    // find the highest total of the combined word usage
    var maxAmount = d3.max(addMax, function(d) {
      return d.total;
    });

    // create the radius size for each bubble based on the relative size of the node
    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([5, height/10])
      .domain([0, maxAmount]);

    // find the highest counts from each text
    const gitaMax = d3.max(addMax, d => +d.gWeight)
    const bibleMax = d3.max(addMax, d => +d.bWeight)

    // find the relative position of the bubble on the x axis
    // pass in the ratio of bible usage to total usage
    const xScale = d3.scaleLinear()
        .domain([1, 0])
        .range([0+padding, width-padding])

    // save nodes with key value pairs needed for the d3 svg render
    var myNodes = addMax.map(function(d) {
      return {
        id: d.word,
        total: d.total,
        radius: radiusScale(d.total),
        bible: +d.bWeight,
        gita: +d.gWeight,
        x: xScale(+d.bWeight/((+d.bWeight)+(+d.gWeight))),
        y: Math.random() * 800,
        xScale: xScale(+d.bWeight/((+d.bWeight)+(+d.gWeight))),
      };
    });

    //myNodes.sort(function (a, b) { return b.bible - a.bible});
    //console.log(myNodes)
    return myNodes
  };

  // create the svg render
  var chart = function chart(selector, rawData) {

    // filter our raw data to contain only values that have
    // been pre-set to start the visualization
    let shownData = rawData.filter(function(d) {
      return d.start === "TRUE"
    });

    //////////////////// this code section is for the input form
    /////////////////// to add new words

    // checks if the input is within our data set
    // if the data is present, manually set the "start" field to "TRUE"
    function checkIfData (rawData, key, value) {
      for (var i=0; i < rawData.length; i++){
        if(rawData[i][key] === value) {
          rawData[i]['start'] = 'TRUE';
          return true;
        }
      }
      console.log(false)
      return false;
    }

    // this was originally a test, but I decided to keep the line
    shownData.push(rawData[186])


    // save input from the HTML form
    function getInput() {
      event.preventDefault();
      var x = document.getElementById("word-form");
      var text = "";
      var i;
      for (i = 0; i < x.length ;i++) {
        text += x.elements[i].value.toLowerCase();
      }
      input = text
    }

    let input = ""

    // listen for button click and restart the render
    document.getElementById("newword").onclick = function() {
      getInput()
      if (checkIfData(rawData, "word", input) === true) {
        d3.selectAll('svg ').remove()
        chart(selector, rawData)
        console.log(shownData)
      }

    };

    ////////////////////

    // create nodes with only data set to start = true
    nodes = createNodes(shownData);

    // create an svg canvas
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // create bubbles
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function(d) { return d.id; })


    // set variables
    let ids = nodes.map(function(d) {return d.id+"SVG"})
    let percentages = nodes.map(function(d) {return (d.bible/d.total)})
    let count = 0;
    var defs = svg.append("defs");


    // create gradient definitions for use on each bubble
    let makeDefs = ids.map(function(d){
      let gradient = defs.append("linearGradient")
        .attr("id", d)
        .attr("x1", "0%")
        .attr("x2", "100%");
      gradient.append("stop")
        .attr('class', 'start')
        .attr("offset", percentages[count])
        .attr("stop-color", "rgb(19, 91, 186, 0.75)")
        .attr("stop-opacity", 0.75);
      gradient.append("stop")
        .attr('class', 'end')
        .attr("offset", percentages[count])
        .attr("stop-color", "rgb(63, 144, 83, 0.75)")
        .attr("stop-opacity", 0.75);
      count ++;
    })

    // add new circles for each bubble
    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function(d) {return "url(#" + d.id + "SVG)" })
      .attr('stroke', "rgb(135, 142, 145)")
      .attr('stroke-width', 2)
      .attr("id", function(d) {return d.id})
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    bubbles = bubbles.merge(bubblesE);

    // add text to display above bubble
    texts = svg.selectAll(null)
      .data(nodes, function(d) { return d.id; })
      .enter()
      .append('text')
      .text(function(d) {
        function cap(string) {
          return (string.charAt(0).toUpperCase() + string.slice(1))
        }
        return cap(d.id)
      })
      .attr('color', 'white')
      .attr('font-size', 0)
      .attr('text-anchor', 'middle');

    ratios = svg.selectAll(null)
      .data(nodes, function(d) { return d.id; })
      .enter()
      .append('text')
      .text(function(d) {
        return d.bible + ' - ' + d.gita
      })
      .attr('color', 'white')
      .attr('font-size', 0)
      .attr('text-anchor', 'middle')


    // fancy transitions
    bubbles.transition()
      .duration(1500)
      .attr('r', function(d) { return d.radius; });

    texts.transition()
      .duration(1500)
      .attr('font-size', function(d) { return d.radius * 0.65 });

    ratios.transition()
      .duration(1500)
      .attr('font-size', function(d) { return d.radius * 0.4 });


    // start the simulation with the finished data
    simulation.nodes(nodes);
    groupBubbles();
  };


  // d3 force simulation ticks
  function ticked() {
    bubbles
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });
    texts
      .attr('x', function(d) { return (d.x)})
      .attr('y', function(d) { return (d.y)});
    ratios
      .attr('x', function(d) { return (d.x)})
      .attr('y', function(d) { return (d.y + (d.radius/2))});
  }


  // run the simulation and apply force to the bubbles
  // this funciton was originally intended to allow the bubbles
  // to regroup in the original arangement if moved
  function groupBubbles() {
    simulation.force('x', d3.forceX().strength(forceStrength).x(function(d) {
      return (d.xScale)
    }));
    simulation.alpha(1).restart();
  }

  // details to display and hide on tooltip mousover
  function details(d) {
    d3.select(this).attr('stroke', 'rgb(135, 142, 145)');
    var content = '<span class="name">' + d.id + '</span> <br/> <span class="value">'
                  + d.bible + ' - ' +  d.gita + '</span>'
  }

  function showDetail(d) {
    d3.select(this).attr('stroke', 'rgb(135, 142, 145)');

    var content = '<span class="name">' + d.id + '</span> <br/> <span class="value">'
                  + d.bible + ' - ' +  d.gita + '</span>';

    tooltip.showTooltip(content, d3.event);
  };

  function hideDetail(d) {
    d3.select(this)
      .attr('stroke', "rgb(135, 142, 145)");

    tooltip.hideTooltip();
  }

  return chart;
}

// run the bubble chart
var myBubbleChart = bubbleChart();

// catch errors
function display(error, data) {
  if (error) {
    console.log(error);
  }
  myBubbleChart('#vis', data);
}


// import data
d3.csv('data/data.csv', display);
