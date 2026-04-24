// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IPersistentAgent.sol";
import "./interfaces/ISecretsACL.sol";

contract MindVaultRouter {
    address constant PERSISTENT_AGENT = address(0x0820);
    address constant SECRETS_ACL = 0xf9BF1BC8A3e79B9EBeD0fa2Db70D0513fecE32FD;
    address constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;

    bytes32 public agentId;
    address public owner;

    mapping(address => bytes32[]) public userSessions;
    mapping(bytes32 => SessionMeta) public sessions;

    struct SessionMeta {
        address user;
        uint256 startedAt;
        uint256 messageCount;
        bytes32 latestJobId;
    }

    event MessageSent(
        address indexed user,
        bytes32 indexed sessionId,
        bytes32 jobId,
        uint256 timestamp
    );

    event ResponseReceived(
        address indexed user,
        bytes32 indexed sessionId,
        bytes encryptedResponse
    );

    event SessionCreated(
        address indexed user,
        bytes32 indexed sessionId
    );

    constructor(bytes32 _agentId) {
        agentId = _agentId;
        owner = msg.sender;
    }

    /// @notice Send an encrypted message to the therapeutic agent
    function sendMessage(bytes32 sessionId, bytes calldata encryptedMessage) external {
        if (sessions[sessionId].user == address(0)) {
            sessions[sessionId] = SessionMeta({
                user: msg.sender,
                startedAt: block.timestamp,
                messageCount: 0,
                latestJobId: bytes32(0)
            });
            userSessions[msg.sender].push(sessionId);
            emit SessionCreated(msg.sender, sessionId);
        }

        require(sessions[sessionId].user == msg.sender, "Not your session");

        bytes memory metadata = abi.encode(
            msg.sender,
            sessionId,
            sessions[sessionId].messageCount
        );

        bytes32 jobId = IPersistentAgent(PERSISTENT_AGENT).sendMessage(
            agentId,
            encryptedMessage,
            metadata
        );

        sessions[sessionId].messageCount++;
        sessions[sessionId].latestJobId = jobId;

        emit MessageSent(msg.sender, sessionId, jobId, block.timestamp);
    }

    /// @notice Callback from the Persistent Agent with encrypted response
    /// @dev Only callable by the AsyncDelivery system contract
    function onAgentResponse(
        bytes32 jobId,
        bytes32 sessionId,
        bytes calldata encryptedResponse
    ) external {
        require(msg.sender == ASYNC_DELIVERY, "Unauthorized callback");

        address user = sessions[sessionId].user;
        require(user != address(0), "Unknown session");

        emit ResponseReceived(user, sessionId, encryptedResponse);
    }

    function getUserSessions(address user) external view returns (bytes32[] memory) {
        return userSessions[user];
    }

    function getSession(bytes32 sessionId) external view returns (SessionMeta memory) {
        return sessions[sessionId];
    }
}
