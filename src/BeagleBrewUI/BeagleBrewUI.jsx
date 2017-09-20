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
import StatusGrid from './js/StatusGrid.js';

// Flux
import BrewGridStore from './stores/BrewGridStore';
import * as BrewGridActions from './actions/BrewGridActions';

// Fluid simulation
var fluidSim;
var assetGrid;
var tanks;

class App extends Component {
    constructor() {
        super();
        this.updateData = this.updateData.bind(this);
        this.socketId = "socketId";
    }

    componentWillMount() {
        BrewGridStore.on("change", this.updateData);
        this.initializeGrid();
        //Add a subscription to get all the states
        BrewGridStore.socket.addStateChangeSub(this.socketId, BrewGridActions.changeStates);
    }

    /**
     * Initialize the grid and adds it to the state
     */
    initializeGrid() {
        const gridInit = new BrewGridInit(BrewGridStore.getBrewAssets());
        assetGrid = gridInit.getAssetGrid();
        tanks = gridInit.getTanks();
        let statusGrid = StatusGrid.convert(assetGrid, BrewGridStore.getAssetStatus());
        fluidSim = new FluidSimulation(assetGrid, tanks, statusGrid);
        this.setState({
            fluidGrid: fluidSim.getFluidGrid(),
            statusGrid: statusGrid
        });
    }

    componentWillUnmount() {
        //Remove subscriptions to states
        BrewGridStore.socket.removeStateChangeSub(this.socketId);
        BrewGridStore.removeListener("change", this.updateData);
    }

    updateData() {
        let statusGrid = StatusGrid.convert(assetGrid, BrewGridStore.getAssetStatus());
        fluidSim.simulateFluid(statusGrid);
        this.setState({
            fluidSim: fluidSim.getFluidGrid(),
            statusGrid: statusGrid
        });
    }

    render() {
        return (
            <BrewGrid statusGrid={this.state.statusGrid} fluidGrid={this.state.fluidGrid} />
        );
    }
}

class BrewGrid extends Component {
    constructor(props) {
        super(props);
        this.toggleCP = this.toggleCP.bind(this);
        this.flowData = this.flowData.bind(this);
        this.state = {
            showCP: false
        };
    }

    toggleCP() {
        this.setState((prevState) => ({
            showCP: !prevState.showCP
        }));
        this.flowData();
    }

    flowData() {
        var flowStatus = BrewGridStore.getDataFlow();
        this.setState((prevState) => ({
            flowStatus: flowStatus
        }));
    }

    componentWillMount() {
        BrewGridStore.on("Toggle Control Panel", this.toggleCP);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowSize);
        BrewGridStore.removeListener("Toggle Control Panel", this.toggleCP);
    }

    render() {
        const rows = assetGrid.map((data, index) =>
            <BrewGridRow statusRow={this.props.statusGrid[index]} fluidRow={this.props.fluidGrid[index]} rowData={data}
                         row={index} key={index}/>
        );
        const tankGrid = tanks;
        const gridDimensions = {
            width: assetGrid[0].length,
            height: assetGrid.length
        };
        const tanksComponents = tankGrid.map((data, index) =>
            <BrewAssetTank grid={gridDimensions} data={data} key={index}/>
        );

        var toggleCPClass = this.state.showCP ? "openControlPanel" : "";

        return (
            <div className={"beagleBrewGrid " + toggleCPClass}>
                <div className="beagleBrewGrid-container">
                    <div className="beagleBrewGrid-assets">
                        {tanksComponents}
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
            <BrewAssetSquare status={this.props.statusRow[index]} fluid={this.props.fluidRow[index]} assetData={data}
                             key={index}/>
        );

        return (
            <div className="beagleBrewGrid-row">
                {squares}
            </div>
        );
    }
}

export default App;
