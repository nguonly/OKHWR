

function value_from_bool(b) {
  if (b) {
    return "1";
  } else {
    return "0";
  }F
}

function get_position(evt) {
  evt = (evt) ? evt : ((event) ? event : null);
  var left = 0;
  var top = 0;
  if (evt.pageX) {
    left = evt.pageX;
    top = evt.pageY;
  } else if (typeof (document.documentElement.scrollLeft) != undefined) {
    left = evt.clientX + document.documentElement.scrollLeft;
    top = evt.clientY + document.documentElement.scrollTop;
  } else {
    left = evt.clientX + document.body.scrollLeft;
    top = evt.clientY + document.body.scrollTop;
  }
  return {
    x: left,
    y: top
  };
}

var drawkhmer;

function drawkhmer_onload() {
  drawkhmer = new DrawKhmer();
}

function DrawKhmer() {
  this.canvas = new DrawCanvas();
  this.found_khmer_char = getbyid("found-khmer-char");
  //this.found_kanji = $('#found_kanji');
  this.adjust_canvas_offsets();
  var self = this;
  this.canvas.element.onmouseup = function (event) {
    self.mouseup(event);
  }
  this.canvas.element.onmousedown = function (event) {
    self.mousedown(event);
  }
  this.canvas.element.onmousemove = function (event) {
    self.mousemove(event);
  }
  var clear_button = getbyid("drawkhmer-clear-button");
  //var clear_button = $('#drawkanji-clear-button');
  clear_button.onclick = function (event) {
    self.clearAll();
  }
  var back_button = getbyid("drawkhmer-back-line-button");
  //var back_button = $('#drawkanji-back-line-button');
  back_button.onclick = function (event) {
    self.backLine();
  }

  window.onresize = function () {
    self.adjust_canvas_offsets();
  }

  var show_numbers = getbyid("show-numbers");
  //var show_numbers = $('#show-numbers');
  this.show_numbers = show_numbers.checked;
  show_numbers.onclick = function (event) {
    self.toggle_show_numbers();
  }

  this.colours = new Array();
  this.clearDrawing();

}

