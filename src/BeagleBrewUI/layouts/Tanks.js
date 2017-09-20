export default {
    cols: {
        id: {},
        sensorStatus: {
            type: "enum",
            enumKeys: [
                0,
                1,
                2
            ],
            enumVals: [
                "Connexion fautive",
                "Connexion correct",
                "Valeurs anormales"
            ]
        },
        controllerStatus: {
            type: "enum",
            enumKeys: [
                0,
                1
            ],
            enumVals: [
                "Non-asservi",
                "Asservi"
            ]
        },
        setTemp: {
            type: "number",
            unitType: "temperature",
            editable: true
        },
        currentTemp: {
            type: "number",
            unitType: "temperature"
        }
    }
};