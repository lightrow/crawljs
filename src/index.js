import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Graph, astar } from './astar.js';

/// <reference path="../node_modules/@types/react/index.d.ts" />

var xLevel = 41;
var yLevel = 21;

var xScreen = 41;
var yScreen = 21;
var radius = 14; // 1 2 3 4 6 9 13 14. Others leave unchecked spots,
//due to "crudeness" of fov algorithm (basic raytracing)

var ready = false;

var level = [];
var levelWeights = [];

var attempts = 10;
var minroom = 3;
var maxroom = 10;

var maxDepth = 10;
var depth = 0;
var currentFloor = 0;
var floors = {};

var tick = 5;

var roomids = [];

var exit = false;
var exitcoor = {};
var entrance = false;
var entcoor = {};

var player = {
	type: 'player',
	name: 'player',
	maxhealth: 25,
	health: 25,
	AC: 0,
	damage: 1,
	level: 1,
	experience: 0,
	xcoor: null,
	ycoor: null,
	prevxcoor: null,
	prevycoor: null,
	lastsquare: 'room'
};

// monsters
function rat() {
	this.type = 'monster';
	this.name = 'rat';
	this.exp = 5;
	this.health = 6;
	this.AC = 0;
	this.damage = 2;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
	this.agro = false;
	this.dead = false;
}

function kobold() {
	this.type = 'monster';
	this.name = 'kobold';
	this.exp = 6;
	this.health = 8;
	this.AC = 0;
	this.damage = 3;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
	this.agro = false;
	this.dead = false;
}

function goblin() {
	this.type = 'monster';
	this.name = 'goblin';
	this.exp = 10;
	this.health = 12;
	this.AC = 1;
	this.damage = 3;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
	this.agro = false;
	this.dead = false;
}

function ogre() {
	this.type = 'monster';
	this.name = 'ogre';
	this.exp = 20;
	this.health = 20;
	this.AC = 3;
	this.damage = 8;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
	this.agro = false;
	this.dead = false;
}

function dragon() {
	this.type = 'monster';
	this.name = 'dragon';
	this.exp = 40;
	this.health = 35;
	this.AC = 6;
	this.damage = 15;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
	this.agro = false;
	this.dead = false;
}

var beastiary = {
	0: [ rat ],
	1: [ rat, kobold ],
	2: [ rat, kobold, goblin ],
	3: [ rat, kobold, goblin, ogre ],
	4: [ rat, goblin, ogre ],
	5: [ kobold, goblin, ogre ],
	6: [ goblin, ogre ],
	7: [ ogre ],
	8: [ ogre, dragon ],
	9: [ dragon ],
	10: [ dragon ]
};

//items
function health() {
	this.type = 'inventory';
	this.name = 'health';
	this.addhealth = 10;
	this.adddamage = 0;
	this.addexp = 2;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
}

function damage() {
	this.type = 'inventory';
	this.name = 'damage';
	this.addhealth = 0;
	this.adddamage = 2;
	this.addexp = 5;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
}

function exp() {
	this.type = 'inventory';
	this.name = 'exp';
	this.addhealth = 0;
	this.adddamage = 2;
	this.addexp = 20;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
}

function backpack() {
	this.type = 'inventory';
	this.name = 'backpack';
	this.addhealth = 15;
	this.adddamage = 3;
	this.addexp = 25;
	this.xcoor = null;
	this.ycoor = null;
	this.prevxcoor = null;
	this.prevycoor = null;
	this.lastsquare = 'room';
}
//***************LEVELGEN************* */

function getMon() {
	var which = Math.floor(Math.random() * beastiary[currentFloor].length);
	var mon = new beastiary[currentFloor][which]();
	return mon;
}

