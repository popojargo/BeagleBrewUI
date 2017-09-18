class ObjectScraper {
    /**
     * Internal recursive function to scrape an object
     * @param obj The object to scrape
     * @param k The key to compare with
     * @param v The value to compare with
     * @param info {{data: boolean, parent: null}} data represented the object if found. parent is the name of the parent.
     * @returns {object} The actual object found or false.
     * @private
     */
    _scrape(obj, k, v, info) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];
                if (typeof value === "object") {
                    let ans = this._scrape(value, k, v, info);
                    if (ans && ans[k] === v) {
                        info.parent = key;
                        return ans;
                    }
                } else if (key === k && value === v)
                    return obj;
            }
        }
        return false;
    }

    /**
     * Get a sub object by finding a matching key-value pair.
     * @param obj The object to scrape
     * @param k The key to compare with
     * @param v The value to compare with
     * @returns {{data: boolean, parent: null}} data represented the object if found. parent is the name of the parent.
     */
    scrape(obj, k, v) {
        let info = {data: false, parent: null};
        info.data = this._scrape(obj, k, v, info);
        return info;
    }
}

const objectScraper = new ObjectScraper();

export default objectScraper;
