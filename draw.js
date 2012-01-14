(function() {
    var node = function(id, canvas) {
        return {
            'id': id,
            'canvas': canvas,
            'next': null,
            'previous': null
        }
    };

    var linkedList = function() {
        var head = null,
            tail = null;

        function loopList(callback) {
            var next = head;
            while (next !== null) {
                callback(next);
                next = next.next;
            }
        }
       
        function splice(node) {
            loopList(function(current_node) {
                if (current_node.id === node.id) {
                    var node_before_current = current_node.previous,
                        node_after_current = current_node.next;

                    if (node_before_current === null &&
                        node_after_current === null) {
                        // Current node is the only node
                        head = null;
                        tail = null;
                    } else if (node_before_current === null &&
                        node_after_current !== null) {
                        // Current node is the head
                        head = node_after_current;
                        current_node.next = null;
                        node_after_current.previous = null; 
                    } else if (node_before_current !== null &&
                        node_after_current === null) {
                        // Current node is the tail
                        tail = node_before_current;
                        current_node.previous = null;
                        node_before_current.next = null;
                    } else {
                        node_before_current.next = node_after_current;
                        node_after_current.previous = node_before_current;
                        current_node.previous = null;
                        current_node.next = null;
                    }
                }
            }); 
        } 

        return {
            'push': function(node) {
                // Splice existing node from the list
                splice(node);

                if (head === null) {head = node; tail = head;}
                else {

                    // Appends to the end of the list
                    tail.next = node;
                    node.previous = tail;
                    tail = node;
                }
            },
            'pop': function() {
                var node = tail;
                if (tail !== null && tail.previous !== null) {
                    tail = tail.previous;
                    tail.next = null;
                } else {
                    head = null;
                    tail = null;
                }
                return node;
            },
            'print': function() {
                loopList(function(node) {
                    console.log(node);
                });
            }
        }
    };

    var beginDrawing = false,
        canvasList = linkedList();

    function undo() {
        var lastCanvas = canvasList.pop();
        if (lastCanvas !== null) {
            lastCanvas.canvas.width = lastCanvas.canvas.width;
        }
    }

    function getTeamColour() {
        if (currentTeam === 1) {
            return '#7fbf4d';
        } else {
            return '#3d5691';
        }
    }

    function mouseMove(context, x, y) {
          // The event handler works like a drawing pencil which tracks the mouse 
          // movements. We start drawing a path made up of lines.
          if (beginDrawing) {
            context.fillStyle = getTeamColour();
            context.strokeStyle = getTeamColour();
            context.lineWidth = 8;
            context.lineTo(x, y);
            context.stroke();
          }
    }

    function getPosition(ev) {
        // Get the mouse position relative to the canvas element.
        if (ev.layerX || ev.layerX == 0) { // Firefox
          x = ev.layerX;
          y = ev.layerY;
        } else if (ev.offsetX || ev.offsetX == 0) { // Opera
          x = ev.offsetX;
          y = ev.offsetY;
        }
        return {'x': x, 'y': y};
    }

    function mouseDown(context, x, y) {
        context.beginPath();
        context.moveTo(x,y);
        beginDrawing = true;
    }

    function _doneDrawing(canvas) {
        if (beginDrawing) {
            beginDrawing = false;
            canvasList.push(node(canvas.id, canvas));
        }
    }

    function mouseUp() { doneDrawing(); }

    function mouseLeave() { doneDrawing(); }

    var currentTeam = 1;

    function activateTeam(team) {
        currentTeam = team;
    }

    var socket = io.connect('http://tereno-mbpro.local:8001');
    socket.on('mouseMove', function(data) {
        mouseMove(document.getElementById(data['id']).getContext('2d'), data['x'], data['y']); 
    });

    socket.on('mouseDown', function(data) {
        mouseDown(document.getElementById(data['id']).getContext('2d'), data['x'], data['y']); 
    });

    socket.on('mouseUp', function(data) {
        _doneDrawing(document.getElementById(data['id'])); 
    });

    socket.on('mouseLeave', function(data) {
        _doneDrawing(document.getElementById(data['id'])); 
    });

    socket.on('undo', function(data) {
        undo();
    });

    $('.canvas').each(function() {
        var context = this.getContext('2d');
        context.lineWidth = 8;
        
        $(this).mousemove(function(ev) {
            var position = getPosition(ev);
            mouseMove(context, position.x, position.y);
            socket.emit('mouseMove', {'id': this.id,
                                      'x': position.x,
                                      'y': position.y});
        });

        $(this).mousedown(function(ev) {
            var position = getPosition(ev);
            mouseDown(context, position.x, position.y);
            socket.emit('mouseDown', {'id': this.id,
                                      'x': position.x,
                                      'y': position.y});
        });

        $(this).mouseup(function(ev) {
            _doneDrawing(this);
            socket.emit('mouseUp', {'id': this.id});
        });

        $(this).mouseleave(function(ev) {
            _doneDrawing(this);
            socket.emit('mouseLeave', {'id': this.id});
        });

    });

    $('#undoButton').click(function() {
        undo();
        socket.emit('undo');
    });

    $('#team1').click(function() {
        activateTeam(1);
        socket.emit('activateTeam1');
    });

    $('#team2').click(function() {
        activateTeam(2);
        socket.emit('activateTeam2');
    });
})();
