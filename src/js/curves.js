var finance = require("./finance");

var canvas = document.querySelector("canvas.graph");
var context = canvas.getContext("2d");

var generateCurves = function(amount, interest, down, valuation) {
  down = down * amount / 100;
  var schedule = finance.schedule(amount, interest, 24);
  var max = schedule[schedule.length - 1].paid + down;
  var curves = {
    max,
    paid: [],
    remaining: [],
    value: [],
    intersect: null,
    length: schedule.length
  };
  var scaleY = val => canvas.height - (val / max * canvas.height);
  schedule.forEach(function(data, i) {
    curves.paid.push(scaleY(data.paid + down));
    curves.remaining.push(scaleY(data.remaining));
    var value = valuation(i);
    curves.value.push(scaleY(value));
    if (data.remaining <= value && !curves.intersect) {
      curves.intersect = i;
    }
  });
  return curves;
};

var lineDefs = [
  { prop: "paid", color: "blue" },
  { prop: "remaining", color: "red" },
  { prop: "value", color: "green" }
]

var graphCurves = function(curves) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  lineDefs.forEach(function(def) {
    context.beginPath();
    var curve = curves[def.prop];
    context.moveTo(0, curve[0]);
    for (var i = 0; i < curve.length; i++) {
      var x = i / curve.length * canvas.width;
      var y = curve[i];
      context.lineTo(x, y);
    }
    context.strokeStyle = def.color;
    context.stroke();
  });
  context.beginPath();
  var ix = curves.intersect / curves.length * canvas.width;
  context.fillStyle = "rgba(255, 180, 128, .2)";
  context.fillRect(0, 0, ix, canvas.height);
}

var morphCurves = function(src, dest, blend) {
  var morphed = {};
  for (var key in src) {
    if (!key in dest) continue;
    var from = src[key];
    var to = dest[key];
    if (from instanceof Array) {
      var list = morphed[key] = [];
      for (var i = 0; i < from.length; i++) {
        var srcItem = from[i];
        var destItem = to[i];
        list[i] = srcItem + (destItem - srcItem) * blend;
      }
    } else if (typeof from == "number") {
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