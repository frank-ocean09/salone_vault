// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DocumentRegistry
 * @dev simple registry to prove existence of documents on-chain.
 */
contract DocumentRegistry {
    // Mapping from document hash to registration timestamp
    mapping(bytes32 => uint256) public documents;

    // Event emitted when a document is registered
    event DocumentRegistered(bytes32 indexed hash, uint256 timestamp);

    /**
     * @dev Registers a document hash.
     * @param hash The SHA-256 hash of the document.
     */
    function register(bytes32 hash) external {
        require(documents[hash] == 0, "Document already registered");
        
        documents[hash] = block.timestamp;
        
        emit DocumentRegistered(hash, block.timestamp);
    }

    /**
     * @dev Verifies if a document is registered.
     * @param hash The SHA-256 hash of the document.
     * @return exists True if registered, false otherwise.
     * @return timestamp The block timestamp of registration.
     */
    function verify(bytes32 hash) external view returns (bool exists, uint256 timestamp) {
        timestamp = documents[hash];
        exists = timestamp != 0;
    }
}
