// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MindVaultRouter.sol";
import "../src/interfaces/IPersistentAgent.sol";

contract MindVaultRouterTest is Test {
    MindVaultRouter router;

    address constant ASYNC_DELIVERY = 0x5A16214fF555848411544b005f7Ac063742f39F6;
    address constant PERSISTENT_AGENT = address(0x0820);

    address user = makeAddr("user");
    address other = makeAddr("other");
    bytes32 agentId = keccak256("mindvault-agent");
    bytes32 sessionId = keccak256("session-1");
    bytes32 mockJobId = bytes32(uint256(42));

    function setUp() public {
        router = new MindVaultRouter(agentId);
        vm.mockCall(
            PERSISTENT_AGENT,
            abi.encodeWithSelector(IPersistentAgent.sendMessage.selector),
            abi.encode(mockJobId)
        );
    }

    function test_CreateSession() public {
        vm.prank(user);
        vm.expectEmit(true, true, false, false);
        emit MindVaultRouter.SessionCreated(user, sessionId);
        router.sendMessage(sessionId, hex"deadbeef");

        MindVaultRouter.SessionMeta memory meta = router.getSession(sessionId);
        assertEq(meta.user, user);
        assertEq(meta.startedAt, block.timestamp);
        assertEq(meta.messageCount, 1);
        assertEq(meta.latestJobId, mockJobId);
    }

    function test_ContinueSession() public {
        vm.startPrank(user);
        router.sendMessage(sessionId, hex"deadbeef");
        router.sendMessage(sessionId, hex"cafebabe");
        vm.stopPrank();

        MindVaultRouter.SessionMeta memory meta = router.getSession(sessionId);
        assertEq(meta.messageCount, 2);
    }

    function test_SessionOwnershipEnforced() public {
        vm.prank(user);
        router.sendMessage(sessionId, hex"deadbeef");

        vm.prank(other);
        vm.expectRevert("Not your session");
        router.sendMessage(sessionId, hex"cafebabe");
    }

    function test_OnAgentResponse() public {
        vm.prank(user);
        router.sendMessage(sessionId, hex"deadbeef");

        vm.prank(ASYNC_DELIVERY);
        vm.expectEmit(true, true, false, false);
        emit MindVaultRouter.ResponseReceived(user, sessionId, hex"cafebabe");
        router.onAgentResponse(mockJobId, sessionId, hex"cafebabe");
    }

    function test_OnAgentResponseUnauthorized() public {
        vm.prank(user);
        router.sendMessage(sessionId, hex"deadbeef");

        vm.prank(other);
        vm.expectRevert("Unauthorized callback");
        router.onAgentResponse(mockJobId, sessionId, hex"cafebabe");
    }

    function test_OnAgentResponseUnknownSession() public {
        vm.prank(ASYNC_DELIVERY);
        vm.expectRevert("Unknown session");
        router.onAgentResponse(mockJobId, sessionId, hex"cafebabe");
    }

    function test_GetUserSessions() public {
        bytes32 session2 = keccak256("session-2");

        vm.startPrank(user);
        router.sendMessage(sessionId, hex"deadbeef");
        router.sendMessage(session2, hex"cafebabe");
        vm.stopPrank();

        bytes32[] memory sessions = router.getUserSessions(user);
        assertEq(sessions.length, 2);
        assertEq(sessions[0], sessionId);
        assertEq(sessions[1], session2);
    }

    function test_EmitsMessageSent() public {
        vm.prank(user);
        vm.expectEmit(true, true, false, true);
        emit MindVaultRouter.MessageSent(user, sessionId, mockJobId, block.timestamp);
        router.sendMessage(sessionId, hex"deadbeef");
    }
}
