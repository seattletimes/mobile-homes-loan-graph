//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");

var { generateCurves, morphCurves, graphCurves } = require("./curves");
var finance = require("./finance");
var params = require("./bindings");
var presets = require("./presets");

// params.on("change", console.log.bind(console));

var breakEven = document.querySelector(`[name="break-even"]`);
var finalPrice = document.querySelector(`[name="final-value"]`);
var totalPaid = document.querySelector(`[name="total-paid"]`);

var dollars = function(n) {
  if (typeof n == "string") n *= 1;
  n = (n.toFixed(2) * 1).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  return "$" + n;
}

var graph = function(params) {
  var valuation = params.delta == "stable" ? finance.stableValuation : finance.mobileValuation;
  var dest = generateCurves({
    amount: params.price + params.other,
    interest: params.interest,
    down: params.down,
    valuation: valuation(params.price),
    term: params.term
  });
  var years = Math.floor(dest.intersect / 12);
  var yearText = years == 1 ? "year" : "years";
  var months = dest.intersect % 12;
  var monthText = months == 1 ? "month" : "months";
  breakEven.value = `${years} ${yearText}, ${months} ${monthText}`;
  finalPrice.value = dollars(dest.finalValue);
  totalPaid.value = dollars(dest.paidTotal);
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

graphCurves(start);

params.on("change", function() {
  graph(params);
});

//start on the first preset
params.emit("change", "preset", document.querySelector(`[name="preset"]:checked`).value);