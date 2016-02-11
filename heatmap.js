angular.module("heatmap", []).directive("heatmap",
	function() {
		return {
			restrict: "E",
			replace: true,
			scope: {
				data: "=",
				options: "=?",
				dispatch: "=?"
			},
			transclude: false,
			template: "<div></div>",
			link: function(scope, element) {

				var options = {
					margin: { top: 50, right: 0, bottom: 100, left: 50 },
					buckets: 9,
					colors: ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
					duration: 1000
				};

				if (scope.options) {
					options = angular.extend(options, scope.options);
				}

				scope.dispatch = d3.dispatch("click", "mouseover", "mouseout");

				var w = element[0].offsetWidth;
				var h = element[0].offsetHeight;
				var width = w - options.margin.left - options.margin.right;
				var height = h - options.margin.top - options.margin.bottom;

				var svg = d3.select(element[0]).append("svg")
					.attr("width", width + options.margin.left + options.margin.right)
					.attr("height", height + options.margin.top + options.margin.bottom)
					.append("g")
					.attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

				scope.render = function(data) {

					var xu = {};
					var x = [];
					var yu = {};
					var y = [];
					
					for (var i in scope.data) {
						if (typeof(xu[scope.data[i].x]) == "undefined") {
							x.push(scope.data[i].x);
						}
						xu[scope.data[i].x] = 0;
						if (typeof(yu[scope.data[i].y]) == "undefined") {
							y.push(scope.data[i].y);
						}
						yu[scope.data[i].y] = 0;
					}

					var xGridSize = Math.floor(width / x.length);
					var yGridSize = Math.floor(height / y.length);
					var legendElementWidth = xGridSize;
					var legendElementHeight = height / 20;

					var yLabels = svg.selectAll(".yLabel")
						.data(y)
						.enter().append("text")
						.text(function (d) { return d; })
						.attr("x", 0)
						.attr("y", function (d, i) { return i * yGridSize; })
						.style("text-anchor", "end")
						.attr("transform", "translate(-6," + yGridSize / 1.5 + ")")
						.attr("class", function (d, i) { return ("yLabel axis"); });

					var xLabels = svg.selectAll(".xLabel")
						.data(x)
						.enter().append("text")
						.text(function(d) { return d; })
						.attr("y", function(d, i) { return -i * xGridSize; })
						.attr("x", 0)
						.style("text-anchor", "end")
						.attr("transform", "translate(" + xGridSize / 2 + ", -10) rotate(90) ")
						.attr("class", function(d, i) { return ("xLabel axis"); });

					var colorScale = d3.scale.quantile()
						.domain([0, options.buckets - 1, d3.max(data, function (d) { return d.value; })])
						.range(options.colors);

					var cards = svg.selectAll(".square")
						.data(scope.data);

					cards.append("title");

					cards.enter().append("rect")
						.attr("x", function(d) { return (x.indexOf(d.x)) * xGridSize; })
						.attr("y", function(d) { return (y.indexOf(d.y)) * yGridSize; })
						.attr("class", "square")
						.attr("width", xGridSize)
						.attr("height", yGridSize)
						.on("click", function(d) { scope.dispatch.click(d); })
						.on("mouseover", function(d) { scope.dispatch.mouseover(d); })
						.on("mouseout", function(d) { scope.dispatch.mouseout(d); })
						.style("fill", options.colors[0]);

					cards.transition().duration(options.duration).style("fill", function(d) { return colorScale(d.value); });

					cards.select("title").text(function(d) { return d.value; });

					cards.exit().remove();

					var legend = svg.selectAll(".legend")
						.data([0].concat(colorScale.quantiles()).concat(d3.max(scope.data, function (d) { return d.value; })), function(d) { return d; });

					legend.enter().append("g").attr("class", "legend");

					legend.append("rect")
						.attr("x", function(d, i) { return legendElementWidth * i; })
						.attr("y", height * 1.05)
						.attr("width", legendElementWidth)
						.attr("height", legendElementHeight)
						.style("fill", function(d, i) { return options.colors[i]; })
						.style("visibility", function(d, i) { return(i < options.buckets ? "visible" : "hidden") });

					legend.append("text")
						.attr("class", "legendLabel")
						.text(function(d) { return Math.round(d); })
						.attr("x", function(d, i) { return legendElementWidth * i; })
						.attr("y", height * 1.15)
						.style("text-anchor", "middle");

					legend.exit().remove();

				};

				scope.$watch("data", function() {
					scope.render(scope.data);
				}, true);

			}
		}
	}
);





