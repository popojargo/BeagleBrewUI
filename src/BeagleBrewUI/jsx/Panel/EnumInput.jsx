import BaseInput from "./BaseInput";
import * as React from "react";

class EnumInput extends BaseInput {
    constructor(props) {
        super(props);
    }

    render() {
        let options = [];
        for (let i = 0; i < this.props.layout.enumKeys.length && i < this.props.layout.enumVals.length; i++) {
            options.push(<option value={this.props.layout.enumKeys[i]} key={i}>{this.props.layout.enumVals[i]}</option>)
        }
        return (
            <div>
                <label>{this.props.layout.label}</label>
                <select onChange={this.onChange.bind(this)} value={this.state.val}
                        disabled={!this.props.layout.editable}>
                    {options}
                </select>
            </div>
        );
    }
}

export default EnumInput;