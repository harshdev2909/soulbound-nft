// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.19;

/// @title ERC-5192: Minimal Soulbound NFTs
/// @dev See https://eips.ethereum.org/EIPS/eip-5192
interface IERC5192 {
    /// @notice Emitted when the locking status is changed to locked.
    event Locked(uint256 tokenId);

    /// @notice Emitted when the locking status is changed to unlocked.
    event Unlocked(uint256 tokenId);

    /// @notice Returns the locking status of a Soulbound Token.
    /// @param tokenId The identifier for an SBT.
    function locked(uint256 tokenId) external view returns (bool);
}
