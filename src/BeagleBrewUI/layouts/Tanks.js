import * as BrewGridStore from "../actions/BrewGridActions";

export default {
    cols: {
        id: {label: "Id: "},
        sensorStatus: {
            label: "Sensor : ",
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
            label: "Controller: ",
            type: "enum",
            enumKeys: [
                0,
                1
            ],
            enumVals: [
                "Non-asservi",
                "Asservi"
            ],
            editable: true,
            onChange: BrewGridStore.changeTemp.bind(BrewGridStore)
        },
        setTemp: {
            label: "Set temp: ",
            type: "number",
            unitType: "temperature",
            editable: true,
            onChange: BrewGridStore.changeTemp.bind(BrewGridStore)
        },
        currentTemp: {
            label: "Current temp: ",
            type: "number",
            unitType: "temperature"
        },
    }
};