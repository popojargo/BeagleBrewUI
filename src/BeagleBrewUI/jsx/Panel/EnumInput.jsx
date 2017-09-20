import BaseInput from "./BaseInput";
import * as React from "react";

class EnumInput extends BaseInput {
    constructor(props) {
        super(props);
    }

    render() {
        let options = [];
        for (let i = 0; i < this.props.enumKeys.length && i < this.props.enumVals; i++) {
            options.push(<option value={this.props.enumKeys[i]}>{this.props.enumVals[i]}</option>)
        }
        return (
            <div>
                <label>{this.props.label}</label>
                <select {this.getDisableProp()} onChange={this.props.onChange}>
                    {options}
                </select>
            </div>
        );
    }
}

export default EnumInput;