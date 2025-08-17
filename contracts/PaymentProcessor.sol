// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ITrustToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PaymentProcessor is ReentrancyGuard, Ownable, Pausable {
    ITrustToken public trustToken;
    
    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        uint256 timestamp;
        PaymentStatus status;
        uint256 escrowReleaseTime;
        string reference;
    }
    
    enum PaymentStatus { Pending, Completed, Cancelled, InEscrow, Released }
    
    mapping(bytes32 => Payment) public payments;
    mapping(address => uint256) public escrowBalances;
    
    uint256 public escrowPeriod = 7 days;
    uint256 public processingFee = 25; // 0.25% in basis points
    address public feeRecipient;
    
    event PaymentCreated(bytes32 indexed paymentId, address indexed payer, address indexed payee, uint256 amount);
    event PaymentCompleted(bytes32 indexed paymentId);
    event PaymentCancelled(bytes32 indexed paymentId);
    event EscrowCreated(bytes32 indexed paymentId, uint256 releaseTime);
    event EscrowReleased(bytes32 indexed paymentId);

    constructor(address _trustToken, address _feeRecipient) {
        trustToken = ITrustToken(_trustToken);
        feeRecipient = _feeRecipient;
    }

    function createPayment(
        address payee,
        uint256 amount,
        string memory reference
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Amount must be positive");
        
        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, payee, amount, block.timestamp));
        
        uint256 fee = (amount * processingFee) / 10000;
        uint256 netAmount = amount - fee;
        
        require(trustToken.transferFrom(msg.sender, payee, netAmount), "Transfer failed");
        if (fee > 0) {
            require(trustToken.transferFrom(msg.sender, feeRecipient, fee), "Fee transfer failed");
        }
        
        payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            timestamp: block.timestamp,
            status: PaymentStatus.Completed,
            escrowReleaseTime: 0,
            reference: reference
        });
        
        emit PaymentCreated(paymentId, msg.sender, payee, amount);
        emit PaymentCompleted(paymentId);
        
        return paymentId;
    }

    function createEscrowPayment(
        address payee,
        uint256 amount,
        string memory reference
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(payee != address(0), "Invalid payee");
        require(amount > 0, "Amount must be positive");
        
        bytes32 paymentId = keccak256(abi.encodePacked(msg.sender, payee, amount, block.timestamp, "escrow"));
        
        require(trustToken.transferFrom(msg.sender, address(this), amount), "Transfer to escrow failed");
        
        uint256 releaseTime = block.timestamp + escrowPeriod;
        
        payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            timestamp: block.timestamp,
            status: PaymentStatus.InEscrow,
            escrowReleaseTime: releaseTime,
            reference: reference
        });
        
        escrowBalances[payee] += amount;
        
        emit PaymentCreated(paymentId, msg.sender, payee, amount);
        emit EscrowCreated(paymentId, releaseTime);
        
        return paymentId;
    }

    function releaseEscrow(bytes32 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.InEscrow, "Payment not in escrow");
        require(
            msg.sender == payment.payer || 
            (block.timestamp >= payment.escrowReleaseTime && msg.sender == payment.payee),
            "Not authorized to release"
        );
        
        uint256 fee = (payment.amount * processingFee) / 10000;
        uint256 netAmount = payment.amount - fee;
        
        payment.status = PaymentStatus.Released;
        escrowBalances[payment.payee] -= payment.amount;
        
        require(trustToken.transfer(payment.payee, netAmount), "Transfer failed");
        if (fee > 0) {
            require(trustToken.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        emit EscrowReleased(paymentId);
    }

    function cancelEscrow(bytes32 paymentId) external nonReentrant {
        Payment storage payment = payments[paymentId];
        require(payment.status == PaymentStatus.InEscrow, "Payment not in escrow");
        require(msg.sender == payment.payer, "Only payer can cancel");
        require(block.timestamp < payment.escrowReleaseTime, "Escrow period expired");
        
        payment.status = PaymentStatus.Cancelled;
        escrowBalances[payment.payee] -= payment.amount;
        
        require(trustToken.transfer(payment.payer, payment.amount), "Refund failed");
        
        emit PaymentCancelled(paymentId);
    }

    function setEscrowPeriod(uint256 _escrowPeriod) external onlyOwner {
        escrowPeriod = _escrowPeriod;
    }

    function setProcessingFee(uint256 _processingFee) external onlyOwner {
        require(_processingFee <= 500, "Fee too high"); // Max 5%
        processingFee = _processingFee;
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getPayment(bytes32 paymentId) external view returns (Payment memory) {
        return payments[paymentId];
    }
}
