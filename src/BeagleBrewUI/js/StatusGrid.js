import ObjectScraper from './ObjectScraper.js';

class StatusGrid {
    /**
     * Creates a statusGrid with the assetStatus
     * @param  {Array}  assetGrid   The asset grid that the status grid will be based on
     * @param  {Object} assetStatus The states of the assets
     * @return {Array}              The status grid
     */
    convert(assetGrid, assetStatus) {
        assetStatus = Object.assign({}, assetStatus);
        let statusGrid = [];
        for (const gridRow of assetGrid) {
            let row = [];
            for (const asset of gridRow) {
                if (asset === null) {
                    row.push(null);
                    continue;
                }
                let result = ObjectScraper.scrape(assetStatus, "id", asset.id);
                let status = result.data;
                if (status) {
                    row.push(status);
                    continue;
                }
                row.push(null);
            }
            statusGrid.push(row);
        }
        return statusGrid;
    }
}

const instance = new StatusGrid();

export default instance;
