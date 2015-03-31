var finance = require("./finance");

var canvas = document.querySelector("canvas.graph");
var context = canvas.getContext("2d");

var lineDefs = [
  { prop: "remaining", color: "rgb(123, 90, 166)" },
  { prop: "value", color: "rgb(7, 119, 179)" }
];
var shadeColor = "rgba(213, 228, 240, .5)";

var generateCurves = function(definition) {
  var { amount, down, interest, valuation, term } = definition;
  down = down * amount / 100;
  var schedule = finance.schedule(amount - down, interest, term);
  var last = schedule[schedule.length - 1];
  var max = amount * 1.1;
  var curves = {
    max,
    paidTotal: last.paid + down,
    paid: [],
    remaining: [],
    value: [],
    finalValue: valuation(schedule.length - 1),
    intersect: null,
    length: schedule.length
  };
  var scaleY = val => 1 - val / max;
  schedule.forEach(function(data, i) {
    curves.paid.push(scaleY(data.paid + down));
    curves.remaining.push(scaleY(data.remaining));
    var value = valuation(i);
    curves.value.push(scaleY(value));
  });
  for (var i = schedule.length - 1; i >= 0; i--) {
    var data = schedule[i];
    if (valuation(i) < data.remaining) {
      curves.intersect = i;
      break;
    }
  }
  return curves;
};

var graphCurves = function(curves) {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetWidth / 3;
  //draw shaded region
  context.beginPath();
  var ix = curves.intersect / curves.length * canvas.width;
  context.fillStyle = shadeColor;
  context.fillRect(0, 0, ix, canvas.height);
  //draw year axes
  context.lineWidth = 1;
  context.strokeStyle = "#888";
  context.font = "16px sans-serif";
  context.fillStyle = "black";
  for (var i = 0; i < curves.length - 1; i += 12) {
    context.beginPath();
    var x = Math.round(i / curves.length * canvas.width);
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
    if (i % (5 * 12) == 0) {
      context.fillText(i / 12, x + 3, canvas.height - 5);
    }
  }
  //draw curves
  context.lineWidth = 2;
  lineDefs.forEach(function(def) {
    context.beginPath();
    var curve = curves[def.prop];
    context.moveTo(0, curve[0] * canvas.height);
    for (var i = 0; i < curves.length; i++) {
      var x = i / curves.length * canvas.width;
      var y = curve[i] * canvas.height;
      context.lineTo(x, y);
    }
    context.strokeStyle = def.color;
    context.stroke();
  });
};

var morphCurves = function(src, dest, blend) {
  var morphed = {};
  //tween between two curve objects
  for (var key in src) {
    if (!key in dest) continue;
    var from = src[key];
    var to = dest[key];
    //if it's an array, recurse through
    if (from instanceof Array) {
      var list = morphed[key] = [];
      for (var i = 0; i < to.length; i++) {
        var destItem = to[i];
        var srcItem = from[i] || destItem;
        list[i] = srcItem + (destItem - srcItem) * blend;
      }
    } else if (typeof from == "number") {
      //otherwise, blend directly
      morphed[key] = from + (to - from) * blend;
    }
  }
  return morphed;
};

module.exports = {
  morphCurves,
  generateCurves,
  graphCurves
};