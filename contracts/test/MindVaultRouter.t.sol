// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MindVaultRouter.sol";
import "../src/interfaces/IAsyncJobTracker.sol";

contract MindVaultRouterTest is Test {
    MindVaultRouter router;

    address constant ASYNC_DELIVERY    = 0x5A16214fF555848411544b005f7Ac063742f39F6;
    address constant SOVEREIGN_AGENT   = address(0x080C);
    address constant ASYNC_JOB_TRACKER = 0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5;
    address constant RITUAL_WALLET     = 0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948;

    address user  = makeAddr("user");
    address other = makeAddr("other");

    bytes32 sessionId = keccak256("session-1");
    bytes32 mockJobId = keccak256("mock-job");

    // Mock agent input — any bytes; the precompile is mocked
    bytes agentInput = hex"deadbeef";

    // Valid Sovereign Agent result ABI encoding
    bytes validResult;

    function setUp() public {
        router = new MindVaultRouter();

        // Mock precompile: returns 32-byte jobId
        vm.mockCall(
            SOVEREIGN_AGENT,
            agentInput,
            abi.encode(mockJobId)
        );

        // Mock AsyncJobTracker: no pending jobs
        vm.mockCall(
            ASYNC_JOB_TRACKER,
            abi.encodeWithSelector(IAsyncJobTracker.hasPendingJobForSender.selector, address(router)),
            abi.encode(false)
        );

        // Valid Sovereign Agent callback result
        validResult = abi.encode(
            true,
            "",
            "You are not alone. Let's explore what you're feeling.",
            ("", "", ""),
            ("", "", ""),
            new (string, string, string)[](0)
        );
    }

    // ─── Session lifecycle ────────────────────────────────────────────────────

    function test_CreateSession() public {
        vm.prank(user);
        vm.expectEmit(true, true, false, false);
        emit MindVaultRouter.SessionCreated(user, sessionId);

        router.sendMessage(sessionId, agentInput);

        MindVaultRouter.SessionMeta memory meta = router.getSession(sessionId);
        assertEq(meta.user, user);
        assertEq(meta.messageCount, 1);
        assertEq(meta.latestJobId, mockJobId);
    }

    function test_SessionOwnershipEnforced() public {
        vm.prank(user);
        router.sendMessage(sessionId, agentInput);

        // Escape the pending state so other can try
        vm.roll(block.number + router.PENDING_TTL() + 1);

        vm.mockCall(
            ASYNC_JOB_TRACKER,
            abi.encodeWithSelector(IAsyncJobTracker.hasPendingJobForSender.selector, address(router)),
            abi.encode(false)
        );

        vm.prank(other);
        vm.expectRevert("Not your session");
        router.sendMessage(sessionId, agentInput);
    }

    function test_GetUserSessions() public {
        bytes32 session2 = keccak256("session-2");

        vm.prank(user);
        router.sendMessage(sessionId, agentInput);

        // TTL expiry + reset mock for second send
        vm.roll(block.number + router.PENDING_TTL() + 1);
        vm.mockCall(
            ASYNC_JOB_TRACKER,
            abi.encodeWithSelector(IAsyncJobTracker.hasPendingJobForSender.selector, address(router)),
            abi.encode(false)
        );

        vm.prank(user);
        router.sendMessage(session2, agentInput);

        bytes32[] memory sessions = router.getUserSessions(user);
        assertEq(sessions.length, 2);
    }

    // ─── Pending-job guard ────────────────────────────────────────────────────

    function test_BlocksSecondSendWhilePending() public {
        vm.prank(user);
        router.sendMessage(sessionId, agentInput);

        bytes32 session2 = keccak256("session-2");
        vm.prank(user);
        vm.expectRevert("Job in-flight: wait or TTL will expire");
        router.sendMessage(session2, agentInput);
    }

    function test_TTLEscapeHatch() public {
        vm.prank(user);
        router.sendMessage(sessionId, agentInput);

        // Roll past TTL
        vm.roll(block.number + router.PENDING_TTL() + 1);
        vm.mockCall(
            ASYNC_JOB_TRACKER,
            abi.encodeWithSelector(IAsyncJobTracker.hasPendingJobForSender.selector, address(router)),
            abi.encode(false)
        );

        bytes32 session2 = keccak256("session-2");
        vm.prank(user);
        router.sendMessage(session2, agentInput); // should not revert
        assertTrue(true);
    }

    // ─── Callback ─────────────────────────────────────────────────────────────

    function test_OnAgentResultEmitsEvent() public {
        vm.prank(user);
        router.sendMessage(sessionId, agentInput);

        vm.prank(ASYNC_DELIVERY);
        vm.expectEmit(true, true, false, true);
        emit MindVaultRouter.AgentResponse(mockJobId, sessionId, true, "You are not alone. Let's explore what you're feeling.", "");
        router.onSovereignAgentResult(mockJobId, validResult);
    }

    function test_CallbackIdempotent() public {
        vm.prank(user);
        router.sendMessage(sessionId, agentInput);

        vm.startPrank(ASYNC_DELIVERY);
        router.onSovereignAgentResult(mockJobId, validResult);

        vm.expectRevert("Already fulfilled");
        router.onSovereignAgentResult(mockJobId, validResult);
        vm.stopPrank();
    }

    function test_CallbackUnauthorized() public {
        vm.prank(user);
        router.sendMessage(sessionId, agentInput);

        vm.prank(other);
        vm.expectRevert("Only async delivery");
        router.onSovereignAgentResult(mockJobId, validResult);
    }

    function test_CallbackClearsPendingState() public {
        vm.prank(user);
        router.sendMessage(sessionId, agentInput);

        assertTrue(router.hasPendingJob());

        vm.prank(ASYNC_DELIVERY);
        router.onSovereignAgentResult(mockJobId, validResult);

        assertFalse(router.hasPendingJob());
    }

    function test_CallbackUnknownJob() public {
        vm.prank(ASYNC_DELIVERY);
        vm.expectRevert("Unknown job");
        router.onSovereignAgentResult(keccak256("unknown"), validResult);
    }

    // ─── Deposit ──────────────────────────────────────────────────────────────

    function test_ReceivesNative() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        (bool ok,) = address(router).call{value: 0.5 ether}("");
        assertTrue(ok);
    }
}
