import { Web3 } from "web3";

const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_eventId",
        "type": "uint256"
      }
    ],
    "name": "buyTicket",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_totalTickets",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_imageUrl",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_eventTime",
        "type": "string"
      }
    ],
    "name": "createEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eventCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "events",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalTickets",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "soldTickets",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "imageUrl",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "location",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "eventTime",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "organizer",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_email",
        "type": "string"
      }
    ],
    "name": "registerProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isRegistered",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "ticketToEvent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

class Web3Service {
  static instance = null;
  web3 = null;
  contract = null;
  rpcUrl = "";
  contractAddress = "";

  static getInstance() {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  init(rpcUrl, contractAddress) {
    if (this.rpcUrl === rpcUrl && this.contractAddress === contractAddress && this.web3 && this.contract) {
      return;
    }
    this.rpcUrl = rpcUrl;
    this.contractAddress = contractAddress;
    this.web3 = new Web3(rpcUrl);
    this.contract = new this.web3.eth.Contract(CONTRACT_ABI, contractAddress);
  }

  getWeb3() {
    if (!this.web3) {
      // Fallback fallback init if not loaded
      this.init("http://127.0.0.1:7545", "0x83aE364a9A2b3DD19d8bE46A6b3E0b7eF0cF4adA");
    }
    return this.web3;
  }

  getContract() {
    if (!this.contract) {
      this.getWeb3();
    }
    return this.contract;
  }

  async getAccountDetails(address) {
    const web3Instance = this.getWeb3();
    const balanceWei = await web3Instance.eth.getBalance(address);
    const balance = web3Instance.utils.fromWei(balanceWei, "ether");
    const nonce = (await web3Instance.eth.getTransactionCount(address)).toString();
    return { balance, nonce };
  }

  async getUserProfile(address) {
    const contractInstance = this.getContract();
    try {
      const user = await contractInstance.methods.users(address).call();
      return {
        name: user.name,
        email: user.email,
        isRegistered: user.isRegistered,
      };
    } catch (err) {
      console.warn("Failed to fetch user profile, account may not exist:", err);
      return { name: "", email: "", isRegistered: false };
    }
  }

  async loginWithPrivateKey(privateKey) {
    // Add prefix if missing
    let formattedKey = privateKey.trim();
    if (!formattedKey.startsWith("0x")) {
      formattedKey = "0x" + formattedKey;
    }

    const web3Instance = this.getWeb3();
    const account = web3Instance.eth.accounts.privateKeyToAccount(formattedKey);

    // Register with singleton wallet to enable auto-signing
    const existing = web3Instance.eth.accounts.wallet.get(account.address);
    if (!existing) {
      web3Instance.eth.accounts.wallet.add(formattedKey);
    }

    const { balance, nonce } = await this.getAccountDetails(account.address);

    // Check if contract is deployed before retrieving profile
    const code = await web3Instance.eth.getCode(this.contractAddress);
    if (code === "0x" || code === "0x0" || code === "0x00") {
      throw new Error(`Không tìm thấy hợp đồng thông minh (Smart Contract) tại địa chỉ: ${this.contractAddress}. Vui lòng kiểm tra lại địa chỉ hợp đồng hoặc đảm bảo bạn đã triển khai (deploy) hợp đồng này lên blockchain node của mình.`);
    }

    const profile = await this.getUserProfile(account.address);

    return {
      address: account.address,
      balance,
      nonce,
      profile,
    };
  }

  async registerProfile(privateKey, name, email) {
    let formattedKey = privateKey.trim();
    if (!formattedKey.startsWith("0x")) {
      formattedKey = "0x" + formattedKey;
    }

    const web3Instance = this.getWeb3();
    const account = web3Instance.eth.accounts.privateKeyToAccount(formattedKey);
    const contractInstance = this.getContract();

    // Register with singleton wallet to enable auto-signing
    const existing = web3Instance.eth.accounts.wallet.get(account.address);
    if (!existing) {
      web3Instance.eth.accounts.wallet.add(formattedKey);
    }

    const tx = contractInstance.methods.registerProfile(name, email);
    const gas = await tx.estimateGas({ from: account.address });

    const receipt = await tx.send({
      from: account.address,
      gas: gas.toString(),
    });

    const { balance, nonce } = await this.getAccountDetails(account.address);
    const profile = await this.getUserProfile(account.address);

    return { balance, nonce, profile, txHash: receipt.transactionHash };
  }

  async createEvent(privateKey, name, priceEth, totalTickets, description = "", imageUrl = "", location = "", eventTime = "") {
    let formattedKey = privateKey.trim();
    if (!formattedKey.startsWith("0x")) {
      formattedKey = "0x" + formattedKey;
    }

    const web3Instance = this.getWeb3();
    const account = web3Instance.eth.accounts.privateKeyToAccount(formattedKey);
    const contractInstance = this.getContract();

    // Register with singleton wallet to enable auto-signing
    const existing = web3Instance.eth.accounts.wallet.get(account.address);
    if (!existing) {
      web3Instance.eth.accounts.wallet.add(formattedKey);
    }

    const priceWei = web3Instance.utils.toWei(priceEth, "ether");
    const tx = contractInstance.methods.createEvent(
      name,
      priceWei,
      totalTickets,
      description,
      imageUrl,
      location,
      eventTime
    );
    const gas = await tx.estimateGas({ from: account.address });

    const receipt = await tx.send({
      from: account.address,
      gas: gas.toString(),
    });

    const { balance, nonce } = await this.getAccountDetails(account.address);
    return { balance, nonce, txHash: receipt.transactionHash };
  }

  async buyTicket(privateKey, eventId, priceEth) {
    let formattedKey = privateKey.trim();
    if (!formattedKey.startsWith("0x")) {
      formattedKey = "0x" + formattedKey;
    }

    const web3Instance = this.getWeb3();
    const account = web3Instance.eth.accounts.privateKeyToAccount(formattedKey);
    const contractInstance = this.getContract();

    // Register with singleton wallet to enable auto-signing
    const existing = web3Instance.eth.accounts.wallet.get(account.address);
    if (!existing) {
      web3Instance.eth.accounts.wallet.add(formattedKey);
    }

    const priceWei = web3Instance.utils.toWei(priceEth, "ether");
    const tx = contractInstance.methods.buyTicket(eventId);
    const gas = await tx.estimateGas({
      from: account.address,
      value: priceWei,
    });

    const receipt = await tx.send({
      from: account.address,
      value: priceWei,
      gas: gas.toString(),
    });

    const { balance, nonce } = await this.getAccountDetails(account.address);
    return { balance, nonce, txHash: receipt.transactionHash };
  }

  async getEvents() {
    const contractInstance = this.getContract();
    try {
      const web3Instance = this.getWeb3();
      const code = await web3Instance.eth.getCode(this.contractAddress);
      if (code === "0x" || code === "0x0" || code === "0x00") {
        throw new Error(`Không tìm thấy hợp đồng thông minh (Smart Contract) tại địa chỉ: ${this.contractAddress}. Vui lòng kiểm tra lại địa chỉ hợp đồng.`);
      }

      const countBig = await contractInstance.methods.eventCount().call();
      const count = Number(countBig);
      const list = [];
      for (let i = 1; i <= count; i++) {
        const ev = await contractInstance.methods.events(i).call();
        list.push({
          id: ev.id.toString(),
          title: ev.name,
          price: this.web3.utils.fromWei(ev.price, "ether"),
          totalTickets: Number(ev.totalTickets),
          soldTickets: Number(ev.soldTickets),
          description: ev.description || "",
          imageUrl: ev.imageUrl || "",
          location: ev.location || "",
          eventTime: ev.eventTime || "",
          organizer: ev.organizer || "",
        });
      }
      return list;
    } catch (err) {
      console.error("Failed to query events from contract:", err);
      throw err;
    }
  }

  async getPastTransactions(address) {
    const contractInstance = this.getContract();
    try {
      const web3Instance = this.getWeb3();
      const code = await web3Instance.eth.getCode(this.contractAddress);
      if (code === "0x" || code === "0x0" || code === "0x00") {
        throw new Error(`Không tìm thấy hợp đồng thông minh (Smart Contract) tại địa chỉ: ${this.contractAddress}.`);
      }

      // Find Transfer events targeting this user address
      const events = await contractInstance.getPastEvents("Transfer", {
        filter: { to: address },
        fromBlock: 0,
      });

      const list = [];
      for (const ev of events) {
        const tokenIdStr = ev.returnValues.tokenId.toString();
        const tokenId = Number(ev.returnValues.tokenId);

        // Fetch eventId associated with this ticket tokenId
        let eventId = "0";
        try {
          const evIdBig = await contractInstance.methods.ticketToEvent(tokenId).call();
          eventId = evIdBig.toString();
        } catch (e) {
          console.warn("Failed to fetch eventId for tokenId", tokenId, e);
        }

        // Fetch event details
        let eventTitle = "Vé Sự Kiện NFT";
        let eventPrice = "0";
        if (eventId !== "0") {
          try {
            const evDetails = await contractInstance.methods.events(Number(eventId)).call();
            eventTitle = evDetails.name;
            eventPrice = this.web3.utils.fromWei(evDetails.price, "ether");
          } catch (e) {
            console.warn("Failed to fetch event details for eventId", eventId, e);
          }
        }

        list.push({
          tokenId: tokenIdStr,
          eventId,
          eventTitle,
          eventPrice,
          from: ev.returnValues.from,
          to: ev.returnValues.to,
          transactionHash: ev.transactionHash,
          blockNumber: ev.blockNumber.toString(),
        });
      }
      return list;
    } catch (err) {
      console.warn("Failed to get past Transfer events, trying alternative scanner:", err);
      return [];
    }
  }
}

export default Web3Service;
