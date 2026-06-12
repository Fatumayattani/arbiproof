// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ReceiptRegistry
/// @notice Binds an agent's authorization, its declared intent, and the
///         resulting transaction into an auditable onchain record.
///
/// Trust model: the registry stores commitments, it does not decide whether an
/// action was in scope. The verifier recomputes that independently from the
/// grant and the real transaction, so a lying agent cannot fake a PASS.
contract ReceiptRegistry is Ownable {
    /// @dev What an agent is allowed to do. Registered once by the authorizer.
    struct Grant {
        address agent;      // who may act under this grant
        address target;     // the only contract the agent may call
        bytes4  selector;   // the only function selector allowed
        address recipient;  // the only allowed recipient of the action
        uint256 maxAmount;  // per call cap
        uint64  expiry;     // unix time after which the grant is dead
        bool    exists;
    }

    /// @dev A record of one action the agent took under a grant.
    struct Receipt {
        bytes32 grantId;    // which grant this action ran under
        address agent;      // msg.sender at record time
        bytes32 intentHash; // hash of the agent's declared intent string
        bytes32 txRef;      // tx hash of the action the agent took
        uint256 timestamp;
        bool    exists;
    }

    mapping(bytes32 => Grant) public grants;
    mapping(bytes32 => Receipt) public receipts;

    event GrantRegistered(bytes32 indexed grantId, address indexed agent, address target);
    event ReceiptRecorded(
        bytes32 indexed receiptId,
        bytes32 indexed grantId,
        address indexed agent,
        bytes32 intentHash,
        bytes32 txRef,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /// @notice Authorizer registers what an agent is allowed to do.
    function registerGrant(
        bytes32 grantId,
        address agent,
        address target,
        bytes4 selector,
        address recipient,
        uint256 maxAmount,
        uint64 expiry
    ) external onlyOwner {
        require(!grants[grantId].exists, "grant exists");
        grants[grantId] = Grant(agent, target, selector, recipient, maxAmount, expiry, true);
        emit GrantRegistered(grantId, agent, target);
    }

    /// @notice Agent anchors a receipt for an action it took under a grant.
    /// @dev Only the agent named in the grant may record under it.
    function recordReceipt(
        bytes32 receiptId,
        bytes32 grantId,
        bytes32 intentHash,
        bytes32 txRef
    ) external {
        Grant memory g = grants[grantId];
        require(g.exists, "no grant");
        require(g.agent == msg.sender, "not the agent");
        require(!receipts[receiptId].exists, "receipt exists");

        receipts[receiptId] = Receipt(grantId, msg.sender, intentHash, txRef, block.timestamp, true);
        emit ReceiptRecorded(receiptId, grantId, msg.sender, intentHash, txRef, block.timestamp);
    }

    function getGrant(bytes32 grantId) external view returns (Grant memory) {
        return grants[grantId];
    }

    function getReceipt(bytes32 receiptId) external view returns (Receipt memory) {
        return receipts[receiptId];
    }
}
