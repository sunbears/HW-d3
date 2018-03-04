var svgWidth = 740;
var svgHeight = 375;

var margin = { top: 20, right: 10, bottom: 110, left: 150 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var chart = svg.append("g");

d3.csv("healthData.csv", function(err, healthData) {
    if (err) {
        throw err;
    }

    healthData.forEach(function(data) {
        data.belowPov = +data.belowPov;
        data.cantSeeDocDueToCost = +data.cantSeeDocDueToCost;
    });

    // Create scale functions
    var yLinearScale = d3.scaleLinear()
        .range([height, 0]);

    var xLinearScale = d3.scaleLinear()
        .range([0, width]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Scale the domain
    xLinearScale.domain([
        d3.min(healthData, function(data) {
            return +data.belowPov;
        }),
        d3.max(healthData, function(data) {
        return +data.belowPov;
        })
    ]);
    
    
    yLinearScale.domain([
        d3.min(healthData, function(data) {
            return +data.cantSeeDocDueToCost;
        }),
        d3.max(healthData, function(data) {
        return +data.cantSeeDocDueToCost;
        })
    ]);

    // Append x-axis labels
    
    chart.append("text")
        .attr("transform", "translate(" + width / 3 + " ," + (height + margin.top + 20) + ")")
        .attr("data-axis-name", "belowPov")
        .attr("class", "x-axis-category")
        .text("DEMOGRAPHICS");

    chart.append("text")
        .attr("transform", "translate(" + width / 3 + " ," + (height + margin.top + 40) + ")")
        .attr("class", "x-axis-text active")
        .attr("data-axis-name", "belowPov")
        .text("% Below Poverty");

    chart
        .append("text")
        .attr("transform", "translate(" + width / 3 + " ," + (height + margin.top + 60) + ")")
        // This axis label is inactive by default
        .attr("class", "x-axis-text inactive")
        .attr("data-axis-name", "uninsured")
        .text("% Uninsured");

    chart
        .append("text")
        .attr("transform", "translate(" + (width) / 3 + " ," + (height + margin.top + 80) + ")")
        // This axis label is inactive by default
        .attr("class", "x-axis-text inactive")
        .attr("data-axis-name", "unempCivLaborForce")
        .text("% Unemployment (Civilian Labor Forcce)");
    
    // Append y-axis labels

    chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (0.95*height))
        .attr("dy", "1em")
        .attr("data-axis-name", "healthOutcomes")
        .attr("class", "y-axis-category")
        .text("HEALTH OUTCOMES");    
    
    
    chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 50)
        .attr("x", 0 - (0.95*height))
        .attr("dy", "1em")
        .attr("class", "y-axis-text active")
        .attr("data-axis-name", "cantSeeDocDueToCost")
        .text("% Unable to See the Doctor Due to Cost");

    chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 75)
        .attr("x", 0 - (0.95*height))
        .attr("dy", "1em")
        .attr("class", "y-axis-text inactive")
        .attr("data-axis-name", "poorHealth")
        .text("% Self-Reported Poor Health");

    chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 100)
        .attr("x", 0 - (0.95*height))
        .attr("dy", "1em")
        .attr("class", "y-axis-text inactive")
        .attr("data-axis-name", "noMammo2Yrs")
        .text("% No Mammograms Within 2 Years");


    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([100, -80])
        .html(function(data) {
            var state = data.state;
            var belowPov = +data.belowPov;
            var cantSeeDocDueToCost = +data.cantSeeDocDueToCost;
            var noMammo2Yrs = +data.noMammo2Yrs;
            var poorHealth = +data.poorHealth;
            var uninsured = +data.uninsured;
            var unempCivLaborForce = +data.unempCivLaborForce;
            return (state + "<br>Poverty:" + belowPov + "%"+ "<br>Can't See Doctor Due to Cost: " + cantSeeDocDueToCost) + "%";
        });

    chart.call(toolTip);

    chart.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", function(data, index) {
            return xLinearScale(data.belowPov);
        })
        .attr("cy", function(data, index) {
            return yLinearScale(data.cantSeeDocDueToCost);
        })
        .attr("r", "11")
        .attr("fill", "#87CEEB")
        .attr("class","circle")
        .on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);
    
    // Add State Abbreviation to Circles
    chart.selectAll("text")
        .data(healthData)
        .enter()
        .append("text")
        .attr("x", function(data, index) {
            return xLinearScale(data.belowPov);
        })
        .attr("y", function(data, index) {
            return yLinearScale(data.cantSeeDocDueToCost);
        })        
        .text(function(data) {return data.stateAbbr})
        .attr("class","circletext")
        .attr("text-anchor","middle")
        .attr("fill","white");

    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")
        .call(bottomAxis);

    chart.append("g")
        .call(leftAxis);

    // Change an X axis's status from inactive to active when clicked (if it was inactive).  Change the status of all active axes to inactive otherwise

    function labelChange(clickedXaxis) {
        d3
            .selectAll(".x-axis-text")
            .filter(".active")
        // An alternative to .attr("class", <className>) method. Used to toggle classes.
            .classed("active", false)
            .classed("inactive", true);

        clickedXaxis.classed("inactive", false).classed("active", true);
    }

    // Change a Y axis's status from inactive to active when clicked (if it was inactive).  Change the status of all active axes to inactive otherwise
    function labelChange(clickedYaxis) {
        d3
            .selectAll(".y-axis-text")
            .filter(".active")
        // An alternative to .attr("class", <className>) method. Used to toggle classes.
            .classed("active", false)
            .classed("inactive", true);

        clickedYaxis.classed("inactive", false).classed("active", true);
    }

    function findMinAndMax(dataColumnX) {
        return d3.extent(healthData, function(data) {
            return +data[dataColumnX];
        });
    }

    d3.selectAll(".x-axis-text").on("click", function() {
        // Assign a variable to current axis
        var clickedSelection = d3.select(this);
        // "true" or "false" based on whether the axis is currently selected
        var isClickedSelectionInactive = clickedSelection.classed("inactive");
        // console.log("this axis is inactive", isClickedSelectionInactive)
        // Grab the data-attribute of the axis and assign it to a variable
        // e.g. if data-axis-name is "poverty," var clickedXaxis = "poverty"
        var clickedXaxis = clickedSelection.attr("data-axis-name");
        console.log("current x axis: ", clickedXaxis);

        // The onclick events below take place only if the x-axis is inactive
        // Clicking on an already active axis will therefore do nothing
        if (isClickedSelectionInactive) {
            
            // Set the domain for the x-axis
            xLinearScale.domain(findMinAndMax(clickedXaxis));

            // Create a transition effect for the x-axis
            svg
                .select(".x-axis")
                .transition()
                .duration(1800)
                .call(bottomAxis);
            
            // Select all circles to create a transition effect, then relocate its horizontal location based on the new axis that was selected/clicked
            d3.selectAll(".circle").each(function() {
                d3
                    .select(this)
                    .transition()
                    .attr("cx", function(data) {
                        return xLinearScale(+data[clickedXaxis]);
                    })
                    .duration(1800);
            });
            
            // Select all circle texts to create a transition effect, then relocate its horizontal location based on the new axis that was selected/clicked
            d3.selectAll(".circletext").each(function() {
                d3
                    .select(this)
                    .transition()
                    .attr("x", function(data) {
                        return xLinearScale(+data[clickedXaxis]);
                    })
                    .duration(1800);
            });

            // Change the status of the axes. See above for more info on this function.
            labelChange(clickedSelection);
        }
    });

    //d3 function for changing the y axis
    d3.selectAll(".y-axis-text").on("click", function() {
        // Assign a variable to current axis
        var clickedSelection = d3.select(this);
        // "true" or "false" based on whether the axis is currently selected
        var isClickedSelectionInactive = clickedSelection.classed("inactive");
        // console.log("this axis is inactive", isClickedSelectionInactive)
        // Grab the data-attribute of the axis and assign it to a variable
        // e.g. if data-axis-name is "poverty," var clickedYaxis = "poverty"
        var clickedYaxis = clickedSelection.attr("data-axis-name");
        console.log("current y axis: ", clickedYaxis);

        // The onclick events below take place only if the x-axis is inactive
        // Clicking on an already active axis will therefore do nothing
        if (isClickedSelectionInactive) {
            
            // Set the domain for the y-axis
            yLinearScale.domain(findMinAndMax(clickedYaxis));

            // Create a transition effect for the y-axis
            svg
                .select(".y-axis")
                .transition()
                .duration(1800)
                .call(leftAxis);
            
            // Select all circles to create a transition effect, then relocate its horizontal location based on the new axis that was selected/clicked
            d3.selectAll(".circle").each(function() {
                d3
                    .select(this)
                    .transition()
                    .attr("cy", function(data) {
                        return yLinearScale(+data[clickedYaxis]);
                    })
                    .duration(1800);
            });
            
            // Select all circle texts to create a transition effect, then relocate its vertital location based on the new axis that was selected/clicked
            d3.selectAll(".circletext").each(function() {
                d3
                    .select(this)
                    .transition()
                    .attr("y", function(data) {
                        return yLinearScale(+data[clickedYaxis]);
                    })
                    .duration(1800);
            });
            
            //Update the Tooltip 
            //As a first step, I tried to select all tooltips and update the html to display the clickedYaxis.
            //The console will print the clickedYaxis.  I'm not sure why it's not working.  
            d3.selectAll(".tooltip").each(function() {
                d3.
                select(this).
                html(clickedYaxis);
                console.log("tooltip update: clickedYaxis: "+ clickedYaxis);
            });    

            // Change the status of the axes. See above for more info on this function.
            labelChange(clickedSelection);
        }
    });

});