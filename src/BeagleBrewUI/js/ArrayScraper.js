class ArrayScraper {
    /* Applies the parameter function to the bottom children of the array */
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
