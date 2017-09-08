import React, {Component} from 'react';
import BrewGridStore from './stores/BrewGridStore';
import * as BrewGridActions from './actions/BrewGridActions';

class FluidSimulation extends Component {
    // constructor() {
    //     super();
    // }
    componentWillMount() {
		BrewGridStore.on("change", this.simulateFluid);
	}
    simulateFluid() {
        var gridAssets = BrewGridStore.getBrewAssets();
        console.log(gridAssets)
    }
    render() {
        return null;
    }
}

// const fluidSimulation = new FluidSimulation();

export default FluidSimulation;
