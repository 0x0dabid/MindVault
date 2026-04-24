// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MindVaultRouter.sol";

contract Deploy is Script {
    function run() external {
        bytes32 agentId = vm.envBytes32("AGENT_ID");
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        MindVaultRouter router = new MindVaultRouter(agentId);
        vm.stopBroadcast();

        console.log("MindVaultRouter deployed at:", address(router));
        console.log("Agent ID:                  ", vm.toString(agentId));
        console.log("Owner:                     ", vm.addr(deployerKey));
    }
}
