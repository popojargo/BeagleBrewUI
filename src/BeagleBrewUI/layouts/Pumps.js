import * as BrewGridStore from "../actions/BrewGridActions";

export default {
    cols: {
        id: {label: "Id: "},
        status: {
            type: "enum",
            enumKeys: [
                -1,
                0,
                1
            ],
            enumVals: [
                "Erreur",
                "Fermé",
                "Ouvert"
            ],
            editable: true,
            onChange: BrewGridStore.toggleAsset.bind(BrewGridStore),
            label: "Status: "
        }
    }
};