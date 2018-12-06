var xMaxLevel = 70;
var yMaxLevel = 50;

var level = []

function generateLevel(){

    for ( var j = 1; j < yMaxLevel; j++ ){
        var row = []
        for ( var i = 1; i < xMaxLevel; i++) {
            var square = {xcoor: i, ycoor: j, value:'empty'}
            row.push(square)
        }
        level.push(row)
    }
	
}



