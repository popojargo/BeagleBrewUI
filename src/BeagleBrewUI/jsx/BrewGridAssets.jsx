import React, {Component} from 'react';
import BrewGridStore from '../stores/BrewGridStore';
import * as BrewGridActions from '../actions/BrewGridActions';

class BrewAssetSquare extends Component {
    render() {
        var asset = null;
        if (this.props.assetData) {
            const assetData = this.props.assetData;
            switch (this.props.assetData.assetId) {
                case "t1":
                    asset = <BrewAssetDefaultTube data={assetData}/>;
                    break;
                case "t2":
                    asset = <BrewAssetCurvedTube data={assetData}/>;
                    break;
                case "t3":
                    asset = <BrewAssetTConnectorTube data={assetData}/>;
                    break;
                case "t4":
                    asset = <BrewAssetIntersectionTube data={assetData}/>;
                    break;
                case "in":
                    asset = <BrewAssetInputTube data={assetData}/>;
                    break;
                case "out":
                    asset = <BrewAssetOutputTube data={assetData}/>;
                    break;
                case "coil":
                    asset = <BrewAssetCoil data={assetData}/>;
                    break;
                case "heat":
                    asset = <BrewAssetHeater data={assetData}/>;
                    break;
                case "cool":
                    asset = <BrewAssetCooler data={assetData}/>;
                    break;
                case "pump":
                    asset =
                        <BrewAssetPump data={assetData} handler={this.props.handler} dataFlow={this.props.dataFlow}/>;
                    break;
                case "valv":
                    asset =
                        <BrewAssetValve data={assetData} handler={this.props.handler} dataFlow={this.props.dataFlow}/>;
                    break;
                case "show":
                    asset = <BrewAssetShower data={assetData}/>;
                    break;
                default:
                //null
            }
        }

        return (
            <div className="beagleBrewGrid-square">
                {asset}
            </div>
        );
    }
}

class BrewAsset extends Component {
    getAssetStatusClass() {
        var status = this.isActive() ? " active" : "";
        var fluid = this.getFluidClass();
        return status + fluid;
    }

    isActive() {
        return !!this.props.data.active;
    }

    getFluidClass() {
        var fluid = this.props.data.fluid ? " fluid" : "";
        var liquid = this.props.data.fluid ? " liquid-" + this.props.data.liquid : "";
        return fluid + liquid;
    }

    // receiveFluid(origin) {
    //     //
    //     // this.
    // }
    // getFluidDestinationData(destinations, sendingFluid, liquidType) {
    //     var destinationData = {
    //         fluid: sendingFluid,
    //         liquid: liquidType,
    //         origin: {
    //             x: this.props.data.x,
    //             y: this.props.data.y
    //         },
    //         destinations: destinations
    //     }
    //     return destinationData;
    // }
    toggleNextFluid(affectedAssetsData) {
        BrewGridActions.toggleFluid(affectedAssetsData);
    }

    getClass(assetClass, hasRotation) {
        const baseClass = "brew-asset";
        assetClass = " " + assetClass;
        const rotationClass = hasRotation ? " r" + this.props.data.rotation : "";
        var statusClass = this.getAssetStatusClass();
        var elemClass = baseClass + assetClass + rotationClass + statusClass;
        return elemClass;
    }

    // componentWillUpdate(nextProps) {
    //
    // }
    render(assetCode, assetClass, hasRotation) {
        return (
            <div className={this.getClass(assetClass, hasRotation)}>
                {assetCode}
            </div>
        );
    }
}

class BrewAssetClickable extends BrewAsset {
    constructor(props) {
        super(props);
        this.clickHandler = this.clickHandler.bind(this);
        // this.startDataFlow = this.startDataFlow.bind(this);
        // this.stopDataFlow = this.stopDataFlow.bind(this);
        const prop = props.data.prop;
        this.state = {
            data: props.data,
            active: false,
            flowingData: false
        };
    }

    clickHandler() {
        BrewGridActions.requestDataFlow(this);
    }

