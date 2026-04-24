// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAsyncJobTracker {
    function hasPendingJobForSender(address sender) external view returns (bool);
    function isLongRunning(bytes32 jobId) external view returns (bool);
    function isPhase1Settled(bytes32 jobId) external view returns (bool);
}
