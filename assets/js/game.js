var canvas = new fabric.Canvas('stage');

var isMobile = false;

if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}

var action_type = 0; // 0: Move, 1: Link, 2: Unlink
var tempSelection = new fabric.ActiveSelection([], {canvas: canvas});

var objectsInCurrentGroup = [];

var lowerCanvasElement = document.getElementsByClassName('lower-canvas')[0];
var upperCanvasElement = document.getElementsByClassName('upper-canvas')[0];

window.addEventListener('resize', resizeCanvas, false);

resizeCanvas();

var total = 36;
var fragments = [];
var movingObjects = [];
var crushCounts = [];
var absorptionConst = 0.9;
var initialMouseX = 0, initialMouseY = 0;

canvas.selection = false;

for (var i = 1; i <= total; i ++) {
  var fileNumber = `000${i}`;
  var imageFileName = `fragment_${fileNumber.substring(fileNumber.length - 4)}.png`;

  new fabric.Image.fromURL(`./assets/img/fragments/${imageFileName}`, function(oImg) {

    var img = oImg.scale(0.2);

    // add filter
    img.filters.push(new fabric.Image.filters.RemoveColor({
      color: "#08f8e8"
    }));

    // apply filters and re-render canvas when done
    img.applyFilters();

    img.set({
      cornerColor: 'red',
      cornerSize: 10,
      transparentCorners: false,
      vx: 0,
      vy: 0,
      left: Math.random() * window.innerWidth,
      top: Math.random() * window.innerHeight
    });

    img.setControlVisible('tl', false);
    img.setControlVisible('tr', false);
    img.setControlVisible('br', false);
    img.setControlVisible('bl', false);
    img.setControlVisible('ml', false);
    img.setControlVisible('mt', false);
    img.setControlVisible('mr', false);
    img.setControlVisible('mb', false);

    // add image onto canvas (it also re-render the canvas)
    canvas.add(img);
    fragments.push(img);

  }, {crossOrigin: 'anonymous'});
}

canvas.on('mouse:down', function(options) {
  if (action_type == 0) {
    if (isMobile) {
      initialMouseX = options.e.targetTouches[0].screenX;
      initialMouseY = options.e.targetTouches[0].screenY;
    }
    else if (options.e.buttons == 1) {
      initialMouseX = options.e.offsetX;
      initialMouseY = options.e.offsetY;
    }
  }
});

canvas.on('mouse:move', function(options) {
  if (action_type == 0) {
    if (!canvas.getActiveObject()) {
      if (isMobile) {
        moveAllObjects(options.e.changedTouches[0].screenX, options.e.changedTouches[0].screenY);
      }
      else if(options.e.buttons == 1) {
        moveAllObjects(options.e.offsetX, options.e.offsetY);
      }
    }
  }
  else if (action_type == 1) {
    if (isMobile || options.e.buttons == 1) {
      var target = options.target;
      if (target) {
        if (target.type == 'group') {
          var subObjects = target.getObjects();
          target.toActiveSelection();
          canvas.discardActiveObject();
          
          subObjects.map((subObject) => {
            if (!tempSelection.contains(subObject)) {
              tempSelection.addWithUpdate(subObject);
            }
          });
        }
        else {
          if (!tempSelection.contains(target)) {
            tempSelection.addWithUpdate(target);
          }
        }
      }
    }
  }
  else if (action_type == 2) {
    if (isMobile || options.e.buttons == 1) {
      var target = options.target;
      if (target) {
        if (target.type == 'group') {
          objectsInCurrentGroup = target.getObjects();
          target.toActiveSelection();
          canvas.discardActiveObject();
        }
        else {
          var tempObjectsInCurrentGroup = objectsInCurrentGroup.slice();
          tempObjectsInCurrentGroup.map((object) => {
            if (object.containsPoint(new fabric.Point(options.e.offsetX, options.e.offsetY))) {
              console.log('HIT!');
              objectsInCurrentGroup.splice(objectsInCurrentGroup.indexOf(object), 1);
              tempSelection.addWithUpdate(object);
            }
          });
        }
      }
      // else {
      //   if (objectsInCurrentGroup.length > 0) {
      //     var newSelection = new fabric.ActiveSelection([], {canvas: canvas});
      //     objectsInCurrentGroup.map((object) => {
      //       newSelection.addWithUpdate(object);
      //     });
      //     newSelection.toGroup().selectable = false;
      //   }
      //   if (tempSelection.size() > 0) {
      //     tempSelection.toGroup().selectable = false;
      //     tempSelection = new fabric.ActiveSelection([], {canvas: canvas});
      //   }
      //   canvas.discardActiveObject();
      //   canvas.requestRenderAll();
      // }
    }
  }
});

