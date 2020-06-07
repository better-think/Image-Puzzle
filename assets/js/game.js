var isMobile = false; // is current environment mobile
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}

var splitMode = 'vertical'; // screen split mode
var spliterWidth = 4; // width of spliter
var mainCanvasRatio = 0.5; // ratio of main canvas in whole screen
var extraCanvasRatio = 0.5; // ratio of extra canvas in whole screen
var isDragingSpliter = false; // is dragging spliter currently
var initialMouseXInSpliter = 0; // offset X of mouse pointer in Spliter
var initialMouseYInSpliter = 0; // offset Y of mouse pointer in Spliter

var main_canvas = new fabric.Canvas('main-stage');
var extra_canvas = new fabric.Canvas('extra-stage');

var ellapseTimer; // timer for ellapsed time
var secondCount = 0; // time ellapse in seconds

var total = 36; // total count of image fragments
var fragments = []; // image fragments

var currentActionType = 0; // 0: Move, 1: Link, 2: Unlink

var tempSelection = new fabric.ActiveSelection([], {canvas: main_canvas}); // temporary selection used for link and unlink
var objectsInCurrentGroup = []; // group containing left fragments when unlinking

var movingObjects = []; // moving objents when animation is going on
var crushCounts = []; // each objects' crush counts with other objects
var absorptionConst = 0.9;

var isMovingObject = false; // is moving a object currently by mouse
var isPanningViewport = false; // is panning viewport currently by mouse
var initialMouseX = 0, initialMouseY = 0; // x and y of initial mousedown point
var initialViewPortTLX = 0, initialViewPortTLY = 0; // x and y of initial viewport top-left point when mousedown
var initialSelectedObjectCenterX = 0, initialSelectedObjectCenterY = 0; // x and y of initial center point of selected when mousedown

var logItem = {}; // log item for current action

var actionHistory = []; // history of action
var actionStep = -1; // current action step

