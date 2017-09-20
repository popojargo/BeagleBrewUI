import dispatcher from "../../dispatcher";
import * as CST from '../js/constants';

// export function initializeGrid(assetGrid, tankGrid) {
//     dispatcher.dispatch({
//         type: CST.INIT_GRID,
//         assetGrid,
//         tankGrid
//     })
// }

export function changeData(data) {
    dispatcher.dispatch({
        type: CST.CHANGE_DATA,
        data
    });
}

export function requestDataFlow(id) {
    dispatcher.dispatch({
        type: CST.REQUEST_DATAFLOW,
        id
    });
}

export function stopDataFlow() {
    dispatcher.dispatch({
        type: CST.STOP_DATAFLOW
    });
}

export function flowData(data) {
    dispatcher.dispatch({
        type: CST.FLOW_DATA,
        data
    })
}

export function changeStates(data) {
    dispatcher.dispatch({
        type: CST.CHANGE_STATES,
        data
    })
}

export function toggleAsset(id) {
    dispatcher.dispatch({
        type: CST.TOGGLE_ASSET,
        id
    })
}
