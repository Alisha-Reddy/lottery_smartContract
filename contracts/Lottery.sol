//SPDX-License-Modifier: MIT
pragma solidity ^0.8.4;

// Enter the lottery (paying some amount)
// Pick a random winner (varifiably randome)
// Winner to be selected every X minutes --> completely automated

// Chainlink oracle is necessary for randomness and automated execution(Chainlink keeper)
<<<<<<< HEAD
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

=======
// import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
// import "@chainlink/contract/src/v0.8/vrf/dev/VRFCoordinatorV2_5.sol";
// import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
>>>>>>> ce6c0da (5)
error Lottery__NotEnoughETHEntered();
error Lottery_TransferFailed();
error Lottery_NotOpen();
error Lottery_UpKeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 lotteryState);

/**@title A sample Lottery Contract
 * @author Alisha Reddy Kondapu
 * @notice This contract is for creatying an untamperable decentralized smart contract
 * @dev This implements Chainlink VRF V2 and Chainlink Keepers
 */

<<<<<<< HEAD
contract Lottery is VRFConsumerBaseV2, AutomationCompatibleInterface {
=======
contract Lottery is VRFConsumerBaseV2Plus, AutomationCompatibleInterface {
>>>>>>> ce6c0da (5)
    /* Type declaration*/
    enum LotteryState {
        OPEN,
        CALCULATING
    } //uint256 0=OPEN, 1=CALCULATING

    /* State Variables */
    uint256 private immutable i_enteranceFee;
    address payable[] private s_players;
<<<<<<< HEAD
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
=======
    IVRFCoordinatorV2Plus private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint256 private immutable i_subscriptionId;
>>>>>>> ce6c0da (5)
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    //Lottery Variables
    address private s_recentWinner;
    LotteryState private s_lotteryState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;

    /* Evnets*/
    event LotteryEnter(address indexed player);
    event RequestedLotteryWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    /* Functions */
    constructor(
        address vrfCoordinatorV2, //contract address
        uint256 enteranceFee,
        bytes32 gasLane,
<<<<<<< HEAD
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_enteranceFee = enteranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
=======
        uint256 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2Plus(vrfCoordinatorV2) {
        i_enteranceFee = enteranceFee;
        i_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinatorV2);
>>>>>>> ce6c0da (5)
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp; //block.timestamp is a globally known variable
        i_interval = interval;
    }

    function enterLottery() public payable {
        if (msg.value < i_enteranceFee) {
            revert Lottery__NotEnoughETHEntered();
        }
        if (s_lotteryState != LotteryState.OPEN) {
            revert Lottery_NotOpen();
        }
        s_players.push(payable(msg.sender));

        emit LotteryEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for the `upKeepNeeded` to return true.
     * The following should be true in order to return true:
     * 1. Our time interval should have passed
     * 2. The lottery should have at least 1 player, and have some ETH
     * 3. Our subscription is funded with LINK
     * 4. The lottery should be in an "open" state.
     */
    function checkUpkeep(
        bytes memory /*checkData*/
    ) public override returns (bool upKeepNeeded, bytes memory /* performData*/) {
        bool isOpen = (LotteryState.OPEN == s_lotteryState);
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        upKeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
<<<<<<< HEAD
=======
        // return (upKeepNeeded, "0x0");
>>>>>>> ce6c0da (5)
    }

    function performUpkeep(bytes calldata /*performData*/) external override {
        (bool upKeepNeeded, ) = checkUpkeep("");
        if (!upKeepNeeded) {
            revert Lottery_UpKeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_lotteryState)
            );
        }

        s_lotteryState = LotteryState.CALCULATING;

        uint256 requestId = i_vrfCoordinator.requestRandomWords(
<<<<<<< HEAD
            i_gasLane, //gasLane
            i_subscriptionId, //Subscription ID that we need for funding requests (here it is to request a random number)
            REQUEST_CONFIRMATIONS, //It says how many confirmations the chainlink node should wait before responding
            i_callbackGasLimit, //The limit for how much gas to use for the callback request to our contract's fulfillRandomWords() function.
            NUM_WORDS // number of random words we need
        );
=======
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_gasLane, //gasLane
                subId: i_subscriptionId, //Subscription ID that we need for funding requests (here it is to request a random number)
                requestConfirmations: REQUEST_CONFIRMATIONS, //It says how many confirmations the chainlink node should wait before responding
                callbackGasLimit: i_callbackGasLimit, //The limit for how much gas to use for the callback request to our contract's fulfillRandomWords() function.
                numWords: NUM_WORDS, // number of random words we need
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        //THis is redudant!!
>>>>>>> ce6c0da (5)
        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /*requestId*/,
<<<<<<< HEAD
        uint256[] memory randomWords
=======
        uint256[] calldata randomWords
>>>>>>> ce6c0da (5)
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_lotteryState = LotteryState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");

        if (!success) {
            revert Lottery_TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /* view / pure functions*/

    function getEnteranceFee() public view returns (uint256) {
        return i_enteranceFee;
    }

    function getPalyers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getLotteryState() public view returns (LotteryState) {
        return s_lotteryState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
