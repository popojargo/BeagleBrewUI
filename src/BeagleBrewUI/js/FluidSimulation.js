import ArrayScraper from './ArrayScraper';

class FluidSimulation {
    constructor(assetGrid, tankGrid, statusGrid) {
        this.assetGrid = assetGrid;
        this.tankGrid = tankGrid;
        this.statusGrid = statusGrid;
        this.fluidGrid = [];
        this.starts = [];
        this.ends = [];

        this.initializeGrid();
        this.findStartsEnds();
        this.simulateFluid(statusGrid);
    }

    // Getter
    getFluidGrid() {
        return this.fluidGrid;
    }

    /**
     * Creates a placeholder grid with the assetGrid dimensions
     */
    initializeGrid() {
        for(const gridRow of this.assetGrid) {
            let row = [];
            for(const asset of gridRow) {
                if(asset === null) {
                    row.push(null);
                    continue;
                }
                let assetFluid = {
                    fluid: false,
                    liquid: 1
                }
                if(asset.assetId === "t4" || asset.assetId === "cool") {
                    assetFluid.fluidA = false;
                    assetFluid.fluidB = false;
                    assetFluid.liquidA = 1;
                    assetFluid.liquidB = 1;
                }
                row.push(assetFluid);
            }
            this.fluidGrid.push(row);
        }
    }

    /**
     * Finds the starts and ends of the tubes
     */
    findStartsEnds() {
        // Find I/O in grid assets
        ArrayScraper.scrape(this.assetGrid, (asset, i) => {
            if(asset === null) return;
            var elem = {
                x: i[1] + 1,
                y: i[0] + 1,
                liquid: asset.liquid,
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

        ArrayScraper.scrape(this.tankGrid, (tank) => {
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

    /**
     * Starts the simulation of the fluid
     * @param  {Array} statusGrid Grid containing the states of the misc
     */
    simulateFluid(statusGrid) {
        this.statusGrid = statusGrid;
        this.removeFluid();
        for(const startPoint of this.starts) {
            if(startPoint.open) {
                var fluid = new Fluid(startPoint);
                this.addFluid(fluid);
            }
        }
    }

    /**
     * Empties the fluid inside the system
     */
    removeFluid() {
        ArrayScraper.scrape(this.fluidGrid, (asset) => {
            if(asset === null) return;
            asset.fluid = false;
            asset.fluidA = asset.fluidA ? false : null;
            asset.fluidB = asset.fluidB ? false : null;
            asset.fluidC = asset.fluidC ? false : null;
        });
    }

    /**
     * Adds specified fluid in the system
     * @param {Fluid} fluid The fluid to be added
     */
    addFluid(fluid) {
        var asset = this.assetGrid[fluid.y][fluid.x];
        var assetFluid = this.fluidGrid[fluid.y][fluid.x];
        var assetStatus = this.statusGrid[fluid.y][fluid.x];
        const point = {
            x: fluid.x,
            y: fluid.y
        };
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
                    assetFluid.fluidA = true;
                    assetFluid.liquidA = fluid.liquid;
                } else {
                    assetFluid.fluidB = true;
                    assetFluid.liquidB = fluid.liquid;
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
                if(!((fluid.direction / 90) % 2)) {
                    assetFluid.fluidA = true;
                    assetFluid.liquidA = fluid.liquid;
                } else {
                    assetFluid.fluidB = true;
                    assetFluid.liquidB = fluid.liquid;
                }
                fluid.moveUp();
                // fluidA - fluidB / liquidA - liquidB
                break;
            case "valv":
                // Valve
                // straight
                if(!!assetStatus.status) {
                    fluid.moveUp();
                    if(assetFluid.fluid) {
                        // TODO: don't cross the streams!
                        return;
                    }
                } else {
                    fluidState = false;
                    if(fluid.direction === asset.rotation) {
                        assetFluid.liquidA = fluid.liquid;
                        assetFluid.fluidA = true;
                    } else {
                        assetFluid.liquidB = fluid.liquid;
                        assetFluid.fluidB = true;
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
        assetFluid.liquid = fluid.liquid;
        assetFluid.fluid = fluidState;
        if(this.checkEnding(point)) return;
        if(this.fluidGrid[fluid.y][fluid.x] == null) return;
        this.addFluid(fluid);
        // this.assetGrid[point.y][point.x] = asset;
    }

    /**
     * Returns if the specified point is an ending
     * @param  {Object} point The position to be checked
     * @return {Boolean}      True if position is an ending
     */
    checkEnding(point) {
        for(const end of this.ends) {
            if(point.x === end.x && point.y === end.y) {
                return true;
            }
        }
        return false;
    }
}

class Fluid {
    constructor(startPoint) {
        this.x = startPoint.x;
        this.y = startPoint.y;
        this.direction = startPoint.direction;
        this.liquid = startPoint.liquid;
        this.updateFluid();

        // this.move = this.move.bind(this);
        this.split = this.split.bind(this);
        this.moveLeft = this.moveLeft.bind(this);
        this.moveRight = this.moveRight.bind(this);
        this.moveUp = this.moveUp.bind(this);
    }

    /**
     * Moves the fluid to its left
     */
    moveLeft() {
        const newPoint = this.getNewPoint(this.left);
        this.moveTo(newPoint);
        this.direction = this.left;
    }

    /**
     * Moves the fluid to its right
     */
    moveRight() {
        const newPoint = this.getNewPoint(this.right);
        this.moveTo(newPoint);
        this.direction = this.right;
    }

    /**
     * Moves the fluid to its front
     */
    moveUp() {
        const newPoint = this.getNewPoint(this.direction);
        this.moveTo(newPoint);
    }

    /**
     * Returns the new position of the fluid following the specified direction
     * @param  {int}    newDirection    Angle of the direction in CW degrees (0 is right)
     * @return {Object}                 Returns the new position of the fluid
     */
    getNewPoint(newDirection) {
        /*
            Ex. direction : 270 (Going up, expected: y--)
            (270/90) = 3 | 3 % 2 = 1 ==> is vertical
            (270/90) = 3 | 3 - (1 + 1) = 1 | 1 * -1 = -1
            ==> y += -1 ==> y--
        */
        let point = {
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

    /**
     * Sets the fluid position to the specified point
     * @param  {Object} point The new position
     */
    moveTo(point) {
        this.x = point.x;
        this.y = point.y;
        this.updateFluid();
    }

    /**
     * Updates the fluid surrounding directions
     */
    updateFluid() {
        const newDirection = new Direction(this.direction);
        this.left = newDirection.left();
        this.right = newDirection.right();
    }

    /**
     * Returns a copy of the current fluid
     * @return {Fluid} The new copy of the fluid
     */
    split() {
        const currentPoint = {
            x: this.x,
            y: this.y,
            liquid: this.liquid,
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

    /**
     * Returns the angle 90 degrees to the left of its rotation
     * @return {int} The angle to the left
     */
    left() {
        return (this.rotation + 270) % 360;
    }

    /**
     * Returns the angle 90 degrees to the right of its rotation
     * @return {int} The angle to the right
     */
    right() {
        return (this.rotation + 90) % 360;
    }
}

export default FluidSimulation;
