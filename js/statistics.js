$(document).ready(function($){
    //reads csv file and sets it to the global variable data
    $.ajax({
      type: "GET",
      url: "dataset/dataset-svprojects.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        data = $.csv.toObjects(fdata);
      }
    });

    $.ajax({
      type: "GET",
      url: "dataset/dataset-abbreviations.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        abbreviations = $.csv.toObjects(fdata);
      }
    });

    $.ajax({
      type: "GET",
      url: "dataset/dataset-diseaseTree.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        tree = $.csv.toObjects(fdata);
        parentArray = Object.keys(tree[0]);
      }
    });

    $.ajax({
      type: "GET",
      url: "dataset/dataset-svresults.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        results = $.csv.toObjects(fdata);
      }
    });
    
    createCharts();

    window.onresize = createCharts;
});

function setAbbreviations(category) {
  var output = [];

  for(var i = 0; i < abbreviations.length; i++)
  {
    var longName = abbreviations[i][category + " LongName"];
    var shortName = abbreviations[i][category + " ShortName"]
    if(longName != "" && shortName != "")
    {
      output[longName] = shortName; 
    }
  }

  return output;
}

var healthData = [];
var ageData = [];
var anatomyData = [];
var diseaseData = [];
var simulationData = [];
var methodData = [];
var arraysUndefined = true;

function createCharts() {
  numbers();

  if(arraysUndefined)
  {
    filters();
  }

  healthChart();
  ageChart();
  
  anatomyChart();
  diseaseChart();

  simulationChart();
  methodChart();
}

function numbers()
{
  var id = "numbers";
  var text = "Our repository has "
  var dataText = data.length + " models";
  var resultsText = results.length + " simulation results";

  var div = document.getElementById(id)

  if(document.documentElement.clientWidth <= 450)
  {
    div.innerHTML = "";

    var span = document.createElement("span");
    span.textContent = text;
    div.appendChild(span);

    div.appendChild(document.createElement("br"))

    var span = document.createElement("span");
    span.textContent = dataText + " and";
    div.appendChild(span);

    div.appendChild(document.createElement("br"))

    var span = document.createElement("span");
    span.textContent = resultsText;
    div.appendChild(span);
  }
  else if(document.documentElement.clientWidth <= 620)
  {
    div.innerHTML = "";

    var span = document.createElement("span");
    span.textContent = text;
    div.appendChild(span);

    div.appendChild(document.createElement("br"))

    var span = document.createElement("span");
    span.textContent = dataText + " and " + resultsText;
    div.appendChild(span);
  }
  else
  {
    div.textContent = text + dataText + " and " + resultsText;
  }

}

function filters()
{
  healthData = filterForHealth();
  ageData = filterForAge();
  anatomyData = filterForAnatomy();
  diseaseData = filterForDisease();
  simulationData = filterForSimulation();
  methodData = filterForMethod();
  arraysUndefined = false;
}