function generateLevel() {
	ready = false;
	level = [];
	levelWeights = [];
	roomids = [];
	exit = false;
	entrance = false;
	exitcoor = {};
	entcoor = {};

	var roomStyle;
	var wallStyle;

	switch (currentFloor) {
		case 0:
			roomStyle = 'roomForest';
			wallStyle = 'wallForest';
			var vchance = function() {
				return 1;
			};
			var hchance = function() {
				return 1;
			};
			attempts = 500;
			maxroom = 3;
			minroom = 1;
			break;
		case 1:
			roomStyle = 'roomForest';
			wallStyle = 'wallForest';
			var vchance = function() {
				return 1;
			};
			var hchance = function() {
				return 1;
			};
			attempts = 500;
			maxroom = 5;
			minroom = 3;
			break;
		case 2:
			roomStyle = 'roomCave';
			wallStyle = 'wallCave';
			var vchance = function() {
				return 0;
			};
			var hchance = function() {
				return 1;
			};
			xLevel = 61;
			attempts = 40;
			yLevel = 41;
			maxroom = 15;
			minroom = 7;
			break;
		case 3:
			roomStyle = 'roomCave';
			wallStyle = 'wallCave';
			var vchance = function() {
				return 0;
			};
			var hchance = function() {
				return 1;
			};
			xLevel = 61;
			attempts = 40;
			yLevel = 41;
			maxroom = 11;
			minroom = 9;
			break;
		case 4:
			roomStyle = 'roomDung';
			wallStyle = 'wallDung';
			var vchance = function() {
				return 1;
			};
			var hchance = function() {
				return Math.floor(Math.random() * 1.1);
			};
			xLevel = 71;
			attempts = 200;
			yLevel = 51;
			maxroom = 5;
			minroom = 1;
			break;
		case 5:
			roomStyle = 'roomDung';
			wallStyle = 'wallDung';
			var vchance = function() {
				return 1;
			};
			var hchance = function() {
				return Math.floor(Math.random() * 1.1);
			};
			xLevel = 71;
			attempts = 200;
			yLevel = 51;
			maxroom = 5;
			minroom = 1;
			break;
		case 6:
			roomStyle = 'roomCastle';
			wallStyle = 'wallCastle';
			var vchance = function() {
				return 1;
			};
			var hchance = function() {
				return Math.floor(Math.random() * 1.5);
			};
			xLevel = 71;
			attempts = 100;
			yLevel = 51;
			maxroom = 11;
			minroom = 9;
			break;
		case 7:
			roomStyle = 'roomCastle';
			wallStyle = 'wallCastle';
			var vchance = function() {
				return Math.floor(Math.random() * 2);
			};
			var hchance = function() {
				return 1;
			};
			xLevel = 71;
			attempts = 100;
			yLevel = 51;
			maxroom = 11;
			minroom = 9;
			break;
		case 8:
			roomStyle = 'roomArchives';
			wallStyle = 'wallArchives';
			var vchance = function() {
				return 1;
			};
			var hchance = function() {
				return 0;
			};
			xLevel = 71;
			attempts = 100;
			yLevel = 51;
			maxroom = 11;
			minroom = 9;
			break;
		case 9:
			roomStyle = 'roomArchives';
			wallStyle = 'wallArchives';
			var vchance = function() {
				return 1;
			};
			var hchance = function() {
				return 0;
			};
			xLevel = 71;
			attempts = 100;
			yLevel = 51;
			maxroom = 11;
			minroom = 3;
			break;
		case 10:
			roomStyle = 'roomThrone';
			wallStyle = 'wallThrone';
			var vchance = function() {
				return 1;
			};
			var hchance = function() {
				return 1;
			};
			xLevel = 61;
			attempts = 100;
			yLevel = 41;
			maxroom = 17;
			minroom = 15;
			break;
		default:
			break;
	}

	//attempts = attempts * (currentFloor + 1)

	// make an empty level plane
	for (var y = 0; y < yLevel; y++) {
		var row = [];
		var rowWeights = [];
		for (var x = 0; x < xLevel; x++) {
			row.push({
				xcoor: x,
				ycoor: y,
				value: 'wall',
				style: wallStyle,
				id: -1,
				bindings: 0,
				width: 0,
				height: 0,
				xstart: 0,
				ystart: 0,
				things: [],
				revealed: false
			});
			rowWeights.push(0);
		}
		level.push(row);
		levelWeights.push(rowWeights);
	}

	//sprinkle with rooms
	for (var i = 0; i < attempts; i++) {
		//odd positioned...
		var rndX = Math.floor(Math.random() * (xLevel - 1));
		var rndY = Math.floor(Math.random() * (yLevel - 1));
		if (!(rndX % 2)) {
			rndX++;
		}
		if (!(rndY % 2)) {
			rndY++;
		}

		// and odd sized rectangle
		var rndHeight = Math.floor(Math.random() * (maxroom - minroom)) + minroom;
		var rndWidth = Math.floor(Math.random() * (maxroom - minroom)) + minroom;
		if ((currentFloor == 9 || currentFloor == 8) && rndWidth == 3) {
			rndHeight = 19;
		}
		if ((currentFloor == 5 || currentFloor == 4) && rndWidth == 1) {
			rndHeight = 19;
		}
		if ((currentFloor == 5 || currentFloor == 4) && rndHeight == 1) {
			rndWidth = 19;
		}

		if (!(rndHeight % 2)) {
			rndHeight++;
		}
		if (!(rndWidth % 2)) {
			rndWidth++;
		}

		//check if in boundaries
		if (!(rndX + rndWidth > xLevel || rndY + rndHeight > yLevel)) {
			//check if space is empty
			var empty = true;
			for (var x = rndX; x < rndX + rndWidth; x++) {
				for (var y = rndY; y < rndY + rndHeight; y++) {
					if (level[y][x].value != 'wall') {
						empty = false;
					}
				}
			}

			//draw square
			if (empty) {
				//save ID
				roomids.push(i);
				for (var x = rndX; x < rndX + rndWidth; x++) {
					for (var y = rndY; y < rndY + rndHeight; y++) {
						level[y][x].value = 'room';
						level[y][x].style = roomStyle;
						level[y][x].id = i;
						level[y][x].width = rndWidth;
						level[y][x].height = rndHeight;
						level[y][x].xstart = rndX;
						level[y][x].ystart = rndY;
						levelWeights[y][x] = 1;
					}
				}
				if (currentFloor == 0 || currentFloor == 1) {
					//level[rndY + rndHeight - 1][rndX + rndWidth - 1].value = 'wall'
				}
			}
		}
	}
	//incoming massive nested chunks of code...
	//get two different squares
	var currentId = -1;
	var nextId = -1;
	var lineFrom = [ -1, -1 ];
	var lineTo = [ -1, -1 ];

	//horizontal connections

	for (var y1 = 0; y1 < yLevel - 1; y1++) {
		for (var x1 = 0; x1 < xLevel - 1; x1++) {
			if (level[y1][x1].id > -1 && level[y1][x1].bindings < 1) {
				// mark box as used
				for (var ecks = x1; ecks < x1 + level[y1][x1].width; ecks++) {
					for (var why = y1; why < y1 + level[y1][x1].height; why++) {
						level[why][ecks].bindings++;
					}
				}

				if (hchance() == 1) {
					//set starting point
					currentId = level[y1][x1].id;
					lineFrom = [
						level[y1][x1].xstart + Math.floor(level[y1][x1].width / 2),
						level[y1][x1].ystart + Math.floor(level[y1][x1].height / 2)
					];

					//find next square
					for (var y2 = 0; y2 < yLevel - 1; y2++) {
						for (var x2 = 0; x2 < xLevel - 1; x2++) {
							if (level[y2][x2].id > -1 && level[y2][x2].bindings < 1) {
								// mark the next box as "used"
								for (
									var ecks = x2;
									ecks < x2 + level[y2][x2].width;
									ecks++
								) {
									for (
										var why = y2;
										why < y2 + level[y2][x2].height;
										why++
									) {
										level[why][ecks].bindings++;
									}
								}
								//set endpoint
								nextId = level[y2][x2].id;
								lineTo = [
									level[y2][x2].xstart +
										Math.floor(level[y2][x2].width / 2),
									level[y2][x2].ystart +
										Math.floor(level[y2][x2].height / 2)
								];

								//join them with a "line"
								var reached = false;
								var lineX = lineTo[0] - lineFrom[0];
								var lineY = lineTo[1] - lineFrom[1];
								level[lineFrom[1]][lineFrom[0]].value = 'room';
								level[lineFrom[1]][lineFrom[0]].style = roomStyle;
								levelWeights[lineFrom[1]][lineFrom[0]] = 1;

								while (lineX != 0 || lineY != 0) {
									var rnd = Math.floor(Math.random() * 2);
									if (rnd && lineX != 0) {
										if (lineX < 0) {
											lineX++;
											lineFrom[0]--;
										} else {
											lineX--;
											lineFrom[0]++;
										}
									} else if (lineY != 0) {
										if (lineY < 0) {
											lineY++;
											lineFrom[1]--;
										} else {
											lineY--;
											lineFrom[1]++;
										}
									}
									level[lineFrom[1]][lineFrom[0]].value = 'room';
									level[lineFrom[1]][lineFrom[0]].style = roomStyle;
									levelWeights[lineFrom[1]][lineFrom[0]] = 1;
								}
							}
						}
					}
				}
			}
		}
	}

	//vertical connections

	for (var x1 = 0; x1 < xLevel - 1; x1++) {
		for (var y1 = 0; y1 < yLevel - 1; y1++) {
			if (level[y1][x1].id > -1 && level[y1][x1].bindings < 2) {
				// mark box as used
				for (var why = y1; why < y1 + level[y1][x1].height; why++) {
					for (var ecks = x1; ecks < x1 + level[y1][x1].width; ecks++) {
						level[why][ecks].bindings++;
					}
				}
				if (vchance() == 1) {
					//set starting point
					currentId = level[y1][x1].id;
					lineFrom = [
						level[y1][x1].xstart + Math.floor(level[y1][x1].width / 2),
						level[y1][x1].ystart + Math.floor(level[y1][x1].height / 2)
					];

					//find next square
					for (var x2 = 0; x2 < xLevel - 1; x2++) {
						for (var y2 = 0; y2 < yLevel - 1; y2++) {
							if (level[y2][x2].id > -1 && level[y2][x2].bindings < 2) {
								// mark the next box as "used"
								for (
									var ecks = x2;
									ecks < x2 + level[y2][x2].width;
									ecks++
								) {
									for (
										var why = y2;
										why < y2 + level[y2][x2].height;
										why++
									) {
										level[why][ecks].bindings++;
									}
								}
								//set endpoint
								nextId = level[y2][x2].id;
								lineTo = [
									level[y2][x2].xstart +
										Math.floor(level[y2][x2].width / 2),
									level[y2][x2].ystart +
										Math.floor(level[y2][x2].height / 2)
								];

								//join them with a "line"
								var reached = false;
								var lineX = lineTo[0] - lineFrom[0];
								var lineY = lineTo[1] - lineFrom[1];
								level[lineFrom[1]][lineFrom[0]].value = 'room';
								level[lineFrom[1]][lineFrom[0]].style = roomStyle;
								levelWeights[lineFrom[1]][lineFrom[0]] = 1;

								while (lineX != 0 || lineY != 0) {
									var rnd = Math.floor(Math.random() * 2);
									if (rnd && lineX != 0) {
										if (lineX < 0) {
											lineX++;
											lineFrom[0]--;
										} else {
											lineX--;
											lineFrom[0]++;
										}
									} else if (lineY != 0) {
										if (lineY < 0) {
											lineY++;
											lineFrom[1]--;
										} else {
											lineY--;
											lineFrom[1]++;
										}
									}
									level[lineFrom[1]][lineFrom[0]].value = 'room';
									level[lineFrom[1]][lineFrom[0]].style = roomStyle;
									levelWeights[lineFrom[1]][lineFrom[0]] = 1;
								}
							}
						}
					}
				}
			}
		}
	}

	//define exit/entrance
	if (!exit) {
		for (var y = 0; y < yLevel; y++) {
			for (var x = 0; x < xLevel; x++) {
				if (!exit && level[y][x].id == roomids[roomids.length - 1]) {
					level[y + level[y][x].height / 2 - 0.5][
						x + level[y][x].width / 2 - 0.5
					].value =
						'exit';
					level[y + level[y][x].height / 2 - 0.5][
						x + level[y][x].width / 2 - 0.5
					].style =
						'exit';
					exitcoor.xcoor = x + level[y][x].width / 2 - 0.5;
					exitcoor.ycoor = y + level[y][x].height / 2 - 0.5;
					levelWeights[y + level[y][x].height / 2 - 0.5][
						x + level[y][x].width / 2 - 0.5
					] = 1;
					exit = true;
				}
				if (!entrance && level[y][x].id == roomids[0]) {
					level[y + level[y][x].height / 2 - 0.5][
						x + level[y][x].width / 2 - 0.5
					].value =
						'entrance';
					level[y + level[y][x].height / 2 - 0.5][
						x + level[y][x].width / 2 - 0.5
					].style =
						'entrance';
					entcoor.xcoor = x + level[y][x].width / 2 - 0.5;
					entcoor.ycoor = y + level[y][x].height / 2 - 0.5;
					levelWeights[y + level[y][x].height / 2 - 0.5][
						x + level[y][x].width / 2 - 0.5
					] = 1;
					entrance = true;
				}
			}
		}
	}

	// one extra empty row
	var row = [];
	for (var x = 0; x < xLevel; x++) {
		row.push({
			xcoor: x,
			ycoor: y,
			value: 'empty',
			id: -1,
			bindings: 0,
			width: 0,
			height: 0,
			xstart: 0,
			ystart: 0,
			things: []
		});
	}

	//monsters and items
	var monsters = [];
	var items = [];
	for (var y = 0; y < yLevel; y++) {
		for (var x = 0; x < xLevel; x++) {
			if (level[y][x].value == 'room') {
				var rndMon = Math.max(0, Math.floor(Math.random() * 200) - 198);
				var rndItem = Math.max(0, Math.floor(Math.random() * 500) - 498);
				if (rndMon) {
					var newMon = getMon();

					newMon.xcoor = x;
					newMon.ycoor = y;
					monsters.push(newMon);
					level[y][x].things.unshift(newMon);
				}
				if (rndItem) {
					var itemWhich = Math.max(
						0,
						Math.floor(Math.random() * 5000) - 4998
					)
						? new backpack()
						: Math.floor(Math.random() * 2) ? new health() : new damage();
					itemWhich.xcoor = x;
					itemWhich.ycoor = y;
					items.push(itemWhich);
					level[y][x].things.push(itemWhich);
				}
			}
		}
	}

	level.push(row);
	floors[currentFloor] = {
		level: level,
		levelweights: levelWeights,
		entcoor: entcoor,
		exitcoor: exitcoor,
		monsters: monsters,
		items: items,
		xLevel: xLevel,
		yLevel: yLevel
	};

	setTimeout(() => {
		ready = true;
	}, 200);
}

