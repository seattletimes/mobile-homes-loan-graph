//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");

var { generateCurves, morphCurves, graphCurves } = require("./curves");
var finance = require("./finance");
var params = require("./bindings");
var presets = require("./presets");
var transform = require("./transform");

// params.on("change", console.log.bind(console));

var finalPrice = document.querySelector(".final-value.output");
var totalPaid = document.querySelector(".total-paid.output");
var breakEven = document.querySelector(".break-even.balloon");
var breakEvenContents = breakEven.querySelector(".contents");
var canvas = document.querySelector("canvas.graph");

var dollars = function(n) {
  if (typeof n == "string") n *= 1;
  n = (n.toFixed(2) * 1).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  return "$" + n;
}

var graph = function(params) {
  var valuation = params.delta == "stable" ? finance.stableValuation : finance.mobileValuation;
  var payment = params.price + params.other;
  var dest = generateCurves({
    amount: params.price + params.other,
    interest: params.interest,
    down: params.down,
    valuation: valuation(params.price),
    term: params.term
  });

  if (dest.intersect) {
    breakEven.classList.remove("hidden");
    var ix = dest.intersect / dest.length * canvas.offsetWidth;
    var iy = dest.value[dest.intersect] * (canvas.offsetHeight / canvas.height);
    transform.setXY(breakEven, ix, iy);
    if (ix < canvas.offsetWidth / 4) {
      breakEven.classList.add("left");
    } else {
      breakEven.classList.remove("left");
    }
    if (ix > canvas.offsetWidth * .75) {
      breakEven.classList.add("right");
    } else {
      breakEven.classList.remove("right");
    }
  } else {
    breakEven.classList.add("hidden");
  }

  //update text readouts
  var years = Math.floor(dest.intersect / 12);
  var yearText = years == 1 ? "year" : "years";
  var months = dest.intersect % 12;
  var monthText = months == 1 ? "month" : "months";
  var duration = `Break-even:<br>${years} ${yearText}, ${months} ${monthText}`;
  var priceComparison = (dest.finalValue / params.price * 100).toFixed(1);
  var paidComparison = (dest.paidTotal / payment * 100).toFixed(1);
  breakEvenContents.innerHTML = duration;
  finalPrice.innerHTML = `${dollars(dest.finalValue)} (${priceComparison}% original value)`;
  totalPaid.innerHTML = `${dollars(dest.paidTotal)} (${paidComparison}% principal)`;
  animate(dest);
};

//animation properties
var blend = 0;
var start = generateCurves({
  amount: 1, 
  interest: 1, 
  down: 0, 
  valuation: finance.stableValuation(0),
  term: 24
});
var finish = null;
var current = null;
var raf;
var lastFrame = null;
var duration = 400;

var frame = function() {
  var now = Date.now();
  var elapsed = now - lastFrame;
  var blend = elapsed / duration;
  if (blend > 1) blend = 1;
  current = morphCurves(start, finish, blend);
  graphCurves(current);
  if (blend == 1) return;
  raf = requestAnimationFrame(frame);
};

var animate = function(dest) {
  if (raf) cancelAnimationFrame(raf);
  blend = 0;
  if (current) start = current;
  finish = dest || finish;
  lastFrame = Date.now();
  frame();
};

var onResize = function(curve) {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  graphCurves(curve || current);
};
onResize(start);

params.on("change", function() {
  graph(params);
});

window.addEventListener("resize", onResize);

//start on the first preset
params.emit("change", "preset", document.querySelector(`[name="preset"]:checked`).value);