canvas.on('mouse:up', function(options) {
  if (action_type == 0) {
    if(options.e.ctrlKey) {
      if (canvas.getActiveObject()) {
        movingObjects = [canvas.getActiveObject()];
        crushCounts = [0];
        animate();
      }
    }
  }
  else if (action_type == 1) {
    if (tempSelection.size() > 0) {
      var newGroup = tempSelection.toGroup()

      newGroup.selectable = false;
      newGroup.setControlVisible('tl', false);
      newGroup.setControlVisible('tr', false);
      newGroup.setControlVisible('br', false);
      newGroup.setControlVisible('bl', false);
      newGroup.setControlVisible('ml', false);
      newGroup.setControlVisible('mt', false);
      newGroup.setControlVisible('mr', false);
      newGroup.setControlVisible('mb', false);

      tempSelection = new fabric.ActiveSelection([], {canvas: canvas});
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    }
  }
  else if (action_type == 2) {
    if (objectsInCurrentGroup.length > 0) {
      var newSelection = new fabric.ActiveSelection([], {canvas: canvas});
      objectsInCurrentGroup.map((object) => {
        newSelection.addWithUpdate(object);
      });

      var newGroup = newSelection.toGroup()
      newGroup.selectable = false;
      newGroup.setControlVisible('tl', false);
      newGroup.setControlVisible('tr', false);
      newGroup.setControlVisible('br', false);
      newGroup.setControlVisible('bl', false);
      newGroup.setControlVisible('ml', false);
      newGroup.setControlVisible('mt', false);
      newGroup.setControlVisible('mr', false);
      newGroup.setControlVisible('mb', false);
      
      objectsInCurrentGroup = [];
    }
    if (tempSelection.size() > 0) {
      var newGroup = tempSelection.toGroup()
      newGroup.selectable = false;
      newGroup.setControlVisible('tl', false);
      newGroup.setControlVisible('tr', false);
      newGroup.setControlVisible('br', false);
      newGroup.setControlVisible('bl', false);
      newGroup.setControlVisible('ml', false);
      newGroup.setControlVisible('mt', false);
      newGroup.setControlVisible('mr', false);
      newGroup.setControlVisible('mb', false);

      tempSelection = new fabric.ActiveSelection([], {canvas: canvas});
    }
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }
});

canvas.on('mouse:wheel', function(options) {
  if (action_type == 0) {
    var delta = options.e.deltaY;
    var pointer = canvas.getPointer(options.e);
    var zoom = canvas.getZoom();
    zoom = zoom * Math.pow(2, delta / 100);
    if (zoom > 8) zoom = 8;
    if (zoom < 0.125) zoom = 0.125;
    canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);
    options.e.preventDefault();
    options.e.stopPropagation();
  }
});

$("input[name='action_type_options']").click(function() {
  action_type = $("input[name='action_type_options']:checked").val();
  if (action_type == 0) {
    setSelectable(true);
  }
  else {
    setSelectable(false);
  }
  canvas.discardActiveObject();
  canvas.requestRenderAll();
});

$('.three').click(function(){
  var zoom = canvas.getZoom();
  zoom = zoom * 2;
  if (zoom > 8) zoom = 8;
  canvas.zoomToPoint({ x: canvas.getCenter().left, y: canvas.getCenter().top }, zoom);
});

$('.four').click(function(){
  var zoom = canvas.getZoom();
  zoom = zoom / 2;
  if (zoom < 0.125) zoom = 0.125;
  canvas.zoomToPoint({ x: canvas.getCenter().left, y: canvas.getCenter().top }, zoom);
});

function setSelectable(selectable) {
  canvas.forEachObject(function(object){
    object.selectable = selectable;
  });
}

function resizeCanvas() {
  $( ".canvas-container" ).css("width", window.innerWidth + 'px');
  $( ".canvas-container" ).css("height", window.innerHeight + 'px');

  $( ".lower-canvas" ).attr("width", window.innerWidth);
  $( ".lower-canvas" ).attr("height", window.innerHeight);
  $( ".lower-canvas" ).css("width", window.innerWidth + 'px');
  $( ".lower-canvas" ).css("height", window.innerHeight + 'px');

  $( ".upper-canvas" ).attr("width", window.innerWidth);
  $( ".upper-canvas" ).attr("height", window.innerHeight);
  $( ".upper-canvas" ).css("width", window.innerWidth + 'px');
  $( ".upper-canvas" ).css("height", window.innerHeight + 'px');

  canvas.setWidth(window.innerWidth);
  canvas.setHeight(window.innerHeight);
}

function moveAllObjects(x, y) {
  canvas.forEachObject((object) => {
    object.left += (x - initialMouseX) / canvas.getZoom();
    object.top += (y - initialMouseY) / canvas.getZoom();

    object.setCoords();
  });

  initialMouseX = x;
  initialMouseY = y;

  canvas.renderAll();
}

