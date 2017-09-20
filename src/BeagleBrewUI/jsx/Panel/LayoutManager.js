import Tanks from '../../layouts/Tanks.js';
import Pumps from '../../layouts/Pumps.js';
import Valves from '../../layouts/Valves.js';
import defaults from '../../layouts/defaults.js';
import * as React from "react";
import NumberInput from "./NumberInput";
import EnumInput from "./EnumInput";
import StringInput from "./StringInput";

class LayoutParser {
    constructor() {
        //Load the defaults inside the layouts.
        let defCols = defaults.cols;
        let layouts = [Tanks, Pumps, Valves];
        for (let lay of layouts) {
            let layCols = lay.cols;
            for (let c in layCols)
                if (layCols.hasOwnProperty(c)) {
                    this.parseColLayout(layCols[c], defCols, c);
                }
        }
    }

    /**
     * Get a layout according to the type of layout requested.
     * @param {string} type The type of entity requested.
     * @returns {Object}
     */
    getLayout(type) {
        switch (type) {
            case "Tanks":
                return Tanks;
            case "Pumps":
                return Pumps;
            case "Valves":
                return Valves;
            default:
                return {};
        }
    }

    /**
     * Parse a column layout and load the values in the obj passed by reference.
     * @param obj The object to modify
     * @param layout The layout to parse
     * @param indexKey The indexKey of the column. This is the name of the column usually.
     */
    parseColLayout(obj, layout, indexKey) {
        let specialVal = {
            _name: indexKey
        };

        let parseCodes = {};
        //Parse normal default values.
        for (let k in layout) {
            if (layout.hasOwnProperty(k)) {
                if (obj[k])
                    continue;
                let v = layout[k];
                if ((v + '').startsWith('_='))
                    parseCodes[k] = v.substr(2);
                else if ((v + '').startsWith('_'))
                    obj[k] = specialVal[v];
                else
                    obj[k] = v;
            }
        }

        //Parse special codes
        for (let k in parseCodes) {
            if (parseCodes.hasOwnProperty(k)) {
                if (obj[k])
                    continue;
                let v = parseCodes[k];
                obj[k] = obj[v];
            }
        }
    }

    getInput(layout, value, id, key) {
        switch (layout.type.toLowerCase()) {
            case "number":
                return <NumberInput val={value} id={id} key={key} layout={layout}/>;
            case "enum":
                return <EnumInput val={value} id={id} key={key} layout={layout}/>;
            case "string":
            default:
                return <StringInput val={value} id={id} key={key} layout={layout}/>;
        }
    }
}

const layoutParser = new LayoutParser();

export default layoutParser;