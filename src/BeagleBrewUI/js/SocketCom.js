/**
 * Created by Alexis on 2017-07-05.
 */
import io from 'socket.io-client';

import config from "../../internals/api-config";

class SocketCom {

    constructor(ip, port) {
        //Param validation and default values
        if (!ip)
            ip = config.ip;
        if (!port)
            port = config.port;

        /**
         *
         * @type {io}
         */
        this.socket = new io(ip + ":" + port);
        this.socket.on('connect', this._onConnect.bind(this));
        this.socket.on('disconnect', this._onDisconnect.bind(this));
        this.socket.on('state change', this._onStateChange.bind(this));

        this.stateChangeSubs = {};
    }

    /**
     * Callback function when the socket gets connected
     * @private
     */
    _onConnect() {
        console.log('[Socket] Connected');
    }

    /**
     * Callback when the socket gets disconnected
     * @private
     */
    _onDisconnect() {
        console.log('[Socket] Disconnected');
        //TODO : Reset admin control if it had
    }

    /**
     * Add a subscription to the StateChange event
     * @param id The id of the subscription
     * @param fun The callback of the subscription.
     */
    addStateChangeSub(id, fun) {
        if (!id || !fun || typeof fun !== "function")
            throw new TypeError("The id parameter must be valid and the fun parameter must be a function");
        this.stateChangeSubs[id] = fun;
    }

    /**
     * Remove the state change subscriber if found.
     * @param id The id of the subscription
     * @returns {boolean} True if removed. Otherwise false (if not found).
     */
    removeStateChangeSub(id) {
        if (this.stateChangeSubs[id]) {
            delete this.stateChangeSubs[id];
            return true;
        }
        return false;
    }

    /**
     * Callback when the socket receive new state changes.
     * It handle the subscriptions
     * @private
     */
    _onStateChange(data) {
        for (let n in this.stateChangeSubs)
            if (this.stateChangeSubs.hasOwnProperty(n))
                this.stateChangeSubs[n](data);
    }

    /**
     * Get the Socket object
     * @returns {io}
     */
    getSocket() {
        return this.socket;
    }

    /**
     * Update a valve state
     * @param id The id of the valve to update
     * @param state The state of the valve
     */
    updateValve(id, state) {
        this.socket.emit('change valve state', {
            id: id, state: state
        });
    }

    /**
     * Updates the pump state
     * @param id The id of the pump
     * @param state The state to change
     */
    updatePump(id, state) {
        this.socket.emit('change pump state', {
            id: id, state: state
        });

    }

    /**
     * Update the temperature set on the tank
     * @param id The id of the tank
     * @param temp The temperature to set.
     */
    updateTank(id, temp) {
        this.socket.emit('change tank temp', {
            id: id, temp: temp
        });
    }
}

export default SocketCom;
