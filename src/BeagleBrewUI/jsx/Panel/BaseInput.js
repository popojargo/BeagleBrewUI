import defaults from '../../layouts/defaults.js';
import LayoutParser from './LayoutManager.js';
import * as React from "react";

let colsDef = defaults.cols;

class BaseInput extends Component {

    constructor(props) {
        super(props);
        //Load the defaults for a column
        LayoutParser.parseColLayout(this, colsDef, props.name)
    }

    getDisableProp() {
        return this.props.editable ? '' : 'disabled';
    }

    onChange(event) {
        if (this.props.onChange) {
            this.props.onChange(this.props.id, event);
        } else
            this.props.value = event.target.value;
    }

    //TODO : Add the ids for htmlFor and ids
}

export default BaseInput;