function animate() {
  var isFinishedMove = true;
  canvas.forEachObject((object) => {
    if (canvas.getActiveObject() != object) {
      var vx = object.vx ? object.vx : 0;
      var vy = object.vy ? object.vy : 0;

      movingObjects.forEach((movingObject) => {
        if (movingObject != object && movingObject.intersectsWithObject(object)) {
          if (movingObjects.indexOf(object) == -1) {
            movingObjects.push(object);
            crushCounts.push(1);
          }
          else {
            crushCounts[movingObjects.indexOf(object)] ++;
          }

          var dx = object.getCenterPoint().x - movingObject.getCenterPoint().x;
          var dy = object.getCenterPoint().y - movingObject.getCenterPoint().y;

          if (dx == 0) dx = 0.001;
          if (dy == 0) dy = 0.001;

          if (dx / vx < 0) vx = 0;
          if (dy / vy < 0) vy = 0;

          vx += (dx / Math.abs(dx)) * Math.pow(absorptionConst, crushCounts[movingObjects.indexOf(object)]);
          vy += (dy / Math.abs(dy)) * Math.pow(absorptionConst, crushCounts[movingObjects.indexOf(object)]);
        }
      });

      vx *= 0.9;
      vy *= 0.9;

      if(Math.abs(vx) < 0.1) {
        vx = 0;
      }
      else {
        isFinishedMove = false;
      }

      if(Math.abs(vy) < 0.1) {
        vy = 0;
      }
      else {
        isFinishedMove = false;
      }

      object.left += vx;
      object.top += vy;

      object.setCoords();

      object.vx = vx;
      object.vy = vy;
    }
  });

  if(!isFinishedMove) {
    new fabric.util.requestAnimFrame(animate, canvas.getElement());
  }
  else {
    movingObjects = [];
    crushCounts = [];
  }

  canvas.renderAll();
}


var intro_arr = [
  {
    id: 1,
    content: 'This is just intro 1.'
  },
  {
    id: 2,
    content: 'This is just intro 2.'
  },
  {
    id: 3,
    content: 'This is just intro 3.'
  },
  {
    id: 4,
    content: 'This is just intro 4.'
  },
  {
    id: 5,
    content: 'This is just intro 5.'
  }
];

var element_id = 0;

$('#intro_modal').modal('show');
$("#intro-content")[0].innerHTML = intro_arr[element_id].content;

$('#next_btn').click(function(){
  element_id ++;
  $("#intro-content")[0].innerHTML = intro_arr[element_id].content;
	if (element_id == intro_arr.length - 1) {
		$(this).attr('disabled','');
		$('#start_btn').text(' Start Now! ');
	}
	$('#prev_btn').removeAttr('disabled');
});

$('#prev_btn').click(function(){
  element_id --;
  $("#intro-content")[0].innerHTML = intro_arr[element_id].content;
	if (element_id == 0) {
		$(this).attr('disabled','');
	}
  $('#start_btn').text('Skip & Start');
  $('#next_btn').removeAttr('disabled');
});

$('#start_btn').click(function(){
	
});

$('#finish_btn').click(function(){
	$('#finish_modal').modal('show');
});

$('#finish_ok_btn').click(function(){
	
});


var ai_tip_arr = [
	'Do ABC',
	'Take something',
	'Move anything',
	'Rotate everything',
	'Zoom in and out repeatedly',		
	'Come here',
	'Go there',
	'Dance with her',
	'Sing with me',
	'Get on now'
];

var slider = document.getElementById("ai_tip_slider");

var tip_count_on_view = 5;

slider.oninput = function() {
  var str = '';
  for(var i = this.value - 4; i < this.value; i ++){
    str += '<li>';
    str += ai_tip_arr[i];
    str += '</li>';
  }
  $('.list_container ul').html(str);
}

$('#up').click(function(){
  if (slider.value < tip_count_on_view) {
		return;
	}
  slider.value -= 1;
  console.log(slider.value)
  var str = '';
	if (slider.value >= tip_count_on_view) {
		for(var i = slider.value - tip_count_on_view; i < slider.value; i ++){
			str += '<li>';
			str += ai_tip_arr[i];
			str += '</li>';
		}
		$('.tip-list-wrapper ul').html(str);
	}
});

$('#down').click(function(){
  if (slider.value > ai_tip_arr.length) {
		return;
  }
  var slider_val = slider.value;
  slider_val ++;
  slider.value = slider_val;
	var str = '';
	if (slider.value >= tip_count_on_view) {
		for(var i = slider.value - tip_count_on_view; i < slider.value; i ++){
			str += '<li>';
			str += ai_tip_arr[i];
			str += '</li>';
		}
		$('.tip-list-wrapper ul').html(str);
	}
});


$('#robot').click(function(){
	if ($('.ai-tip-slider-container').css('display') == 'flex') {
		$('.ai-tip-slider-container').hide();
	}
	else if($('.ai-tip-slider-container').css('display') == 'none'){
    $('.ai-tip-slider-container').show();
    $('.ai-tip-slider-container').css('display', 'flex');
	}
	$('#ai_tip_slider').css('width',$('#ai_tip_slider').parent().height());
	var str = '';
	for(var i = 0; i < tip_count_on_view; i ++){
		str += '<li>';
		str += ai_tip_arr[i];
		str += '</li>';
	}
	$('.tip-list-wrapper ul').html(str);
});
