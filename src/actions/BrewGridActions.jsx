import dispatcher from "../dispatcher";

export function initializeGrid(grid) {
    dispatcher.dispatch({
        type: "INIT_GRID",
        grid
    })
}

export function changeData(data) {
    dispatcher.dispatch({
        type: "CHANGE_DATA",
        data
    });
}

export function requestDataFlow(asset) {
    dispatcher.dispatch({
        type: "START_DATAFLOW",
        asset
    });
}

export function stopDataFlow() {
    dispatcher.dispatch({
        type: "STOP_DATAFLOW"
    });
}

export function flowData(data) {
    dispatcher.dispatch({
        type: "FLOW_DATA",
        data
    })
}

export function toggleFluid(affectedAssetsData) {
    dispatcher.dispatch({
        type: "TOGGLE_FLUID",
        affectedAssetsData
    })
}
