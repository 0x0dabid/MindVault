// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPersistentAgent {
    function sendMessage(
        bytes32 agentId,
        bytes calldata encryptedMessage,
        bytes calldata metadata
    ) external returns (bytes32 jobId);
}
