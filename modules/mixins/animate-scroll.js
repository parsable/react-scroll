/*eslint-disable */

var smooth = require('./smooth');

var easing = smooth.defaultEasing;

var cancelEvents = require('./cancel-events');

/*
 * Sets the cancel trigger
 */

cancelEvents.register(function() {
  __cancel = true;
});

/*
 * Wraps window properties to allow server side rendering
 */
var currentWindowProperties = function() {
  if (typeof window !== 'undefined') {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  }
};

/*
 * Helper function to never extend 60fps on the webpage.
 */
var requestAnimationFrame = (function () {
  return  currentWindowProperties() ||
          function (callback, element, delay) {
              window.setTimeout(callback, delay || (1000/60));
          };
})();


var __currentPositionY  = 0;
var __startPositionY    = 0;
var __targetPositionY   = 0;
var __progress          = 0;
var __duration          = 0;
var __cancel            = false;

//added for div element /container
var __parent            = false;
var __relativePosition  = false;


var __start;
var __deltaTop;
var __percent;
var __targetOffset;

var currentPositionY = function() {
  var supportPageOffset = window.pageXOffset !== undefined;
  var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
  return supportPageOffset ? window.pageYOffset : isCSS1Compat ?
         document.documentElement.scrollTop : document.body.scrollTop;
};

var animateTopScroll = function(timestamp) {
  // Cancel on specific events
  if(__cancel) { return; }

  if (__start === null) {
      __start = timestamp;
  }

  __progress = timestamp - __start;
  __percent = (__progress >= __duration ? 1 : easing(__progress/__duration));
  __deltaTop = __targetPositionY - __startPositionY - __targetOffset;
  __currentPositionY =
    Math.ceil((__deltaTop * __percent) +  __startPositionY);
  __parent.scrollTop = __currentPositionY;

  if (__percent < 1){
    requestAnimationFrame(animateTopScroll);
  }


};

var startAnimateTopScroll = function(y, options, parent, relativePosition, currentPosition, offSetFromTop) {

  __start           = null;
  __cancel          = false;
  __startPositionY  = currentPosition;
  __currentPositionY  = __startPositionY;
  __targetPositionY = relativePosition;
  __duration        = options.duration || 1000;
  __targetOffset    = y;


  if (parent){
    __parent = parent;
    __relativePosition = relativePosition;
  }

  requestAnimationFrame(animateTopScroll);
};

module.exports = {
  animateTopScroll: startAnimateTopScroll
};