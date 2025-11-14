pragma solidity ^0.8.9;

contract bank {
    address public immutable admin;

    mapping(address => uint) public deposits;

    address[3] public topDepositors;

    uint8 private constant TOP_COUNT = 3;

    constructor() {
        admin = msg.sender;
    }

    receive() external payable {
        _handleDeposit();
    }

    function deposit() external payable {
        _handleDeposit();
    }

    function _handleDeposit() internal {
        deposits[msg.sender] += msg.value;
        updateTopDepositors(msg.sender);
    }

    // 更新前三名存款人员

    function updateTopDepositors(address depositor) internal {
        // 记录当前地址的余额
        uint depositorBalance = deposits[depositor];
        // 更新前三名的人员，如果已经在前三名中，进行前三名的排序
        for (uint8 i = 0; i < TOP_COUNT; i++) {
            if (topDepositors[i] == depositor) {
                _updateRanking();
                return;
            }
        }
        // 没有在前三名中， 进行前三名重新登记
        for (uint8 i = 0; i < TOP_COUNT; i++) {
            address currentAddr = topDepositors[i];

            if(currentAddr == address(0) || depositorBalance > deposits[]) {
                for (uint8 j = 2; j > i; j--) {
                    topDepositors[j] = topDepositors[j-1];
                }
                topDepositors[i] = depositor;
                break;
            }
        }
    }

    function _updateRanking() internal {
        for (uint8 i = 0; i < 2; i++) {
            for (uint8 j = 0; j < 2 - i; j++) {
                address current = topDepositors[j];
                address next = topDepositors[j + 1];

                uint currentDeposit = current == address(0) ? 0 : deposits[current];
                uint nextDeposit = next == address(0) ? 0 : deposits[next];

                if(currentDeposit < nextDeposit) {
                    topDepositors[j] = next;
                    topDepositors[j + 1] = current;
                }
            }
        }
    }

    function getTopDepositors() external view returns (address[3], uint[3] memory) {
        uint[3] memory amounts;

        for (uint8 i = 0; i < TOP_COUNT; i++) {
            amounts[i] = deposits[topDepositors[i]];
        }
        return (topDepositors, amounts);
    }

    function withdraw() external {
        require(msg.sender == admin, "Only admin can withdraw");

        uint balance = address(this).balance;

        require(balance > 0, "No balance to withdraw");

        (bool success, ) = admin.call{value: balance} ("");

        require(success, "Withdraw failed");
    }
}