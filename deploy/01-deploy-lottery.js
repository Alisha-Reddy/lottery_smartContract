const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("1")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2_5Address, subscriptionId, vrfCoordinatorV2_5Mock

    if (developmentChains.includes(network.name)) {
        log("local network detected")
        // const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2_5Mock")
        // const vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2_5Mock")
        // log("vrfCoordinatorV2Mock :", vrfCoordinatorV2Mock)
        const deployment = await deployments.get("VRFCoordinatorV2_5Mock")
        vrfCoordinatorV2_5Mock = await ethers.getContractAt(deployment.abi, deployment.address)
        // vrfCoordinatorV2_5Address = vrfCoordinatorV2_5Mock.address
        // log("vrfCoordinatorV2_5Address:", vrfCoordinatorV2_5Address)
        vrfCoordinatorV2_5Address = deployment.address
        // log('vrfCoordinatorV2_5Address:', vrfCoordinatorV2_5Address)
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        // log("transactionResponse:" , transactionResponse)
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId
        // console.log("......")
        // console.log("subscriptionId : ", subscriptionId.toString())
        console.log(".....")
        console.log("subscriptionId : ", subscriptionId.toString())
        //Fund the subscription
        //Usually, you'd need the link token on a real network
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)


    } else {
        vrfCoordinatorV2_5Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    const enteranceFee = networkConfig[chainId]["enteranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]

    const args = [
        vrfCoordinatorV2_5Address,
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

    if (developmentChains.includes(network.name)) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, lottery.address)
        // console.log(subscriptionId)
        console.log("Consumer is added")
    }


    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("verifying...")
        await verify(lottery.address, args)
    }

    log("-------------------------------------------")
}

module.exports.tags = ["all", "lottery"]