var tip_count_on_view = 5; // count of AI's tips to display on tip menu
var ai_tip_arr = [ // AI's tip list
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

var introContentId = 0; // index of introduction to display currently
var intro_arr = [ // count of introductions to display before starting game
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

init();

window.addEventListener('resize', resizeCanvas, false);
window.addEventListener('keydown', handleKeyDown);

main_canvas.on('object:moved', function(options) {
  logItem.action = 'move';
  logItem.object = {}
  logItem.object.objects = [];
  if (options.target.type == 'group') {
    logItem.object.type = 'group';
    options.target.forEachObject((object) => {
      logItem.object.objects.push(object.custom_id);
    });
  }
  else {
    logItem.object.type = 'fragment';
    logItem.object.objects.push(options.target.custom_id);
  }
  logItem.original = {};
  logItem.original.centerX = options.target.getCenterPoint().x - (options.target.left - options.transform.original.left);
  logItem.original.centerY = options.target.getCenterPoint().y - (options.target.top - options.transform.original.top);
  logItem.transformed = {};
  logItem.transformed.centerX = options.target.getCenterPoint().x;
  logItem.transformed.centerY = options.target.getCenterPoint().y;
  console.log(logItem);
});

main_canvas.on('object:rotated', function(options) {
  logItem.action = 'rotate';
  logItem.object = {}
  logItem.object.objects = [];
  if (options.target.type == 'group') {
    logItem.object.type = 'group';
    options.target.forEachObject((object) => {
      logItem.object.objects.push(object.custom_id);
    });
  }
  else {
    logItem.object.type = 'fragment';
    logItem.object.objects.push(options.target.custom_id);
  }
  logItem.original = {};
  logItem.original.angle = options.transform.original.angle;
  logItem.transformed = {};
  logItem.transformed.angle = options.target.angle;
  console.log(logItem);
});

main_canvas.on('mouse:down:before', function(options) {
  if (options.target && main_canvas.isTargetTransparent(options.target, options.e.offsetX, options.e.offsetY)) {
    main_canvas.discardActiveObject();
    options.target.selectable = false;
    main_canvas.renderAll();
  }
});

main_canvas.on('mouse:down', function(options) {
  if (!options.target || main_canvas.isTargetTransparent(options.target, options.e.offsetX, options.e.offsetY)) {
    if (isMobile) {
      isPanningViewport = true;
      initialMouseX = options.e.targetTouches[0].screenX;
      initialMouseY = options.e.targetTouches[0].screenY;
      initialViewPortTLX = main_canvas.vptCoords.tl.x;
      initialViewPortTLY = main_canvas.vptCoords.tl.y;
    }
    else if (options.e.buttons == 1) {
      isPanningViewport = true;
      initialMouseX = options.e.offsetX;
      initialMouseY = options.e.offsetY;
      initialViewPortTLX = main_canvas.vptCoords.tl.x;
      initialViewPortTLY = main_canvas.vptCoords.tl.y;
    }
  }
  else if (currentActionType == 1) {
    logItem.action = 'link';
    logItem.objects = [];
  }
  else if (currentActionType == 2) {
    if (isMobile || options.e.buttons == 1) {
      var target = options.target;
      target.set('hoverCursor', "url(assets/img/cursor/unlink.svg), auto");
      target.set('moveCursor', "url(assets/img/cursor/unlink.svg), auto");
      if (target.type == 'group') {
        logItem.action = 'unlink';
        var objects = [];
        target.forEachObject((object) => {
          objects.push(object.custom_id);
        });
        logItem.original = {type: 'group', objects: objects};
        logItem.left = {type: 'group', objects: []};
        logItem.separated = {type: 'group', objects: []}

        objectsInCurrentGroup = target.getObjects();
        target.toActiveSelection();
        main_canvas.discardActiveObject();
        var tempObjectsInCurrentGroup = objectsInCurrentGroup.slice();
        tempObjectsInCurrentGroup.map((object) => {
          if (object.containsPoint(new fabric.Point(options.e.offsetX, options.e.offsetY))) {
            objectsInCurrentGroup.splice(objectsInCurrentGroup.indexOf(object), 1);
            object.filters.push(new fabric.Image.filters.BlendColor({
              color: "#08f8e8"
            }));
            object.applyFilters();
            main_canvas.renderAll();
            tempSelection.addWithUpdate(object);
          }
        });
      }
    }
  }
});

main_canvas.on('mouse:move', function(options) {
  if (isPanningViewport) {
    if (isMobile) {
      var newVptTlPoint = new fabric.Point(
        initialViewPortTLX - (options.e.changedTouches[0].screenX - initialMouseX),
        initialViewPortTLY - (options.e.changedTouches[0].screenY - initialMouseY)
      )
      main_canvas.absolutePan(newVptTlPoint);
      main_canvas.renderAll();
    }
    else if(options.e.buttons == 1) {
      var mainCanvasIndex = 1;
      if (window.location.pathname == '/game_ai_human.html' || window.location.pathname == '/game_ai_human') {
        mainCanvasIndex = 3;
      }
      if ($( `.canvas-container:nth-child(${mainCanvasIndex}) .upper-canvas` )[0] == options.e.target) {
        var newVptTlPoint = new fabric.Point(
          initialViewPortTLX * main_canvas.getZoom() - (options.e.offsetX - initialMouseX),
          initialViewPortTLY * main_canvas.getZoom() - (options.e.offsetY - initialMouseY)
        )
        main_canvas.absolutePan(newVptTlPoint);
        main_canvas.renderAll();
      }
    }
  }
  else if (currentActionType == 0) {
    var target = options.target;

    if (main_canvas.getActiveObject() && (isMobile || options.e.buttons == 1)) {
      isMovingObject = true;
    }
    else {
      if (target && !main_canvas.isTargetTransparent(options.target, options.e.offsetX, options.e.offsetY)) {
        target.set('hoverCursor', 'move');
        target.set('moveCursor', 'move');
        target.selectable = true;
      }
      else if (target) {
        target.set('hoverCursor', 'default');
        target.set('moveCursor', 'default');
        target.selectable = false;

        main_canvas.forEachObject((object) => {
          if (object.containsPoint(new fabric.Point(options.e.offsetX, options.e.offsetY)) && !main_canvas.isTargetTransparent(object, options.e.offsetX, options.e.offsetY)) {
            main_canvas.bringForward(object);
          }
        });
      }
    }
  }
  else if (currentActionType == 1) {
    var target = options.target;

    if ((target && !main_canvas.isTargetTransparent(options.target, options.e.offsetX, options.e.offsetY))) {
      target.set('hoverCursor', "url(assets/img/cursor/link.svg), auto");
      target.set('moveCursor', "url(assets/img/cursor/link.svg), auto");
    }
    else if (target) {
      target.set('hoverCursor', 'default');
      target.set('moveCursor', 'default');

      main_canvas.forEachObject((object) => {
        if (object.containsPoint(new fabric.Point(options.e.offsetX, options.e.offsetY)) && !main_canvas.isTargetTransparent(object, options.e.offsetX, options.e.offsetY)) {
          main_canvas.bringForward(object);
          object.set('hoverCursor', "url(assets/img/cursor/link.svg), auto");
          object.set('moveCursor', "url(assets/img/cursor/link.svg), auto");
        }
      });
    }

    if (isMobile || options.e.buttons == 1) {
      if (target && !main_canvas.isTargetTransparent(options.target, options.e.offsetX, options.e.offsetY)) {
        if (target.type == 'group') {
          var objects = [];
          target.forEachObject((object) => {
            objects.push(object.custom_id);
          });
          logItem.objects.push({type: 'group', objects: objects});
          var subObjects = target.getObjects();
          target.toActiveSelection();
          main_canvas.discardActiveObject();
          
          subObjects.map((subObject) => {
            if (!tempSelection.contains(subObject)) {
              subObject.filters.push(new fabric.Image.filters.BlendColor({
                color: "#08f8e8"
              }));
              subObject.applyFilters();
              main_canvas.renderAll();
              tempSelection.addWithUpdate(subObject);
            }
          });
        }
        else {
          if (!tempSelection.contains(target)) {
            logItem.objects.push({type: 'fragment', objects: [target.custom_id]});
            target.filters.push(new fabric.Image.filters.BlendColor({
              color: "#08f8e8"
            }));
            target.applyFilters();
            main_canvas.renderAll();
            tempSelection.addWithUpdate(target);
          }
        }
      }
    }
  }
  else if (currentActionType == 2) {
    var target = options.target;

    if (target && !main_canvas.isTargetTransparent(options.target, options.e.offsetX, options.e.offsetY)) {
      target.set('hoverCursor', "url(assets/img/cursor/unlink.svg), auto");
      target.set('moveCursor', "url(assets/img/cursor/unlink.svg), auto");
    }
    else if (target) {
      target.set('hoverCursor', 'default');
      target.set('moveCursor', 'default');

      main_canvas.forEachObject((object) => {
        if (object.containsPoint(new fabric.Point(options.e.offsetX, options.e.offsetY)) && !main_canvas.isTargetTransparent(object, options.e.offsetX, options.e.offsetY)) {
          main_canvas.bringForward(object);
          object.set('hoverCursor', "url(assets/img/cursor/unlink.svg), auto");
          object.set('moveCursor', "url(assets/img/cursor/unlink.svg), auto");
        }
      });
    }

    if (isMobile || options.e.buttons == 1) {
      if (target && !main_canvas.isTargetTransparent(options.target, options.e.offsetX, options.e.offsetY)) {
        var tempObjectsInCurrentGroup = objectsInCurrentGroup.slice();
        tempObjectsInCurrentGroup.map((object) => {
          if (object.containsPoint(new fabric.Point(options.e.offsetX, options.e.offsetY))) {
            objectsInCurrentGroup.splice(objectsInCurrentGroup.indexOf(object), 1);
            object.filters.push(new fabric.Image.filters.BlendColor({
              color: "#08f8e8"
            }));
            object.applyFilters();
            main_canvas.renderAll();
            tempSelection.addWithUpdate(object);
          }
        });
      }
    }
  }
});

main_canvas.on('mouse:up', function(options) {
  isPanningViewport = false;
  
  if (currentActionType == 0 && isMovingObject) {
    if(!options.e.ctrlKey) {
      if (main_canvas.getActiveObject()) {
        movingObjects = [main_canvas.getActiveObject()];
        crushCounts = [0];
        animate();
      }
    }
    else if(main_canvas.getActiveObject()) {
      addCurrentStateToHistory();
    }
    isMovingObject = false;
  }
  else if (currentActionType == 1) {
    if (tempSelection.size() > 0) {
      tempSelection.forEachObject(function(object) {
        object.filters.pop();
        object.applyFilters();
      });

      var newGroup = tempSelection.toGroup();
      newGroup.cornerColor = 'red';
      newGroup.cornerStrokeColor = 'blue';
      newGroup.transparentCorners = false;
      newGroup.selectable = false;
      newGroup.setControlVisible('tl', false);
      newGroup.setControlVisible('tr', false);
      newGroup.setControlVisible('br', false);
      newGroup.setControlVisible('bl', false);
      newGroup.setControlVisible('ml', false);
      newGroup.setControlVisible('mt', false);
      newGroup.setControlVisible('mr', false);
      newGroup.setControlVisible('mb', false);

      tempSelection = new fabric.ActiveSelection([], {canvas: main_canvas});
      main_canvas.discardActiveObject();
      main_canvas.requestRenderAll();

      addCurrentStateToHistory();

      console.log(logItem);
    }

    changeActionType(0);
  }
  else if (currentActionType == 2) {
    if (objectsInCurrentGroup.length > 0) {
      var newSelection = new fabric.ActiveSelection([], {canvas: main_canvas});
      objectsInCurrentGroup.map((object) => {
        newSelection.addWithUpdate(object);
        logItem.left.objects.push(object.custom_id);
      });

      var newGroup = newSelection.toGroup();
      newGroup.selectable = false;
      newGroup.cornerColor = 'red';
      newGroup.cornerStrokeColor = 'blue';
      newGroup.transparentCorners = false;
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
      tempSelection.forEachObject(function(object) {
        object.filters.pop();
        object.applyFilters();
        logItem.separated.objects.push(object.custom_id);
      });

      var newGroup = tempSelection.toGroup();
      newGroup.selectable = false;
      newGroup.cornerColor = 'red';
      newGroup.cornerStrokeColor = 'blue';
      newGroup.transparentCorners = false;
      newGroup.setControlVisible('tl', false);
      newGroup.setControlVisible('tr', false);
      newGroup.setControlVisible('br', false);
      newGroup.setControlVisible('bl', false);
      newGroup.setControlVisible('ml', false);
      newGroup.setControlVisible('mt', false);
      newGroup.setControlVisible('mr', false);
      newGroup.setControlVisible('mb', false);

      tempSelection = new fabric.ActiveSelection([], {canvas: main_canvas});
    }
    main_canvas.discardActiveObject();
    main_canvas.requestRenderAll();

    addCurrentStateToHistory();

    console.log(logItem);

    changeActionType(0);
  }

  logItem = {};
});

main_canvas.on('mouse:wheel', function(options) {
  if(options.e.buttons != 1) {
    var delta = options.e.deltaY;
    var zoom = main_canvas.getZoom();
    zoom = zoom * Math.pow(2, delta / 100);
    if (zoom > 8) zoom = 8;
    if (zoom < 0.125) zoom = 0.125;
    main_canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);
    options.e.preventDefault();
    options.e.stopPropagation();

    if (zoom == 8) {
      $('.three').addClass('disabled');
    }
    else if (zoom == 0.125) {
      $('.four').addClass('disabled');
    }
    else {
      $('.three').removeClass('disabled');
      $('.four').removeClass('disabled');
    }
  }
});

$("input[name='action_type_options']").click(function() {
  if ($("input[name='action_type_options']:checked").val() == currentActionType) {
    changeActionType(0);
  }
  else {
    changeActionType($("input[name='action_type_options']:checked").val());
  }
});

$("input[name='split_options']").click(function() {
  splitMode = $("input[name='split_options']:checked").val();
  if (splitMode == 'vertical') {
    $( ".spliter" ).css("cursor", "e-resize");
  }
  else if (splitMode == 'horizontal') {
    $( ".spliter" ).css("cursor", "n-resize");
  }
  else {
    $( ".spliter" ).css("cursor", "default");
  }
  resizeCanvas();
});

$('.one').click(function() {
  undoAction();
});

$('.two').click(function() {
  redoAction();
});

$('.three').click(function() {
  zoomIn();
});

$('.four').click(function(){
  zoomOut()
});

$('#intro_modal').modal('show');
$("#intro-content")[0].innerHTML = intro_arr[introContentId].content;

$('#next_btn').click(function() {
  introContentId ++;
  $("#intro-content")[0].innerHTML = intro_arr[introContentId].content;
	if (introContentId == intro_arr.length - 1) {
		$(this).attr('disabled','');
		$('#start_btn').text(' Start Now! ');
	}
	$('#prev_btn').removeAttr('disabled');
});

$('#prev_btn').click(function() {
  introContentId --;
  $("#intro-content")[0].innerHTML = intro_arr[introContentId].content;
	if (introContentId == 0) {
		$(this).attr('disabled','');
	}
  $('#start_btn').text('Skip & Start');
  $('#next_btn').removeAttr('disabled');
});

$('#start_btn').click(function() {
  ellapseTimer = setInterval(countTimeEllapse, 1000);
});

$('#finish_btn').click(function() {
	$('#finish_modal').modal('show');
});

$('#finish_ok_btn').click(function() {
	
});

$('#ai_tip_slider').change(function() {
  var str = '';
  for(var i = this.value - 4; i < this.value; i ++){
    str += '<li>';
    str += ai_tip_arr[i];
    str += '</li>';
  }
  $('.tip-list-wrapper ul').html(str);
});

$('#up').click(function() {
  if ($('#ai_tip_slider')[0].value < tip_count_on_view) {
		return;
	}
  $('#ai_tip_slider')[0].value -= 1;
  var str = '';
	if ($('#ai_tip_slider')[0].value >= tip_count_on_view) {
		for(var i = $('#ai_tip_slider')[0].value - tip_count_on_view; i < $('#ai_tip_slider')[0].value; i ++){
			str += '<li>';
			str += ai_tip_arr[i];
			str += '</li>';
		}
		$('.tip-list-wrapper ul').html(str);
	}
});

$('#down').click(function() {
  if ($('#ai_tip_slider')[0].value > ai_tip_arr.length) {
		return;
  }
  var slider_val = $('#ai_tip_slider')[0].value;
  slider_val ++;
  $('#ai_tip_slider')[0].value = slider_val;
	var str = '';
	if ($('#ai_tip_slider')[0].value >= tip_count_on_view) {
		for(var i = $('#ai_tip_slider')[0].value - tip_count_on_view; i < $('#ai_tip_slider')[0].value; i ++){
			str += '<li>';
			str += ai_tip_arr[i];
			str += '</li>';
		}
		$('.tip-list-wrapper ul').html(str);
	}
});


$('#robot').click(function() {
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

$( ".spliter" ).mousedown(function(e) {
  isDragingSpliter = true;
  initialMouseXInSpliter = e.offsetX;
  initialMouseYInSpliter = e.offsetY;
  main_canvas.selectable = false;
  if (splitMode == 'vertical') {
    $( ".stage" ).css("cursor", "e-resize");
  }
  else if (splitMode == 'horizontal'){
    $( ".stage" ).css("cursor", "n-resize");
  }
});
$( ".stage" ).mousemove(function(e) {
  if(isDragingSpliter) {
    if (splitMode == 'vertical') {
      if (window.location.pathname == "/game_human_ai.html" || window.location.pathname == "/game_human_ai") {
        mainCanvasRatio = (e.clientX - initialMouseXInSpliter) / (window.innerWidth - spliterWidth);
        extraCanvasRatio = 1 - mainCanvasRatio;
      }
      else if (window.location.pathname == "/game_ai_human.html" || window.location.pathname == "/game_ai_human") {
        extraCanvasRatio = (e.clientX - initialMouseXInSpliter) / (window.innerWidth - spliterWidth);
        mainCanvasRatio = 1 - extraCanvasRatio;
      }
    }
    else if (splitMode == 'horizontal') {
      if (window.location.pathname == "/game_human_ai.html" || window.location.pathname == "/game_human_ai") {
        mainCanvasRatio = (e.clientY - initialMouseYInSpliter) / (window.innerHeight - spliterWidth);
        extraCanvasRatio = 1 - mainCanvasRatio;
      }
      else if (window.location.pathname == "/game_ai_human.html" || window.location.pathname == "/game_ai_human") {
        extraCanvasRatio = (e.clientY - initialMouseYInSpliter) / (window.innerHeight - spliterWidth);
        mainCanvasRatio = 1 - extraCanvasRatio;
      }
    }
    console.log(mainCanvasRatio);
    resizeCanvas();
  }
});
$( ".spliter" ).mouseup(function(e) {
  if(isDragingSpliter) {
    isDragingSpliter = false;
    main_canvas.selectable = true;
    $( ".stage" ).css("cursor", "default");
  }
});
$( ".stage" ).mouseup(function(e) {
  if(isDragingSpliter) {
    isDragingSpliter = false;
    main_canvas.selectable = true;
    $( ".stage" ).css("cursor", "default");
  }
});

function init() {
  $('.one').addClass('disabled');
  $('.two').addClass('disabled');

  $( ".spliter" ).css("cursor", "e-resize");

  main_canvas.selection = false;
  extra_canvas.selection = false;
  extra_canvas.selectable = false;

  resizeCanvas();

  var fragmentCount = 1;

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
        left: 0,
        top: 0,
        hoverCursor: 'default',
        moveCursor: 'default',
        cornerStrokeColor: 'blue',
        visible: false,
        custom_id: fragmentCount
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
      main_canvas.add(img);
      fragments.push(img);
  
      if (fragmentCount == total) {
        main_canvas.forEachObject((object) => {
          reposition(object, 0);
        });
        addCurrentStateToHistory();
      }

      fragmentCount ++;
  
    }, {crossOrigin: 'anonymous'});
  }
}

