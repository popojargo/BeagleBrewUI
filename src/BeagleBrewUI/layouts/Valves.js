export default {
    cols: {
        id: {},
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
            editable: true
        }
    }
};