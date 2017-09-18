class FluidSimulation {
    constructor(assetGrid, tankGrid) {
        this.assetGrid = assetGrid;
        this.tankGrid = tankGrid;
        this.starts = [];
        this.ends = [];

        this.findStartsEnds();
        this.simulateFluid();
    }
    getAssetGrid() {
        return this.assetGrid;
    }
    /* Adds the starts and ends of fluids */
    findStartsEnds() {
        // Find I/O in grid assets
        this.arrayScan(this.assetGrid, (asset) => {
            if(asset === null) return;
            var elem = {
                x: asset.x,
                y: asset.y,
                direction: asset.rotation
            };
            switch (asset.assetId) {
                case "in":
                    elem.open = asset.open;
                    this.starts.push(elem);
                    break;
                case "out":
                    this.ends.push(elem);
                    break;
                default:

            }
        });

        this.arrayScan(this.tankGrid, (tank) => {
            for(const output of tank.outputs) {
                var testY = output.y - tank.y - 1;
                var testX = output.x - tank.x - 1;

                var rotation = 0;
                if(testX < 0) {
                    // X left or middle
                    if(output.x < tank.x + 1) {
                        rotation = 180;
                    } else {
                        if (testY < 0) {
                            // Y top or middle
                            if(output.y < tank.y + 1) {
                                rotation = 270;
                            } else {
                                return;
                            }
                        } else {
                            rotation = 90;
                        }
                    }
                }
                output.direction = rotation;
            }
            this.starts = this.starts.concat(tank.outputs);
            this.ends = this.ends.concat(tank.inputs);
        });

        // Put positions with 0 as starting point
        for(const pos of this.starts) {
            pos.x--;
            pos.y--;
        }
        for(const pos of this.ends) {
            pos.x--;
            pos.y--;
        }
    }
    /* Starts fluid simulation in open ports */
    simulateFluid() {
        debugger;
        this.removeFluid();
        for(const startPoint of this.starts) {
            // if(startPoint.open) {
                var fluid = new Fluid(startPoint);
                this.addFluid(fluid);
            // }
        }
    }
    /* Removes fluid off the system */
    removeFluid() {
        this.arrayScan(this.assetGrid, (asset) => {
            if(asset === null) return;
            asset.fluid = false;
            asset.fluidA = asset.fluidA ? false : null;
            asset.fluidB = asset.fluidB ? false : null;
            asset.fluidC = asset.fluidC ? false : null;
        });
    }
    /* Adds fluid to point */
    addFluid(fluid) {
        var asset = this.assetGrid[fluid.y][fluid.x];
        const point = {
            x: fluid.x,
            y: fluid.y
        };
        console.log(point)
        var fluidState = true;
        switch(asset.assetId) {
            case "t2":
                // Curved Tube
                // right side
                if(fluid.direction === asset.rotation) {
                    fluid.moveRight();
                } else {
                    fluid.moveLeft();
                }
                break;
            case "t3":
                var splitFluid = fluid.split();
                // T-Connector Tube
                // sides / straight
                switch(asset.rotation) {
                    case fluid.direction:
                        fluid.moveUp();
                        splitFluid.moveRight();
                        break;
                    case (fluid.direction + 90) % 360:
                        fluid.moveLeft();
                        splitFluid.moveRight();
                        break;
                    case (fluid.direction + 180) % 360:
                        fluid.moveUp();
                        splitFluid.moveLeft();
                        break;
                    default:
                        // impossible
                        return;
                }
                this.addFluid(splitFluid);
                break;
            case "t4":
                // Intersection Tube
                // straight
                // fluidA - fluidB / liquidA - liquidB
                fluidState = false;
                if(!((fluid.direction / 90) % 2)) {
                    asset.fluidA = true;
                } else {
                    asset.fluidB = true;
                }
                fluid.moveUp();
                break;
            case "coil":
                // Coil
                // straight
                fluid.moveUp();
                // If water goes through heat it if tank is hot too???
                break;
            case "heat":
                // nothing
                break;
            case "cool":
                // Cooler
                // straight
                fluidState = false;
                asset.active = false;
                if(!((fluid.direction / 90) % 2)) {
                    asset.fluidA = true;
                } else {
                    asset.fluidB = true;
                }
                if(asset.fluidA && asset.fluidB) {
                    asset.active = true;
                }
                fluid.moveUp();
                // fluidA - fluidB / liquidA - liquidB
                break;
            case "valv":
                // Valve
                // straight
                if(asset.active) {
                    fluid.moveUp();
                    if(asset.fluid) {
                        // TODO: don't cross the streams!
                        return;
                    }
                } else {
                    fluidState = false;
                    if(fluid.direction === asset.rotation) {
                        asset.fluidA = true;
                    } else {
                        asset.fluidB = true;
                    }
                    return;
                }
                break;
            default:
                // straight
                fluid.moveUp();
        }
        if(point.y === fluid.y && point.x === fluid.x) {
            console.log(point)
            console.log("something is bad")
            return;
        }
        asset.fluid = fluidState;
        if(this.checkEnding(point)) return;
        this.addFluid(fluid);
        this.assetGrid[point.y][point.x] = asset;
    }
    /* Returns true if there is an end at specified point */
    checkEnding(point) {
        for(const end of this.ends) {
            if(point.x === end.x && point.y === end.y) {
                return true;
            }
        }
        return false;
    }
    /* Applies the parameter function to the bottom children of the array */
    arrayScan(arr, f) {
        for(let elem of arr) {
            if(Array.isArray(elem)) {
                this.arrayScan(elem, f);
            } else {
                f(elem);
            }
        }
    }
}

