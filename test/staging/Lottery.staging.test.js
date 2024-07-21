const { network, getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle staging test", () => {
          let lottery, lotteryEnteranceFee, deployer

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              vrfCoordinatorV2Mock = await ethers.getContractAt(
                  "VRFCoordinatorV2Mock",
                  vrfCoordinatorV2MockDeployed.address,
              )
              const lotteryDeployed = await deployments.get("Lottery")
              lottery = await ethers.getContractAt("Lottery", lotteryDeployed.address)
              lotteryEnteranceFee = await lottery.getEnteranceFee()
          })
        
        describe("fulfillRandomWords", () => {
            it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async () => {
                // enter the lottery
                const startingTimeStamp = await lottery.getLatestTimeStamp()
                const accounts = await ethers.getSigners()
                console.log("1")

                await new Promise(async (resolve, reject) => {
                    lottery.once("WinnerPicked", async () => {
                        console.log("WinnerPicked event fired!")
                        try {
                            //add our asserts here
                            const recentWinner = await lottery.getRecentWinner()
                            const lotteryState = await lottery.getLotteryState()
                            const winnerEndingBalance = await accounts[0].getBalance()
                            const endingTimeStamp = await lottery.getLatestTimeStamp()

                            await expect(lottery.getPalyers(0)).to.be.reverted
                            assert.equal(recentWinner.toString(), accounts[0].address)
                            assert.equal(lotteryState, 0)
                            assert.equal(
                                winnerEndingBalance.toString(),
                                winnerStartingBalance.add(lotteryEnteranceFee).toString(),
                            )
                            assert(endingTimeStamp > startingTimeStamp)
                            resolve()
                        } catch (error) {
                            console.log(error)
                            reject(e)
                        }
                    })
                    //Then entering the lottery
                    await lottery.enterLottery({ value: lotteryEnteranceFee })
                    const winnerStartingBalance = await accounts[0].getBalance()
                    
                    // and this code wont complete until our listener has finished listening!
                })

                //setup listener before we eneter the lottery
                //Just in case the blockchain moves really fast

                
            })
        })
      })
