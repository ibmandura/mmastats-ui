
const implicitColors = [ "blue", "pink" ];

const colorInfo = {
  blue: {
    borderColor: "#6086BD",
    pointBorderColor: '#6086BD',
    pointBackgroundColor: '#6086BD',
    pointHoverBorderColor: '#6086BD',
    pointHoverBackgroundColor: '#6086BD',
  },

  pink: {
    borderColor: "#F542E3",
    pointBorderColor: '#F542E3',
    pointBackgroundColor: '#F542E3',
    pointHoverBorderColor: '#F542E3',
    pointHoverBackgroundColor: '#F542E3',
  }
}

function getColorInfo(index) {
  const color = implicitColors[index] || "blue";
  return colorInfo[color];
}

function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getGradientFill(ctx, index) {
  const colorInfo = getColorInfo(index);
  const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
  const rgb = hexToRgb(colorInfo.borderColor);
  gradientFill.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`)
  gradientFill.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`)
  return gradientFill;
}

function plot(canvasElementId, datasets) {
  const canvas = document.getElementById(canvasElementId);
  const ctx = canvas.getContext("2d");

  const graph_data = datasets.map(function(fighter_data, index) {
    const colorInfo = getColorInfo(index);
    return {
      label: fighter_data.name,
      data: fighter_data.fights,
      lineTension: 0.1,
      borderColor: colorInfo.borderColor,
      fill: true,
      backgroundColor: getGradientFill(ctx, index),
      pointBorderColor: colorInfo.pointBorderColor,
      pointBackgroundColor: colorInfo.pointBackgroundColor,
      pointHoverBorderColor: colorInfo.pointHoverBorderColor,
      pointHoverBackgroundColor: colorInfo.pointHoverBackgroundColor,
      // pointHitRadius: 10,
    };
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: graph_data,
    },
    options: {
      legend: { display: datasets.length > 1, },
      scales: {
        xAxes: [{
            ticks: { fontColor: '#979EA7' },
            type: 'time',
            time: {
              unit: 'year',
              tooltipFormat:'MMM DD, YYYY',
            },
        }],
        yAxes: [{
          ticks: { fontColor: '#979EA7' },
        }]
      },
      tooltips: {
        enabled: false,
        mode: 'nearest',
        position: 'nearest',
        custom: function(tooltip) {
          // Tooltip Element
          let tooltipEl = document.getElementById('chartjs-tooltip');
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            this._chart.canvas.parentNode.appendChild(tooltipEl);
          }

          // Hide if no tooltip
          if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = 0;
            tooltipEl.style.visibility = 'hidden';
            return;
          }

          // Set caret Position
          tooltipEl.classList.remove('above', 'below', 'no-transform');
          if (tooltip.yAlign) {
            tooltipEl.classList.add(tooltip.yAlign);
          } else {
            tooltipEl.classList.add('no-transform');
          }

          // Set Text
          if (tooltip.body) {
            let innerHtml = '<div class="chartjs-tooltip-layout">'
            innerHtml += '<div class="arrow-up"></div>';

            const bodyLines = tooltip.dataPoints.map(function(bodyItem) { return bodyItem.value; });
            bodyLines.forEach(function(body) { innerHtml += '<div class="chartjs-tooltip-layout-body">' + body + '</div>'; });

            const date = tooltip.title || [];
            date.forEach(function(title) {
              innerHtml += '<div class="chartjs-tooltip-layout-date">' + title + '</div>';
            });

            const datasetIndex = tooltip.dataPoints[0].datasetIndex;
            const vs = datasets[datasetIndex].opponentNames[tooltip.dataPoints[0].index];
            innerHtml += '<div class="chartjs-tooltip-layout-vs">vs ' + vs + '</div>';
            innerHtml += '</div>';

            tooltipEl.innerHTML = innerHtml;
          }

          const positionY = this._chart.canvas.offsetTop;
          const positionX = this._chart.canvas.offsetLeft;

          // Display, position, and set styles for font
          tooltipEl.style.opacity = 1;
          tooltipEl.style.visibility = 'visible';
          tooltipEl.style.left = positionX + tooltip.caretX + 'px';
          tooltipEl.style.top = positionY + tooltip.caretY + 14 + 'px';
          tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
          tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
          tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
          tooltipEl.style.padding = '10px';
        }
      }
    }
  });
}
