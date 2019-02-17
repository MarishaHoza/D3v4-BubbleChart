




function bubbleChart() {

  var width = 940;
  //var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  var height = 600;
  var padding = 100;
  var tooltip = floatingTooltip('gates_tooltip', 240);
  var center = {
    x: width / 2,
    y: height / 2
  }

  var bookCenters = {
    bible: { x: width / 3, y: height / 2 },
    gita: { x: 2 * width / 3, y: height / 2 }
  };

  var bookTitleX = {
   bible: 160,
   gita: width - 160
 };

  var svg = null;
  var bubbles = null;
  var texts = null;
  var ratios = null;
  var nodes = [];

  var forceStrength = 0.025;

  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
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

  simulation.stop();


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
      .range([5, height/15])
      .domain([0, maxAmount]);

    const gitaMax = d3.max(addMax, d => +d.gWeight)
    const bibleMax = d3.max(addMax, d => +d.bWeight)

    const xScale = d3.scaleLinear()
        .domain([(0-bibleMax), gitaMax])
        .range([0+padding, width-padding])

    var myNodes = addMax.map(function(d) {
      return {
        id: d.word,
        total: d.total,
        radius: radiusScale(d.total),
        bible: +d.bWeight,
        gita: +d.gWeight,
        x: xScale((0-(+d.bWeight)+(+d.gWeight))),
        y: Math.random() * 800,
        xScale: xScale((0-(+d.bWeight)+(+d.gWeight))),
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


    let ids = nodes.map(function(d) {return d.id+"SVG"})
    let percentages = nodes.map(function(d) {return (d.bible/d.total)})
    console.log(nodes)
    let count = 0;

    var defs = svg.append("defs");

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
      .attr('font-size', function(d) {
        return d.radius * 0.65
      })
      .attr('text-anchor', 'middle');

    ratios = svg.selectAll(null)
      .data(nodes, function(d) { return d.id; })
      .enter()
      .append('text')
      .text(function(d) {
        return d.bible + ' - ' + d.gita
      })
      .attr('color', 'white')
      .attr('font-size', function(d) {
        return d.radius * 0.4
      })
      .attr('text-anchor', 'middle')



    bubbles.transition()
      .duration(2000)
      .attr('r', function(d) { return d.radius; });


    simulation.nodes(nodes);

    console.log(bubbles)

    groupBubbles();
  };


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

  function groupBubbles() {
    simulation.force('x', d3.forceX().strength(forceStrength).x(function(d) {
      return (d.xScale)
    }));
    simulation.alpha(1).restart();
  }

  // function splitBubbles() {
  //   simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));
  //   simulation.alpha(1).restart();
  // }

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

  // chart.toggleDisplay = function (displayName) {
  //     if (displayName === 'year') {
  //       splitBubbles();
  //     } else {
  //       groupBubbles();
  //     }
  // };

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
