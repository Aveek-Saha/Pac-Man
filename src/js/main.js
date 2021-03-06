var Main = function(game){

};

function pathTo(node) {
	var curr = node;
	var path = [];
	while (curr.parent) {
		path.unshift(curr);
		curr = curr.parent;
	}
	return path;
}

function getHeap() {
	return new BinaryHeap(function (node) {
		return node.f;
	});
}

var astar = {
	/**
	* Perform an A* Search on a graph given a start and end node.
	* @param {Graph} graph
	* @param {GridNode} start
	* @param {GridNode} end
	* @param {Object} [options]
	* @param {bool} [options.closest] Specifies whether to return the
			   path to the closest node if the target is unreachable.
	* @param {Function} [options.heuristic] Heuristic function (see
	*          astar.heuristics).
	*/
	search: function (graph, start, end, options) {
		graph.cleanDirty();
		options = options || {};
		var heuristic = options.heuristic || astar.heuristics.manhattan;
		var closest = options.closest || false;

		var openHeap = getHeap();
		var closestNode = start; // set the start node to be the closest if required

		start.h = heuristic(start, end);
		graph.markDirty(start);

		openHeap.push(start);

		while (openHeap.size() > 0) {

			// Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
			var currentNode = openHeap.pop();

			// End case -- result has been found, return the traced path.
			if (currentNode === end) {
				return pathTo(currentNode);
			}

			// Normal case -- move currentNode from open to closed, process each of its neighbors.
			currentNode.closed = true;

			// Find all neighbors for the current node.
			var neighbors = graph.neighbors(currentNode);

			for (var i = 0, il = neighbors.length; i < il; ++i) {
				var neighbor = neighbors[i];

				if (neighbor.closed || neighbor.isWall()) {
					// Not a valid node to process, skip to next neighbor.
					continue;
				}

				// The g score is the shortest distance from start to current node.
				// We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
				var gScore = currentNode.g + neighbor.getCost(currentNode);
				var beenVisited = neighbor.visited;

				if (!beenVisited || gScore < neighbor.g) {

					// Found an optimal (so far) path to this node.  Take score for node to see how good it is.
					neighbor.visited = true;
					neighbor.parent = currentNode;
					neighbor.h = neighbor.h || heuristic(neighbor, end);
					neighbor.g = gScore;
					neighbor.f = neighbor.g + neighbor.h;
					graph.markDirty(neighbor);
					if (closest) {
						// If the neighbour is closer than the current closestNode or if it's equally close but has
						// a cheaper path than the current closest node then it becomes the closest node
						if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
							closestNode = neighbor;
						}
					}

					if (!beenVisited) {
						// Pushing to heap will put it in proper place based on the 'f' value.
						openHeap.push(neighbor);
					} else {
						// Already seen the node, but since it has been rescored we need to reorder it in the heap
						openHeap.rescoreElement(neighbor);
					}
				}
			}
		}

		if (closest) {
			return pathTo(closestNode);
		}

		// No result was found - empty array signifies failure to find path.
		return [];
	},
	// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
	heuristics: {
		manhattan: function (pos0, pos1) {
			var d1 = Math.abs(pos1.x - pos0.x);
			var d2 = Math.abs(pos1.y - pos0.y);
			return d1 + d2;
		},
		diagonal: function (pos0, pos1) {
			var D = 1;
			var D2 = Math.sqrt(2);
			var d1 = Math.abs(pos1.x - pos0.x);
			var d2 = Math.abs(pos1.y - pos0.y);
			return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
		}
	},
	cleanNode: function (node) {
		node.f = 0;
		node.g = 0;
		node.h = 0;
		node.visited = false;
		node.closed = false;
		node.parent = null;
	}
};

/**
 * A graph memory structure
 * @param {Array} gridIn 2D array of input weights
 * @param {Object} [options]
 * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
 */
