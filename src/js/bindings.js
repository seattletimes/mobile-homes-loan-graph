var qsa = require("./qsa");
var EventEmitter = require("events").EventEmitter;

var presets = require("./presets");

//force Firefox to use the default checkboxes
var defaults = qsa("[checked]");
defaults.forEach(function(element) { element.checked = true });

var bindings = {};
var params = new EventEmitter();

var autocast = function(value) {
  if (typeof value == "string") {
    if (value == "") return 0;
    if (value.match(/^[-\d,.]+$/)) {
      return parseFloat(value.replace(/,/g, ""));
    }
  }
  return value;
};

var onKeyUp = function(e) {
  var value = autocast(e.target.value);
  params[e.target.name] = value;
  params.emit("change", e.target.name, value);
};

//initialize bindings
qsa("input[type=text][name], input[type=radio]:checked").forEach(function(element) {
  bindings[element.name] = element;
  //only works for inputs, technically
  element.addEventListener("keyup", onKeyUp);
  params[element.name] = autocast(element.value);
});

//bind to radio buttons (special case)
document.body.addEventListener("change", function(e) {
  var name = e.target.name;
  var value = autocast(e.target.value);
  params[name] = value;
  params.emit("change", name, value);
});

//handle presets
params.on("change", function(prop, value) {
  if (prop == "preset") {
    var preset = presets[value];
    for (var key in preset) {
      var value = preset[key];
      if (bindings[key]) bindings[key].value = value;
      params[key] = value;
    }
    var termButton = document.querySelector(`input[name="term"][value="${preset.term}"]`);
    termButton.checked = true;
    params.delta = preset.depreciates ? "mobile" : "stable";
  }
});

module.exports = params;