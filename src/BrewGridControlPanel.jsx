import React, {Component} from 'react';
const variables = require('./exampleDB/controlPanelVariables.json');

class BrewGridControlPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modified: false
        };
    }
    confirm() {
        console.log("confirm");
    }
    cancel() {
        console.log("cancel");
    }
    render() {
        var asset = this.props.asset;
        if(asset == null) {
            return(
                <div className="beagleBrewCP-container"></div>
            );
        }
        var assetData = asset.props.data.prop;
        const dataKeys = Object.keys(assetData);
        const cpContent = dataKeys.map((data, index) =>
            <Content dataName={data} data={assetData[data]} key={index} />
        );
        return(
            <div className="beagleBrewCP-container">
                <DefaultButton classname="back" text="back" handler={asset.toggleDataFlow} />
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
                element = <Switch status={this.props.data} />;
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

class Switch extends Component {
    switchStuff() {

    }
    render() {
        return(
            <input type="checkbox" checked={this.props.status} onChange={this.switchStuff}/>
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
        const dataName = this.props.dataName;
        var unit = "";
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
