// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ReceiptRegistry} from "../src/ReceiptRegistry.sol";
import {BoundedAction} from "../src/BoundedAction.sol";
import {MockERC20} from "../src/MockERC20.sol";

/// @notice Deploys the full demo set and wires one grant for the happy path.
/// Edit AGENT and RECIPIENT before running, then copy the logged addresses into
/// the agent and verifier env files.
contract Deploy is Script {
    // TODO set these before deploying
    address constant AGENT = address(0xA11CE);
    address constant RECIPIENT = address(0xB0B);    // the one allowlisted recipient
    uint256 constant MAX_AMOUNT = 100 ether;        // per call cap

    function run() external {
        vm.startBroadcast();

        MockERC20 token = new MockERC20();
        BoundedAction action = new BoundedAction(address(token), MAX_AMOUNT);
        ReceiptRegistry registry = new ReceiptRegistry();

        // allowlist the one recipient on the action
        action.setRecipient(RECIPIENT, true);

        // register the matching grant in the registry
        bytes32 grantId = keccak256("demo-grant-1");
        registry.registerGrant(
            grantId,
            AGENT,
            address(action),
            action.execute.selector,
            RECIPIENT,
            MAX_AMOUNT,
            uint64(block.timestamp + 7 days)
        );

        vm.stopBroadcast();

        console2.log("MockERC20:", address(token));
        console2.log("BoundedAction:", address(action));
        console2.log("ReceiptRegistry:", address(registry));
        console2.logBytes32(grantId);
    }
}