// React
// *******************Main Frame*******************

class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			overlay: null,
			screen: null
		};

		this.level = null;
		this.panx = 0;
		this.pany = 0;
		this.xStart = player.xcoor - xScreen / 2;
		this.yStart = player.ycoor - yScreen / 2;
		this.handlePan = this.handlePan.bind(this);
	}

	componentDidMount() {
		generateLevel();
		this.setFocus();
		setTimeout(() => {
			player.xcoor = entcoor.xcoor;
			player.ycoor = entcoor.ycoor;
			player.prevxcoor = entcoor.xcoor;
			player.prevycoor = entcoor.ycoor;
			player.lastsquare = 'entrance';
			this.level = level;
			this.updatePosition();
			this.moveScreen();
		}, 200);
	}

	updatePosition() {
		this.level[player.ycoor][player.xcoor].things.unshift(player);
		//monster AI
		floors[currentFloor].monsters.forEach((monster) => {
			console.log(monster);
			if (!monster.dead) {
				//check health, "die" if dead
				if (monster.health <= 0) {
					player.experience += monster.exp;
					monster.dead = true;
					//remove from square
					this.level[monster.ycoor][monster.xcoor].things.splice(0, 1);
					levelWeights[monster.ycoor][monster.xcoor] = 1;
				} else if (this.level[monster.ycoor][monster.xcoor].revealed) {
					this.level[monster.ycoor][monster.xcoor].things.splice(0, 1);
					levelWeights[monster.ycoor][monster.xcoor] = 1;

					//pathfinding ( A* )
					var graph = new Graph(levelWeights);
					var start = graph.grid[monster.ycoor][monster.xcoor];
					var end = graph.grid[player.ycoor][player.xcoor];
					var result = astar.search(graph, start, end);
					if (result[0] != null) {
						var monX = result[0].y;
						var monY = result[0].x;
						var things = this.level[monY][monX].things;
						if (things[0] == player) {
							player.health -= monster.damage;
							console.log('DAMN THAT HURT');
							if (player.health <= 0) {
								console.log('dam son');
							}
						} else if (things[0] == null) {
							//if (this.level[monY][monX].value == "room") { // A* already dealt with it
							monster.xcoor = monX;
							monster.ycoor = monY;
							this.moveScreen();
						}
					}

					this.level[monster.ycoor][monster.xcoor].things.unshift(monster);
					levelWeights[monster.ycoor][monster.xcoor] = 0;
				}
			}
		});
		if (player.health <= 0) {
			this.lose();
		}
		if (player.experience > 100) {
			player.level++;
			player.experience = 0;
			player.maxhealth += 10;
			player.health = player.maxhealth;
			player.damage += 3;
		}
		this.renderScreen();
	}

	renderScreen() {
		this.setState({
			screen: (
				<Screen
					class="screen"
					level={this.level}
					xstart={this.xStart}
					ystart={this.yStart}
				/>
			)
		});
	}

	lose() {
		document.getElementById('botbar').innerHTML = 'You Died.';
	}

	win() {
		document.getElementById('botbar').innerHTML = 'You Defeated!';
	}

	movePlayer(x, y) {
		if (player.health < player.maxhealth) {
			if (--tick == 0) {
				player.health++;
				tick = 5;
			}
		}

		var plX = player.xcoor;
		var plY = player.ycoor;
		var things = this.level[plY][plX].things;
		things.splice(0, 1);
		this.panx = 0;
		this.pany = 0;

		if (plX + x >= 0 && plX + x < xLevel) {
			plX += x;
		}
		if (plY + y >= 0 && plY + y < yLevel) {
			plY += y;
		}
		var things = this.level[plY][plX].things;

		if (things[0] != null) {
			if (things[0].type == 'monster') {
				things[0].health -= player.damage;
			} else if (things[0].type == 'inventory') {
				player.damage += things[0].adddamage;
				player.health += things[0].addhealth;
				if (player.health > player.maxhealth) {
					player.health = player.maxhealth;
				}
				player.experience += things[0].addexp;
				things.shift();
				player.xcoor = plX;
				player.ycoor = plY;
				this.moveScreen();
			}
			this.updatePosition();
		} else if (this.level[plY][plX].value == 'room') {
			player.xcoor = plX;
			player.ycoor = plY;

			this.updatePosition();
			this.moveScreen();
		} else if (level[plY][plX].value == 'entrance') {
			if (currentFloor - 1 >= 0) {
				ready = false;
				currentFloor--;
				level = floors[currentFloor].level;
				levelWeights = floors[currentFloor].levelweights;
				entcoor = floors[currentFloor].entcoor;
				exitcoor = floors[currentFloor].exitcoor;
				xLevel = floors[currentFloor].xLevel;
				yLevel = floors[currentFloor].yLevel;
				this.level = level;
				player.xcoor = exitcoor.xcoor;
				player.ycoor = exitcoor.ycoor;
				player.lastsquare = 'exit';
				this.moveScreen();
				this.updatePosition();

				setTimeout(() => {
					ready = true;
				}, 200);
			}
		} else if (level[plY][plX].value == 'exit') {
			ready = false;
			if (currentFloor + 1 > depth) {
				if (currentFloor + 1 <= maxDepth) {
					currentFloor++;
					console.log('generating new level ' + currentFloor);
					depth++;
					generateLevel();
				} else {
					this.win();
				}
			} else {
				currentFloor++;
				console.log('level ' + currentFloor);
				level = floors[currentFloor].level;
				levelWeights = floors[currentFloor].levelweights;
				entcoor = floors[currentFloor].entcoor;
				exitcoor = floors[currentFloor].exitcoor;
				xLevel = floors[currentFloor].xLevel;
				yLevel = floors[currentFloor].yLevel;
			}
			this.level = level;
			player.xcoor = entcoor.xcoor;
			player.ycoor = entcoor.ycoor;
			player.lastsquare = 'entrance';
			this.moveScreen();
			this.updatePosition();

			setTimeout(() => {}, 100);
			setTimeout(() => {
				ready = true;
			}, 200);
		}
	}

	moveScreen(panx, pany) {
		var xStart = player.xcoor - xScreen / 2 + 0.5;
		var yStart = player.ycoor - yScreen / 2 + 0.5;
		//keep screen inside level
		while (xStart < 0) {
			xStart++;
		}
		while (yStart < 0) {
			yStart++;
		}
		while (xStart + xScreen > xLevel) {
			xStart--;
		}
		while (yStart + yScreen > yLevel) {
			yStart--;
		}

		//check panning
		if (panx > 0 && xStart + this.panx + xScreen < xLevel) {
			this.panx++;
		}
		if (pany > 0 && yStart + this.pany + yScreen < yLevel) {
			this.pany++;
		}
		if (panx < 0 && xStart + this.panx - 1 >= 0) {
			this.panx--;
		}
		if (pany < 0 && yStart + this.pany - 1 >= 0) {
			this.pany--;
		}

		yStart += this.pany;
		xStart += this.panx;
		this.xStart = xStart;
		this.yStart = yStart;
		this.renderScreen();
	}

	handlePan(e) {
		if (ready && player.health > 0) {
			switch (e.key) {
				case 'w':
					this.movePlayer(0, -1);
					break;
				case 's':
					this.movePlayer(0, +1);
					break;
				case 'a':
					this.movePlayer(-1, 0);
					break;
				case 'd':
					this.movePlayer(+1, 0);
					break;
				case 'i':
					this.moveScreen(0, -1);
					break;
				case 'k':
					this.moveScreen(0, +1);
					break;
				case 'j':
					this.moveScreen(-1, 0);
					break;
				case 'l':
					this.moveScreen(+1, 0);
					break;
			}
		}
	}

	setFocus() {
		this.refs.main.focus();
	}

	render() {
		return (
			<div id="main" tabIndex="1" ref="main" onKeyPress={this.handlePan}>
				{this.state.screen}
			</div>
		);
	}
}

