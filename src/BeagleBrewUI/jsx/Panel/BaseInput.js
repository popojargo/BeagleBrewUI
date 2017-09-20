import React, {Component} from 'react';
import BrewGridStore from "../../stores/BrewGridStore";


class BaseInput extends Component {

    constructor(props) {
        super(props);
    }

    onChange(event) {
        if (this.props.layout.onChange && typeof this.props.layout.onChange === "function") {
            this.props.layout.onChange(this.props.id,this.props.rKey, event);
        }
    }

    //TODO : Add the ids for htmlFor and ids
}

export default BaseInput;