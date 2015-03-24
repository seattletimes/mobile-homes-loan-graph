//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");

var { generateCurves, morphCurves, graphCurves } = require("./curves");
var finance = require("./finance");

//faux two-way binding
var params = {};

var bindParams = function(e) {
  if (e.keyCode == 13) {
    return graphFromParams();
  }
  var prop = e.target.name;
  var val = e.target.tagName == "INPUT" ? e.target.value * 1 : e.target.value;
  params[prop] = val;
};

var bindings = {};

[].slice.call(document.querySelectorAll(".params [name]")).forEach(function(element) {
  var value = element.tagName == "INPUT" ? element.value * 1 : element.value;
  params[element.name] = value;
  bindings[element.name] = element;
});

var updateParams = function() {
  for (var key in bindings) {
    if (typeof params[key] == "undefined") continue;
    bindings[key].value = params[key];
  }
};

var graphFromParams = function() {
  var valuation = params.delta == "stable" ? finance.stableValuation : finance.mobileValuation;
  var dest = generateCurves({
    amount: params.price + params.other,
    interest: params.interest,
    down: params.down,
    valuation: valuation(params.price),
    term: params.term
  });
  animate(dest);
};

var form = document.querySelector(".params");
form.addEventListener("keyup", bindParams);
form.addEventListener("change", bindParams);
form.querySelector(".regenerate").addEventListener("click", graphFromParams);

//animation properties
var blend = 0;
var start = generateCurves({
  amount: 1, 
  interest: 1, 
  down: 0, 
  valuation: finance.stableValuation(0),
  term: 24
});
var finish = generateCurves({
  amount: 100882.54, 
  interest: 12.5, 
  down: 4.9, 
  valuation: finance.mobileValuation(96005.56),
  term: 24
});
var current = null;
var raf;

var setParamsFromCurve = function(curve) {
  for (var key in curve) {
    if (bindings[key]) {
      params[key] = (curve[key].toFixed(2) * 1).toLocaleString();
    }
  }
  var years = Math.floor(curve.intersect / 12);
  var months = Math.floor(curve.intersect % 12);
  params.debtFree = `${years} years, ${months} month(s)`;
  updateParams();
};

var frame = function() {
  blend += .01;
  if (blend > 1) blend = 1;
  current = morphCurves(start, finish, blend);
  graphCurves(current);
  setParamsFromCurve(current);
  if (blend == 1) return;
  raf = requestAnimationFrame(frame);
};

var animate = function(dest) {
  if (raf) cancelAnimationFrame(raf);
  blend = 0;
  if (current) start = current;
  finish = dest || finish;
  frame();
};

updateParams();
graphCurves(start);
animate();