// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/MindVaultRouter.sol";
import "../src/MindVaultFactory.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        MindVaultRouter router = new MindVaultRouter();
        MindVaultFactory factory = new MindVaultFactory();
        vm.stopBroadcast();

        console.log("MindVaultRouter deployed at:", address(router));
        console.log("MindVaultFactory deployed at:", address(factory));
        console.log("Owner:                     ", vm.addr(deployerKey));
        console.log("");
        console.log("Next steps:");
        console.log("  1. Set NEXT_PUBLIC_ROUTER_ADDRESS=", address(router));
        console.log("  2. Set NEXT_PUBLIC_FACTORY_ADDRESS=", address(factory));
        console.log("  3. Fund the router: cast send", address(router),
                    "\"deposit(uint256)\" <lockDuration> --value <amount>");
    }
}
