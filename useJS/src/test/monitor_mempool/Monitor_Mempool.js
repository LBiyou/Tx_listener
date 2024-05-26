import { ethers } from "ethers";
import config from "dotenv";

config.config({path: "E:\\Code_data\\Temp_workspace\\Tx_listener\\useJS\\src\\.env"});

// the RPC of network
const ALCHEMY_MAINNET_WSSURL = process.env.ALCHEMY_MAINNET_WSSURL;

// const provider = new ethers.WebSocketProvider(ALCHEMY_MAINNET_WSSURL); // 建议使用wss, wss可以提供更持久的监听机制
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545") // test demo

// moniter these addersses
const fromAddress = ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"];
const toAddress = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
];

// All interfaces that meet the requirements
let txHashs = [];

const iface = new ethers.Interface([
    "function transfer(address,uint) public returns (bool)",
]);

const selector = iface.getFunction("transfer").selector;


/**
 * @description: Parse the transaction and return the transaction's from address, To address, transfer amount, and function called.
 * @param txHash : the transaction hash
 * @returns from, to, value, signature
 */
async function decodeTx(txHash) {

    let fromAddress, toAddress, value, signature;
    // get transaction object
    let transaction = await provider.getTransaction(txHash);

    if (transaction != null && transaction.data.indexOf(selector) !== -1) {

        fromAddress = transaction.from;

        // detail of transaction
        // let txObject = JSON.stringify(iface.parseTransaction(transaction), handleBigInt, 3);

        let tx = iface.parseTransaction(transaction);
        toAddress = tx.args[0];
        value = ethers.formatUnits(tx.args[1]);
        signature = tx.signature;

        return {fromAddress, toAddress, value, signature};
    }
}


async function listen_Pending() {

    provider.on("pending", async (txHash) => {

        if (txHash) {
            try {
                let result = await decodeTx(txHash);
                let from = result.fromAddress;
                let to = result.toAddress;
                if (fromAddress.includes(from) && toAddress.includes(to)) {
                    txHashs.push(txHash);
                    console.log(`[${(new Date).toLocaleTimeString()}] 监听Pending交易: ${txHash} \r`);
                    console.log(`[${result.fromAddress} ----${result.signature}----> ${result.toAddress}] amount:${result.value}ETH \n`);
                } 
            } catch(e) {
                console.log(e)
            }
        }
    })
}

// listen_Pending();
async function listen_Succeed() {

    provider.on("block", async (blockNumber) => {

        let block = await provider.getBlock(blockNumber, true);
        // console.log(block)

        let res = block.prefetchedTransactions;
        for (let i = 0; i < res.length; i++) {
            // console.log(await provider.getTransaction(res[0].hash))
            let txHash = res[i].hash;
            console.log(txHashs);
            if (txHash.includes(txHash)) {
                provider.getTransactionReceipt(txHash).then((receipt) => {
                    if (receipt.status === 1) {
                        console.log('Transaction was successful.');
                    } else {
                        console.log('Transaction failed.');
                    }
                })
            }
        }
    }) 
}

// test 
async function main() {
    await listen_Pending()
    await listen_Succeed()
}
await main()



