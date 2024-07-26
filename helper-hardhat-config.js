const { ethers } = require("hardhat")

const networkConfig = {
    11155111: {
        name: "sepolia",
        vrfCoordinatorV2: "0x9ddfaca8183c41ad55329bdeed9f6a8d53168b1b",
        enteranceFee: ethers.utils.parseEther("0.005"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        subscriptionId:
            "10934790610309635938768864170246170727904081629632230265749781917397871379724",
        callbackGasLimit: "5000000", //500,000
        interval: "30", //30 sec
    },
    31337: {
        name: "hardhat",
        enteranceFee: ethers.utils.parseEther("0.005"),
        gasLane: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: "5000000", //500,000
        interval: "30", //30 sec
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
