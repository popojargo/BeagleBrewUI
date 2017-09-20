import React, {Component} from 'react';
import BrewGridStore from '../stores/BrewGridStore';
import * as BrewGridActions from '../actions/BrewGridActions';
import variables from "../../exampleDB/units.json";

class BrewGridControlPanel extends Component {
    constructor(props) {
        super(props);
        //TODO : {result: {}, parent : ""}
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
        if(asset == null) {
            return(<div className="beagleBrewCP-container"></div>);
        }
        var assetData = asset.prop;
        const dataKeys = Object.keys(assetData);
        debugger;
        const cpContent = dataKeys.map((data, index) =>
            <Content dataName={data} data={assetData[data]} key={index} />
        );
        return(
            <div className="beagleBrewCP-container">
                <DefaultButton classname="back" text="back" handler={this.back}/>
                <div className="beagleBrewCP-contents">
                    {cpContent}
                </div>
                <div className="beagleBrewCP-confirmation">
                    <DefaultButton classname="confirm" text="confirm" handler={this.confirm} />
                    <DefaultButton classname="cancel" text="cancel" handler={this.cancel} />
                </div>
            </div>
        );
    }
}

class Content extends Component {
    constructor() {
        super();
        this.state = {
            modified: false
        };
    }
    render() {
        var element;
        var dataName = this.props.dataName;

        switch(dataName) {
            case "name":
                element = <Name name={this.props.data} />;
                break;
            case "active":
                element = <Switch data={this.props.data} />;
                break;
            default:
                element = <DefaultContent dataName={dataName} data={this.props.data} />;
        }

        return(
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
        return(
            <label className={"switch " + checked}>
                <input type="checkbox" checked={this.props.status} onChange={this.switchStuff.bind(this)}/>
            </label>
        );
    }
}

class Name extends Component {
    render() {
        return(
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
        if(dataName in variables) {
            unit = variables[dataName];
        }
        return(
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

        return(
            <span className={"button " + classname} data-text={text} onClick={(e) => this.props.handler()}>&nbsp;</span>
        );
    }
}


export default BrewGridControlPanel;