function changeActionType(actionType) {
  currentActionType = actionType;

  main_canvas.forEachObject((object) => {
    object.set('hoverCursor', 'default');
    object.set('moveCursor', 'default');
  });

  if (currentActionType == 0) {
    setSelectable(true);

    $('input[name=currentActionType_options][value=0]').attr('checked', true);
    $('label[id="actionTypeLabel1"]').addClass('selected');
    $('label[id="actionTypeLabel2"]').removeClass('selected');
    $('label[id="actionTypeLabel3"]').removeClass('selected');
  }
  else if (currentActionType == 1) {
    setSelectable(false);

    $('input[name=currentActionType_options][value=1]').attr('checked', true);
    $('label[id="actionTypeLabel1"]').removeClass('selected');
    $('label[id="actionTypeLabel2"]').addClass('selected');
    $('label[id="actionTypeLabel3"]').removeClass('selected');
  }
  else if (currentActionType == 2) {
    setSelectable(false);

    $('input[name=currentActionType_options][value=2]').attr('checked', true);
    $('label[id="actionTypeLabel1"]').removeClass('selected');
    $('label[id="actionTypeLabel2"]').removeClass('selected');
    $('label[id="actionTypeLabel3"]').addClass('selected');
  }
  main_canvas.discardActiveObject();
  main_canvas.requestRenderAll();
}

