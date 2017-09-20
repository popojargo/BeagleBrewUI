/*
 * Creates a grid with all the brew assets
 */
class BrewGridInit {
    constructor(brewAssets) {
        this.assetGrid = [];
        this.tanks = [];
        this.brewAssets = brewAssets;
        this.initializeGrid();
    }
    // Getters
    getAssetGrid() {
        return this.assetGrid.slice(0);
    }
    getTanks() {
        console.log(this.tanks)
        return this.tanks.slice(0);
    }

    /**
     * Changes the asset at the specified position in the grid
     * @param {int}    x     Position on the x axis
     * @param {int}    y     Position on the y axis
     * @param {Object} asset Asset to be added
     */
    changeAssetGridAt(x, y, asset) {
        this.redimensionGrid(x + 1, y + 1);
        this.assetGrid[y][x] = asset;
    }

    /**
     * Redimensions the grid
     * @param {int} width  Width wanted
     * @param {int} height height wanted
     */
    redimensionGrid(width, height) {
        const gridHeight = this.assetGrid.length;
        if(gridHeight < height) this.addGridRow(height);

        const gridWidth = this.assetGrid[0].length;
        if(gridWidth < width) this.addGridCol(width);
    }

    /**
     * Adds rows the the grid until specified number of row
     * @param {int} nbRow Number of rows wanted
     */
    addGridRow(nbRow) {
        while(this.assetGrid.length < nbRow) {
            this.assetGrid.push([]);
        }
        this.addGridCol(this.assetGrid[0].length);
    }

    /**
     * Adds columns the the grid until specified number of columns
     * @param {int} nbCol Number of columns wanted
     */
    addGridCol(nbCol) {
        for(let row of this.assetGrid) {
            while(row.length < nbCol) {
                row.push(null);
            }
        }
    }

    /**
     * Starts the creation of the grid
     */
    initializeGrid() {
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

    /**
     * Adds a new tank to the tank grid
     * @param {Object} tank The tank to be added
     */
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
        this.tanks.push(tank);
    }
    /**
     * Places a placeholder tube connected to the tank
     * @param  {Object} data Data of the input
     * @param  {int}    x    Tank x position
     * @param  {int}    y    Tank y position
     */
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
                    }
                } else {
                    rotation = 90;
                }
            }
        }

        var assetData = {
            assetId: "t1",
            rotation: rotation,
            posTubing: -1
        };
        this.changeAssetGridAt(tubeX - 1, tubeY - 1, assetData);
    }

    /**
     * Places tubes on the specified path
     * @param  {Array} tubePath Pathing of a tube
     */
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

    /**
     * Adds a tube piece at the specified position
     * Will modify the tube type if there is a tube existing in the position
     * @param {int}     y          Position on the y axis
     * @param {int}     x          Position on the x axis
     * @param {int}     posDir     Direction of the tube
     * @param {Boolean} isVertical Is the tube vertical
     * @param {int}     posTubing  Is the tube at the end of its path
     */
    addTubePiece(y, x, posDir, isVertical, posTubing) {
        y--;
        x--;
        var asset = {};
        asset.assetId = "t1";
        asset.posTubing = posTubing;
        asset.rotation = isVertical ? 90 : 0;
        asset.rotation += 180 * (1 - posDir) / 2;
        asset.rotation %= 360;

        this.redimensionGrid(x + 1, y + 1);
        if(this.assetGrid[y][x] != null) {
            var gridData = this.assetGrid[y][x];
            switch(gridData.assetId) {
                // Default
                case "t1":
                    // set tconnector
                    asset.assetId = "t3";
                    var modRotation = asset.rotation + 180 * (1 - posTubing) / 2;
                    modRotation %= 360;
                    asset.rotation = 90 + modRotation;
                    asset.rotation %= 360;
                    if(posTubing) {
                        if(gridData.posTubing) {
                            // curved
                            asset.assetId = "t2";
                            switch(gridData.rotation + modRotation) {
                                case 270:
                                asset.rotation = gridData.rotation * modRotation ? 180 : 0;
                                break;
                                case 90:
                                asset.rotation = 90;
                                break;
                                case 450:
                                asset.rotation = 270;
                                break;
                                default:
                                asset.rotation = 0;
                                asset.assetId = "t1";
                            }
                        }
                    } else {
                        if(!gridData.posTubing) {
                            asset.assetId = "t4";
                            asset.rotation = 0;
                        }
                    }
                    break;
                // Curved
                case "t2":
                    break;
                default:
                    console.log(gridData.assetId);
            }
            asset.posTubing = 0;
        }
        asset.x = x + 1;
        asset.y = y + 1;
        this.changeAssetGridAt(x, y, asset);
    }

    /**
     * Adds a miscellenous asset to the grid
     * @param {Object} misc Misc data
     */
    addMiscAsset(misc) {
        var x = misc.x - 1;
        var y = misc.y - 1;
        this.redimensionGrid(x + 1, y + 1);
        if(this.assetGrid[y][x] === null) {
            var asset = {};
            asset.rotation = 0;
            this.changeAssetGridAt(x, y, asset);
        }
        misc = Object.assign({}, this.assetGrid[y][x], misc);
        this.changeAssetGridAt(x, y, misc);
    }

    /**
     * Cleans up the data of its useless information
     */
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

    /**
     * Returns the assets with the specified type
     * @param  {String} type Asset type
     * @return {Array}  Array of the specified type of asset
     */
	filterAsset(type) {
		return this.brewAssets.filter(obj => obj.type === type);
	}
}

export default BrewGridInit;
