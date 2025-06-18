document.body.style.height = '100vh';
document.body.style.margin = '0';
document.body.style.display = 'flex';
document.body.style.flexDirection = 'column';
document.body.style.alignItems = 'center';
document.body.style.justifyContent = 'center';
document.body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)';

//Container for controls and canvas
const container = document.createElement('div');
container.style.display = 'flex';
container.style.flexDirection = 'column';
container.style.alignItems = 'center';

//Controls row
const controls = document.createElement('div');
controls.style.display = 'flex';
controls.style.alignItems = 'center';
controls.style.marginBottom = '24px';

//Grid size
const gridLabel = document.createElement('label');
gridLabel.textContent = 'Grid Size (l*b): ';
gridLabel.style.fontFamily = 'consolas';
gridLabel.style.fontSize = '1.1rem';
gridLabel.style.marginRight = '8px';

const gridInput = document.createElement('input');
gridInput.type = 'text';
gridInput.style.width = '60px';
gridInput.style.marginRight = '18px';
gridInput.style.fontFamily = 'consolas';
gridInput.style.fontSize = '1.1rem';
gridInput.style.textAlign = 'center';
gridInput.style.border = '1px solid #ccc';
gridInput.style.borderRadius = '5px';
gridInput.style.padding = '2px 6px';

//Line width
const lineLabel = document.createElement('label');
lineLabel.textContent = 'Line Width (mm): ';
lineLabel.style.fontFamily = 'consolas';
lineLabel.style.fontSize = '1.1rem';
lineLabel.style.marginRight = '8px';

const lineInput = document.createElement('input');
lineInput.type = 'number';
lineInput.min = '0.00';
lineInput.step = '0.01';
lineInput.style.width = '50px';
lineInput.style.marginRight = '18px';
lineInput.style.fontFamily = 'consolas';
lineInput.style.fontSize = '1.1rem';
lineInput.style.textAlign = 'center';
lineInput.style.border = '1px solid #ccc';
lineInput.style.borderRadius = '5px';
lineInput.style.padding = '2px 6px';

//Color picker
const colorLabel = document.createElement('label');
colorLabel.textContent = 'Pick Color: ';
colorLabel.style.fontFamily = 'consolas';
colorLabel.style.fontSize = '1.1rem';
colorLabel.style.marginRight = '8px';

const colorPicker = document.createElement('input');
colorPicker.type = 'color';
colorPicker.value = '#ff0000';
colorPicker.style.width = '40px';
colorPicker.style.height = '32px';
colorPicker.style.border = '2px solid #ddd';
colorPicker.style.borderRadius = '6px';
colorPicker.style.marginLeft = '8px';
colorPicker.style.cursor = 'pointer';
colorPicker.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';

const hexDisplay = document.createElement('span');
hexDisplay.textContent = colorPicker.value.toUpperCase();
hexDisplay.style.marginLeft = '12px';
hexDisplay.style.fontFamily = 'consolas';
hexDisplay.style.fontSize = '1.1rem';
hexDisplay.style.padding = '2px 8px';
hexDisplay.style.background = '#f3f3f3';
hexDisplay.style.borderRadius = '5px';
hexDisplay.style.border = '1px solid #ddd';

//Assemble controls
controls.appendChild(gridLabel);
controls.appendChild(gridInput);
controls.appendChild(lineLabel);
controls.appendChild(lineInput);
controls.appendChild(colorLabel);
controls.appendChild(colorPicker);
controls.appendChild(hexDisplay);

//Canvas
const canvas = document.createElement('canvas');
canvas.width = 1100;
canvas.height = 650;
canvas.style.display = 'block';
canvas.style.background = '#f9fafb';
canvas.style.border = 'none';
canvas.style.borderRadius = '12px';
canvas.style.boxShadow = '0 4px 24px rgba(60,60,90,0.08)';

//DOM
container.appendChild(controls);
container.appendChild(canvas);
document.body.innerHTML = '';
document.body.appendChild(container);

//Triangle Grid Logic
const ctx = canvas.getContext('2d');
const side = 37.8; // 10mm in px
const h = side * Math.sqrt(3) / 2;
let rows = 7;
let cols = 10;
let lineWidthPx = 3.78; // 1mm in px
let triangles = [];

function parseGridInput() {
  const match = gridInput.value.match(/^(\d+)\s*\*\s*(\d+)$/);
  if (match) {
    rows = parseInt(match[1], 10);
    cols = parseInt(match[2], 10);
  }
}

function parseLineWidth() {
  let mm = parseFloat(lineInput.value);
  if (isNaN(mm) || mm <= 0) mm = 1;
  lineWidthPx = mm * 3.78;
}

function drawGrid() {
  triangles = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = lineWidthPx;

  //Centering grid horizontally in canvas
  const gridWidth = side + (cols - 1) * (side / 2);
  const xOffset = (canvas.width - gridWidth) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let x = xOffset + col * side / 2;
      let y = row * h;
      if ((row + col) % 2 === 0) {
        let verts = [
          [x, y + h],
          [x + side / 2, y],
          [x + side, y + h]
        ];
        triangles.push({ verts, color: null });
      } else {
        let verts = [
          [x, y],
          [x + side, y],
          [x + side / 2, y + h]
        ];
        triangles.push({ verts, color: null });
      }
    }
  }
  redrawTriangles();
}

function drawTriangle(verts, fill) {
  ctx.beginPath();
  ctx.moveTo(verts[0][0], verts[0][1]);
  ctx.lineTo(verts[1][0], verts[1][1]);
  ctx.lineTo(verts[2][0], verts[2][1]);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  ctx.strokeStyle = '#333';
  ctx.lineWidth = lineWidthPx;
  ctx.stroke();
}

function redrawTriangles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let t of triangles) {
    drawTriangle(t.verts, t.color);
  }
}

function pointInTriangle(px, py, verts) {
  function sign(p1, p2, p3) {
    return (p1[0] - p3[0]) * (p2[1] - p3[1]) -
           (p2[0] - p3[0]) * (p1[1] - p3[1]);
  }
  let b1 = sign([px, py], verts[0], verts[1]) < 0.0;
  let b2 = sign([px, py], verts[1], verts[2]) < 0.0;
  let b3 = sign([px, py], verts[2], verts[0]) < 0.0;
  return ((b1 === b2) && (b2 === b3));
}

canvas.addEventListener('click', function(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let i = triangles.length - 1; i >= 0; i--) {
    if (pointInTriangle(x, y, triangles[i].verts)) {
      triangles[i].color = colorPicker.value;
      redrawTriangles();
      break;
    }
  }
});

//Update hex code(dynamically)
colorPicker.addEventListener('input', function() {
  hexDisplay.textContent = colorPicker.value.toUpperCase();
});

//Redraw grid(dynamically)
gridInput.addEventListener('input', function() {
  parseGridInput();
  drawGrid();
});
lineInput.addEventListener('input', function() {
  parseLineWidth();
  drawGrid();
});

//Initial parse and draw
parseGridInput();
parseLineWidth();
drawGrid();