function setSelectable(selectable) {
  main_canvas.forEachObject(function(object){
    object.selectable = selectable;
  });
}

function resizeCanvas() {
  if (window.location.pathname == '/game_human.html' || window.location.pathname == '/game_human' || splitMode == 'single') {
    $( ".stage" ).css("display", "block");

    $( ".spliter" ).css("display", "none");

    $( ".canvas-container:nth-child(1)" ).css("width", window.innerWidth + 'px');
    $( ".canvas-container:nth-child(1)" ).css("height", window.innerHeight + 'px');

    $( ".canvas-container:nth-child(1) .lower-canvas" ).attr("width", window.innerWidth);
    $( ".canvas-container:nth-child(1) .lower-canvas" ).attr("height", window.innerHeight);
    $( ".canvas-container:nth-child(1) .lower-canvas" ).css("width", window.innerWidth + 'px');
    $( ".canvas-container:nth-child(1) .lower-canvas" ).css("height", window.innerHeight + 'px');

    $( ".canvas-container:nth-child(1) .upper-canvas" ).attr("width", window.innerWidth);
    $( ".canvas-container:nth-child(1) .upper-canvas" ).attr("height", window.innerHeight);
    $( ".canvas-container:nth-child(1) .upper-canvas" ).css("width", window.innerWidth + 'px');
    $( ".canvas-container:nth-child(1) .upper-canvas" ).css("height", window.innerHeight + 'px');

    $( ".canvas-container:nth-child(3)" ).css("display", "none");

    main_canvas.setWidth(window.innerWidth);
    main_canvas.setHeight(window.innerHeight);
  }
  else if (splitMode == 'vertical'){
    var firstCanvasRatio = mainCanvasRatio;
    var secondCanvasRatio = extraCanvasRatio;

    if (window.location.pathname == '/game_ai_human.html' || window.location.pathname == '/game_ai_human') {
      firstCanvasRatio = extraCanvasRatio;
      secondCanvasRatio = mainCanvasRatio;
    }

    $( ".stage" ).css("display", "flex");

    $( ".spliter" ).css("display", "block");
    $( ".spliter" ).css("height", "100vh");
    $( ".spliter" ).css("width", "4px");

    $( ".canvas-container:nth-child(1)" ).css("width", ((window.innerWidth - spliterWidth) * firstCanvasRatio) + 'px');
    $( ".canvas-container:nth-child(1)" ).css("height", (window.innerHeight) + 'px');

    $( ".canvas-container:nth-child(1) .lower-canvas" ).attr("width", (window.innerWidth - spliterWidth) * firstCanvasRatio);
    $( ".canvas-container:nth-child(1) .lower-canvas" ).attr("height", window.innerHeight);
    $( ".canvas-container:nth-child(1) .lower-canvas" ).css("width", ((window.innerWidth - spliterWidth) * firstCanvasRatio) + 'px');
    $( ".canvas-container:nth-child(1) .lower-canvas" ).css("height", (window.innerHeight) + 'px');

    $( ".canvas-container:nth-child(1) .upper-canvas" ).attr("width", (window.innerWidth - spliterWidth) * firstCanvasRatio);
    $( ".canvas-container:nth-child(1) .upper-canvas" ).attr("height", window.innerHeight);
    $( ".canvas-container:nth-child(1) .upper-canvas" ).css("width", ((window.innerWidth - spliterWidth) * firstCanvasRatio) + 'px');
    $( ".canvas-container:nth-child(1) .upper-canvas" ).css("height", (window.innerHeight) + 'px');

    $( ".canvas-container:nth-child(3)" ).css("width", ((window.innerWidth - spliterWidth) * secondCanvasRatio) + 'px');
    $( ".canvas-container:nth-child(3)" ).css("height", (window.innerHeight) + 'px');

    $( ".canvas-container:nth-child(3) .lower-canvas" ).attr("width", (window.innerWidth - spliterWidth) * secondCanvasRatio);
    $( ".canvas-container:nth-child(3) .lower-canvas" ).attr("height", window.innerHeight);
    $( ".canvas-container:nth-child(3) .lower-canvas" ).css("width", ((window.innerWidth - spliterWidth) * secondCanvasRatio) + 'px');
    $( ".canvas-container:nth-child(3) .lower-canvas" ).css("height", (window.innerHeight) + 'px');

    $( ".canvas-container:nth-child(3) .upper-canvas" ).attr("width", (window.innerWidth - spliterWidth) * secondCanvasRatio);
    $( ".canvas-container:nth-child(3) .upper-canvas" ).attr("height", window.innerHeight);
    $( ".canvas-container:nth-child(3) .upper-canvas" ).css("width", ((window.innerWidth - spliterWidth) * secondCanvasRatio) + 'px');
    $( ".canvas-container:nth-child(3) .upper-canvas" ).css("height", (window.innerHeight) + 'px');

    $( ".canvas-container:nth-child(3)" ).css("display", "block");

    main_canvas.setWidth((window.innerWidth - spliterWidth) * mainCanvasRatio);
    main_canvas.setHeight(window.innerHeight);

    extra_canvas.setWidth((window.innerWidth - spliterWidth) * extraCanvasRatio);
    extra_canvas.setHeight(window.innerHeight);
  }
  else if (splitMode == 'horizontal'){
    var firstCanvasRatio = mainCanvasRatio;
    var secondCanvasRatio = extraCanvasRatio;

    if (window.location.pathname == '/game_ai_human.html' || window.location.pathname == '/game_ai_human') {
      firstCanvasRatio = extraCanvasRatio;
      secondCanvasRatio = mainCanvasRatio;
    }

    $( ".stage" ).css("display", "block");

    $( ".spliter" ).css("display", "block");
    $( ".spliter" ).css("height", "4px");
    $( ".spliter" ).css("width", "100%");

    $( ".canvas-container:nth-child(1)" ).css("width", (window.innerWidth) + 'px');
    $( ".canvas-container:nth-child(1)" ).css("height", ((window.innerHeight - spliterWidth) * firstCanvasRatio) + 'px');

    $( ".canvas-container:nth-child(1) .lower-canvas" ).attr("width", window.innerWidth);
    $( ".canvas-container:nth-child(1) .lower-canvas" ).attr("height", (window.innerHeight - spliterWidth) * firstCanvasRatio);
    $( ".canvas-container:nth-child(1) .lower-canvas" ).css("width", (window.innerWidth) + 'px');
    $( ".canvas-container:nth-child(1) .lower-canvas" ).css("height", ((window.innerHeight - spliterWidth) * firstCanvasRatio) + 'px');

    $( ".canvas-container:nth-child(1) .upper-canvas" ).attr("width", window.innerWidth);
    $( ".canvas-container:nth-child(1) .upper-canvas" ).attr("height", (window.innerHeight - spliterWidth) * firstCanvasRatio);
    $( ".canvas-container:nth-child(1) .upper-canvas" ).css("width", (window.innerWidth) + 'px');
    $( ".canvas-container:nth-child(1) .upper-canvas" ).css("height", ((window.innerHeight - spliterWidth) * firstCanvasRatio) + 'px');

    $( ".canvas-container:nth-child(3)" ).css("width", (window.innerWidth) + 'px');
    $( ".canvas-container:nth-child(3)" ).css("height", ((window.innerHeight - spliterWidth) * secondCanvasRatio) + 'px');

    $( ".canvas-container:nth-child(3) .lower-canvas" ).attr("width", window.innerWidth);
    $( ".canvas-container:nth-child(3) .lower-canvas" ).attr("height", (window.innerHeight - spliterWidth) * secondCanvasRatio);
    $( ".canvas-container:nth-child(3) .lower-canvas" ).css("width", (window.innerWidth) + 'px');
    $( ".canvas-container:nth-child(3) .lower-canvas" ).css("height", ((window.innerHeight - spliterWidth) * secondCanvasRatio) + 'px');

    $( ".canvas-container:nth-child(3) .upper-canvas" ).attr("width", window.innerWidth);
    $( ".canvas-container:nth-child(3) .upper-canvas" ).attr("height", (window.innerHeight - spliterWidth) * secondCanvasRatio);
    $( ".canvas-container:nth-child(3) .upper-canvas" ).css("width", (window.innerWidth) + 'px');
    $( ".canvas-container:nth-child(3) .upper-canvas" ).css("height", ((window.innerHeight - spliterWidth) * secondCanvasRatio) + 'px');

    $( ".canvas-container:nth-child(3)" ).css("display", "block");

    main_canvas.setWidth(window.innerWidth);
    main_canvas.setHeight((window.innerHeight - spliterWidth) * mainCanvasRatio);

    extra_canvas.setWidth(window.innerWidth);
    extra_canvas.setHeight((window.innerHeight - spliterWidth) * extraCanvasRatio);
  }
  
}

