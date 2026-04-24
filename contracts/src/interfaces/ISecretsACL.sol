// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISecretsACL {
    function grantAccess(address user, string calldata secretName) external;
    function revokeAccess(address user, string calldata secretName) external;
    function hasAccess(address user, string calldata secretName) external view returns (bool);
}
