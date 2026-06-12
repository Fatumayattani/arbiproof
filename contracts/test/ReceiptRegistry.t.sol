// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ReceiptRegistry} from "../src/ReceiptRegistry.sol";
import {BoundedAction} from "../src/BoundedAction.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract ReceiptRegistryTest is Test {
    ReceiptRegistry registry;
    BoundedAction action;
    MockERC20 token;

    address agent = address(0xA11CE);
    address recipient = address(0xB0B);
    address outsider = address(0xDEAD);
    uint256 cap = 100 ether;

    function setUp() public {
        token = new MockERC20();
        action = new BoundedAction(address(token), cap);
        registry = new ReceiptRegistry();
        action.setRecipient(recipient, true);

        token.mint(agent, 1000 ether);
        vm.prank(agent);
        token.approve(address(action), type(uint256).max);
    }

    function test_inScopeActionSucceeds() public {
        vm.prank(agent);
        action.execute(recipient, 50 ether);
        assertEq(token.balanceOf(recipient), 50 ether);
    }

    function test_outOfScopeRecipientReverts() public {
        vm.prank(agent);
        vm.expectRevert();
        action.execute(outsider, 50 ether);
    }

    function test_overCapReverts() public {
        vm.prank(agent);
        vm.expectRevert();
        action.execute(recipient, 200 ether);
    }

    function test_recordReceiptBindsGrant() public {
        bytes32 grantId = keccak256("g1");
        registry.registerGrant(
            grantId, agent, address(action), action.execute.selector, recipient, cap, uint64(block.timestamp + 1 days)
        );

        bytes32 receiptId = keccak256("r1");
        bytes32 intentHash = keccak256("pay supplier 50 APT");
        bytes32 txRef = keccak256("0xfakeTxHash");

        vm.prank(agent);
        registry.recordReceipt(receiptId, grantId, intentHash, txRef);

        ReceiptRegistry.Receipt memory r = registry.getReceipt(receiptId);
        assertEq(r.grantId, grantId);
        assertEq(r.agent, agent);
        assertEq(r.intentHash, intentHash);
    }

    function test_onlyGrantAgentCanRecord() public {
        bytes32 grantId = keccak256("g2");
        registry.registerGrant(
            grantId, agent, address(action), action.execute.selector, recipient, cap, uint64(block.timestamp + 1 days)
        );
        vm.prank(outsider);
        vm.expectRevert();
        registry.recordReceipt(keccak256("r2"), grantId, keccak256("i"), keccak256("t"));
    }
}
