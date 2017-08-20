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

var tanksLayout = "5:3:[params],5:9:[params],5:15:[params]";
var tubesLayout = "1:1,13:1,13:9,14:9;2:1,2:7,5:7,5:8;5:2,3:2,3:19,11:19,11:6,5:6;9:6,9:8;3:9,6:9,6:11,4:11,4:13,9:13,9:14;5:19,5:16,6:16;9:2,12:2,12:7,14:7";
var miscsLayout = "in(1:1);valv(2:2);valv(3:8);valv(3:10);valv(5:18);coil(6:10);show(6:16);valv(8:6);valv(8:13);heat(9:3);heat(9:5);pump(9:8);heat(9:9);heat(9:11);pump(9:14);valv(10:6);cool(13:7);out(14:7);out(14:9)";

class App extends Component {
    render() {
        var regExpText = /[a-z]+/ig;
        var regExpDigit = /\d+/g;

        var digits = tubesLayout.match(regExpDigit);
        var row = getArrayElements(digits, false);
        var col = getArrayElements(digits, true);
        var nbRow = row.slice(0).sort(sortNumbers).reverse()[0];
        var nbCol = col.slice(0).sort(sortNumbers).reverse()[0];

        var grid = [];
        for (var i = 0; i < nbRow; i++) {
            var gridRow = [];
            for (var j = 0; j < nbCol; j++) {
                gridRow.push(null);
            }
            grid.push(gridRow);
        }

        var tubes = tubesLayout.split(";");
        for (i = 0; i < tubes.length; i++) {
            var td = tubes[i].match(regExpDigit);
            var tdata = {};
            tdata.row = getArrayElements(td, false);
            tdata.col = getArrayElements(td, true);

            placeTube(tdata);
        }

        var miscs = miscsLayout.split(";");
        for (i = 0; i < miscs.length; i++) {
            var miscData = {};
            var pos = miscs[i].match(regExpDigit);
            miscData.y = parseInt(pos[0], 10) - 1;
            miscData.x = parseInt(pos[1], 10) - 1;
            miscData.asset = miscs[i].match(regExpText)[0];
            addMiscAsset(miscData);
        }

        console.log(grid);

        function placeTube(tubeData) {
            for (var i = 1; i < tubeData.row.length; i++) {
                var yDelta = tubeData.row[i] - tubeData.row[i-1];
                var xDelta = tubeData.col[i] - tubeData.col[i-1];

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
                    var oldPos = isVertical ? tubeData.row[i-1] : tubeData.col[i-1];
                    var posDir = pos / Math.abs(pos);
                    pos = oldPos + j * posDir;
                    var posTubing = (j === 0 || j === max) ? 1 : 0;
                    posTubing *= j === 0 ? -1 : 1;
                    if(isVertical) {
                        addTubePiece(pos, tubeData.col[i], posDir, isVertical, posTubing);
                    } else {
                        addTubePiece(tubeData.row[i], pos, posDir, isVertical, posTubing);
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

        function addMiscAsset(assetData) {
            var y = assetData.y;
            var x = assetData.x;
            console.log(y + ":" + x);
            if(grid[y][x] === null) {
                // console.log(y + ":" + x);
                var data = {};
                data.rotation = 0;
                grid[y][x] = data;
            }
            grid[y][x].asset = assetData.asset;
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
