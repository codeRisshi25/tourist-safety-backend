// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TouristRegistry {
    address public owner;
    // Mapping from the tourist's database ID (UUID as string) to the hash of their data
    mapping(string => bytes32) public touristProofs;

    event IdIssued(string indexed touristDbId, bytes32 dataHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    constructor() {
        owner = msg.sender; // The deployer (your backend service) is the owner
    }

    /**
     * @dev Issues a new ID by storing a hash of the tourist's verified data.
     * @param _touristDbId The tourist's primary key from the PostgreSQL database.
     * @param _dataHash A SHA-256 hash of the tourist's key data.
     */
    function issueId(string memory _touristDbId, bytes32 _dataHash) public onlyOwner {
        require(touristProofs[_touristDbId] == 0, "ID already exists.");
        touristProofs[_touristDbId] = _dataHash;
        emit IdIssued(_touristDbId, _dataHash);
    }

    /**
     * @dev Public function to verify if a given data hash matches the one on-chain.
     */
    function verifyProof(string memory _touristDbId, bytes32 _dataHash) public view returns (bool) {
        return touristProofs[_touristDbId] == _dataHash;
    }
}