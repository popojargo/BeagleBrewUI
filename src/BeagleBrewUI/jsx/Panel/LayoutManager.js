import Tanks from '../../layouts/Tanks.js';
import Pumps from '../../layouts/Pumps.js';
import Valves from '../../layouts/Valves.js';

class LayoutParser {

    /**
     * Get a layout according to the type of layout requested.
     * @param {string} type The type of entity requested.
     * @returns {Object}
     */
    getLayout(type) {
        switch (type) {
            case "Tanks":
                return Tanks;
                break;
            case "Pumps":
                return Pumps;
                break;
            case "Valves":
                return Valves;
                break;
            default:
                return {};
                break;
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
                if (obj.props[k])
                    continue;
                let v = layout[k];
                if (v.startsWith('_='))
                    parseCodes[k] = v.substr(2);
                else if (v.startsWith('_'))
                    obj.props[k] = specialVal[v];
                else
                    obj.props[k] = v;
            }
        }

        //Parse special codes
        for (let k in parseCodes) {
            if (parseCodes.hasOwnProperty(k)) {
                if (obj.props[k])
                    continue;
                let v = parseCodes[k];
                obj.props[k] = obj.props[v];
            }
        }
    }
}

const layoutParser = new LayoutParser();

export default layoutParser;