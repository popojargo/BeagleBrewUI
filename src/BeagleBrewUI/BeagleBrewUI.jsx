// React elements
import React, {Component} from 'react';
import BrewGridControlPanel from './jsx/BrewGridControlPanel';
import {
    BrewAssetSquare,
    BrewAssetTank
} from './jsx/BrewGridAssets';

// Brew Grid logic
import BrewGridInit from './js/BrewGridInit.js';
import FluidSimulation from './js/FluidSimulation.js';

// Flux
import BrewGridStore from './stores/BrewGridStore';
import * as BrewGridActions from './actions/BrewGridActions';

// Fluid simulation
var fluidSim;


class App extends Component {
    constructor() {
        super();
        this.socketId = 'socketId';
        this.updateData = this.updateData.bind(this);
    }

    componentWillMount() {
        BrewGridStore.on("change", this.updateData);
        this.initializeGrid();
    }

    initializeGrid() {
        const gridInit = new BrewGridInit(BrewGridStore.getBrewAssets());
        fluidSim = new FluidSimulation(gridInit.getAssetGrid(), gridInit.getTankGrid());
        BrewGridActions.initializeGrid(fluidSim.getAssetGrid());
        this.setState({
            assetGrid: fluidSim.getAssetGrid(),
            tankGrid: gridInit.getTankGrid()
        });
    }

    componentWillUnmount() {
        BrewGridStore.removeListener("change", this.updateData);
    }

    updateData() {
        fluidSim.simulateFluid(BrewGridStore.getBrewAssets());
        this.setState({
            assetGrid: fluidSim.getAssetGrid()
        });
    }

    render() {
        return (
            <BrewGrid assetGrid={this.state.assetGrid} tankGrid={this.state.tankGrid}/>
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
        if (asset !== null) {
            this.setState({
                zoomX: asset.x,
                zoomY: asset.y
            });
        }
    }

    zoomTo() {
        const assetGrid = this.props.assetGrid;
        var nbRow = assetGrid.length;
        var nbCol = assetGrid[0].length;
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
        const assetGrid = this.props.assetGrid;
        const rows = assetGrid.map((data, index) =>
            <BrewGridRow rowData={data} row={index} key={index}/>
        );
        const tankGrid = this.props.tankGrid;
        const tanks = tankGrid.map((data, index) =>
            <BrewAssetTank data={data} key={index}/>
        );

        var origin = this.zoomTo();
        var toggleCPClass = this.state.showCP ? "openControlPanel" : "";

        return (
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
                    <BrewGridControlPanel/>
                </div>
            </div>
        );
    }
}

class BrewGridRow extends Component {
    render() {
        const rows = this.props.rowData;
        const squares = rows.map((data, index) =>
            <BrewAssetSquare assetData={data} key={index}/>
        );

        return (
            <div className="beagleBrewGrid-row">
                {squares}
            </div>
        );
    }
}

export default App;
