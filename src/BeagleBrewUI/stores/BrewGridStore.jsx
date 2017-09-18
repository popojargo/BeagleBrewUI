import {EventEmitter} from "events";
import dispatcher from '../../dispatcher';
import * as CST from '../js/constants';
import ObjectScraper from '../js/ObjectScraper'

import brewAssets from "../../exampleDB/gridLayout.json";

import exampleStatus from "../../exampleDB/defaultStatus.json";
import SocketCom from "../js/SocketCom";

class BrewGridStore extends EventEmitter {
    constructor() {
        super();
        this.brewAssets = brewAssets;
        this.assetStatus = exampleStatus; // Will be updated by the server

        this.tankGrid = null;
        this.dataFlow = null;
        this.activeAsset = null;

        //Create socket if not already created
        if (!this.socket)
            this.socket = new SocketCom();
    }

    // Actions / Emitters

    changeData(data) {
        // this.assetGrid[data.y - 1][data.x - 1] = data;
        this.emit("change");
    }

    startDataFlow(asset) {
        if (this.dataFlow === null) {
            // asset.startDataFlow();
            this.activeAsset = asset;
            this.flowData(asset.state.data);
            this.emit("Toggle Control Panel");
        }
    }

    toggleAsset(id) {
        // check asset status in this.assetStatus
        let result = ObjectScraper.scrape(this.assetStatus, "id", id);
        let state = result.data;
        // toggle status
        state.status = state.status ? 0 : 1;
        
        // emit to server for supported toggle assets
        switch (result.parent) {
            case "Valves":
                this.socket.updateValve(id, state.status);
                break;
            case "Pumps":
                this.socket.updatePump(id, state.status);
                break;
        }

        // emit to UI client
        this.emit("change");
    }

    // Getters
    getBrewAssets() {
        return this.brewAssets;
    }

    getAssetStatus(id) {
        const clone = Object.assign({}, this.assetStatus);
        if (typeof id !== "undefined") return ObjectScraper.scrape(clone, "id", id);
        return clone;
    }

    // getAssetGrid() {
    //     return this.assetGrid;
    // }

    getDataFlow() {
        return this.dataFlow;
    }


    // Handlers
    handleActions(action) {
        // debugger;
        switch (action.type) {
            // case CST.INIT_GRID:
            //     this.initializeGrid(action.assetGrid, action.tankGrid);
            //     break;
            case CST.CHANGE_DATA:
                //TODO: Is this still necessary?
                this.changeData(action.data);
                break;
            case CST.CHANGE_STATES:
                this.assetStatus = action.data;
                this.emit("change");
                break;
            case CST.TOGGLE_ASSET:
                this.toggleAsset(action.id);
                break;
            default:
        }
    }
}

const brewGridStore = new BrewGridStore();
dispatcher.register(brewGridStore.handleActions.bind(brewGridStore));

export default brewGridStore;
