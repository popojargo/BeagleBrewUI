// import * as BrewGridActions from '../actions/BrewGridActions';

class BrewGridInit {
    constructor(brewAssets) {
        this.assetGrid = [];
        this.tankGrid = [];
        this.brewAssets = brewAssets;
        this.initializeGrid();
    }
    getAssetGrid() {
        return this.assetGrid.slice(0);
    }
    getTankGrid() {
        return this.tankGrid.slice(0);
    }
    initializeGrid() {
        // TODO: find the highest X and Y of brewAssets to build the assetGrid

        for(let i = 0; i < 14; i++) {
            let gridRow = [];
            for(let j = 0; j < 19; j++) {
                gridRow.push(null);
            }
            this.assetGrid.push(gridRow);
        }

        const tanks = this.filterAsset("tank");
        for(const tank of tanks) {
            this.addTank(tank);
        }

        const tubes = this.filterAsset("tube");
        for(const tube of tubes) {
            this.placeTube(tube.path);
        }

        const miscs = this.filterAsset("misc");
        for(const misc of miscs) {
            this.addMiscAsset(misc);
        }

        this.cleanupData();
    }
    addTank(tank) {
        let i;
        for(i = 0; i < tank.inputs.length; i++) {
            this.placeInputOutput(tank.inputs[i], tank.x, tank.y);
        }
        for(i = 0; i < tank.outputs.length; i++) {
            this.placeInputOutput(tank.outputs[i], tank.x, tank.y);
        }

        delete tank.type;
        tank.x--;
        tank.y--;
        tank.assetId = "tank";
        this.tankGrid.push(tank);
    }
    placeInputOutput(data, x, y) {
        var tubeY = data.y;
        var tubeX = data.x;
        var testY = tubeY - y;
        var testX = tubeX - x;

        var rotation = 0;
        if(testX < 0) {
            // X left or middle
            if(tubeX < x) {
                rotation = 180;
            } else {
                if (testY < 0) {
                    // Y top or middle
                    if(tubeY < y) {
                        rotation = 270;
                    } else {
                        return;
                    }
                } else {
                    rotation = 90;
                }
            }
        }

        var gridData = {};
        gridData.assetId = "t1";
        gridData.rotation = rotation;
        gridData.posTubing = -1;
        this.assetGrid[tubeY-1][tubeX-1] = gridData;
    }
    placeTube(tubePath) {
        for(var i = 1; i < tubePath.length; i++) {
            var yDelta = tubePath[i].y - tubePath[i-1].y;
            var xDelta = tubePath[i].x - tubePath[i-1].x;

            var yLength = Math.abs(yDelta);
            var xLength = Math.abs(xDelta);
            var max = yLength;
            var isVertical = true;
            if(max === 0 && xLength !== 0) {
                max = xLength;
                isVertical = false;
            } else if(max + xLength === 0) {
                console.log("yLength: " + yLength);
                console.log("xLength: " + xLength);
                return;
            }

            for(var j = 0; j <= max; j++) {
                var pos = isVertical ? yDelta : xDelta;
                var oldPos = isVertical ? tubePath[i-1].y : tubePath[i-1].x;
                var posDir = pos / Math.abs(pos);
                pos = oldPos + j * posDir;
                var posTubing = (j === 0 || j === max) ? 1 : 0;
                posTubing *= j === 0 ? -1 : 1;
                if(isVertical) {
                    this.addTubePiece(pos, tubePath[i].x, posDir, isVertical, posTubing);
                } else {
                    this.addTubePiece(tubePath[i].y, pos, posDir, isVertical, posTubing);
                }
            }
        }
    }
    addTubePiece(y, x, posDir, isVertical, posTubing) {
        y--;
        x--;
        var data = {};
        data.assetId = "t1";
        data.posTubing = posTubing;
        data.rotation = isVertical ? 90 : 0;
        data.rotation += 180 * (1 - posDir) / 2;
        data.rotation %= 360;
        if(this.assetGrid[y][x] != null) {
            var gridData = this.assetGrid[y][x];
            switch(gridData.assetId) {
                // Default
                case "t1":
                // set tconnector
                data.assetId = "t3";
                var modRotation = data.rotation + 180 * (1 - posTubing) / 2;
                modRotation %= 360;
                data.rotation = 90 + modRotation;
                data.rotation %= 360;
                if(posTubing) {
                    if(gridData.posTubing) {
                        // curved
                        data.assetId = "t2"
                        switch(gridData.rotation + modRotation) {
                            case 270:
                            data.rotation = gridData.rotation * modRotation ? 180 : 0;
                            break;
                            case 90:
                            data.rotation = 90;
                            break;
                            case 450:
                            data.rotation = 270;
                            break;
                            default:
                            data.rotation = 0;
                            data.assetId = "t1";
                        }
                    }
                } else {
                    if(!gridData.posTubing) {
                        data.assetId = "t4";
                        data.rotation = 0;
                    }
                }
                break;
                // Curved
                case "t2":
                break;
                default:
                console.log(gridData.assetId);
            }
            data.posTubing = 0;
        }
        data.x = x + 1;
        data.y = y + 1;
        this.assetGrid[y][x] = data;
    }
    addMiscAsset(misc) {
        var x = misc.x - 1;
        var y = misc.y - 1;
        if(this.assetGrid[y][x] === null) {
            var data = {};
            data.rotation = 0;
            this.assetGrid[y][x] = data;
        }
        misc = Object.assign({}, this.assetGrid[y][x], misc);
        this.assetGrid[y][x] = misc;
    }
    cleanupData() {
        let cleanGrid = [];
        for(const row of this.assetGrid) {
            let cleanRow = [];
            for(const asset of row) {
                if(asset === null) {
                    cleanRow.push(null);
                    continue;
                }
                let cleanData = {
                    id: asset.id,
                    assetId: asset.assetId,
                    rotation: asset.rotation,
                    liquid: asset.liquid,
                    open: asset.open
                };
                cleanRow.push(cleanData);
            }
            cleanGrid.push(cleanRow);
        }
        this.assetGrid = cleanGrid;
    }
    sortNumbers(a, b) {
        return a - b;
    }
    getArrayElements(arr, isEven) {
        var a = [];
        var x = isEven ? 1 : 0;
        for(var i = x; i < arr.length; i+=2) {
            a.push(parseInt(arr[i], 10));
        }
        return a;
    }
	filterAsset(type) {
		return this.brewAssets.filter(obj => obj.type === type);
	}
}

export default BrewGridInit;
