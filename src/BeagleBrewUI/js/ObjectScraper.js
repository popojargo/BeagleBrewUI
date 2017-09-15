class ObjectScraper {
    scrape(obj, k, v) {
        for(const key in obj) {
            let value = obj[key];
            if(typeof value === "object") {
                let ans = this.scrape(value, k, v);
                if(ans[k] === v) return ans;
            } else if(key === k && value === v)
                return obj;
        }
        return false;
    }
}

const objectScraper = new ObjectScraper();

export default objectScraper;
