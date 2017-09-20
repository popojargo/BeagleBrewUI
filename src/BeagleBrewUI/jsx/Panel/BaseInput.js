import React, {Component} from 'react';
import BrewGridStore from "../../stores/BrewGridStore";


class BaseInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            val: this.props.val
        };
    }

    onChange(event) {
        if (this.props.layout.onChange && typeof this.props.layout.onChange === "function") {
            this.props.layout.onChange.call(BrewGridStore, this.props.id, event);
        }
        let currentState = this.state;
        currentState.val = event.target.value;
        this.setState(currentState);
    }

    //TODO : Add the ids for htmlFor and ids
}

export default BaseInput;