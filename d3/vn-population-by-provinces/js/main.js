/**
 * ©2018 Tran Trong Thanh
 */
/*global d3*/
$(function() {
	// var W = window.innerWidth;
	// var H = window.innerHeight;

	const YEAR_FIRST = 1995;
	const YEAR_LAST = 2016;
	let curYear = 1995;
	let svg;
	let legend;
	let loadedData;

	d3.xml('img/vietnam-v4.svg').then(function(xml) {
		document.getElementById('map').appendChild(xml.documentElement);
		d3.csv('data.csv').then(function(data) {
			// console.log(data[0]);
			// normalize data
			data.forEach(item => {
				item.area = parseFloat(item.area);
				for (let i = 1995; i <= 2016; ++i) {
					item['pop' + i] = parseFloat(item['pop' + i]);
					item['den' + i] = parseFloat(item['den' + i]);
				}
			});
			console.log(data);
			loadedData = data;
			renderChart(data);
		});
	});

	const tooltip = d3.select('#tooltip').style('display', 'none');

	// const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 3500]);
	const colorScale = d3
		.scaleLinear()
		.domain([0, 100, 200, 500, 1000, 2000, 4000])
		.range(['#ffffff', '#ffffe0', '#ffcb91', '#fe906a', '#e75758', '#c0223b', '#8b0000']);

	function renderChart(data) {
		// append the svg obgect to the body of the page
		// appends a 'group' element to 'svg'
		// moves the 'group' element to the top left margin
		svg = d3.select('#map > svg');
		// console.log(svg);
		// const width = svg.node().getBBox().width;
		// const height = svg.node().getBBox().height;

		svg.selectAll('#islands>path').attr('fill', '#fff');

		svg
			.selectAll('#land>path')
			.data(data, (d, i, nodes) => {
				return d ? 'vn-' + d.code : nodes[i].id;
			})
			.attr('fill', d => colorScale(d['den' + curYear]))
			.attr('stroke', '#000')
			.attr('stroke-width', '1')
			.on('mouseover', (d, i, nodes) => {
				tooltip
					.style('display', 'block')
					.style('left', () => {
						return d3.event.pageX + 20 + 'px';
					})
					.style('top', () => {
						return d3.event.pageY - 40 + 'px';
					})
					.attr('data-code', d.code).html(`
						<h4>${d.name}</h4>
						<p>${d['den' + curYear]}ng/km<sup>2</sup></p>
						`);
				d3.select(nodes[i]).attr('stroke', '#ff0000');
			})
			.on('mouseout', (d, i, nodes) => {
				d3.select(nodes[i]).attr('stroke', '#000');
			});

		const legendLinear = d3
			.legendColor()
			.labelFormat(d3.format('d'))
			.title('Mật độ Dân số Việt Nam')
			.cells([0, 100, 200, 500, 1000, 2000, 4000])
			.shapeWidth(50)
			.orient('horizontal')
			.scale(colorScale);

		legend = svg
			.append('g')
			.attr('transform', 'translate(700, 40)')
			.call(legendLinear);
	}

	function updateChart() {
		curYear++;

		if (curYear > YEAR_LAST) {
			curYear = YEAR_FIRST;
		}

		legend.select('.legendTitle').text('Mật độ Dân số Việt Nam năm ' + curYear);

		if ($(tooltip.node()).is(':visible')) {
			const provCode = tooltip.attr('data-code');
			const provData = loadedData.find(item => {
				return item.code === provCode;
			});

			tooltip.html(`
						<h4>${provData.name}</h4>
						<p>${provData['den' + curYear]}ng/km<sup>2</sup></p>
						`);
		}

		svg
			// .transition()
			// .duration(100)
			// .on('end', () => {
			// 	updateChart();
			// })
			.selectAll('#land>path')
			.attr('fill', d => colorScale(d['den' + curYear]));
		setTimeout(() => {
			updateChart();
		}, 500);
	}

	function getCentroid(element) {
		var bbox = element.getBBox();
		return [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
	}

	$('#play-btn').on('click', function() {
		updateChart();
	});
});
