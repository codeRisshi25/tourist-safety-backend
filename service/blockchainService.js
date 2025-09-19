const { ethers, JsonRpcProvider, Wallet } = require("ethers"); // Changed import
const crypto = require("crypto");
const contractABI = require("./TouristRegistry.json").abi;
require("dotenv").config();

// -- config --
const GANACHE_URL = process.env.GANACHE_PROVIDER_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Initialize
const provider = new JsonRpcProvider(GANACHE_URL); // Changed instantiation
const wallet = new Wallet(PRIVATE_KEY, provider); // Changed instantiation
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

// ye name , id aur phone number se hash banayega
const createTouristDataHash = (touristData) => {
  const dataString = `${touristData.name}-${String(touristData.id)}-${
    touristData.phone
  }`;
  const hash = crypto.createHash("sha256").update(dataString).digest("hex");
  return `0x${hash}`;
};

// --- REGISTER A TOURIST ON BLOCKCHAIN ---
const registerTouristOnBlockchain = async (touristData) => {
  try {
    const dataHash = createTouristDataHash(touristData);
    console.log(
      `Issuing ID for Tourist DB ID: ${touristData.id} with hash: ${dataHash}`
    );
    const touristId = String(touristData.id);
    const tx = await contract.issueId(touristId, dataHash);
    const receipt = await tx.wait();
    console.log(`Tourist registered on blockchain with hash: ${dataHash}`);
    return receipt.hash; // yahi uski blockchain id hai
  } catch (error) {
    console.error("Error registering tourist on blockchain:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  registerTouristOnBlockchain,
};
