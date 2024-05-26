import { ethers } from "ethers";
import config from "dotenv";

config.config({path: "../../.env"});

// the RPC of network
const NET_URL = process.env.LOCAL_RPC;
console.log(NET_URL)

const provider = new ethers.JsonRpcProvider(NET_URL);

// addres of contract
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// abi of event
const ABI = [
    "event Transfer(address indexed from, address indexed to, uint value)",
];

// generate contract
const contract_MyToken = new ethers.Contract(contractAddress, ABI, provider);

// to moniter addresses
const toAddresses = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", 
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
];

// set filter to moniter toAddresses
let filterTo = contract_MyToken.filters.Transfer(null, toAddresses);


async function listen() {
    try {

        console.log(`\n It is listening => ${NET_URL} \n`);  

        contract_MyToken.on(filterTo, async (res) => {
            // output the result of transaction
            console.log(`[${(new Date).toLocaleTimeString()}] from:${res.args[0]} -> to:${res.args[1]} value:${ethers.formatUnits(ethers.getBigInt(res.args[2], 18), 18)} ETH`);
            
            // No need, because listening to an event indicates successful execution.
            // let txHash = res.log.transactionHash;
            // let receipt =  await provider.getTransactionReceipt(txHash);
            // console.log(`The result of the transaction is ${ receipt.status == 1 ? "success" : "fail"}`);

        });

    } catch (e) {
        console.log(e);
    }
}

// to test
await listen();