function Graph(gridIn, options) {
	options = options || {};
	this.nodes = [];
	this.diagonal = !!options.diagonal;
	this.grid = [];
	for (var x = 0; x < gridIn.length; x++) {
		this.grid[x] = [];

		for (var y = 0, row = gridIn[x]; y < row.length; y++) {
			var node = new GridNode(x, y, row[y]);
			this.grid[x][y] = node;
			this.nodes.push(node);
		}
	}
	this.init();
}

Graph.prototype.init = function () {
	this.dirtyNodes = [];
	for (var i = 0; i < this.nodes.length; i++) {
		astar.cleanNode(this.nodes[i]);
	}
};

Graph.prototype.cleanDirty = function () {
	for (var i = 0; i < this.dirtyNodes.length; i++) {
		astar.cleanNode(this.dirtyNodes[i]);
	}
	this.dirtyNodes = [];
};

Graph.prototype.markDirty = function (node) {
	this.dirtyNodes.push(node);
};

Graph.prototype.neighbors = function (node) {
	var ret = [];
	var x = node.x;
	var y = node.y;
	var grid = this.grid;

	// West
	if (grid[x - 1] && grid[x - 1][y]) {
		ret.push(grid[x - 1][y]);
	}

	// East
	if (grid[x + 1] && grid[x + 1][y]) {
		ret.push(grid[x + 1][y]);
	}

	// South
	if (grid[x] && grid[x][y - 1]) {
		ret.push(grid[x][y - 1]);
	}

	// North
	if (grid[x] && grid[x][y + 1]) {
		ret.push(grid[x][y + 1]);
	}

	if (this.diagonal) {
		// Southwest
		if (grid[x - 1] && grid[x - 1][y - 1]) {
			ret.push(grid[x - 1][y - 1]);
		}

		// Southeast
		if (grid[x + 1] && grid[x + 1][y - 1]) {
			ret.push(grid[x + 1][y - 1]);
		}

		// Northwest
		if (grid[x - 1] && grid[x - 1][y + 1]) {
			ret.push(grid[x - 1][y + 1]);
		}

		// Northeast
		if (grid[x + 1] && grid[x + 1][y + 1]) {
			ret.push(grid[x + 1][y + 1]);
		}
	}

	return ret;
};

Graph.prototype.toString = function () {
	var graphString = [];
	var nodes = this.grid;
	for (var x = 0; x < nodes.length; x++) {
		var rowDebug = [];
		var row = nodes[x];
		for (var y = 0; y < row.length; y++) {
			rowDebug.push(row[y].weight);
		}
		graphString.push(rowDebug.join(" "));
	}
	return graphString.join("\n");
};

function GridNode(x, y, weight) {
	this.x = x;
	this.y = y;
	this.weight = weight;
}

GridNode.prototype.toString = function () {
	return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function (fromNeighbor) {
	// Take diagonal weight into consideration.
	if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
		return this.weight * 1.41421;
	}
	return this.weight;
};

GridNode.prototype.isWall = function () {
	return this.weight === 0;
};

