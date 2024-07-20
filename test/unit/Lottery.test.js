const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Tests", () => {
          let lottery, vrfCoordinatorV2Mock, lotteryEnteranceFee, deployer, interval
          const chainId = network.config.chainId

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer)
              lottery = await ethers.getContractAt("Lottery", deployer)
              lotteryEnteranceFee = await lottery.getEnteranceFee()
              interval = await lottery.getInterval()
          })

          describe("constructor", () => {
              it("initializes the lottery correctly", async () => {
                  //Ideally we make our tests hav just 1 assert per "it"
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
                        const playerFromContract = await lottery.getPlayer(0)
                        assert.equal(playerFromContract, deployer)
                    })

                    it("emits event on test", async () => {
                        await expect(lottery.enterLottery({ value: lotteryEnteranceFee })).to.emit(
                            lottery,
                            "LotteryEnter",
                        )
                    })

                    it("doesn't allow enterance when raffle is calculating", async () => {
                        await lottery.enterLottery({ value: lotteryEnteranceFee })
                        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                        await network.provider.send("evm_mine", [])
                        //We pretend to be a chainlink keeper
                        await lottery.performUpKeep([])
                        await expect(
                            lottery.enterLottery({ value: lotteryEnteranceFee }),
                        ).to.be.revertedWith("Lottery_NotOpen")
                    })
                })

                describe("checkUpKeep", () => {
                    it("returns false if peoplr haven't sewnt any ETH", async () => {
                        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                        await network.provider.send("evem_mine", [])
                        const { upKeepNeeded } = await lottery.callStatic.checkUpkeep([])
                        assert(![upKeepNeeded])
                    })

                    it("returns false if lottery isn't open", async function () {
                        await lottery.enterLottery({ value: lotteryEnteranceFee })
                        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                        await network.provider.send("evm_mine", [])
                        await lottery.performUpkeep([])
                        const lotteryState = await lottery.getLotteryState()
                        const { upKeepNeeded } = await lottery.callStatic.checkUpKeep([])
                        assert.equal(lotteryState.toString(), "1")
                        assert.equal(upKeepNeeded, false)
                    })

                    it("returns false if enough time hasn't passed", async () => {
                        await lottery.enterLottery({ value: lotteryEnteranceFee })
                        await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
                        await network.provider.request({ method: "evm_mine", params: [] })
                        const { upKeepNeeded } = await lottery.callStatic.checkUpKeep("0x")
                        assert(!upKeepNeeded)
                    })

                    it("returns true if enough time has passed, has players, eth, and is open", async () => {
                        await lottery.enterLottery({ value: lotteryEnteranceFee })
                        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                        await network.provider.request({ method: "evm_mine", params: [] })
                        const { upKeepNeeded } = await lottery.callStatic.checkUpKeep("0x")
                        assert(upKeepNeeded)
                    })
                })

                describe("performUpKeep", () => {
                    it("it can only run if checkUpKeep is true", async () => {
                        await lottery.enterLottery({ vlaue: lotteryEnteranceFee })
                        await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                        await network.provider.send("evm_mine", [])
                        const tx = await lottery.performUpKeep([])
                        assert(tx)
                    })
                })
      })
