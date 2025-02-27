const { network, getNamedAccounts, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { expect, assert } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle staging test", () => {
          let lottery, lotteryEnteranceFee, deployer

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              const lotteryDeployed = await deployments.get("Lottery")
              lottery = await ethers.getContractAt("Lottery", lotteryDeployed.address)
              lotteryEnteranceFee = await lottery.getEnteranceFee()
          })

          describe("fulfillRandomWords", () => {
              it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async () => {
                  // enter the lottery
                  console.log("Setting up test...")
                  const startingTimeStamp = await lottery.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()
                  const winnerStartingBalance = await accounts[0].getBalance()

                  await new Promise(async (resolve, reject) => {
                      //   try {
                      console.log("Setting up listener...")

                      //setup listener before we eneter the lottery
                      //Just in case the blockchain moves really fast
                      lottery.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              //add our asserts here
                              const recentWinner = await lottery.getRecentWinner()
                              const lotteryState = await lottery.getLotteryState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await lottery.getLatestTimeStamp()

                              //   Assert that the player list is reset
                              await expect(lottery.getPalyers(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(lotteryState, 0)
                            //   assert.equal(
                            //       winnerEndingBalance.toString(),
                            //       winnerStartingBalance.add(lotteryEnteranceFee).toString(),
                            //   )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log("Assertion error :", error)
                              reject(error)
                          }
                      })

                      //Then entering the lottery
                      console.log("Entering Lottery...")
                      const tx = await lottery.enterLottery({ value: lotteryEnteranceFee })
                      await tx.wait(1)
                      console.log("Lottery entry transaction confirmed.")
                      //   resolve()
                      //   } catch (error) {
                      //       console.log("Transcation error :", error)
                      //       reject(error)
                      //   }

                      // and this code wont complete until our listener has finished listening!
                  })
              })
          })
      })