function healthChart()
{
  // chart for health
  var id = "health"
  var width = document.getElementById(id).offsetWidth;

  var title = "Number of Healthy and Diseased Models";
  var downloadfilename = "VMR_Healthy_And_Diseased"
  var x = healthData[0];
  var longLabel = healthData[0];
  var y = healthData[1];

  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

function filterForHealth()
{
  var healthy = 0;
  var diseased = 0;

  for(var i = 0; i < data.length; i++)
  {
    if(data[i]["Disease"] == "Healthy")
    {
      healthy++;
    }
    else
    {
      diseased++;
    }
  }

  return [["Healthy", "Diseased"], [healthy, diseased]];
}

function ageChart()
{
  // chart for age
  var id = "age"
  var width = document.getElementById(id).offsetWidth;

  var title = "Distribution of Age in Years for Human Models";
  var downloadfilename = "VMR_Human_Age_Distribution"

  var modedata = ageData;

  generateBoxPlot(title, downloadfilename, modedata, id, width);
}

function filterForAge()
{
  var humanModeData = new Array(data.length);

  for(var i = 0 ; i < data.length; i++)
  {
    if(data[i]["Species"] == "Human")
    {
      humanModeData.push(data[i]["Age"]);
    }
  }

  return humanModeData;
}

function anatomyChart()
{
  // chart for anatomy
  var id = "anatomy"
  var width = document.getElementById(id).offsetWidth;
  var abbs = setAbbreviations("Anatomy");

  var title = "Number of Models per Type of Anatomy";
  var downloadfilename = "VMR_Models_Per_Anatomy"

  var x = abbreviate(anatomyData[0], abbs, width);
  var longLabel = anatomyData[0];
  var y = anatomyData[1];

  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

function filterForAnatomy() {
  var x = namesOfValuesPerKey("Anatomy");
  var titles = new Set();

  //adds Pulmonary Fontan and Glenn to Pulmonary for simplicity
  for(var t = 0; t < x.length; t++)
  {
    if(x[t].includes("Pulmonary"))
    {
      titles.add("Pulmonary");
    }
    else
    {
      titles.add(x[t]);
    }
  }

  x = Array.from(titles);

  var output = [];

  for(var t = 0; t < x.length; t++)
  {
      output[x[t]] = 0;
  }

  //adds Pulmonary Fontan and Glenn to Pulmonary for simplicity
  for(var i = 0 ; i < data.length; i++)
  {
    if(data[i]["Anatomy"].includes("Pulmonary"))
    {
      output["Pulmonary"] = output["Pulmonary"] + 1
    }
      output[data[i]["Anatomy"]] = output[data[i]["Anatomy"]] + 1;
  }

  var y = [];

  for(var t = 0; t < x.length; t++)
  {
      y.push(output[x[t]]);
  }

  return [x, y];
}

function diseaseChart()
{
  // chart for anatomy
  var id = "disease"
  var width = document.getElementById(id).offsetWidth;
  var abbs = setAbbreviations("Disease");

  var title = "Number of Models per Type of Disease";
  var downloadfilename = "VMR_Models_Per_Disease"

  
  var x = abbreviate(diseaseData[0], abbs, width, true);
  var longLabel = diseaseData[0];

  var y = diseaseData[1];

  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

function filterForDisease()
{
  var x = new Set();
  var allDisease = namesOfValuesPerKey("Disease");
  var children = getChildrenOfTree();

  for(var i = 0; i < parentArray.length; i++)
  {
    if(!children.includes(parentArray[i]))
    {
      x.add(parentArray[i])
    }
  }

  for(var i = 0; i < allDisease.length; i++)
  {
    if(!children.includes(allDisease[i]) && allDisease[i] != "Healthy")
    {
      x.add(allDisease[i])
    }
  }

  x = Array.from(x).sort();

  var output = [];

  for(var t = 0; t < x.length; t++)
  {
      output[x[t]] = 0;
  }

  //adds Pulmonary Fontan and Glenn to Pulmonary for simplicity
  for(var i = 0 ; i < data.length; i++)
  {
    if(children.includes(data[i]["Disease"]))
    {
      var parents = getParentsOfChild(data[i]["Disease"]);
      
      for (var p = 0; p < parents.length; p++)
      {
        if(!children.includes(parents[p]))
        {
          output[parents[p]]++;
        }
      }
      
    }
    else if(data[i]["Disease"] != "Healthy")
    {
      output[data[i]["Disease"]]++;
    }
  }

  var otherCategory = false;
  var keepX = [];

  // combine ones that are very small
  for(var t = 0; t < x.length; t++)
  {
    if(output[x[t]] <= 10)
    {
      //if first time, sets output["Other"] value
      if(!otherCategory)
      {
        output["Other"] = 0;
      }

      output["Other"] += output[x[t]];

      otherCategory = true;
    }
    else
    {
      keepX.push(x[t])
    }
  }
  
  x = keepX;

  if(otherCategory)
  {
    x.push("Other");
  }

  var y = [];

  for(var t = 0; t < x.length; t++)
  {
      y.push(output[x[t]]);
  }

  return [x, y]
  
}

function simulationChart()
{
  // chart for health
  var id = "simulation"
  var width = document.getElementById(id).offsetWidth;
  var abbs = [];
  abbs["With Results"] = "With";
  abbs["Without Results"] = "Without";

  var title = "Number of Models With and Without Simulation Results";
  var downloadfilename = "VMR_With_And_Without_Results"

  var x = abbreviate(simulationData[0], abbs, width);
  var longLabel = simulationData[0];
  var y = simulationData[1];

  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

function filterForSimulation(){
  var withResults = 0;
  var withoutResults = 0;

  for(var i = 0; i < data.length; i++)
  {
    if(data[i]["Results"] == "1")
    {
      withResults++;
    }
    else
    {
      withoutResults++;
    }
  }

  return [["With Results", "Without Results"], [withResults, withoutResults]];
}

function methodChart()
{
  // chart for anatomy
  var id = "method"
  var width = document.getElementById(id).offsetWidth;
  var abbs = setAbbreviations("Method");

  var title = "Number of Simulation Results per Simulation Method";
  var downloadfilename = "VMR_Results_Per_Method"

  var x = abbreviate(methodData[0], abbs, width);
  var longLabel = methodData[0];
  var y = methodData[1];

  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

function filterForMethod()
{
  var x = resultsNamesOfValuesPerKey("Simulation Method");

  var output = [];

  for(var t = 0; t < x.length; t++)
  {
      output[x[t]] = 0;
  }

  //adds Pulmonary Fontan and Glenn to Pulmonary for simplicity
  for(var i = 0 ; i < results.length; i++)
  {
    output[results[i]["Simulation Method"]] = output[results[i]["Simulation Method"]] + 1;
  }

  var y = [];

  for(var t = 0; t < x.length; t++)
  {
      y.push(output[x[t]]);
  }

  return [x, y];
}

function abbreviate(x, abbs, width, early = false) {
  //changes x-axis labels to abbreviations if the width is small
  var meetWidth = width <= 767
  if(early)
  {
    meetWidth = true;
  }
  if(meetWidth)
  {
    var shortenedX = [];

    for(var i = 0; i < x.length; i++)
    {
      if(typeof abbs[x[i]] != "undefined")
      {
        shortenedX[i] = abbs[x[i]]
      }
      else
      {
        shortenedX[i] = x[i]
      }
      
    }

    return shortenedX;
  }
  else
  {
    return x;
  }  
}

function generateBoxPlot(titletext, downloadfilename, modedata, id, width)
{
  var data = [
    {
      name: "",
      x: modedata,
      type: 'box',
      marker: {
        color: '#6195b8',
        line: {
          width: 1.5
        }
      },
      boxpoints: "all",
      hoverinfo: "x",
      orientation: "h",
      hoverlabel : {
        bgcolor: "#cee7f8",
        bordercolor: '#3a596e'
      }
    }
  ];
 
  generateChart(titletext, downloadfilename, data, id, width);
}

function generateBar(titletext, downloadfilename, xdata, longLabel, ydata, id, width) {
  var data = [
    {
      x: xdata,
      y: ydata,
      type: 'bar',
      marker: {
        color: '#6195b8',
        line: {
            width: 2.5
        }
      },
      hoverlabel : {
        bgcolor: "#cee7f8",
        bordercolor: '#3a596e'
      },
      textposition: "none",
      text: longLabel,
      hovertemplate:
            "<b> %{y:,.0f} </b>" +
            " %{text} <br>" +
            "<extra></extra>"
    }
  ];

  generateChart(titletext, downloadfilename, data, id, width);
}

function generateChart(titletext, downloadfilename, data, id, width)
{
  var output = responsiveForSizing(titletext, width);
  
  var titlesize = output[0];
  var bodysize = output[1];
  var titletext_post = output[2];

  var layout = {
    title: {
      text: titletext_post,
      font: {
        size: titlesize
      },
    },

    font: {
      // dark2
      color: "#3a596e",
      family: ["Poppins", "sans-serif"],
      size: bodysize
    },

    showlegend: false,

    modebar: {
      activecolor: "#6195b8"
    },

    margin: {
      pad: 15,
    }
  };

  var config = {
    toImageButtonOptions: {
      format: 'png', // one of png, svg, jpeg, webp
      filename: downloadfilename,
      height: 500,
      width: 700,
      scale: 8 // Multiply title/legend/axis/canvas sizes by this factor
    },

    // responsive: true,

    displayModeBar: true,

    modeBarButtonsToRemove: ['zoom2d', "pan2d", "lasso2d", "select2d", "resetScale2d"],

    displaylogo: false
  }
  
  Plotly.newPlot(id, data, layout, config);
}

function responsiveForSizing(title_pre, width)
{
  var titlesize;
  var bodysize;

  if(width <= 430)
  {
    var titlesize = 15;
    var bodysize = 10;
    var titletext = insertBreak(title_pre);
  }
  else if(width <= 550)
  {
    var titlesize = 17;
    var bodysize = 12;
    var titletext = insertBreak(title_pre);
  }
  else if(width <= 767)
  {
    var titlesize = 20;
    var bodysize = 17;
    var titletext = title_pre;
  }
  else
  {
    if(title_pre.length >= 47)
    {
      var titlesize = 23;
    }
    else
    {
      var titlesize = 25;
    }
    var bodysize = 17;
    var titletext = title_pre;
  }

  return [titlesize, bodysize, titletext]
}

function insertBreak(title){
  var array = title.split(" ");
  var spaceCount = array.length - 1;
  var half = parseInt(spaceCount/2 + 0.5);
  var title_post = "";

  for(var i = 0; i < array.length; i++)
  {
    title_post += array[i];
    if(i == half - 1)
    {
      title_post += "<br>";
    }
    else if(i != spaceCount)
    {
      title_post += " ";
    }
  }

  return title_post;
}