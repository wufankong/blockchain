const crypto = require('crypto');
const { performance } = require('perf_hooks');

class RSADemo {
    constructor() {
        this.privateKey = null;
        this.publicKey = null;
    }

    // 生成RSA公私钥对
    generateKey(keySize = 2048) {
        /**
         * 2048 = 451公钥 + 1704私钥
         */
        console.log(`正在生成${ keySize } 位RSA密钥对`);
        /**
         *  SPKI + PKCS8: 现代标准，兼容性好
         *  type: 'spki'
            Subject Public Key Infrastructure
            标准的公钥格式，包含算法信息和公钥数据
         *  format: 'pem'
            Privacy Enhanced Mail 格式
            Base64 编码的文本格式，包含头尾标识人类可读，易于传输
         */
        const options = {
            modulusLength: keySize,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        }
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', options)
        this.privateKey = privateKey;
        this.publicKey = publicKey;

        console.log('RSA密钥对生成成功');
        console.log(`公钥长度：${publicKey.length} 字符`);
        console.log(`私钥长度：${ privateKey.length} 字符`);

        return { publicKey, privateKey };
    }

    // 计算SHA256哈希
    generateHash( data ) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    // 工作量证明
    pow(nickname) {
        console.log(`开始工作量证明(POW)，寻找以"0000"开头的哈希值...`);
        console.log(`昵称: "${nickname}"`);
        
        const startTime = performance.now();
        let nonce = 0;
        let hash;

        while ( true ) {
            const data = `${nickname}${nonce}`;
            hash = this.generateHash(data);

            if (hash.startsWith('0000')) {
                const endTime = performance.now();
                const timeTaken = ( endTime - startTime ).toFixed(2);

                console.log('✓ POW找到符合条件的哈希！');
                console.log(`Nonce: ${nonce}`);
                console.log(`数据: "${data}"`);
                console.log(`哈希: ${hash}`);
                console.log(`耗时: ${timeTaken} 毫秒`);
                console.log(`尝试次数: ${nonce.toLocaleString()}\n`);

                return { nonce, data, hash };
            }
            nonce++;
        }
    }

    // 使用私钥签名
    signWithPrivateKey(data) {
        if (!this.privateKey) {
            throw new Error('请先生成密钥对')
        }

        const sign = crypto.createSign('SHA256');
        sign.update(data);
        sign.end();

        const signature = sign.sign(this.privateKey, 'base64');

        console.log('✓ 签名完成');
        console.log(`原始数据: "${data}"`);
        console.log(`数字签名(Base64): ${signature}\n`);
        
        return signature;
    }
    // 使用公钥验证签名
    verifyWithPublickKey(data, signature) {
        if(!this.publicKey) {
            throw new Error('请先生成密钥对');
        }
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        verify.end();

        const isValid = verify.verify(this.publicKey, signature, 'base64');

        console.log(`签名验证结果：${isValid ? '有效' : '无效'}`);
    }

    //完整演示流程
    async demostrate() {
        console.log('='.repeat(60));
        console.log('RSA非对称加密实践演示');
        console.log('='.repeat(60) + '\n');

        try {
            // 1 生成密钥对
            this.generateKey();

            // 2 工作量证明
            const nickname = "wufankong";
            const powResult = this.pow(nickname);

            // 3 使用私钥签名
            const signature = this.signWithPrivateKey(powResult.data);

            // 4 使用公钥验证
            this.verifyWithPublickKey(powResult.data, signature);

            // 5 演示篡改检测
            console.log('-'.repeat(40));
            console.log('演示篡改检测...');
            const tamperedData = powResult.data + "tampered";
            this.verifyWithPublickKey(tamperedData, signature);
        } catch (error) {
            console.error('错误', error.message);
        }
    }

    // 导出密钥对
    exportKeys() {
        if (!this.privateKey || !this.publicKey) {
            throw new Error('请先生成密钥对');
        }

        return {
            publicKey: this.publicKey,
            privateKey: this.privateKey
        }
    }

    // 从 PEM 格式导入密钥
    importKeys(publicKeyPem, privateKeyPem) {
        this.publicKey = publicKeyPem;
        this.privateKey = privateKeyPem;
        console.log('密钥对导入成功');
    }
}

// 使用示例
async function main() {
    const rsaDemo = new RSADemo();

    await rsaDemo.demostrate();
}

// 运行演示
if (require.main === module) {
    main().catch(console.error);
}

module.exports = RSADemo;