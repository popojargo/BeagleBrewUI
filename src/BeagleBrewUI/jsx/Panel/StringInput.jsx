import BaseInput from "./BaseInput";
import * as React from "react";
import units from '../../../exampleDB/units.json';

class StringInput extends BaseInput {

    constructor(props) {
        super(props);
    }

    render() {
        let unit = units[this.props.layout.unitType];
        return (
            <div>
                <label>{this.props.layout.label}</label>
                <span className="content-data" data-unit={unit}>
                <input type="text" value={this.props.val} onChange={this.onChange.bind(this)}
                       disabled={!this.props.layout.editable}/>
            </span>
            </div>
        );
    }
}

export default StringInput;