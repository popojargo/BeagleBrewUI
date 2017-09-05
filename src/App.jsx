import React, {Component} from 'react';
// import './style/css/App.css';
import {
	BrewAssetSquare,
	BrewAssetTank
} from './BrewGridAssets';
import BrewGridControlPanel from './BrewGridControlPanel';
import BrewGridStore from './stores/BrewGridStore';
import * as BrewGridActions from './actions/BrewGridActions';

class App extends Component {
	constructor() {
		super();
		var tankGrid = [];
		var grid = [];
		this.updateData = this.updateData.bind(this);
		this.state = {
			brewAssets: BrewGridStore.getBrewAssets(),
			tankGrid: tankGrid,
			grid: grid
		};
	}
	componentWillMount() {
		BrewGridStore.on("change", this.updateData);
		this.initializeGrid();
	}
	initializeGrid() {
		// TODO: find the highest X and Y of brewAssets to build the grid
		var tankGrid = [];
		var grid = [];
		for (var i = 0; i < 14; i++) {
			var gridRow = [];
			for (var j = 0; j < 19; j++) {
				gridRow.push(null);
			}
			grid.push(gridRow);
		}

		const tanks = this.filterAsset("tank");
		for (i = 0; i < tanks.length; i++) {
			addTank(tanks[i]);
		}

		const tubes = this.filterAsset("tube");
		for (i = 0; i < tubes.length; i++) {
			placeTube(tubes[i].path);
		}

		const miscs = this.filterAsset("misc");
		for (i = 0; i < miscs.length; i++) {
			addMiscAsset(miscs[i]);
		}

		this.setState({
			grid: grid,
			tankGrid: tankGrid
		});

		function addTank(tank) {
			for (var i = 0; i < tank.inputs.length; i++) {
				placeInputOutput(tank.inputs[i], tank.x, tank.y);
			}
			for (i = 0; i < tank.outputs.length; i++) {
				placeInputOutput(tank.outputs[i], tank.x, tank.y);
			}

			delete tank.type;
			tank.x--;
			tank.y--;
			tank.assetId = "tank";
			tankGrid.push(tank);
		}

		function placeInputOutput(data, x, y) {
			var tubeY = data.y;
			var tubeX = data.x;
			var testY = tubeY - y;
			var testX = tubeX - x;
			var rotation = 0;

			if(testX < 0) {
				// X left or center
				if(tubeX < x) {
					rotation = 180;
				} else {
					if (testY < 0) {
						// Y top or center
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
			grid[tubeY-1][tubeX-1] = gridData;
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
			data.assetId = "t1";
			data.posTubing = posTubing;
			data.rotation = isVertical ? 90 : 0;
			data.rotation += 180 * (1 - posDir) / 2;
			data.rotation %= 360;
			if(grid[row][col] != null) {
				var gridData = grid[row][col];
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
			misc = Object.assign({}, grid[y][x], misc);
			grid[y][x] = misc;
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
	}
	componentWillUnmount() {
		BrewGridStore.removeListener("change", this.updateData);
	}
	updateData() {
		this.setState({
			brewAssets: BrewGridStore.getBrewAssets()
		});
	}
	filterAsset(type) {
		return this.state.brewAssets.filter(obj => obj.type === type);
	}
	render() {
		return (
			<BrewGrid grid={this.state.grid} tankGrid={this.state.tankGrid} />
		);
	}
}

class BrewGrid extends Component {
	constructor(props) {
		super(props);
		this.toggleCP = this.toggleCP.bind(this);
		this.updateWindowSize = this.updateWindowSize.bind(this);
		this.state = {
			showCP: false,
			winWidth: 0,
			winHeight: 0,
			zoomX: 0,
			zoomY: 0
		};
	}
	toggleCP() {
		var asset = BrewGridStore.getDataFlow();
		this.setState((prevState) => ({
			showCP: !prevState.showCP
		}));
		if(asset !== null) {
			this.setState({
				zoomX: asset.x,
				zoomY: asset.y
			});
		}
	}
	zoomTo() {
		const grid = this.props.grid;
		var nbRow = grid.length;
		var nbCol = grid[0].length;
		var zoomX = this.state.zoomX;
		var zoomY = this.state.zoomY;
		var originY = 100 * (zoomY - 1 + 0.5) / nbRow;
		var originX = 100 * (zoomX - 1 + 0.5) / nbCol;
		var origin = originX + "% " + originY + "%";

		var cpWidth = this.state.winWidth / 3;
		cpWidth = cpWidth < 500 ? cpWidth : 500;
		cpWidth = cpWidth > 300 ? cpWidth : 300;
		var zoomingWidth = this.state.winWidth - cpWidth;
		// (window.innerWidth - ( rect.width * scale ) ) / 2;
		return origin;

	}
	componentWillMount() {
		BrewGridStore.on("Toggle Control Panel", this.toggleCP);
	}
	componentDidMount() {
	    this.updateWindowSize();
	    window.addEventListener('resize', this.updateWindowSize);
	}

	componentWillUnmount() {
	    window.removeEventListener('resize', this.updateWindowSize);
		BrewGridStore.removeListener("Toggle Control Panel", this.toggleCP);
	}

	updateWindowSize() {
	    this.setState({
			winWidth: window.innerWidth,
			winHeight: window.innerHeight
		});
	}
	render() {
		const grid = this.props.grid;
		const rows = grid.map((data, index) =>
			<BrewGridRow rowData={data} row={index} key={index} />
		);
		const tankGrid = this.props.tankGrid;
		const tanks = tankGrid.map((data, index) =>
			<BrewAssetTank data={data} key={index} />
		);

		var origin = this.zoomTo();
		var toggleCPClass = this.state.showCP ? "openControlPanel" : "";

		return(
			<div className={toggleCPClass}>
				<div className="beagleBrewGrid" style={{transformOrigin: origin}}>
					<div className="beagleBrewGrid-tanks">
						{tanks}
					</div>
					<div className="beagleBrewGrid-assets">
						{rows}
					</div>
				</div>
				<div className="beagleBrewCP">
					<BrewGridControlPanel />
				</div>
			</div>
		);
	}
}

class BrewGridRow extends Component {
	render() {
		const rows = this.props.rowData;
		const squares = rows.map((data, index) =>
			<BrewAssetSquare assetData={data} key={index} />
		);

		return(
			<div className="beagleBrewGrid-row">
				{squares}
			</div>
		);
	}
}

export default App;
