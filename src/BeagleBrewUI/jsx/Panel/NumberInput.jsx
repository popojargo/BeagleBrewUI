import BaseInput from "./BaseInput";
import * as React from "react";
import units from '../../../exampleDB/units.json';

class NumberInput extends BaseInput {
    constructor(props) {
        super(props);
    }

    render() {
        let unit = units[this.props.unitType];
        return (
            <div>
                <label htmlFor="">{this.label}</label>
                <span className="content-data" data-unit={unit}>
                    <input id="" type="number" value={this.props.value}
                           onChange={this.props.onChange} {this.getDisableProp()}/>
                </span>
            </div>
        );
    }
}

export default NumberInput;