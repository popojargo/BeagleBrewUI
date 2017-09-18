class ArrayScraper {
    /**
     * Applies the parameter function to the bottom children of the array
     * @param  {Array}      arr     Array to be scraped
     * @param  {Function}   f       Function to be used with the bottom children
     * @param  {Array}      indexes The position of the last children in the original array (used in the recursion)
     */
    scrape(arr, f, indexes) {
        let prevIndex = typeof indexes !== "undefined" ? indexes.slice(0) : [];
        arr.forEach((elem, i) => {
            let newIndex = prevIndex.slice(0);
            newIndex.push(i);
            if(Array.isArray(elem)) {
                this.scrape(elem, f, newIndex);
            } else {
                f(elem, newIndex);
            }
        })
    }
}

const instance = new ArrayScraper();

export default instance;
