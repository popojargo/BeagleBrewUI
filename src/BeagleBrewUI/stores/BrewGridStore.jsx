import {EventEmitter} from "events";
import dispatcher from '../../dispatcher';
import * as CST from '../js/constants';
import Converter from '../js/converter';
import SocketCom from '../js/SocketCom.js';

var brewAssets = require('../../exampleDB/gridLayout.json');

class BrewGridStore extends EventEmitter {
    constructor() {
        super();
        this.socketId = "socketId";
        this.brewAssets = brewAssets;
        this.assetMap = this.initAssetMap();
        //Create socket if not already created
        this.socket = new SocketCom();

        //Add a subscription to get all the states
        let dis = this;
        this.socket.addStateChangeSub(this.socketId, function (data) {
            debugger;
            if (data.ForceInit)
                dis.forceChangeStates(data);
            else
                dis.changeStates(data);
            dis.emit("change");
        });
        this.assetGrid = null;
        this.tankGrid = null;
        this.dataFlow = null;
        this.activeAsset = null;
    }

    initAssetMap() {

        //Map template
        let map = {
            tank: {},
            valv: {},
            pump: {}
        };

        //Map assets per type/id
        for (let idx in this.brewAssets)
            if (this.brewAssets.hasOwnProperty(idx)) {
                let asset = this.brewAssets[idx];
                if (asset.id) {
                    if (map[asset.type])
                        map[asset.type][asset.id] = asset;
                    else if (map[asset.assetId])
                        map[asset.assetId][asset.id] = asset;
                }
            }
        return map;
    }

    // Actions / Emitters
    initializeGrid(assetGrid, tankGrid) {
        this.assetGrid = assetGrid;
        this.tankGrid = tankGrid;
    }

    changeData(data) {

        this.brewAssets[data.y - 1][data.x - 1] = data;
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

    stopDataFlow() {
        this.dataFlow = null;
        // this.activeAsset.stopDataFlow();
        this.emit("Toggle Control Panel");
        this.emit("Stopping Data Flow");
    }

    flowData(data) {
        this.dataFlow = data;
        this.emit("Flowing Data");
    }

    toggleFluid(data) {
        for (const dest of data.destinations) {
            // console.log(this.brewAssets[dest.y][dest.x])
        }
    }

    // Getters
    getBrewAssets() {
        return this.brewAssets;
    }

    getDataFlow() {
        return this.dataFlow;
    }

    updateById(id, data) {
        if (this.assetMap[data.type]) {
            let asset = this.assetMap[data.type][id];
            if (asset) {
                asset.prop = Object.assign(asset.prop, data);
                return true;
            }
        }
        return false;
    }

    changeStates(states) {
        for (const typeIdx in states)
            if (states.hasOwnProperty(typeIdx)) {
                let group = states[typeIdx];
                for (let i = 0; i < group.length; i++) {
                    let elem = group[i];
                    this.updateById(elem.id, elem);
                }
            }
        this.emit("change");
    }

    forceChangeStates(states) {
        debugger;
        for (let apiType in states) {
            if (states.hasOwnProperty(apiType)) {
                //An array of entities of type "apiType"
                let apiEntities = states[apiType];
                let converter = new Converter();
                let appType = converter.typeToApp(apiType);
                if (!this.assetMap[appType])
                    continue;
                let appTypeIds = Object.keys(this.assetMap[appType]);
                let newMapping = {};
                for (let apiCnt = 0, appCnt = 0; appCnt < appTypeIds.length; apiCnt++, appCnt++) {
                    let asset = this.assetMap[appType][appTypeIds[appCnt]];
                    if (apiCnt < apiEntities.length) {
                        let apiEntity = apiEntities[apiCnt];
                        asset.id = apiEntity.id;
                        asset.prop = Object.assign(asset.prop ? asset.prop : {}, apiEntity);
                    }
                    newMapping[asset.id] = asset;
                }
                this.assetMap[appType] = newMapping;
            }
            debugger;
        }
        this.emit("change");
    }


    // Handlers
    handleActions(action) {
        switch (action.type) {
            case CST.INIT_GRID:
                this.initializeGrid(action.assetGrid, action.tankGrid);
                break;
            case CST.CHANGE_DATA:
                //TODO: Do we want to update the asset locally? We could assume that it works but this could lead to some weird behaviors if the API call failed.
                this.changeData(action.data);
                break;
            case CST.START_DATAFLOW:
                this.startDataFlow(action.asset);
                break;
            case CST.STOP_DATAFLOW:
                this.stopDataFlow();
                break;
            case CST.FLOW_DATA:
                this.flowData(action.data);
                break;
            case CST.TOGGLE_FLUID:
                this.toggleFluid(action.affectedAssetsData);
                break;

            case CST.CHANGE_VALVE:
                debugger;
                let newValveStatus = !action.data.prop.status;
                this.socket.updateValve(action.data.id, newValveStatus);
                this.emit("change");
                break;
            case CST.CHANGE_PUMP:
                debugger;
                let newPumpStatus = !action.data.prop.status;
                this.socket.updatePump(action.data.id, newPumpStatus);
                this.emit("change");
                break;
            default:
        }
    }
}

const brewGridStore = new BrewGridStore();
dispatcher.register(brewGridStore
    .handleActions
    .bind(brewGridStore)
);

export default brewGridStore;
