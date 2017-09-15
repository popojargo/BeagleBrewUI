class Converter {

    constructor() {
        this.typeAppToAPI = {
            "valv": "Valves",
            "pump": "Pumps",
            "tank": "Tanks"
        }
        this.typeApiToApp = this.swapDic(this.typeAppToAPI);
    }

    swapDic(original) {
        let dict = {};
        for (let n in original) {
            if (original.hasOwnProperty(n)) {
                let val = original[n];
                dict[val] = n;
            }
        }
        return dict;
    }

    typeToAPI(appType) {
        return this.typeAppToAPI[appType];
    }

    typeToApp(apiType) {
        return this.typeApiToApp[apiType];
    }
}

export default Converter;