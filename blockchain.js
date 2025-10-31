const crypto = require('crypto');

class Blockchain {
    constructor() {
        this.chain = [];
        this.currentTransactions = [];
        
        // 创建创世区块
        this.createBlock(1, '0');
    }

    createBlock(proof, previousHash = null) {
        const block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: [...this.currentTransactions],
            proof,
            previous_hash: previousHash || this.hash(this.lastBlock)
        }

        this.currentTransactions = [];

        this.chain.push(block);
        return block;
    }

    addTransaction(sender, recipient, amount) {
        this.currentTransactions.push({
            sender,
            recipient,
            amount
        })

        return this.lastBlock.index + 1;
    }

    pow(lastProof) {
        let nonce = 0;
        while(true) {
            const data = `${lastProof}${nonce}`;
            const hash = crypto.createHash('sha256').update(data).digest('hex');

            if(hash.startsWith('0000')) {
                console.log(`找到有效证明：${lastProof}, 哈希：${hash}`);
                return nonce;
            }
            nonce++;
        }
    }

    validProof(lastProof, proof) {
        const data = `${lastProof}${proof}`;
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        return hash.startsWith('0000');
    }

    hash(block) {
        const blockString = JSON.stringify(block, Object.keys(block).sort());
        return crypto.createHash('sha256').update(blockString).digest('hex');
    }

    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    isValidChain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.previous_hash !== this.hash(previousBlock)) {
                console.log('wrong72')
                return false;
            }

            if (!this.validProof(previousBlock.proof, currentBlock.proof)) {
                console.log('wrong77')
                return false;
            }
        }
        return true;
    }

    mine(minerAddress) {
        this.addTransaction('0', minerAddress, 1);
        const lastBlock = this.lastBlock;
        const lastProof = lastBlock.proof;

        console.log('计算机工作量证明...');
        const startTime = Date.now();
        const proof = this.pow(lastProof);
        const endTime = Date.now();

        console.log(`挖矿完成！耗时: ${(endTime - startTime) / 1000}秒`);

        const previousHash = this.hash(lastBlock);
        const newBlock = this.createBlock(proof, previousHash);

        console.log(`新区块已添加: 区块#${newBlock.index}`);
        return newBlock;
    }

    printChain() {
        console.log('\n=== 区块链信息 ===');
        console.log(`链长度: ${this.chain.length}`);
        console.log('区块详情:');

        this.chain.forEach(block => {
            console.log(`\n区块 #${block.index}:`);
            console.log(`  时间戳: ${new Date(block.timestamp).toLocaleString()}`);
            console.log(`  交易数: ${block.transactions.length}`);
            console.log(`  工作量证明: ${block.proof}`);
            console.log(`  前区块哈希: ${block.previous_hash.substring(0, 16)}...`);
            console.log(`  本区块哈希: ${this.hash(block).substring(0, 16)}...`);

            if (block.transactions.length > 0) {
                console.log(' 交易详情:');
                block.transactions.forEach((tx, index) => {
                    console.log(`    交易${index + 1}: ${tx.sender} -> ${tx.recipient} (${tx.amount}币)`);
                })
            }
        })
        console.log(`\n区块链有效性: ${this.isValidChain() ? '有效' : '无效'}`);
    }
}

function main() {
    console.log('🚀 启动最小区块链...\n');
    
    // 创建区块链实例
    const blockchain = new Blockchain();
    
    // 添加一些交易
    console.log('添加交易...');
    blockchain.addTransaction('Alice', 'Bob', 5);
    blockchain.addTransaction('Bob', 'Charlie', 3);
    
    // 挖矿第一个区块
    console.log('\n--- 第一次挖矿 ---');
    blockchain.mine('miner1');
    
    // 添加更多交易
    console.log('\n添加更多交易...');
    blockchain.addTransaction('Charlie', 'David', 2);
    blockchain.addTransaction('David', 'Eve', 1);
    
    // 挖矿第二个区块
    console.log('\n--- 第二次挖矿 ---');
    blockchain.mine('miner2');
    
    // 打印区块链信息
    blockchain.printChain();
}

if (require.main === module) {
    main();
}

module.exports = Blockchain;