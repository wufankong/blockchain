const cryto = require("crypto");

class POWMiner {
    constructor(nickname) {
        this.nickname = nickname;
    }

    generateHash(data) {
        return cryto.createHash('sha256').update(data).digest('hex');
    }

    mine(targetNums) {
        console.log(`\n开始寻找${targetNums}个0开头的哈希值...`);
        console.log('='.repeat(60));

        const startTime = Date.now();
        let nonce = 0;
        let tryNum = 0;

        while(true) {
            const data = `${this.nickname}${nonce}`;

            const hashResult = this.generateHash(data);

            tryNum++;

            if(hashResult.startsWith('0'.repeat(targetNums))) {
                const endTime = Date.now();
                const diffTime = (endTime - startTime) / 1000;

                console.log('成功找到哈希值！');
                console.log(`花费时间：${diffTime.toFixed(2)} 秒`);
                console.log(`尝试次数：${tryNum}次`);
                console.log(`Nonce值：${nonce}`);
                console.log(`原始数据："${data}"`);
                console.log(`哈希值：${hashResult}`);
                console.log(`计算速度：${(tryNum / diffTime).toFixed(2)} 次/秒`);
                
                return {
                    time: diffTime,
                    hash: hashResult,
                    tryNum,
                    nonce,
                    data
                }
            }

            nonce++;
        }
    }
}

function main() {
    const nickname = "wufankong";
    const miner = new POWMiner(nickname);

    console.log('开始工作量证明（POW）模拟挖矿');
    console.log(`使用昵称："${nickname}"`);

    try {
        const result4 = miner.mine(4);
        const result5 = miner.mine(5);

        console.log('\n结果对比');
        console.log('='.repeat(60));
        console.log(`4个0:${result4.tryNum} 次尝试，${result4.time.toFixed(2)} 秒`);
        console.log(`5个0:${result5.tryNum} 次尝试，${result4.time.toFixed(2)} 秒`);
        console.log(`难度增加后时间比率：${(result5.time/ result4.time).toFixed(2)} 倍`);
    } catch (error) {
        console.log('error',error);
        console.log('挖掘被用户中断')
    }
}
main();