// ******************Screen*******************

class Screen extends React.Component {
	constructor(props) {
		super(props);
		this.state = { image: null };
		this.viewport = [];
		this.panx = 0;
		this.pany = 0;
		this.update = false;
	}

	cropViewport(xStart, yStart) {
		var nextViewport = [];
		for (var y = yStart; y < yStart + yScreen; y++) {
			var viewRow = [];
			for (var x = xStart; x < xStart + xScreen; x++) {
				if (this.props.level[y][x].things[0] != null) {
					viewRow.push(this.props.level[y][x].things[0].name);
				} else {
					viewRow.push(this.props.level[y][x].value);
				}
			}
			nextViewport.push(viewRow);
		}
		this.viewport = nextViewport;
	}

	//               *******            FOV           *********

	handleFov() {
		var posX = player.xcoor;
		var posY = player.ycoor;
		var circle = [ { x: radius + posX, y: posY } ];

		//define vision perimeter
		for (var i = 2; i <= 360; i += 2) {
			var entryY = Math.round(Math.sin(i / 180 * Math.PI) * radius);
			var entryX = Math.round(Math.cos(i / 180 * Math.PI) * radius);
			var entry = {
				x: Math.min(xLevel - 1, Math.max(0, entryX + posX)),
				y: Math.min(yLevel - 1, Math.max(0, entryY + posY))
			};
			circle.push(entry);
		}

		//remove repeating
		var j = 1;
		while (j < circle.length) {
			if (circle[j - 1].x == circle[j].x && circle[j - 1].y == circle[j].y) {
				circle.splice(j, 1);
			} else {
				j++;
			}
		}

		var visible = [];

		function round(num) {
			//if (num % 1 < 0.5) { return Math.floor(num) } else
			{
				return Math.round(num);
			}
		}

		//draw lines to every point of perimeter
		circle.forEach((item) => {
			var deltaX = item.x - posX;
			var deltaY = item.y - posY;

			//split circle into 8 parts, divided by vertical, horizontal and diagonal "lines"

			// horizontal and vertical divisors
			if (deltaY == 0) {
				if (deltaX > 0) {
					for (var x = posX; x <= item.x; x++) {
						var entry = { x: x, y: posY };
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
				if (deltaX < 0) {
					for (var x = posX; x >= item.x; x--) {
						var entry = { x: x, y: posY };
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
			} else if (deltaX == 0) {
				if (deltaY > 0) {
					for (var y = posY; y <= item.y; y++) {
						var entry = { x: posX, y: y };
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
				if (deltaY < 0) {
					for (var y = posY; y >= item.y; y--) {
						var entry = { x: posX, y: y };
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
			} else if (deltaX == -deltaY) {
				//diagonal divisors
				// top right divisor
				if (deltaX > 0) {
					var x = posX;
					for (var y = posY; y >= item.y; y--) {
						var entry = { x: x, y: y };
						x++;
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				} else {
					//bottom left divisor
					var x = posX;
					for (var y = posY; y <= item.y; y++) {
						var entry = { x: x, y: y };
						x--;
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
			} else if (deltaX == deltaY) {
				//top left divisor
				if (deltaX < 0) {
					var x = posX;
					for (var y = posY; y >= item.y; y--) {
						var entry = { x: x, y: y };
						x--;
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				} else {
					//bottom right divisor
					if (deltaX > 0) {
						var x = posX;
						for (var y = posY; y <= item.y; y++) {
							var entry = { x: x, y: y };
							x++;
							visible.push(entry);
							level[entry.y][entry.x].revealed = true;
							if (level[entry.y][entry.x].value == 'wall') {
								break;
							}
						}
					}
				}
			} else if (deltaX > 0 && deltaY > 0) {
				//octants clockwise, starting from "3 o'clock"

				// bottom right
				if (deltaX > deltaY) {
					for (var x = 0; x <= item.x - posX; x++) {
						var entry = {
							x: x + posX,
							y: round(deltaY / deltaX * x) + posY
						};
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				} else {
					for (var y = 0; y <= item.y - posY; y++) {
						var entry = {
							x: round(deltaX / deltaY * y) + posX,
							y: y + posY
						};
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
			} else if (deltaX < 0 && deltaY > 0) {
				// bottom left
				if (-deltaX > deltaY) {
					for (var x = 0; x >= item.x - posX; x--) {
						var entry = {
							x: x + posX,
							y: round(deltaY / deltaX * x) + posY
						};
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				} else {
					for (var y = 0; y <= item.y - posY; y++) {
						var entry = {
							x: round(deltaX / deltaY * y) + posX,
							y: y + posY
						};
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
			} else if (deltaX < 0 && deltaY < 0) {
				//top left
				if (deltaX < deltaY) {
					for (var x = 0; x >= item.x - posX; x--) {
						var entry = {
							x: x + posX,
							y: round(deltaY / deltaX * x) + posY
						};
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				} else {
					for (var y = 0; y >= item.y - posY; y--) {
						var entry = {
							x: round(deltaX / deltaY * y) + posX,
							y: y + posY
						};
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
			} else if (deltaX > 0 && deltaY < 0) {
				//top right
				if (deltaX > -deltaY) {
					var slope = deltaY / deltaX;
					for (var x = 0; x <= item.x - posX; x++) {
						var entry = { x: x + posX, y: round(slope * x) + posY };
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				} else {
					var slope = deltaX / deltaY;
					for (var y = 0; y >= item.y - posY; y--) {
						var entry = { x: round(slope * y) + posX, y: y + posY };
						visible.push(entry);
						level[entry.y][entry.x].revealed = true;
						if (level[entry.y][entry.x].value == 'wall') {
							break;
						}
					}
				}
			}
		});

		//refinements
		visible.forEach((entry) => {
			if (level[entry.y][entry.x].value == 'room') {
				if (level[entry.y][entry.x - 1].value == 'wall') {
					visible.push({ x: entry.x - 1, y: entry.y });
					level[entry.y][entry.x - 1].revealed = true;
				}
				if (level[entry.y][entry.x + 1].value == 'wall') {
					visible.push({ x: entry.x + 1, y: entry.y });
					level[entry.y][entry.x + 1].revealed = true;
				}
				if (level[entry.y - 1][entry.x - 1] == 'wall') {
					visible.push({ x: entry.x - 1, y: entry.y - 1 });
				}
				if (level[entry.y - 1][entry.x].value == 'wall') {
					visible.push({ x: entry.x, y: entry.y - 1 });
					level[entry.y - 1][entry.x].revealed = true;
				}
				if (level[entry.y - 1][entry.x + 1] == 'wall') {
					visible.push({ x: entry.x + 1, y: entry.y - 1 });
				}
				if (level[entry.y + 1][entry.x - 1] == 'wall') {
					visible.push({ x: entry.x - 1, y: entry.y + 1 });
				}
				if (level[entry.y + 1][entry.x].value == 'wall') {
					visible.push({ x: entry.x, y: entry.y + 1 });
					level[entry.y + 1][entry.x].revealed = true;
				}
				if (level[entry.y + 1][entry.x + 1] == 'wall') {
					visible.push({ x: entry.x - 1, y: entry.y + 1 });
				}
			}
		});

		// print it
		var nextViewport = [];
		for (var y = this.props.ystart; y < this.props.ystart + yScreen; y++) {
			var viewRow = [];
			for (var x = this.props.xstart; x < this.props.xstart + xScreen; x++) {
				var matchVis = false;
				visible.forEach((entry) => {
					if (entry.x == x && entry.y == y) {
						matchVis = true;
					}
				});

				if (matchVis) {
					if (this.props.level[y][x].things[0] != null) {
						viewRow.push(this.props.level[y][x].things[0].name);
					} else {
						viewRow.push(this.props.level[y][x].style);
					}
				} else if (level[y][x].revealed) {
					viewRow.push(this.props.level[y][x].style + ' fog');
				} else {
					viewRow.push('shadow');
				}
			}
			nextViewport.push(viewRow);
		}
		this.viewport = nextViewport;
	}

	genImage() {
		var imageArr = [];
		var pixId = 0;
		var rowId = 0;
		for (var y = 0; y < yScreen; y++) {
			var row = [];
			for (var x = 0; x < xScreen; x++) {
				row.push(
					<div className={'pixel ' + this.viewport[y][x]} key={pixId} />
				);
				pixId++;
			}
			row = (
				<div className="row" key={rowId}>
					{row}
				</div>
			);
			rowId++;
			imageArr.push(row);
		}
		this.setState({ image: imageArr });
	}

	componentWillReceiveProps() {
		this.update = true;
	}

	componentDidUpdate() {
		if (this.update) {
			this.cropViewport(this.props.xstart, this.props.ystart);
			this.handleFov();
			requestAnimationFrame(() => {
				this.genImage();
			});
			this.update = false;
		}
	}

	componentDidMount() {
		requestAnimationFrame(() => {
			this.cropViewport(this.props.xstart, this.props.ystart);
			this.handleFov();
			this.genImage();
		});
	}

	render() {
		return (
			<div id="screen" onKeyPress={this.pan}>
				<span id="topbar">
					Health: {player.health} // Damage: {player.damage} // Level:{' '}
					{player.level}
				</span>
				{this.state.image}
				<span id="botbar">...</span>
			</div>
		);
	}
}

ReactDOM.render(<Main />, document.getElementById('root'));

/*document.getElementById("screen").addEventListener("blur", function () {
   this.focus()
})*/
