// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IERC5192.sol";

/// @title 
/// @author Telis
/// @notice 
contract SoulboundNFT is IERC5192 {
    error SoulboundTokenNonTransferable();
    error InvalidTokenId();
    error NotOwnerNorApproved();
    error NotTokenOwner();
    error ZeroAddress();
    error MintToZeroAddress();

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    string private _name;
    string private _symbol;
    string private _baseURI;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    uint256 private _nextTokenId = 1;
    address public owner;

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotTokenOwner();
        _;
    }

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function baseURI() external view returns (string memory) {
        return _baseURI;
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        _baseURI = uri;
    }

    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        return string(abi.encodePacked(_baseURI, _toString(tokenId)));
    }

    function balanceOf(address account) public view returns (uint256) {
        if (account == address(0)) revert ZeroAddress();
        return _balances[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        if (tokenOwner == address(0)) revert InvalidTokenId();
        return tokenOwner;
    }

    /// @dev ERC-5192: Soulbound tokens are always locked (non-transferable)
    function locked(uint256 tokenId) external view override returns (bool) {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        return true;
    }

    function approve(address to, uint256 tokenId) public {
        address tokenOwner = ownerOf(tokenId);
        if (to == tokenOwner) revert();
        if (msg.sender != tokenOwner && !isApprovedForAll(tokenOwner, msg.sender)) revert NotOwnerNorApproved();
        _tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        if (_owners[tokenId] == address(0)) revert InvalidTokenId();
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public {
        if (msg.sender == operator) revert();
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address tokenOwner, address operator) public view returns (bool) {
        return _operatorApprovals[tokenOwner][operator];
    }

    function transferFrom(address, address, uint256) public pure {
        revert SoulboundTokenNonTransferable();
    }

    function safeTransferFrom(address, address, uint256) public pure {
        revert SoulboundTokenNonTransferable();
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) public pure {
        revert SoulboundTokenNonTransferable();
    }

    /// @notice 
    function mint(address to) external onlyOwner returns (uint256) {
        if (to == address(0)) revert MintToZeroAddress();
        uint256 tokenId = _nextTokenId++;
        _owners[tokenId] = to;
        _balances[to]++;
        emit Transfer(address(0), to, tokenId);
        emit Locked(tokenId);
        return tokenId;
    }

    /// @notice Batch mint soulbound tokens to multiple addresses
    function mintBatch(address[] calldata recipients) external onlyOwner returns (uint256[] memory tokenIds) {
        tokenIds = new uint256[](recipients.length);
        for (uint256 i; i < recipients.length;) {
            if (recipients[i] == address(0)) revert MintToZeroAddress();
            uint256 tokenId = _nextTokenId++;
            _owners[tokenId] = recipients[i];
            _balances[recipients[i]]++;
            emit Transfer(address(0), recipients[i], tokenId);
            emit Locked(tokenId);
            tokenIds[i] = tokenId;
            unchecked { ++i; }
        }
    }

    /// @dev ERC-165
    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return interfaceId == 0x01ffc9a7 // IERC165
            || interfaceId == 0x80ac58cd // IERC721
            || interfaceId == 0x5b5e139f   // IERC721Metadata
            || interfaceId == 0xb45a3c0e;  // IERC5192
    }

    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
