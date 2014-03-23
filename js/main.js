$(document).ready (function(){
	var game = {
		debug: false
	};
	var x = 150;
	var y = 150;
	var ctx;
	
	var DIR = {
		NORTH: 'north',
		SOUTH: 'south',
		EAST: 'east',
		WEST: 'west'
	}

	var canvasMinX;
	var canvasMaxX;
	var canvasMinY;
	var canvasMaxY;
		
	var bubbles = [],
		colors = ['#EFD279', '#95CBE9', '#024769', '#AFD775', '#2C5700', '#DE9D7F'],
		width = 10,
		height = 10,
		// bubble size
		bS = {width: 30, height: 30};

	function $R(min, max) {
		var a = [];
		for (var i = min; i < max; i ++) {
			a.push(i);
		}
		return a;
	}

	function init() {
		$('#canvas').attr ({
			width: width * bS.width,
			height: height * bS.height
		});
				
		height = parseInt ($('#height').val());
		width = parseInt ($('#width').val());
		

		
		
		$('#score').text(0);
	  ctx = $('#canvas')[0].getContext("2d");
		bubbles = [];
	  jQuery.each( $R(0, height), function () {
			var row = [];
			jQuery.each($R(0, width), function () {
				row.push (Math.floor(Math.random()*colors.length));
			});
			bubbles.push(row);
	  });
	  draw();
	
		$('#btnRefresh').click(function(){
			init ();
		});
	}
	
	/**
	 * Sort blocks by northmost first
	 */
	function sortBubblePositions(bubbles) {
		return bubbles.sort(function (a, b) {
			if ( a.y == b.y ) {
				return 0;
			}
			return a.y < b.y ? -1 : 1;
		});
	}

	/**
	 * init bubbles
	 */
	function draw() {
		radius = bS.height/2;		
		ctx.clearRect(0,0,width*bS.width,height*bS.height);
	  jQuery.each(bubbles, function(y, v) {
			// draws y labels
			if (game.debug){
				ctx.fillStyle = '#000';
				ctx.fillText(y, width * bS.width, y * bS.height + 1.5 *radius);
			}
			jQuery.each(bubbles[y], function(x, v2) {
				var color = bubbles[y][x];
				drawBubble ({x:x, y:y}, color);
				// draws x labels
				if (game.debug){
					ctx.fillStyle = '#000';
					ctx.fillText(x, x * bS.width + radius/2, height * bS.height + radius);
				}
			});
			
			
	  });
	
	}


	function drawBubble(pos, index) {
		color = index >= 0 ? colors[index]: '#FFF';
		ctx.fillStyle = color;
		ctx.beginPath();
		radius = bS.height/2;
	  ctx.arc(radius + pos.x * bS.width, radius + pos.y * bS.height, radius-1, 0, Math.PI*2, true);
	  ctx.closePath();
	  ctx.fill();
	}
	
	function clearBubble(pos) {
		setBubble(pos, -1);
		var coords = bubbleToPixelCoords (pos);
				ctx.clearRect(coords.x, coords.y, bS.width, bS.height);
	}


	function init_mouse() {
	  canvasMinX = $("#canvas").offset().left;
	  canvasMaxX = canvasMinX + width*bS.width;
	  canvasMinY = $("#canvas").offset().top
	  canvasMaxY = canvasMinY + height*bS.height;	
	}
	
	function inCanvas(x,y) {
		return canvasMaxX > x && canvasMinX < x && y < canvasMaxY && y >= canvasMinY;
	}
	
	function adjustViewportCoordinates(x,y) {
		return {x: x-canvasMinX, y: y-canvasMinY};
	}
	
	$('#canvas').click(function(evt){
		var view = adjustViewportCoordinates(evt.pageX, evt.pageY),
			bubblePos = pixelToBubbleCoord(view.x,view.y);
				
		if(bubblePos) { 
			var selectedBubbles = floodBubble(bubblePos);
			selectedBubbles = sortBubblePositions ( selectedBubbles );
			if(selectedBubbles.length > 1 ) {
				addScore ((selectedBubbles.length - 1)*selectedBubbles.length);
				jQuery.each (selectedBubbles, function(i,v){clearBubble(v);})
				jQuery.each (selectedBubbles, function(i,v){
					dropBubbles(v);
				});
				draw();
			}
		}
		

	});
	
	function addScore(value) {
		var s = parseFloat($('#score').text());
		s += value;
		$('#score').text(s);
	}
	
	function dropBubbles(bubPos) {
		if(isBubblePos(bubPos)){
			// drop all blocks north of this block if there are empty spots
			var color = getBubble(bubPos);
			if(color == -1) {
				// empty position, so set current block to block above
				var top = {x: bubPos.x, y: bubPos.y-1};
				var bottom = {x: bubPos.x, y: bubPos.y+1};
				if(isBubblePos(top)) {
					
					var topColor = getBubble(top);
						
					setBubble(bubPos, topColor);
					setBubble(top, -1); 
					dropBubbles(top);
				
				}
			}
		}
	}
	
	function $P (x, y) {
		var p = {x:x, y:y};
		return isBubblePos(p) ? p : null;
	}
	
	function getBubblePosDir(pos,dir) {
		var rtn = {x:pos.x, y:pos.y};
		switch(dir) {
			case 'north':
				pos.y --;
				break;
			case 'east':
				pos.x ++;
				break;
			case 'west':
				pos.x --;
				break;
			case 'south':
				pos.y ++;
				break;
		}
		return isBubblePos(pos) ? pos : null;
	}

	function pixelToBubbleCoord(x,y) {
		return {x: Math.floor(x/bS.width), y: Math.floor(y/bS.height)}
	}
	function bubbleToPixelCoords(coords){
		return {x: coords.x*bS.width, y: coords.y*bS.height};
	}
	
	function getBubbleUsingPixel(x, y) {
		var pos = pixelToBubbleCoord(x,y);
		return pos.x < width && pos.y < height ? bubbles[pos.y][pos.x] : null;
	}
	
	function isBubblePos(pos) {
		return 0 <= pos.x && 0 <= pos.y && pos.x < width && pos.y < height;
	}
	
	function getBubble(pos) {
		return bubbles[pos.y][pos.x];
	}
	
	function setBubble(pos, index) {
		bubbles[pos.y][pos.x] = index;
	}
	
	/**
	 * Determine all adjacent blockPos that share
	 * a color with the given blockPos.
	 **/
	function floodBubble(blockPos, targetColor, result) {
		if (!isBubblePos(blockPos)) return result;
		
		result = result || {values:[]};
		var color = getBubble(blockPos);
		var key = blockPos.x +','+blockPos.y;
		targetColor = targetColor == null ? color : targetColor; 
		if (color >= 0) {
			if (targetColor == color && ! result[key] ) {
				result.values.push(blockPos);
				result[key] = true;
				// check neighbors
				// north
				floodBubble({x: blockPos.x, y: blockPos.y-1}, targetColor, result);
				// south
				floodBubble({x: blockPos.x, y: blockPos.y+1}, targetColor, result);
				// east
				floodBubble({x: blockPos.x + 1, y: blockPos.y}, targetColor, result);
				// west
				floodBubble({x: blockPos.x - 1, y: blockPos.y}, targetColor, result);								
			} 
		}
		return result.values;
	}
	

	init();
	init_mouse();
});
