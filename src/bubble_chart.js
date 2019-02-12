




function bubbleChart() {

  var width = 940;
  var height = 600;
  var tooltip = floatingTooltip('gates_tooltip', 240);
  var center = {
    x: width / 2,
    y: height / 2
  }

  // const gitaExtent = d3.extent(rawData, d => +d.gWeight)
  // const bibleExtent = d3.extent(rawData, d => +d.bWeight)
  //
  // const xScale = d3.scaleLinear()
  //   .domain([(0-bibleExtent[1]), gitaExtent[1]])
  //   .range([0, width])
  //
  // console.log(gitaExtent)

  var bookCenters = {
    bible: { x: width / 3, y: height / 2 },
    gita: { x: 2 * width / 3, y: height / 2 }
  };

  var bookTitleX = {
   bible: 160,
   gita: width - 160
 };

  var forceStrength = 0.03;

  var svg = null;
  var bubbles = null;
  var nodes = [];

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(forceStrength).x(center.x))
    .force('y', d3.forceY().strength(forceStrength).y(center.y))
    .force('charge', d3.forceManyBody().strength(charge))
    .on('tick', ticked);

  simulation.stop();


  var fillColor = d3.scaleOrdinal()
    .domain(['low', 'medium', 'high'])
    .range(['#d84b2a', '#beccae', '#7aa25c']);

  function createNodes(rawData) {

    let myData = rawData.filter(function(d) {
      return d.start === "TRUE"
    })

    let addMax = myData.map(function(d) {
      var theData = Object.assign({}, d);
      theData.total = ( Number(d.bWeight) + Number(d.gWeight) );
      return theData;
    })

    var maxAmount = d3.max(addMax, function(d) {
      return d.total;
    });

    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 85])
      .domain([0, maxAmount]);

    var myNodes = addMax.map(function(d) {
      return {
        id: d.word,
        total: d.total,
        radius: radiusScale(d.total),
        bible: +d.bWeight,
        gita: +d.gWeight,
        x: Math.random() * 900,
        y: Math.random() * 800,
      };
    });

    myNodes.sort(function (a, b) { return b.bible - a.bible});

    return myNodes;
  };



  var chart = function chart(selector, rawData) {
    nodes = createNodes(rawData);

    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    bubbles = svg.selectAll('.bubble')
      .data(nodes, function(d) { return d.id; })

    var bubblesE = bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.radius); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.radius)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    bubbles = bubbles.merge(bubblesE);

    bubbles.transition()
      .duration(2000)
      .attr('r', function(d) { return d.radius; });

    simulation.nodes(nodes);

    groupBubbles();
  };


  function ticked() {
    bubbles
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });
  }

  function groupBubbles() {
    simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
    simulation.alpha(1).restart();
  }

  // function splitBubbles() {
  //   simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));
  //   simulation.alpha(1).restart();
  // }

  function showDetail(d) {
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name"> Title: </span><span class="value">' +
                  d.id +
                  '</span><br/>' +
                  '<span class="name"> Bible Count: </span><span class="value">' +
                  d.bible +
                  '<span class="name"> Gita Count: </span><span class="value">' +
                  d.gita +
                  '</span>';

    tooltip.showTooltip(content, d3.event);
  };

  function hideDetail(d) {
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.radius)).darker());

    tooltip.hideTooltip();
  }

  chart.toggleDisplay = function (displayName) {
      if (displayName === 'year') {
        splitBubbles();
      } else {
        groupBubbles();
      }
  };

  return chart;
}


var myBubbleChart = bubbleChart();

function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

d3.csv('data/data.csv', display);
