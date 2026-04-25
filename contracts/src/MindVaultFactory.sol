// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MindVaultHarness.sol";

/**
 * MindVaultFactory — one harness per user.
 *
 * Each call to deploy() creates a MindVaultHarness owned by msg.sender.
 * The harness acts as the Sovereign Agent sender, giving each user their own
 * async job slot — removing the global bottleneck of the shared router.
 *
 * After deploying, the user must fund their harness:
 *   harness.deposit{value: amount}(lockDuration)
 */
contract MindVaultFactory {
    mapping(address => address) public harnessOf;

    event HarnessDeployed(address indexed user, address indexed harness);

    function deploy() external returns (address harness) {
        require(harnessOf[msg.sender] == address(0), "Harness already deployed");
        harness = address(new MindVaultHarness(msg.sender));
        harnessOf[msg.sender] = harness;
        emit HarnessDeployed(msg.sender, harness);
    }
}
