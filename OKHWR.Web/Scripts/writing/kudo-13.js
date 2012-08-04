/* Copyright (C) Taku Kudo <taku@chasen.org>, Ben Bullock
Licensed under the GNU General Public Licence.
*/
function write_canvas_advert() {
  var canvas_advert = getbyid("canvas-advert");
  canvas_advert.style.display = "block";
}

function DrawCanvas() {
  //var canvas = getbyid("drawkanji-canvas");
  var canvas = $('#drawkhmer-char-canvas')[0];
  this.size = canvas.offsetWidth;
  this.element = canvas;
  var self = this;
}
DrawCanvas.prototype.clear = function () {
  clear(this.element);
}
DrawCanvas.prototype._draw_dot = function (x, y) {
  var dot = document.createElement("span");
  dot.style.left = x + this.offset_left + "px";
  dot.style.top = y + this.offset_top + "px";
  dot.className = "drawkhmer-dot";
  this.element.appendChild(dot);
}
DrawCanvas.prototype.start_line = function (x, y) {
  this.x = x;
  this.y = y;
}
DrawCanvas.prototype.draw_line = function (x, y) {
  if (this.x == x && this.y == y) return;
  var x_move = x - this.x;
  var y_move = y - this.y;
  var x_diff = x_move < 0 ? 1 : -1;
  var y_diff = y_move < 0 ? 1 : -1;
  if (Math.abs(x_move) >= Math.abs(y_move)) {
    for (var i = x_move; i != 0; i += x_diff) {
      this._draw_dot(x - i, y - Math.round(y_move * i / x_move));
    }
  } else {
    for (var i = y_move; i != 0; i += y_diff) {
      this._draw_dot(x - Math.round(x_move * i / y_move), y - i);
    }
  }
  this.x = x;
  this.y = y;
}
DrawCanvas.prototype.draw_text = function (x, y, text) {
  var text_node = document.createTextNode(text);
  var dot = document.createElement("span");
  dot.appendChild(text_node);
  dot.style.left = x + this.offset_left + "px";
  dot.style.top = y + this.offset_top + "px";
  dot.className = "drawkhmer-stroke-number";
  this.element.appendChild(dot);
}