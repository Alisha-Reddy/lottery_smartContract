const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("1")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
<<<<<<< HEAD
    let vrfCoordinatorV2Address, subscriptionId
=======
    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock
>>>>>>> ce6c0da (5)

    if (developmentChains.includes(network.name)) {
        log("local network detected")
        // const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock")
        // log("vrfCoordinatorV2Mock :", vrfCoordinatorV2Mock)
        const deployment = await deployments.get("VRFCoordinatorV2Mock")
<<<<<<< HEAD
        const vrfCoordinatorV2Mock = await ethers.getContractAt(deployment.abi, deployment.address)
=======
         vrfCoordinatorV2Mock = await ethers.getContractAt(deployment.abi, deployment.address)
>>>>>>> ce6c0da (5)
        // vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        // log("vrfCoordinatorV2Address:", vrfCoordinatorV2Address)
        vrfCoordinatorV2Address = deployment.address
        // log('vrfCoordinatorV2Address:', vrfCoordinatorV2Address)
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        // log("transactionResponse:" , transactionResponse)
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId
        //Fund the subscription
        //Usually, you'd need the link token on a real network
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
<<<<<<< HEAD
=======
        
>>>>>>> ce6c0da (5)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }
<<<<<<< HEAD
    
=======
>>>>>>> ce6c0da (5)

    const enteranceFee = networkConfig[chainId]["enteranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]

    const args = [
        vrfCoordinatorV2Address,
        enteranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval,
    ]

    const lottery = await deploy("Lottery", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

<<<<<<< HEAD
=======
    if (developmentChains.includes(network.name)) {   
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, lottery.address)
        // log("Consumer is added")
    }


>>>>>>> ce6c0da (5)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying...")
        await verify(lottery.address, args)
    }

    log("-------------------------------------------")
}

module.exports.tags = ["all", "lottery"]
