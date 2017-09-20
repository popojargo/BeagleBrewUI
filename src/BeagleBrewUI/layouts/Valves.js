import BrewGridStore from "../stores/BrewGridStore";

export default {
    cols: {
        id: {label: "Id: "},
        status: {
            label: "Status: ",
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
            onChange: BrewGridStore.toggleAsset
        }
    }
};