DrawKhmer.prototype.clearDrawing = function () {
  this.clear();
  clear(this.found_khmer_char);
  this.reply = undefined;
}
DrawKhmer.prototype.clearAll = function () {
  this.clearDrawing();
}
DrawKhmer.prototype.backLine = function () {
  if (this.stroke_num > 0) {
    this.sequence.pop();
    this.stroke_num--;
  }
  if (this.stroke_num > 0) {
    this.canvas.clear();
    this.drawAll();
    this.sendStroke();
  } else {
    this.clearAll();
  }
}
DrawKhmer.prototype.clear = function () {
  this.active = false;
  this.sequence = [];
  this.point_num = 0;
  this.stroke_num = 0;
  this.prev_x = -1;
  this.prev_y = -1;
  this.resultNum = 0;
  this.resultChar = "";
  this.exampleId = 0;
  this.canvas.clear();
}
DrawKhmer.prototype.sendStroke = function () {
  if (this.stroke_num == 0) {
    return;
  }

  var r = this.makeMessage();
  var self = this;

  var t = JSON.stringify(r);
  $.ajax({
    type: 'POST',
    url: 'Recognition/Recognize',
    data: t,
    success: function (data) {
      //console.log(data);
      var result = "<table>";
      result += "<tr><th>Character</th><th>Confidence Level</th></tr>";
      $.each(data, function (index, value) {
        result += "<tr><td>" + data[index].ShapeCharacter + "</td><td> " + data[index].ConfidenceLevel + "</td></tr>";
      });
      result += "</table>";
      $('#found-khmer-char').html(result);
    },
    dataType: 'json',
    contentType: 'application/json; charset=utf-8'
  });

}
DrawKhmer.prototype.mouseup = function (event) {
  if (this.active) {
    this.active = false;
    this.trace(event);
    if (this.sequence[this.stroke_num].length > 1) {
      this.finishStroke();
      this.sendStroke();
    } else {
      this.sequence[this.stroke_num].length = 0;
      this.reset_brush();
    }
  }
}
DrawKhmer.prototype.mousemove = function (event) {
  this.trace(event);
}
DrawKhmer.prototype.mousedown = function (event) {
  this.active = true;
  this.trace(event);
  if (event.preventDefault) event.preventDefault();
  else event.returnValue = false;
  return false;
}
DrawKhmer.prototype.reset_brush = function () {
  this.active = false;
  this.point_num = 0;
  this.prev_x = -1;
  this.prev_y = -1;
}
DrawKhmer.prototype.finishStroke = function () {
  this.annotate(this.stroke_num);
  this.stroke_num++;
  this.reset_brush();
}
DrawKhmer.prototype.drawAll = function () {
  var stroke;
  var point_num;
  for (stroke = 0; stroke < this.stroke_num; stroke++) {
    this.canvas.start_line(this.sequence[stroke][0].x, this.sequence[stroke][0].y, this.colours[stroke]);
    this.annotate(stroke);
    for (point_num = 0; point_num < this.sequence[stroke].length - 1; point_num++) {
      this.canvas.draw_line(this.sequence[stroke][point_num + 1].x, this.sequence[stroke][point_num + 1].y);
    }
  }
}
DrawKhmer.prototype.annotate = function (stroke) {
  if (!this.show_numbers) return;
  var offsetlength = 15;
  var x;
  var y;
  var xoffset = offsetlength;
  var yoffset = offsetlength;
  var str = this.sequence[stroke];
  var gap = 1;
  x = str[0].x;
  y = str[0].y;
  if (str.length > 1) {
    if (str.length > 5) gap = 5;
    var sine = str[gap].x - str[0].x;
    var cosine = str[gap].y - str[0].y;
    var length = Math.sqrt(sine * sine + cosine * cosine);
    if (length > 0) {
      sine /= length;
      cosine /= length;
      xoffset = -offsetlength * sine;
      yoffset = -offsetlength * cosine;
    }
  }
  this.canvas.draw_text(x + xoffset, y + yoffset, stroke + 1);
}
DrawKhmer.prototype.addPoint = function (x, y) {
  var x2 = x;
  var y2 = y;
  if (this.point_num == 0) this.sequence[this.stroke_num] = new Array;
  this.sequence[this.stroke_num][this.point_num] = {
    x: x2,
    y: y2
  };
  ++this.point_num;
  if (this.prev_x != -1) {
    this.canvas.draw_line(this.prev_x, this.prev_y, x, y);
  } else {
    //var colour = random_colour();
    //this.colours[this.stroke_num] = colour;
    this.canvas.start_line(x, y, '#000');
  }
  this.prev_x = x;
  this.prev_y = y;
}
DrawKhmer.prototype.trace = function (event) {
  if (!this.active) return;
  var pos = this.canvas_adjust(get_position(event));
  if (pos.x < 2 || pos.y < 2 || pos.x > this.canvas_size - 4 || pos.y > this.canvas_size - 4) {
    this.mouseup(event);
  } else {
    this.addPoint(pos.x, pos.y);
  }
}
DrawKhmer.prototype.makeMessage = function () {

  var tg = { 'Traces': [], 'CaptureDevice': null };
  for (var i = 0; i < this.sequence.length; ++i) {
    var t = { 'Points': [] };
    for (var j = 0; j < this.sequence[i].length; ++j) {
      var p = { 'X': this.sequence[i][j].x, 'Y': this.sequence[i][j].y };
      t.Points.push(p);
    }
    tg.Traces.push(t);
  }

  //set device context
  tg.CaptureDevice = {'XDpi': 300, 'YDpi': 300, 'SamplingRate': 100, 'Latency': 0};
  
  return tg;
}

DrawKhmer.prototype.colour_string = function () {
  var colour_string = "";
  if (this.colours.length > 0) {
    for (colour in this.colours) {
      colour_string += this.colours[colour];
    }
    colour_string = colour_string.replace(/#/g, "");
    colour_string = "#" + colour_string + "\n";
  }
  return colour_string;
}

DrawKhmer.prototype.toggle_show_numbers = function () {
  var show_numbers = getbyid("show-numbers");
  this.show_numbers = show_numbers.checked;
//  set_cookie(draw_cookie("show-numbers") + value_from_bool(this.show_numbers));
  this.canvas.clear();
  this.drawAll();
}

DrawKhmer.prototype.adjust_canvas_offsets = function () {
  var offset_left = 0;
  var offset_top = 0;
  for (var o = this.canvas.element; o; o = o.offsetParent) {
    offset_left += (o.offsetLeft - o.scrollLeft);
    offset_top += (o.offsetTop - o.scrollTop);
  }
  this.canvas.offset_left = offset_left;
  this.canvas.offset_top = offset_top;
  this.canvas.clear();
  this.drawAll();
}
DrawKhmer.prototype.canvas_adjust = function (absolute) {
  var relative = new Object();
  relative.x = absolute.x - this.canvas.offset_left;
  relative.y = absolute.y - this.canvas.offset_top;
  return relative;
}


///////////////////////////

function clear(o) {
  while (o.firstChild)
    o.removeChild(o.firstChild);
}

function getbyid(id) {
  var element = document.getElementById(id);
  return element;
}