    // startDataFlow() {
    //     this.setState({
    //         flowingData: true
    //     });
    // }
    // stopDataFlow() {
    //     this.setState({
    //         flowingData: false
    //     });
    // }
    // changeData(newData) {
    //     this.setState((prevState) => ({
    //         data: Object.assign({}, prevState.data, newData)
    //     }));
    // }
    getClass(assetClass, hasRotation) {
        const clickableClass = " clickable";
        return super.getClass(assetClass, hasRotation) + clickableClass;
    }

    render(assetCode, assetClass, hasRotation) {
        return (
            <div className={this.getClass(assetClass, hasRotation)} onClick={this.clickHandler}>
                {assetCode}
            </div>
        );
    }
}

class BrewAssetToggle extends BrewAssetClickable {
    clickHandler() {
        var data = this.props.data;
        data.active = !data.active;
        BrewGridActions.changeData(data);
    }
}

class BrewAssetTank extends BrewAssetClickable {
    tick() {
        var testData = this.props.data;
        var delta = Math.floor(Math.random() * 10);
        testData.prop["currentTemp"] += Math.random() >= 0.5 ? delta : -delta;
        this.setState({
            data: testData
        });
        if (this.state.flowingData) {
            BrewGridActions.flowData(this.state.data);
        }
    }

    render() {
        const assetClass = "tank";
        var data = this.props.data;
        const width = (data.width * 50) + "px";
        const height = (data.height * 50) + "px";
        const x = (data.x * 50 - 5) + "px";
        const y = (data.y * 50 - 5) + "px";
        // const width = data.width;
        // const height = data.height;

        var assetCode =
            <div className="tank" style={{width: width, height: height, left: x, top: y}}>
                <span className="fluid"></span>
            </div>;

        return super.render(assetCode, assetClass, false);
    }
}

