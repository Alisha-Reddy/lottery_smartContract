const { ethers } = require("hardhat")

const networkConfig = {
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2_5: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
        enteranceFee: ethers.utils.parseEther("0.005"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        subscriptionId:
            "111252104185184762594089519699972821903833555342884080396817028054692582683801",
        callbackGasLimit: "500000", //500,000
        interval: "30", //30 sec
    },
    31337: {
        name: "hardhat",
        enteranceFee: ethers.utils.parseEther("0.005"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: "500000", //500,000
        interval: "30", //30 sec
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}



// 0x0d7eb1c1a7638956149005f6d3b715fea7b414e0