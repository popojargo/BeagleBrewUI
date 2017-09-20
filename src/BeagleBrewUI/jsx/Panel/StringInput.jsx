import BaseInput from "./BaseInput";
import * as React from "react";
import units from '../../../exampleDB/units.json';

class StringInput extends BaseInput {

    constructor(props) {
        super(props);
    }

    render() {
        let unit = units[this.props.unitType];
        return (
            <div>
                <label>{this.props.label}</label>
                <span className="content-data" data-unit={unit}>
                <input type="text" value={this.props.value} {this.getDisableProp()}/>
                </span>
            </div>
        );
    }
}

export default StringInput;