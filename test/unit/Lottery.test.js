const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Tests", () => {
          let lottery, vrfCoordinatorV2_5Mock, lotteryEnteranceFee, deployer, interval
          const chainId = network.config.chainId

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              const vrfCoordinatorV2_5MockDeployed = await deployments.get("VRFCoordinatorV2_5Mock")
              vrfCoordinatorV2_5Mock = await ethers.getContractAt(
                  "VRFCoordinatorV2_5Mock",
                  vrfCoordinatorV2_5MockDeployed.address,
              )
              const lotteryDeployed = await deployments.get("Lottery")
              lottery = await ethers.getContractAt("Lottery", lotteryDeployed.address)
              lotteryEnteranceFee = await lottery.getEnteranceFee()
              interval = await lottery.getInterval()

              //   vrfCoordinatorV2_5Mock.addConsumer(1, lotteryDeployed.address)
          })

          describe("constructor", () => {
              it("initializes the lottery correctly", async () => {
                  //Ideally we make our tests have just 1 assert per "it"
                  const lotteryState = await lottery.getLotteryState()
                  assert.equal(lotteryState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })

          describe("Enter lottery", () => {
              it("reverts when you don't pay enough", async () => {
                  await expect(lottery.enterLottery()).to.be.revertedWith(
                      "Lottery__NotEnoughETHEntered",
                  )
              })

              it("records players when they enter", async () => {
                  await lottery.enterLottery({ value: lotteryEnteranceFee })
                  const playerFromContract = await lottery.getPalyers(0)
                  assert.equal(playerFromContract, deployer)
              })

              it("emits event on test", async () => {
                  await expect(lottery.enterLottery({ value: lotteryEnteranceFee })).to.emit(
                      lottery,
                      "LotteryEnter",
                  )
              })

              it("doesn't allow enterance when lottery is calculating", async () => {
                  await lottery.enterLottery({ value: lotteryEnteranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  //We pretend to be a chainlink keeper
                  await lottery.performUpkeep([])
                  await expect(
                      lottery.enterLottery({ value: lotteryEnteranceFee }),
                  ).to.be.revertedWith("Lottery_NotOpen")
              })
          })

          describe("checkUpkeep", () => {
              it("returns false if people haven't sent any ETH", async () => {
                  //   'network.provider.send' sends a command to the blockchain node.
                  //   "evm_increaseTime" is a special command that tells the blockchain to pretend that time has moved forward.
                  //   [interval.toNumber() + 1] is the amount of time to move forward. interval.toNumber() converts the interval to a number and + 1 adds one more unit of time.
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  //   Mine a New Block: This line mines a new block on the blockchain. Mining a block processes all pending transactions and updates the blockchain's state.
                  //   'evm_mine' is a command that tells the blockchain to create a new block. [] means there are no special parameters for this command.
                  await network.provider.send("evm_mine", [])
                  const { upKeepNeeded } = await lottery.callStatic.checkUpkeep([]) //This line calls a function on the lottery contract without actually changing the blockchain state (hence the callStatic part).
                  assert(!upKeepNeeded) //If upKeepNeeded is false (as expected when no one has sent any ETH), the test passes. If it's true, the test fails.
              })

              it("returns false if lottery isn't open", async function () {
                  await lottery.enterLottery({ value: lotteryEnteranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  await lottery.performUpkeep([])
                  const lotteryState = await lottery.getLotteryState()
                  const { upKeepNeeded } = await lottery.callStatic.checkUpkeep("0x")
                  assert.equal(lotteryState.toString(), "1")
                  assert.equal(upKeepNeeded, false)
              })

              it("returns false if enough time hasn't passed", async () => {
                  await lottery.enterLottery({ value: lotteryEnteranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 3])
                  await network.provider.send("evm_mine", [])
                  //   await network.provider.request({ method: "evm_mine", params: [] })
                  const { upKeepNeeded } = await lottery.callStatic.checkUpkeep("0x")

                  console.log("Interval:", interval.toNumber())
                  console.log("Upkeep Needed:", upKeepNeeded)

                  assert(!upKeepNeeded, "Expected upkeep to be false, but it was true.")
              })

              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await lottery.enterLottery({ value: lotteryEnteranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upKeepNeeded } = await lottery.callStatic.checkUpkeep("0x")
                  assert(upKeepNeeded)
              })
          })

          describe("performUpKeep", () => {
              it("it can only run if checkUpKeep is true", async () => {
                  await lottery.enterLottery({ value: lotteryEnteranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const tx = await lottery.performUpkeep([])
                  assert(tx)
              })

              it("reverts when checkUpkeep is false ", async () => {
                  await expect(lottery.performUpkeep([])).to.be.revertedWith(
                      "Lottery_UpKeepNotNeeded",
                  )
              })

              it("updates the lottery state, emits an event, and calls the vrf coordinator", async () => {
                  await lottery.enterLottery({ value: lotteryEnteranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const txResponse = await lottery.performUpkeep([])
                  const txReceipt = await txResponse.wait(1)
                  const requestId = txReceipt.events[1].args.requestId
                  const lotteryState = await lottery.getLotteryState()
                  assert(requestId.toNumber() > 0)
                  assert(lotteryState == 1) //0= open, 1 = calculating
              })
          })

          describe("fulfillRandomWords", () => {
              beforeEach(async () => {
                  await lottery.enterLottery({ value: lotteryEnteranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
              })

              it("can only be called after performUpKeep", async () => {
                  await expect(
                      vrfCoordinatorV2_5Mock.fulfillRandomWords(0, lottery.address),
                  ).to.be.revertedWith("InvalidRequest")
                  //   await expect(
                  //       vrfCoordinatorV2_5Mock.fulfillRandomWords(1, lottery.address),
                  //   ).to.be.revertedWith("nonexistent request")
              })

              it("picks a winner, resets the lottery, and sends money", async () => {
                  const additionalEntrants = 3
                  const startingAccountIndex = 1 //deployer = 0
                  const accounts = await ethers.getSigners()
                  for (
                      let i = startingAccountIndex;
                      i < startingAccountIndex + additionalEntrants;
                      i++
                  ) {
                      const accountConnectedLottery = lottery.connect(accounts[i])
                      await accountConnectedLottery.enterLottery({ value: lotteryEnteranceFee })
                  }
                  const startingTimeStamp = await lottery.getLatestTimeStamp()
                  const winnerStartingBalance = await accounts[1].getBalance()

                  //   performUpKeep (mock being Chainlink Keepers)
                  //   fulfillRandomWords (mock being the Chainlink VRF)
                  //   we will have to wait for the fulfillRandomWords to be called
                  await new Promise(async (resolve, reject) => {
                      console.log("here 1")
                      lottery.once("WinnerPicked", async () => {
                          console.log("Found the event!")
                          try {
                              const recentWinner = await lottery.getRecentWinner()
                              console.log(recentWinner)
                              console.log(accounts[2].address)
                              console.log(accounts[0].address)
                              console.log(accounts[1].address)
                              console.log(accounts[3].address)
                              const lotteryState = await lottery.getLotteryState()
                              const endingTimeStamp = await lottery.getLatestTimeStamp()
                              const numPlayers = await lottery.getNumberOfPlayers()
                              const winnerEndingBalance = await accounts[1].getBalance()
                              assert.equal(numPlayers.toString, "0")
                              assert.equal(lotteryState.toString, "0")
                              assert(endingTimeStamp > startingTimeStamp)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(
                                      lotteryEnteranceFee
                                          .mul(additionalEntrants)
                                          .add(lotteryEnteranceFee)
                                          .toString(),
                                  ),
                              )
                              resolve()
                          } catch (e) {
                              reject(e)
                          }
                      })
                      //Setting up the listener

                      try {
                          console.log("here 3!")
                          const tx = await lottery.performUpkeep("0x")
                          console.log("here 4!")
                          const txReceipt = await tx.wait(1)

                          //   // Ensure txReceipt.events[1].args.requestId is correct
                          //   const requestId = txReceipt.events[1].args.requestId
                          //   console.log("Request ID:", requestId)

                          //   below, we will fire the event and the listener will pick it up and resolve
                          console.log("here 2")
                          await vrfCoordinatorV2_5Mock.fulfillRandomWords(
                              txReceipt.events[1].args.requestId,
                              lottery.address,
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
      })
