import { EventEmitter } from "events";
import dispatcher from '../dispatcher';
var brewAssets = require('../exampleDB/brewAssets.json');

class BrewGridStore extends EventEmitter {
    constructor() {
        super();
        this.brewAssets = brewAssets;
        this.dataFlow = null;
        this.activeAsset = null;
    }

    // Actions / Emitters
    changeData(data) {
        // change DB
        this.emit("change");
    }
    startDataFlow(asset) {
        if(this.dataFlow === null) {
            asset.startDataFlow();
            this.activeAsset = asset;
            this.flowData(asset.state.data);
            this.emit("Toggle Control Panel");
        }
    }
    stopDataFlow() {
        this.dataFlow = null;
        this.activeAsset.stopDataFlow();
        this.emit("Toggle Control Panel");
        this.emit("Stopping Data Flow");
    }
    flowData(data) {
        this.dataFlow = data;
        this.emit("Flowing Data");
    }

    // Getters
    getBrewAssets() {
        return this.brewAssets;
    }
    getDataFlow() {
        return this.dataFlow;
    }

    // Handlers
    handleActions(action) {
        switch(action.type) {
            case "CHANGE_DATA":
                this.changeData(action.data);
                break;
            case "START_DATAFLOW":
                this.startDataFlow(action.asset);
                break;
            case "STOP_DATAFLOW":
                this.stopDataFlow();
                break;
            case "FLOW_DATA":
                this.flowData(action.data);
                break;
            default:
        }
    }
}

const brewGridStore = new BrewGridStore();
dispatcher.register(brewGridStore.handleActions.bind(brewGridStore));

export default brewGridStore;
