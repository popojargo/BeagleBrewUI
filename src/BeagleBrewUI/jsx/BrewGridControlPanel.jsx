import React, {Component} from 'react';
import BrewGridStore from '../stores/BrewGridStore';
import * as BrewGridActions from '../actions/BrewGridActions';
import variables from "../../exampleDB/units.json";
import LayoutManager from './Panel/LayoutManager.js';

class BrewGridControlPanel extends Component {
    constructor(props) {
        super(props);
        this.back = this.back.bind(this);
        this.confirm = this.confirm.bind(this);
        this.confirm = this.confirm.bind(this);
        this.updateData = this.updateData.bind(this);
        this.state = {
            modified: false,
            asset: this.getAsset()
        };
    }

    getAsset() {
        return BrewGridStore.getDataFlow();
    }

    componentWillMount() {
        BrewGridStore.on("Flowing Data", this.updateData);
    }

    componentWillUnmount() {
        BrewGridStore.removeListener("Flowing Data", this.updateData);
    }

    updateData() {
        this.setState({
            asset: BrewGridStore.getDataFlow()
        })
        //TODO: use this.state.asset rather than props
    }

    back() {
        BrewGridActions.stopDataFlow();
    }

    confirm() {
        console.log("confirm");
    }

    cancel() {
        console.log("cancel");
    }

    render() {
        var asset = this.state.asset;
        if (asset == null) {
            return (<div className="beagleBrewCP-container"></div>);
        }
        let assetData = asset.data;
        let type = asset.parent;
        let layout = LayoutManager.getLayout(type);
        const dataKeys = Object.keys(layout.cols);
        const cpContent = dataKeys.map((data, index) =>
            <Content type={type} val={assetData[data]} layout={layout.cols[data]} id={assetData.id} key={data}
                     rKey={data}/>
        );
        return (
            <div className="beagleBrewCP-container">
                <DefaultButton classname="back" text="back" handler={this.back}/>
                <div className="beagleBrewCP-contents">
                    {cpContent}
                </div>
                <div className="beagleBrewCP-confirmation">
                    <DefaultButton classname="confirm" text="confirm" handler={this.confirm}/>
                    <DefaultButton classname="cancel" text="cancel" handler={this.cancel}/>
                </div>
            </div>
        );
    }
}

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modified: false
        };

    }

    render() {
        let element = LayoutManager.getInput(this.props.layout, this.props.val, this.props.id, this.props.rKey);
        return (
            <div className="beagleBrewCP-content">
                {element}
            </div>
        );
    }
}

class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            currentData: props.data
        }
    }
}

class Switch extends Input {
    switchStuff() {
        this.setState({
            currentData: !this.state.currentData
        });
    }

    render() {
        var checked = this.state.currentData ? "checked" : "";
        return (
            <label className={"switch " + checked}>
                <input type="checkbox" checked={this.props.status} onChange={this.switchStuff.bind(this)}/>
            </label>
        );
    }
}

class Name extends Component {
    render() {
        return (
            <div>
                <span className="asset-name">{this.props.name}</span>
            </div>
        );
    }
}

class DefaultContent extends Component {
    render() {
        //TODO: Bind columns to unit classes
        const dataName = this.props.dataName;
        let unit = "";
        if (dataName in variables) {
            unit = variables[dataName];
        }
        return (
            <div>
                <span className="content-title">{dataName}</span>
                <span className="content-data" data-unit={unit}>{this.props.data}</span>
            </div>
        );
    }
}

class DefaultButton extends Component {
    render() {
        const classname = this.props.classname;
        const text = this.props.text;

        return (
            <span className={"button " + classname} data-text={text} onClick={(e) => this.props.handler()}>&nbsp;</span>
        );
    }
}


export default BrewGridControlPanel;
