// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IRitualWallet.sol";
import "./interfaces/IAsyncJobTracker.sol";

/**
 * MindVaultHarness — per-user router for MindVault.
 *
 * Deployed once per user via MindVaultFactory. Each harness is the precompile
 * sender for its owner, giving every user their own async job slot and removing
 * the global single-in-flight constraint of the shared MindVaultRouter.
 *
 * The owner must call deposit() to fund their harness before sending messages.
 */
contract MindVaultHarness {
    // ─── System contracts ────────────────────────────────────────────────────
    address constant SOVEREIGN_AGENT   = address(0x080C);
    address constant ASYNC_DELIVERY    = 0x5A16214fF555848411544b005f7Ac063742f39F6;
    address constant RITUAL_WALLET     = 0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948;
    address constant ASYNC_JOB_TRACKER = 0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5;

    uint256 public constant PENDING_TTL = 500; // blocks (~175s)

    address public immutable owner;

    // ─── Session state ────────────────────────────────────────────────────────
    mapping(bytes32 => SessionMeta) public sessions;
    bytes32[] public sessionIds;

    // ─── Job tracking ─────────────────────────────────────────────────────────
    mapping(bytes32 => bytes32) public jobToSession;
    mapping(bytes32 => bool)    public fulfilled;

    bytes32 public pendingJobId;
    uint256 public pendingBlock;
    bool    public hasPendingJob;

    struct SessionMeta {
        uint256 startedAt;
        uint256 messageCount;
        bytes32 latestJobId;
    }

    struct SovereignRef {
        string platform;
        string path;
        string keyRef;
    }

    // ─── Events ───────────────────────────────────────────────────────────────
    event SessionCreated(bytes32 indexed sessionId);
    event MessageSent(bytes32 indexed sessionId, bytes32 jobId, uint256 timestamp);
    event AgentResponse(
        bytes32 indexed jobId,
        bytes32 indexed sessionId,
        bool    success,
        string  text,
        string  error
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAsyncDelivery() {
        require(msg.sender == ASYNC_DELIVERY, "Only async delivery");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    // ─── Funding ──────────────────────────────────────────────────────────────

    function deposit(uint256 lockDuration) external payable {
        IRitualWallet(RITUAL_WALLET).deposit{value: msg.value}(lockDuration);
    }

    // ─── Core ─────────────────────────────────────────────────────────────────

    function sendMessage(bytes32 sessionId, bytes calldata agentInput) external onlyOwner {
        if (hasPendingJob && block.number > pendingBlock + PENDING_TTL) {
            hasPendingJob = false;
        }

        require(!hasPendingJob, "Job in-flight: wait or TTL will expire");
        require(
            !IAsyncJobTracker(ASYNC_JOB_TRACKER).hasPendingJobForSender(address(this)),
            "Async job pending on chain"
        );

        if (sessions[sessionId].startedAt == 0) {
            sessions[sessionId] = SessionMeta({
                startedAt: block.timestamp,
                messageCount: 0,
                latestJobId: bytes32(0)
            });
            sessionIds.push(sessionId);
            emit SessionCreated(sessionId);
        }

        (bool ok, bytes memory output) = SOVEREIGN_AGENT.call(agentInput);
        require(ok, "Sovereign agent call failed");

        bytes32 jobId;
        if (output.length >= 32) {
            // forge-lint: disable-next-line(unsafe-typecast)
            assembly { jobId := mload(add(output, 32)) }
        } else {
            jobId = keccak256(output);
        }

        jobToSession[jobId] = sessionId;
        sessions[sessionId].messageCount++;
        sessions[sessionId].latestJobId = jobId;
        hasPendingJob = true;
        pendingJobId  = jobId;
        pendingBlock  = block.number;

        emit MessageSent(sessionId, jobId, block.timestamp);
    }

    function onSovereignAgentResult(bytes32 jobId, bytes calldata result) external onlyAsyncDelivery {
        require(!fulfilled[jobId], "Already fulfilled");
        fulfilled[jobId] = true;
        hasPendingJob = false;

        bytes32 sessionId = jobToSession[jobId];
        require(sessionId != bytes32(0), "Unknown job");

        bool   success;
        string memory agentError;
        string memory text;

        if (result.length > 0) {
            try this.decodeResult(result) returns (bool s, string memory e, string memory t) {
                success    = s;
                agentError = e;
                text       = t;
            } catch {
                agentError = "Result decode failed";
            }
        }

        emit AgentResponse(jobId, sessionId, success, text, agentError);
    }

    function decodeResult(bytes calldata result)
        external
        pure
        returns (bool success, string memory agentError, string memory text)
    {
        SovereignRef memory r1;
        SovereignRef memory r2;
        SovereignRef[] memory artifacts;
        (success, agentError, text, r1, r2, artifacts) = abi.decode(
            result,
            (bool, string, string, SovereignRef, SovereignRef, SovereignRef[])
        );
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getSessionIds() external view returns (bytes32[] memory) {
        return sessionIds;
    }

    function getSession(bytes32 sessionId) external view returns (SessionMeta memory) {
        return sessions[sessionId];
    }

    receive() external payable {}
}
