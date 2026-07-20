import NodeCache from "node-cache";

const memoryCache = new NodeCache({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false
});

export default memoryCache;