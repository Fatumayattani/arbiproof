// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title BoundedAction
/// @notice The demo target the agent calls. Enforces the scope onchain so an
///         out of scope call reverts no matter what key signs it. This is the
///         fallback that keeps the rejection demo real even if the ZeroDev
///         session key policy is not wired in time.
contract BoundedAction is Ownable {
    IERC20 public immutable token;

    mapping(address => bool) public allowedRecipient;
    uint256 public maxAmount; // per call cap

    event Executed(address indexed caller, address indexed recipient, uint256 amount);

    error RecipientNotAllowed(address recipient);
    error AmountOverCap(uint256 amount, uint256 cap);

    constructor(address token_, uint256 maxAmount_) Ownable(msg.sender) {
        token = IERC20(token_);
        maxAmount = maxAmount_;
    }

    function setRecipient(address recipient, bool allowed) external onlyOwner {
        allowedRecipient[recipient] = allowed;
    }

    function setMaxAmount(uint256 maxAmount_) external onlyOwner {
        maxAmount = maxAmount_;
    }

    /// @notice The single action the agent is allowed to perform.
    /// @dev Reverts if recipient is not allowlisted or amount is over cap.
    ///      Tokens are pulled from the caller, so the caller must approve first.
    function execute(address recipient, uint256 amount) external {
        if (!allowedRecipient[recipient]) revert RecipientNotAllowed(recipient);
        if (amount > maxAmount) revert AmountOverCap(amount, maxAmount);

        token.transferFrom(msg.sender, recipient, amount);
        emit Executed(msg.sender, recipient, amount);
    }

    /// @notice Selector the grant should pin. Handy for the deploy script.
    function executeSelector() external pure returns (bytes4) {
        return this.execute.selector;
    }
}