function animate() {
  var isFinishedMove = true;
  main_canvas.forEachObject((object) => {
    if (main_canvas.getActiveObject() != object) {
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
    new fabric.util.requestAnimFrame(animate, main_canvas.getElement());
  }
  else {
    movingObjects = [];
    crushCounts = [];
    addCurrentStateToHistory();
  }

  main_canvas.renderAll();
}

function reposition(object, count) {
  if (count < 8) {
    var isOverlayed = false;

    object.set({
      left: Math.random() * (window.innerWidth - 80),
      top: Math.random() * (window.innerHeight - 80)
    });
    object.setCoords();

    main_canvas.forEachObject((otherObject) => {
      if (object != otherObject) {
        if (object.intersectsWithObject(otherObject)) {
          isOverlayed = true;
        }
      }
    });
    if (isOverlayed) {
      reposition(object, count + 1);
    }
    else {
      object.set({
        visible: true
      });
    }
  }
}

function addCurrentStateToHistory() {
  actionHistory = actionHistory.slice(0, actionStep + 1);
  actionHistory.push(main_canvas.toJSON(['cornerSize', 'cornerColor', 'cornerStrokeColor', 'transparentCorners']));
  actionStep ++;
  if (actionStep > 0) {
    $('.one').removeClass('disabled');
  }
  $('.two').addClass('disabled');
}

function undoAction() {
  if (actionStep > 0) {
    actionStep --;
    if (actionStep == 0) {
      $('.one').addClass('disabled');
    }
    $('.two').removeClass('disabled');
    main_canvas.loadFromJSON(actionHistory[actionStep], () => {
      main_canvas.forEachObject((object) => {
        object.setControlVisible('tl', false);
        object.setControlVisible('tr', false);
        object.setControlVisible('br', false);
        object.setControlVisible('bl', false);
        object.setControlVisible('ml', false);
        object.setControlVisible('mt', false);
        object.setControlVisible('mr', false);
        object.setControlVisible('mb', false);
      });
      main_canvas.renderAll();
      changeActionType(0);
    });
  }
}

function redoAction() {
  if (actionStep < actionHistory.length - 1) {
    actionStep ++;
    if (actionStep == actionHistory.length - 1) {
      $('.two').addClass('disabled');
    }
    $('.one').removeClass('disabled');
    main_canvas.loadFromJSON(actionHistory[actionStep], () => {
      main_canvas.forEachObject((object) => {
        object.setControlVisible('tl', false);
        object.setControlVisible('tr', false);
        object.setControlVisible('br', false);
        object.setControlVisible('bl', false);
        object.setControlVisible('ml', false);
        object.setControlVisible('mt', false);
        object.setControlVisible('mr', false);
        object.setControlVisible('mb', false);
      });
      main_canvas.renderAll();
      changeActionType(0);
    });
  }
}

function zoomIn() {
  var zoom = main_canvas.getZoom();
  zoom = zoom * 2;
  if (zoom > 8) zoom = 8;
  main_canvas.zoomToPoint({ x: main_canvas.getCenter().left, y: main_canvas.getCenter().top }, zoom);

  if (zoom == 8) {
    $('.three').addClass('disabled');
  }
  $('.four').removeClass('disabled');
}

function zoomOut() {
  var zoom = main_canvas.getZoom();
  zoom = zoom / 2;
  if (zoom < 0.125) zoom = 0.125;
  main_canvas.zoomToPoint({ x: main_canvas.getCenter().left, y: main_canvas.getCenter().top }, zoom);

  if (zoom == 0.125) {
    $('.four').addClass('disabled');
  }
  $('.three').removeClass('disabled');
}

function handleKeyDown(e) {
  if (e.ctrlKey) {
    if (e.keyCode == 89) {
      redoAction();
    }
    else if (e.keyCode == 90) {
      undoAction();
    }
    else if (e.keyCode == 38) {
      zoomIn();
    }
    else if (e.keyCode == 40) {
      zoomOut();
    }
  }
}

function countTimeEllapse() {
  secondCount ++;
  var hh;
  if (Math.floor(secondCount / 3600) < 10) {
    hh = ("0" + Math.floor(secondCount / 3600));
  }
  else {
    hh = Math.floor(secondCount / 3600).toString();
  }
  var mString = ("00" + Math.floor((secondCount % 3600) / 60));
  var mm = mString.slice(mString.length - 2);
  var sString = ("00" + Math.floor(secondCount % 60));
  var ss = sString.slice(sString.length - 2);
  document.getElementById("timeEllapse").innerHTML = `${hh}:${mm}:${ss}`;
}

function clearEllapseTimer() {
  clearInterval(ellapseTimer);
}