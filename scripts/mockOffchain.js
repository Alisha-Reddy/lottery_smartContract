const { ethers, network, deployments, getNamedAccounts } = require("hardhat")

async function mockKeepers() {
    const { deployer } = await getNamedAccounts()
    const deployment = await deployments.get("Lottery")
    const lottery = await ethers.getContractAt("Lottery", deployment.address)
    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    console.log(checkData)
    const { upkeepNeeded } = await lottery.callStatic.checkUpkeep(checkData)
    if (upkeepNeeded) {
        const tx = await lottery.performUpkeep(checkData)
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events[1].args.requestId
        console.log(`Performed upkeep with RequestId: ${requestId}`)
        if (network.config.chainId == 31337) {
            await mockVrf(requestId, lottery)
        }
    } else {
        console.log("No upkeep needed!")
    }
}

async function mockVrf(requestId, lottery) {
    console.log("We on a local network? Ok let's pretend...")
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2_5Mock")
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, lottery.address)
    console.log("Responded!")
    const recentWinner = await lottery.getRecentWinner()
    console.log(`The winner is: ${recentWinner}`)
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
