import {EventEmitter} from "events";
import dispatcher from '../../dispatcher';
import * as CST from '../js/constants';
import Converter from '../js/converter';

var brewAssets = require('../../exampleDB/gridLayout.json');

class BrewGridStore extends EventEmitter {
    constructor() {
        super();
        this.brewAssets = brewAssets;
        this.assetMap = this.initAssetMap();
        this.assetStatus = null;

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
    // initializeGrid(assetGrid, tankGrid) {
    //     this.assetGrid = assetGrid;
    //     this.tankGrid = tankGrid;
    // }

    changeData(data) {
        console.log(data)
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
        // toggle status
        // emit to server
        // emit to UI client
    }

    // Getters
    getBrewAssets() {
        return this.brewAssets;
    }

    getAssetStatus() {
        return this.assetStatus;
    }

    // getAssetGrid() {
    //     return this.assetGrid;
    // }

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
    }

    forceChangeStates(states) {
        for (let apiType in states) {
            if (states.hasOwnProperty(apiType)) {
                //An array of entities of type "apiType"
                let apiEntities = states[apiType];
                let converter = new Converter();
                let appType = converter.typeToApp(apiType);
                if (!this.assetMap[apiType])
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
        }
    }


    // Handlers
    handleActions(action) {
        // debugger;
        switch (action.type) {
            // case CST.INIT_GRID:
            //     this.initializeGrid(action.assetGrid, action.tankGrid);
            //     break;
            case CST.CHANGE_DATA:
                //TODO: Do we want to update the asset locally? We could assume that it works but this could lead to some weird behaviors if the API call failed.
                this.changeData(action.data);
                break;
            case CST.CHANGE_STATES:
                // debugger;
                if (action.data.ForceInit)
                    this.forceChangeStates(action.data);
                else
                    this.changeStates(action.data);
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
dispatcher.register(brewGridStore
    .handleActions
    .bind(brewGridStore)
);

export default brewGridStore;
