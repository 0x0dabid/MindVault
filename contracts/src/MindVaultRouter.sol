// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IRitualWallet.sol";
import "./interfaces/IAsyncJobTracker.sol";

/**
 * MindVaultRouter — on-chain entry point for the MindVault therapeutic agent.
 *
 * Calls the Sovereign Agent precompile (0x080C) via raw .call() to skip wagmi
 * simulation. The frontend builds the full 23-field ABI-encoded input and passes
 * it as `agentInput`; this contract validates session ownership, proxies the call,
 * and handles the async callback.
 *
 * Architecture constraints:
 *   • The precompile enforces one pending async job per sender address.
 *     Since this contract is the sender, only one user message can be in-flight
 *     globally at a time. Production deployments should use per-user harness
 *     contracts (via SovereignAgentFactory) to remove this bottleneck.
 *   • RitualWallet deposit is required. Call deposit() with sufficient RITUAL
 *     and a lockDuration that covers commit_block + ttl before any user can
 *     send messages.
 */
contract MindVaultRouter {
    // ─── System contracts ────────────────────────────────────────────────────
    address constant SOVEREIGN_AGENT   = address(0x080C);
    address constant ASYNC_DELIVERY    = 0x5A16214fF555848411544b005f7Ac063742f39F6;
    address constant RITUAL_WALLET     = 0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948;
    address constant ASYNC_JOB_TRACKER = 0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5;

    // TTL-based escape hatch so stuck state doesn't block all users forever
    uint256 public constant PENDING_TTL = 500; // blocks (~175s at ~350ms/block)

    address public owner;

    // ─── Session state ────────────────────────────────────────────────────────
    mapping(address => bytes32[]) public userSessions;
    mapping(bytes32 => SessionMeta) public sessions;

    // ─── Job tracking ─────────────────────────────────────────────────────────
    mapping(bytes32 => bytes32) public jobToSession; // jobId → sessionId
    mapping(bytes32 => bool)    public fulfilled;     // idempotency guard

    // Global pending-job state (single-sender constraint; see architecture note)
    bytes32 public pendingJobId;
    uint256 public pendingBlock;
    bool    public hasPendingJob;

    struct SessionMeta {
        address user;
        uint256 startedAt;
        uint256 messageCount;
        bytes32 latestJobId;
    }

    // Mirrors the (string,string,string) StorageRef tuple in the Sovereign Agent ABI.
    // Required for abi.decode — Solidity cannot decode into anonymous tuple arrays.
    struct SovereignRef {
        string platform;
        string path;
        string keyRef;
    }

    // ─── Events ───────────────────────────────────────────────────────────────
    event SessionCreated(address indexed user, bytes32 indexed sessionId);
    event MessageSent(
        address indexed user,
        bytes32 indexed sessionId,
        bytes32 jobId,
        uint256 timestamp
    );
    // `text` contains the agent's plaintext response, or ECIES-encrypted bytes
    // if userPublicKey was set in the agentInput (recommended for privacy).
    event AgentResponse(
        bytes32 indexed jobId,
        bytes32 indexed sessionId,
        bool    success,
        string  text,
        string  error
    );

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAsyncDelivery() {
        require(msg.sender == ASYNC_DELIVERY, "Only async delivery");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ─── Funding ──────────────────────────────────────────────────────────────

    /// @notice Deposit RITUAL into this contract's RitualWallet balance.
    ///         Call this before any user can send messages.
    ///         lockDuration must extend past the expected commit_block + ttl.
    function deposit(uint256 lockDuration) external payable {
        IRitualWallet(RITUAL_WALLET).deposit{value: msg.value}(lockDuration);
    }

    // ─── Core ─────────────────────────────────────────────────────────────────

    /// @notice Send a message to the MindVault therapeutic agent.
    /// @param sessionId  Session identifier (derive off-chain: keccak256(user, index))
    /// @param agentInput ABI-encoded 23-field Sovereign Agent params built by the
    ///                   frontend using lib/sovereign-agent.ts. Must include:
    ///                   - deliveryTarget == address(this)
    ///                   - deliverySelector == onSovereignAgentResult.selector
    ///                   - userPublicKey set to encrypt the response back to the user
    function sendMessage(bytes32 sessionId, bytes calldata agentInput) external {
        // TTL-based escape hatch — auto-clear stuck pending state
        if (hasPendingJob && block.number > pendingBlock + PENDING_TTL) {
            hasPendingJob = false;
        }

        require(!hasPendingJob, "Job in-flight: wait or TTL will expire");
        require(
            !IAsyncJobTracker(ASYNC_JOB_TRACKER).hasPendingJobForSender(address(this)),
            "Async job pending on chain"
        );

        // Create session on first message
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

        // Call Sovereign Agent precompile via raw .call() — wagmi writeContract
        // uses eth_call simulation which fails on precompile addresses.
        // The frontend must also use useSendTransaction, not useWriteContract.
        (bool ok, bytes memory output) = SOVEREIGN_AGENT.call(agentInput);
        require(ok, "Sovereign agent call failed");

        // Phase 1 response is raw bytes; treat as jobId for tracking
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

        emit MessageSent(msg.sender, sessionId, jobId, block.timestamp);
    }

    /// @notice Callback delivered by AsyncDelivery after Sovereign Agent completes.
    /// @dev    Result ABI: (bool success, string error, string text,
    ///                     (str,str,str) convoHistory, (str,str,str) output,
    ///                     (str,str,str)[] artifacts)
    ///         If userPublicKey was set, `text` is ECIES-encrypted to the user's key.
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
            // Defensive decode: don't revert if the format is unexpected
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

    /// @dev Public so it can be called via try/catch inside onSovereignAgentResult.
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

    function getUserSessions(address user) external view returns (bytes32[] memory) {
        return userSessions[user];
    }

    function getSession(bytes32 sessionId) external view returns (SessionMeta memory) {
        return sessions[sessionId];
    }

    // ─── Receive ──────────────────────────────────────────────────────────────

    receive() external payable {}
}
