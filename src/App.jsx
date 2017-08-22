import React, {Component} from 'react';
import './style/css/App.css';
import {
    BrewAssetDefaultTube,
    BrewAssetCurvedTube,
    BrewAssetTConnectorTube,
    BrewAssetIntersectionTube,
    BrewAssetInputTube,
    BrewAssetOutputTube,
    BrewAssetCoil,
    BrewAssetHeater,
    BrewAssetCooler,
    BrewAssetPump,
    BrewAssetValve,
    BrewAssetShower
} from './BrewGridAssets';
var brewAssets = require('./exampleDB/brewAssets.json');

class App extends Component {
    render() {
        var grid = [];
        for (var i = 0; i < 14; i++) {
            var gridRow = [];
            for (var j = 0; j < 19; j++) {
                gridRow.push(null);
            }
            grid.push(gridRow);
        }

        var tanks = filterAsset("tank");
        // for (i = 0; i < tanks.length; i++) {
        //
        // }

        var tubes = filterAsset("tube");
        for (i = 0; i < tubes.length; i++) {
            placeTube(tubes[i].path);
        }

        var miscs = filterAsset("misc");
        for (i = 0; i < miscs.length; i++) {
            addMiscAsset(miscs[i]);
        }

        function placeTube(tubePath) {
            for (var i = 1; i < tubePath.length; i++) {
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

                for (var j = 0; j <= max; j++) {
                    var pos = isVertical ? yDelta : xDelta;
                    var oldPos = isVertical ? tubePath[i-1].y : tubePath[i-1].x;
                    var posDir = pos / Math.abs(pos);
                    pos = oldPos + j * posDir;
                    var posTubing = (j === 0 || j === max) ? 1 : 0;
                    posTubing *= j === 0 ? -1 : 1;
                    if(isVertical) {
                        addTubePiece(pos, tubePath[i].x, posDir, isVertical, posTubing);
                    } else {
                        addTubePiece(tubePath[i].y, pos, posDir, isVertical, posTubing);
                    }
                }
            }
        }

        function addTubePiece(row, col, posDir, isVertical, posTubing) {
            row--;
            col--;
            var data = {};
            data.asset = "t1";
            data.posTubing = posTubing;
            data.rotation = isVertical ? 90 : 0;
            data.rotation += 180 * (1 - posDir) / 2;
            data.rotation %= 360;
            if(grid[row][col] != null) {
                var gridData = grid[row][col];
                switch(gridData.asset) {
                    // Default
                    case "t1":
                        // set tconnector
                        data.asset = "t3";
                        var modRotation = data.rotation + 180 * (1 - posTubing) / 2;
                        modRotation %= 360;
                        data.rotation = 90 + modRotation;
                        data.rotation %= 360;
                        if(posTubing) {
                            if(gridData.posTubing) {
                                // curved
                                data.asset = "t2"
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
                                        data.rotation = "error: " + gridData.rotation + ":" + data.rotation;
                                }
                            }
                        } else {
                            if(!gridData.posTubing) {
                                data.asset = "t4";
                                data.rotation = 0;
                            }
                        }

                        break;
                    // Curved
                    case "t2":
                        break;
                    default:
                        console.log(gridData.asset);
                }
                data.posTubing = 0;
            }

            grid[row][col] = data;
        }

        function addMiscAsset(misc) {
            var x = misc.x - 1;
            var y = misc.y - 1;
            if(grid[y][x] === null) {
                var data = {};
                data.rotation = 0;
                grid[y][x] = data;
            }
            grid[y][x].asset = misc.miscId;
        }

        function sortNumbers(a, b) {
            return a - b;
        }

        function getArrayElements(arr, isEven) {
            var a = [];
            var x = isEven ? 1 : 0;
            for (var i = x; i < arr.length; i+=2) {
                a.push(parseInt(arr[i], 10));
            }
            return a;
        }

        function filterAsset(type) {
            return brewAssets.filter(obj => obj.type === type);
        }

        return (
            <BrewGrid grid={grid} />
        );
    }
}

class BrewGrid extends Component {
    constructor() {
        super();
        this.state = {
            grid: []
        };
    }
    render() {
        const grid = this.props.grid;
        const rows = grid.map((data, index) =>
            <BrewGridRow rowData={data} row={index} key={index} />
        );

        return(
            <div className="beagleBrewGrid">
                {rows}
            </div>
        );
    }
}

class BrewGridRow extends Component {
    constructor() {
        super();
        this.state = {
            // nbCol: 0,
            row: 0,
            rowData: []
        };
    }
    render() {
        const rows = this.props.rowData;
        const squares = rows.map((data, index) =>
            <BrewGridSquare assetData={data} key={index} />
        );

        return(
            <div className="beagleBrewGrid-row">
                {squares}
            </div>
        );
    }
}

class BrewGridSquare extends Component {
    constructor() {
        super();
        this.state = {
            assetData: {}
        }
    }
    render() {
        var asset = null;
        if(this.props.assetData) {
            const rotation = this.props.assetData.rotation;
            switch (this.props.assetData.asset) {
                case "t1":
                    asset = <BrewAssetDefaultTube rotation={rotation} />;
                    break;
                case "t2":
                    asset = <BrewAssetCurvedTube rotation={rotation} />;
                    break;
                case "t3":
                    asset = <BrewAssetTConnectorTube rotation={rotation} />;
                break;
                case "t4":
                    asset = <BrewAssetIntersectionTube rotation={rotation} />;
                    break;
                case "in":
                    asset = <BrewAssetInputTube rotation={rotation} />
                    break;
                case "out":
                    asset = <BrewAssetOutputTube rotation={rotation} />
                    break;
                case "coil":
                    asset = <BrewAssetCoil rotation={rotation} />
                    break;
                case "heat":
                    asset = <BrewAssetHeater rotation={rotation} />
                    break;
                case "cool":
                    asset = <BrewAssetCooler rotation={rotation} />
                    break;
                case "pump":
                    asset = <BrewAssetPump rotation={rotation} />
                    break;
                case "valv":
                    asset = <BrewAssetValve rotation={rotation} />
                    break;
                case "show":
                    asset = <BrewAssetShower rotation="0" />
                    break;
                default:

            }
        }

        return(
            <div className="beagleBrewGrid-square">
                {asset}
            </div>
        );
    }
}

export default App;