function BinaryHeap(scoreFunction) {
	this.content = [];
	this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
	push: function (element) {
		// Add the new element to the end of the array.
		this.content.push(element);

		// Allow it to sink down.
		this.sinkDown(this.content.length - 1);
	},
	pop: function () {
		// Store the first element so we can return it later.
		var result = this.content[0];
		// Get the element at the end of the array.
		var end = this.content.pop();
		// If there are any elements left, put the end element at the
		// start, and let it bubble up.
		if (this.content.length > 0) {
			this.content[0] = end;
			this.bubbleUp(0);
		}
		return result;
	},
	remove: function (node) {
		var i = this.content.indexOf(node);

		// When it is found, the process seen in 'pop' is repeated
		// to fill up the hole.
		var end = this.content.pop();

		if (i !== this.content.length - 1) {
			this.content[i] = end;

			if (this.scoreFunction(end) < this.scoreFunction(node)) {
				this.sinkDown(i);
			} else {
				this.bubbleUp(i);
			}
		}
	},
	size: function () {
		return this.content.length;
	},
	rescoreElement: function (node) {
		this.sinkDown(this.content.indexOf(node));
	},
	sinkDown: function (n) {
		// Fetch the element that has to be sunk.
		var element = this.content[n];

		// When at 0, an element can not sink any further.
		while (n > 0) {

			// Compute the parent element's index, and fetch it.
			var parentN = ((n + 1) >> 1) - 1;
			var parent = this.content[parentN];
			// Swap the elements if the parent is greater.
			if (this.scoreFunction(element) < this.scoreFunction(parent)) {
				this.content[parentN] = element;
				this.content[n] = parent;
				// Update 'n' to continue at the new position.
				n = parentN;
			}
			// Found a parent that is less, no need to sink any further.
			else {
				break;
			}
		}
	},
	bubbleUp: function (n) {
		// Look up the target element and its score.
		var length = this.content.length;
		var element = this.content[n];
		var elemScore = this.scoreFunction(element);

		while (true) {
			// Compute the indices of the child elements.
			var child2N = (n + 1) << 1;
			var child1N = child2N - 1;
			// This is used to store the new position of the element, if any.
			var swap = null;
			var child1Score;
			// If the first child exists (is inside the array)...
			if (child1N < length) {
				// Look it up and compute its score.
				var child1 = this.content[child1N];
				child1Score = this.scoreFunction(child1);

				// If the score is less than our element's, we need to swap.
				if (child1Score < elemScore) {
					swap = child1N;
				}
			}

			// Do the same checks for the other child.
			if (child2N < length) {
				var child2 = this.content[child2N];
				var child2Score = this.scoreFunction(child2);
				if (child2Score < (swap === null ? elemScore : child1Score)) {
					swap = child2N;
				}
			}

			// If the element needs to be moved, swap it, and continue.
			if (swap !== null) {
				this.content[n] = this.content[swap];
				this.content[swap] = element;
				n = swap;
			}
			// Otherwise, we are done.
			else {
				break;
			}
		}
	}
};

var player;
var playerMoving = false;
var tileSize = 32;
var crates = [];
var score = 0;