class Fluid {
    constructor(startPoint) {
        this.x = startPoint.x;
        this.y = startPoint.y;
        if(typeof startPoint.direction === "undefined") {
            // do something
        } else {
            this.direction = startPoint.direction;
        }
        this.updateFluid();

        // this.move = this.move.bind(this);
        this.split = this.split.bind(this);
        this.moveLeft = this.moveLeft.bind(this);
        this.moveRight = this.moveRight.bind(this);
        this.moveUp = this.moveUp.bind(this);
    }
    moveLeft() {
        const newPoint = this.getNewPoint(this.left);
        this.moveTo(newPoint);
        this.direction = this.left;
    }
    moveRight() {
        const newPoint = this.getNewPoint(this.right);
        this.moveTo(newPoint);
        this.direction = this.right;
    }
    moveUp() {
        const newPoint = this.getNewPoint(this.direction);
        this.moveTo(newPoint);
    }
    getNewPoint(newDirection) {
        /*
            Ex. direction : 270 (Going up, expected: y--)
            (270/90) = 3 | 3 % 2 = 1 ==> is vertical
            (270/90) = 3 | 3 - (1 + 1) = 1 | 1 * -1 = -1
            ==> y += -1 ==> y--
        */
        var point = {
            x: this.x,
            y: this.y
        }
        const isVertical = (newDirection / 90) % 2;
        const delta = ((newDirection / 90) - (isVertical + 1)) * -1;
        if(!isVertical) {
            point.x += delta;
        } else {
            point.y += delta;
        }
        return point;
    }
    moveTo(point) {
        this.x = point.x;
        this.y = point.y;
        this.updateFluid();
    }
    updateFluid() {
        const newDirection = new Direction(this.direction);
        this.left = newDirection.left();
        this.right = newDirection.right();
    }
    split() {
        const currentPoint = {
            x: this.x,
            y: this.y,
            direction: this.direction
        };
        return new Fluid(currentPoint);
    }
}




class Direction {
    constructor(rotation) {
        this.rotation = rotation;
        this.left = this.left.bind(this);
        this.right = this.right.bind(this);
    }
    left() {
        return (this.rotation + 270) % 360;
    }
    right() {
        return (this.rotation + 90) % 360;
    }
}

export default FluidSimulation;
