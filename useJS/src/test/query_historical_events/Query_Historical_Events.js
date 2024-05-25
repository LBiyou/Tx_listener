import { ethers } from "ethers";
import config from "dotenv";

config.config({path: "./.env"});

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

// console.log(NET_URL)

async function listen(start, end) {

    let events = await contract_MyToken.queryFilter(filterTo, start, end);
    console.log(" --------------- 查询地址历史交易事件 -------------");
    for (let event of events) {
        console.log(
            `from:${event.args[0]} -> to:${event.args[1]} value:${ethers.formatUnits(ethers.getBigInt(event.args[2], 18), 18)} ETH`
        );
    }
}

// to test
await listen(25, 40);