var level = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
	[0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
	[0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
	[0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
	[0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0],
	[0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
	[0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

var level_tiles = [
	[299, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 319, 299, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 319],
	[217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215],
	[217, 131, 195, 196, 196, 197, 131, 195, 196, 196, 196, 197, 131, 215, 217, 131, 195, 196, 196, 196, 197, 131, 195, 196, 196, 197, 131, 215],
	[217, 131, 215, 378, 378, 217, 131, 215, 378, 378, 378, 217, 131, 215, 217, 131, 215, 378, 378, 378, 217, 131, 215, 378, 378, 217, 131, 215],
	[217, 131, 235, 236, 236, 237, 131, 235, 236, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 236, 237, 131, 235, 236, 236, 237, 131, 215],
	[217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215],
	[217, 131, 195, 196, 196, 197, 131, 195, 197, 131, 195, 196, 196, 196, 196, 196, 196, 197, 131, 195, 197, 131, 195, 196, 196, 197, 131, 215],
	[217, 131, 235, 236, 236, 237, 131, 215, 217, 131, 235, 236, 236, 319, 299, 236, 236, 237, 131, 215, 217, 131, 235, 236, 236, 237, 131, 215],
	[217, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 215],
	[279, 196, 196, 196, 196, 197, 131, 215, 279, 196, 196, 197, 131, 215, 217, 131, 195, 196, 196, 378, 217, 131, 195, 196, 196, 196, 196, 339],
	[378, 378, 378, 378, 378, 217, 131, 215, 299, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 319, 217, 131, 215, 378, 378, 378, 378, 378],
	[378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
	[378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 195, 196, 196, 196, 196, 196, 196, 197, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
	[378, 378, 378, 378, 378, 217, 131, 235, 237, 131, 215, 378, 378, 378, 378, 378, 378, 217, 131, 235, 237, 131, 215, 378, 378, 378, 378, 378],
	[378, 378, 378, 378, 378, 217, 131, 131, 131, 131, 215, 378, 378, 378, 378, 378, 378, 217, 131, 131, 131, 131, 215, 378, 378, 378, 378, 378],
	[378, 378, 378, 378, 378, 217, 131, 195, 197, 131, 215, 378, 378, 378, 378, 378, 378, 217, 131, 195, 197, 131, 215, 378, 378, 378, 378, 378],
	[378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 235, 236, 236, 236, 236, 236, 236, 237, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
	[378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
	[378, 378, 378, 378, 378, 217, 131, 215, 217, 131, 195, 196, 196, 196, 196, 196, 196, 197, 131, 215, 217, 131, 215, 378, 378, 378, 378, 378],
	[299, 236, 236, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 319, 299, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 236, 236, 319],
	[217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215],
	[217, 131, 195, 196, 196, 197, 131, 195, 196, 196, 196, 197, 131, 215, 217, 131, 195, 196, 196, 196, 197, 131, 195, 196, 196, 197, 131, 215],
	[217, 131, 235, 236, 319, 217, 131, 235, 236, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 236, 237, 131, 215, 299, 236, 237, 131, 215],
	[217, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 215],
	[279, 196, 197, 131, 215, 217, 131, 195, 197, 131, 195, 196, 196, 196, 196, 196, 196, 197, 131, 195, 197, 131, 215, 217, 131, 195, 196, 339],
	[299, 236, 237, 131, 235, 237, 131, 215, 217, 131, 235, 236, 236, 319, 299, 236, 236, 237, 131, 215, 217, 131, 235, 237, 131, 235, 236, 319],
	[217, 131, 131, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 215, 217, 131, 131, 131, 131, 131, 131, 215],
	[217, 131, 195, 196, 196, 196, 196, 339, 279, 196, 196, 197, 131, 215, 217, 131, 195, 196, 196, 339, 279, 196, 196, 196, 196, 197, 131, 215],
	[217, 131, 235, 236, 236, 236, 236, 236, 236, 236, 236, 237, 131, 235, 237, 131, 235, 236, 236, 236, 236, 236, 236, 236, 236, 237, 131, 215],
	[217, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 131, 215],
	[279, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 196, 339]
  ];

graph = new Graph(level);


Main.prototype = {

	create: function() {

		this.gridsize = 32;
		this.marker = new Phaser.Point();
		this.pos = new Phaser.Point();
		this.pos1 = new Phaser.Point();
		this.pos2 = new Phaser.Point();
		this.speed = 150;
		this.threshold = 3;
		this.turnPoint = new Phaser.Point();
		this.directions = [null, null, null, null, null];
		this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
		this.current = Phaser.NONE;
		this.turning = Phaser.NONE;
		this.game.physics.startSystem(Phaser.Physics.ARCADE);

		this.cursors = this.input.keyboard.createCursorKeys();

		// this.pacman.play('munch');
		// this.move(Phaser.DOWN);

		// var background = this.game.add.
		// 	tileSprite(0, 0, this.game.width, this.game.height, "ground");


		this.walls = this.game.add.group();
		this.walls.enableBody = true;
		this.walls.immovable = true;
		// this.walls.createMultiple(100, 'wall');
		this.game.world.bringToTop(this.walls);

		this.dots = this.game.add.group();
		this.dots.createMultiple(100, 'dot');
		// this.game.world.sendToBack(this.dots);

		this.drawLevel();

		this.player = game.add.sprite(tileSize * 1.5, tileSize * 1, "player");
		this.game.physics.arcade.enable(this.player);
		this.player.anchor.set(0.5);

		this.ghost = game.add.sprite(tileSize * 25, tileSize * 1, "ghost1");
		this.game.physics.arcade.enable(this.ghost);

		this.ghost1 = game.add.sprite(tileSize * 25, tileSize * 29, "ghost2");
		this.game.physics.arcade.enable(this.ghost1);

		this.ghost2 = game.add.sprite(tileSize * 1, tileSize * 29, "ghost3");
		this.game.physics.arcade.enable(this.ghost2);

		this.move(Phaser.DOWN);

		// player.frame = level[i][j];

		// this.player.body.velocity.x = 100;
		// this. current = Phaser.RIGHT;
		// this.game.input.keyboard.addCallbacks(this, this.onDown);

		this.timer1 = game.time.events.loop(300, this.ghostMove, this);
		this.timer2 = game.time.events.loop(350, this.ghostMove1, this);
		this.timer3 = game.time.events.loop(400, this.ghostMove2, this);

	},

	drawLevel: function () {

		var tile;
		crates.length = 0;
		for (var i = 0; i < level.length; i++) {
			crates[i] = [];
			for (var j = 0; j < level[i].length; j++) {
				crates[i][j] = null;
				switch (level_tiles[i][j]) {
					case 195:
						tile = game.add.sprite(tileSize * j, tileSize * i, "top-left");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 196:
						tile = game.add.sprite(tileSize * j, tileSize * i, "top");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 197:
						tile = game.add.sprite(tileSize * j, tileSize * i, "top-right");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 215:
						tile = game.add.sprite(tileSize * j, tileSize * i, "left");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 217:
						tile = game.add.sprite(tileSize * j, tileSize * i, "right");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 235:
						tile = game.add.sprite(tileSize * j, tileSize * i, "bottom-left");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 236:
						tile = game.add.sprite(tileSize * j, tileSize * i, "bottom");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 237:
						tile = game.add.sprite(tileSize * j, tileSize * i, "bottom-right");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 199:
						tile = game.add.sprite(tileSize * j, tileSize * i, "inner-top-right");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 235:
						tile = game.add.sprite(tileSize * j, tileSize * i, "inner-bottom-right");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 239:
						tile = game.add.sprite(tileSize * j, tileSize * i, "inner-bottom-left");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;

					case 259:
						tile = game.add.sprite(tileSize * j, tileSize * i, "inner-top-left");
						this.game.physics.arcade.enable(tile);
						tile.enableBody = true;
						tile.body.immovable = true;
						this.walls.add(tile);
						break;
				}
			}
		}
	},

	checkKey: function () {
		if (this.cursors.left.isDown && this.current !== Phaser.LEFT) {
			this.check(Phaser.LEFT);
		}
		else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT) {
			this.check(Phaser.RIGHT);
		}
		else if (this.cursors.up.isDown && this.current !== Phaser.UP) {
			this.check(Phaser.UP);
		}
		else if (this.cursors.down.isDown && this.current !== Phaser.DOWN) {
			this.check(Phaser.DOWN);
		}
		else {
			//  This forces them to hold the key down to turn the corner
			this.turning = Phaser.NONE;
		}

	},

	check: function (turnTo) {
		if (this.turning === turnTo || this.directions[turnTo] === 0) {
			//  Invalid direction if they're already set to turn that way
			//  Or there is no tile there, or the tile isn't index 1 (a floor tile)
			return;
		}
		if (this.current === this.opposites[turnTo]) {
			this.move(turnTo);
		}
		else {
			this.turning = turnTo;
			this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
			this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
		}
	},

	turn: function () {
		var cx = Math.floor(this.player.x);
		var cy = Math.floor(this.player.y);
		//  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
		if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) 
		|| !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold)) {
			return false;
		}
		//  Grid align before turning
		this.player.x = this.turnPoint.x;
		this.player.y = this.turnPoint.y;
		this.player.body.reset(this.turnPoint.x, this.turnPoint.y);
		this.move(this.turning);
		this.turning = Phaser.NONE;
		return true;
	},

	move: function (direction) {
		var speed = this.speed;
		if (direction === Phaser.LEFT || direction === Phaser.UP) {
			speed = -speed;
		}
		if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
			this.player.body.velocity.x = speed;
		}
		else {
			this.player.body.velocity.y = speed;
		}
		this.current = direction;
	},

	update: function () {

		this.game.physics.arcade.collide(this.player, this.walls);
		this.game.physics.arcade.collide(this.ghost, this.walls);


		this.marker.x = this.math.snapToFloor(Math.floor(this.player.x), tileSize) / tileSize;
		this.marker.y = this.math.snapToFloor(Math.floor(this.player.y), tileSize) / tileSize;

		this.pos.x = this.math.snapToFloor(Math.floor(this.ghost.x), tileSize) / tileSize;
		this.pos.y = this.math.snapToFloor(Math.floor(this.ghost.y), tileSize) / tileSize;

		this.pos1.x = this.math.snapToFloor(Math.floor(this.ghost1.x), tileSize) / tileSize;
		this.pos1.y = this.math.snapToFloor(Math.floor(this.ghost1.y), tileSize) / tileSize;

		this.pos2.x = this.math.snapToFloor(Math.floor(this.ghost2.x), tileSize) / tileSize;
		this.pos2.y = this.math.snapToFloor(Math.floor(this.ghost2.y), tileSize) / tileSize;
		
		this.directions[1] = level[this.marker.y][this.marker.x - 1]
		this.directions[2] = level[this.marker.y][this.marker.x + 1]
		this.directions[3] = level[this.marker.y - 1][this.marker.x]
		this.directions[4] = level[this.marker.y + 1][this.marker.x]
		
		// console.log(this.directions)

		this.checkKey();
		

		if (this.turning !== Phaser.NONE) {
			this.turn();
		}

		// if (this.cursors.left.isDown) {

		// 	// this.player.body.velocity.y = 0;
		// 	this.player.body.velocity.x = -100;
		// }
		// else if (this.cursors.right.isDown) {
		// 	// this.player.body.velocity.y = 0;
		// 	this.player.body.velocity.x = 100;
		// } 
		// else if (this.cursors.up.isDown) {
		// 	this.player.body.velocity.y = -100;
		// 	// this.player.body.velocity.x = 0;
		// }
		// else if (this.cursors.down.isDown) {
		// 	this.player.body.velocity.y = 100;
		// 	// this.player.body.velocity.x = 0;
		// }
	},

	drawDots: function (result) {
		this.dots.removeAll();
		var tile;
		for (var i = 0; i < result.length; i++) {
			tile = game.add.sprite(tileSize * result[i].y, tileSize * result[i].x, "dot");
				// this.game.physics.arcade.enable(tile);
				// tile.enableBody = true;
				// tile.body.immovable = true;
				this.dots.add(tile);
		}
	},

	ghostMove: function () {
		var start = graph.grid[this.pos.y][this.pos.x];
		var end = graph.grid[this.marker.y][this.marker.x];
		var result = astar.search(graph, start, end);
		// console.log(result)

		this.drawDots(result)

		this.ghost.x = result[0].y * tileSize
		this.ghost.y = result[0].x * tileSize

	},

	ghostMove1: function () {
		var start = graph.grid[this.pos1.y][this.pos1.x];
		var end = graph.grid[this.marker.y][this.marker.x];
		var result = astar.search(graph, start, end);
		// console.log(result[0].x)

		this.ghost1.x = result[0].y * tileSize
		this.ghost1.y = result[0].x * tileSize
	},

	ghostMove2: function () {
		var start = graph.grid[this.pos2.y][this.pos2.x];
		var end = graph.grid[this.marker.y][this.marker.x];
		var result = astar.search(graph, start, end);
		// console.log(start)

		this.ghost2.x = result[0].y * tileSize
		this.ghost2.y = result[0].x * tileSize
	},

	gameOver: function(){
		
	}

};