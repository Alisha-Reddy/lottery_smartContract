# Lottery Smart Contract

## 🎯 Project Overview

This project implements a decentralized lottery system using Ethereum smart contracts. It leverages Chainlink VRF for randomness and Chainlink Keepers for automated execution, ensuring a fair and transparent experience for participants.

## 🔧 Technologies Used

- **Solidity:** Smart contract development.
- **Hardhat:** Ethereum development environment.
- **Chainlink VRF:** Verifiable random number generation.
- **Chainlink Keepers:** Automated smart contract execution.

## 🚀 Features

- **Random Winner Selection:** Ensures fairness with Chainlink VRF.
- **Automated Rounds:** Uses Chainlink Keepers to manage lottery cycles.
- **Customizable Entry Fees:** Flexible settings for various use cases.

## 🛠️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/your-username/lottery-smart-contract.git

# Navigate to the project directory
cd lottery-smart-contract

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
