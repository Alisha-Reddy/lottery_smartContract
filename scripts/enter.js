const { ethers, deployments, getNamedAccounts } = require("hardhat")

async function enterLottery() {
    // const {deployer} = await getNamedAccounts()
    const deployment = await deployments.get("Lottery")
    const lottery = await ethers.getContractAt(deployment.abi, deployment.address)
    console.log(lottery)

    const enteranceFee = await lottery.getEnteranceFee()
    await lottery.enterLottery({ value: enteranceFee })
    console.log("Entered!")
}

enterLottery().then(() => process.exit(0)).catch((error) => {
    console.error(error)
    process.exit(1)
})