var finance = require("./finance");

var canvas = document.querySelector("canvas.graph");
var context = canvas.getContext("2d");

var lineDefs = [
  // { prop: "paid", color: "blue" },
  { prop: "remaining", color: "red" },
  { prop: "value", color: "green" }
];
var shadeColor = "#EEF";

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
  var scaleY = val => canvas.height - (val / max * canvas.height);
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
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  var ix = curves.intersect / curves.length * canvas.width;
  context.fillStyle = shadeColor;
  context.fillRect(0, 0, ix, canvas.height);
  lineDefs.forEach(function(def) {
    context.beginPath();
    var curve = curves[def.prop];
    context.moveTo(0, curve[0]);
    for (var i = 0; i < curves.length; i++) {
      var x = i / curves.length * canvas.width;
      var y = curve[i];
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