class BrewAssetDefaultTube extends BrewAsset {
    render() {
        const assetClass = "default-tube";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <line className="tube" y1="25" x2="50" y2="25"/>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetCurvedTube extends BrewAsset {
    render() {
        const assetClass = "curved-tube";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <polyline className="tube" points="0 25 25 25 25 50"/>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetTConnectorTube extends BrewAsset {
    render() {
        const assetClass = "t-connector-tube";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <line className="tube" y1="25" x2="50" y2="25"/>
                <line className="tube" x1="25" y1="25" x2="25" y2="50"/>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetIntersectionTube extends BrewAsset {
    getFluidClass() {
        var fluid = this.props.data.fluid ? " fluid" : "";
        var fluidA = this.props.data.fluidA ? " fluid-a" : "";
        var fluidB = this.props.data.fluidB ? " fluid-b" : "";
        var liquid = "";
        if (fluid + fluidA + fluidB != "") {
            liquid = " liquid-" + this.props.data.liquid;
        }
        return fluid + fluidA + fluidB + liquid;
    }

    render() {
        const assetClass = "intersection-tube";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <line className="tube-b tube" x1="25" x2="25" y2="50"/>
                <g>
                    <line className="tube-a tube" y1="25" x2="18" y2="25"/>
                    <line className="tube-a tube" x1="32" y1="25" x2="50" y2="25"/>
                </g>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetInputTube extends BrewAsset {
    // sendFluid() {
    //     var destinations = [];
    //     var dest = {
    //         x: this.props.data.x,
    //         y: this.props.data.y
    //     }
    //     switch(this.props.data.rotation) {
    //         case 0:
    //             dest.x++;
    //             break;
    //         case 90:
    //             dest.y++;
    //             break;
    //         case 180:
    //             dest.x--;
    //             break;
    //         case 270:
    //             dest.y--;
    //             break;
    //         default:
    //             // nothing
    //     }
    //     destinations.push(dest);
    //     var data = super.getFluidDestinationData(destinations, true, 1);
    //     super.toggleNextFluid(data);
    // }
    render() {
        const assetClass = "input-tube";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <line className="tube" x1="35" y1="25" x2="50" y2="25"/>
                <g>
                    <polyline points="26.14 17.5 35 17.5 35 32.5 26.14 32.5"/>
                    <path d="M15.89,30c.63,2.87,1.84,5,3.64,5a10,10,0,0,0,0-20c-1.8,0-3,2.13-3.64,5"/>
                </g>
                <g className="arrow">
                    <line x1="20.7" y1="28.6" x2="24.24" y2="25.07"/>
                    <line x1="20.7" y1="21.53" x2="24.24" y2="25.07"/>
                    <line x1="24.24" y1="25.07" x2="12.35" y2="25.07"/>
                </g>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetOutputTube extends BrewAsset {
    render() {
        const assetClass = "output-tube";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <line className="tube" y1="25" x2="20" y2="25"/>
                <g>
                    <line x1="25" y1="32.5" x2="25" y2="17.5"/>
                    <line x1="20" y1="30" x2="20" y2="20"/>
                </g>
                <g className="arrow">
                    <line x1="38.35" y1="28.54" x2="41.89" y2="25"/>
                    <line x1="38.35" y1="21.46" x2="41.89" y2="25"/>
                    <line x1="41.89" y1="25" x2="30" y2="25"/>
                </g>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetCoil extends BrewAsset {
    render() {
        const assetClass = "coil";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <line className="tube" x1="17.5" y1="40" x2="22.5" y2="10"/>
                <line className="tube" x1="27.5" y1="40" x2="32.5" y2="10"/>
                <polyline className="tube" points="37.5 40 42.5 10 45 25"/>
                <polyline className="tube" points="5 25 7.5 40 12.5 10"/>
                <line className="tube" x1="5" y1="25" y2="25"/>
                <line className="tube" x1="45" y1="25" x2="50" y2="25"/>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetHeater extends BrewAsset {
    render() {
        const assetClass = "heater";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <rect x="10" y="10" width="30" height="30"/>
                <g className="heater-icon">
                    <path className="heater-vapor" d="M17,32.5c0-2.5,2-2.5,2-5s-2-2.5-2-5,2-2.5,2-5"/>
                    <path className="heater-vapor" d="M24,32.5c0-2.5,2-2.5,2-5s-2-2.5-2-5,2-2.5,2-5"/>
                    <path className="heater-vapor" d="M31,32.5c0-2.5,2-2.5,2-5s-2-2.5-2-5,2-2.5,2-5"/>
                </g>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetCooler extends BrewAsset {
    getFluidClass() {
        var fluid = this.props.data.fluid ? " fluid" : "";
        var fluidA = this.props.data.fluidA ? " fluid-a" : "";
        var fluidB = this.props.data.fluidB ? " fluid-b" : "";
        var liquid = "";
        if (fluid + fluidA + fluidB != "") {
            liquid = " liquid-" + this.props.data.liquid;
        }
        return fluid + fluidA + fluidB + liquid;
    }

    render() {
        const assetClass = "cooler";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <g className="cooler-icon">
                    <polyline points="21.79 14.92 25 18.75 28.21 14.92"/>
                    <polyline points="28.21 35.08 25 31.25 21.79 35.08"/>
                    <polyline points="14.66 22.74 19.59 21.88 17.88 17.18"/>
                    <polyline points="35.34 27.26 30.41 28.13 32.12 32.82"/>
                    <polyline points="17.88 32.82 19.59 28.13 14.66 27.26"/>
                    <polyline points="32.12 17.18 30.41 21.88 35.34 22.74"/>
                    <polyline points="25 12.5 25 25 25 37.5"/>
                    <polyline points="14.18 18.75 25 25 35.83 31.25"/>
                    <polyline points="14.18 31.25 25 25 35.83 18.75"/>
                </g>
                <line className="tube-b" x1="25" y1="10" x2="25"/>
                <line className="tube-b" x1="25" y1="40" x2="25" y2="50"/>
                <line className="tube-a" x1="40" y1="25" x2="50" y2="25"/>
                <line className="tube-a" x1="10" y1="25" y2="25"/>
                <rect x="10" y="10" width="30" height="30"/>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetPump extends BrewAssetToggle {
    clickHandler() {
        let data = this.props.data;
        BrewGridActions.changeData(data);
    }

    isActive() {
        if (this.props.data.prop !== undefined)
            return !!this.props.data.prop.status;
        else
            super.isActive();
    }

    render() {
        const assetClass = "pump";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <g>
                    <line className="tube" y1="25" x2="10" y2="25"/>
                    <line className="tube" x1="17.5" y1="25" x2="32.5" y2="25"/>
                    <line className="tube" x1="40" y1="25" x2="50" y2="25"/>
                </g>
                <circle cx="25" cy="25" r="15"/>
                <path className="pump-icon"
                      d="M37,28.66a12.37,12.37,0,0,0,.23-6.44,13.71,13.71,0,0,0-3.6.07,9,9,0,0,0-1.47-2.78A16.65,16.65,0,0,1,36,19.13a12.54,12.54,0,0,0-4.39-4.71A13.67,13.67,0,0,0,29.15,17a8.93,8.93,0,0,0-3-.94,16.65,16.65,0,0,1,2.5-3,12.38,12.38,0,0,0-6.43-.23,13.73,13.73,0,0,0,.07,3.6,9,9,0,0,0-2.78,1.46A16.66,16.66,0,0,1,19.13,14a12.54,12.54,0,0,0-4.71,4.39A13.66,13.66,0,0,0,17,20.85a8.92,8.92,0,0,0-.94,3,16.67,16.67,0,0,1-3-2.5,12.37,12.37,0,0,0-.23,6.44,13.69,13.69,0,0,0,3.6-.07,9,9,0,0,0,1.47,2.79,16.21,16.21,0,0,1-3.49.39l-.43,0a12.54,12.54,0,0,0,4.4,4.71A13.66,13.66,0,0,0,20.85,33a8.92,8.92,0,0,0,3,.94,16.67,16.67,0,0,1-2.5,3,12.38,12.38,0,0,0,6.44.23,13.69,13.69,0,0,0-.07-3.6,9,9,0,0,0,2.78-1.46A16.67,16.67,0,0,1,30.86,36a12.54,12.54,0,0,0,4.71-4.39A13.66,13.66,0,0,0,33,29.15a8.92,8.92,0,0,0,.94-3A16.65,16.65,0,0,1,37,28.66ZM25,31a6,6,0,1,1,6-6A6,6,0,0,1,25,31Z"/>
            </svg>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetValve extends BrewAssetToggle {
    clickHandler() {
        let data = this.props.data;
        BrewGridActions.changeValve(data);
    }

    isActive() {
        if (this.props.data.prop !== undefined)
            return !!this.props.data.prop.status;
        else
            super.isActive();
    }

    getFluidClass() {
        var fluid = this.props.data.fluid ? " fluid" : "";
        var fluidA = this.props.data.fluidA ? " fluid-a" : "";
        var fluidB = this.props.data.fluidB ? " fluid-b" : "";
        var liquid = "";
        if (fluid + fluidA + fluidB != "") {
            liquid = " liquid-" + this.props.data.liquid;
        }
        return fluid + fluidA + fluidB + liquid;
    }

    render() {
        const assetClass = "valve";
        const assetCode =
            <div>
                <svg viewBox="0 0 50 50" className="valve-icon">
                    <g>
                        <circle cx="25" cy="25" r="15"/>
                        <path d="M31.27,21.46a5,5,0,0,1,0,7.07"/>
                        <path d="M18.73,28.54a5,5,0,0,1,0-7.07"/>
                    </g>
                    <line className="tube-c tube" x1="25" y1="10" x2="25" y2="40"/>
                </svg>
                <svg viewBox="0 0 50 50">
                    <line className="tube-a tube" y1="25" x2="10" y2="25"/>
                    <line className="tube-b tube" x1="40" y1="25" x2="50" y2="25"/>
                </svg>
            </div>;
        return super.render(assetCode, assetClass, true);
    }
}

class BrewAssetShower extends BrewAsset {
    render() {
        const assetClass = "shower";
        const assetCode =
            <svg viewBox="0 0 50 50">
                <line className="tube" x1="25" y1="15" x2="25"/>
                <g className="shower-icon">
                    <path d="M37.5,27.5c0,6.9-25,6.9-25,0a12.5,12.5,0,0,1,25,0Z"/>
                    <line x1="12.5" y1="27.5" x2="37.5" y2="27.5"/>
                </g>
            </svg>;
        return super.render(assetCode, assetClass, false);
    }
}

export {
    BrewAssetSquare,
    BrewAssetTank
}
