require("dotenv").config();

const WalletService = require("./WalletService");
const SYMBOL = process.env.SYMBOL;

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let myAddres = null;

function menu(){
    setTimeout(() => {
        console.clear();

        if(myAddres)
            console.log(`You are logged as ${myAddres}`);
        else
            console.log(`You aren't logged!`)

        console.log("1 - Create Wallet");
        console.log("2 - Recover Wallet");
        console.log("3 - Balance");
        console.log("4 - Send "+ SYMBOL);
        console.log("5 - Search Tx");

        rl.question("Choose your option: ", (answer) => {
            switch(answer){
                case "1": createWallet(); break;
                case "2": recoverWallet(); break;
                case "3": getBalance(); break;
                case "4": sendTx(); break;
                case "5": getTransaction(); break;
                default: {
                    console.log("Wrong option!");
                    menu();
                }
            }
        })
    }, 1000)
    
}

function preMenu(){
    rl.question("Press any key to continue...", () => {
        menu();
    })
}

function createWallet(){
    const myWallet = WalletService.createWallet(); 
    myAddres = myWallet.address;

    console.log(`Your new wallet:`);
    console.log(myAddres);
    console.log("PK: "+ myWallet.privateKey);
    preMenu();
}

function recoverWallet(){
    console.clear();
    rl.question(`What is your private key or phrase mnemonic?`, (pkOrMnemonic) => {
        const myWallet = WalletService.recoverWallet(pkOrMnemonic);
        myAddres = myWallet.address;

        console.log(`Your recoverd wallet: `);
        console.log(myAddres);

        preMenu();
    })

}

async function getBalance(){
    console.clear();

    if(!myAddres){
        console.log(`You don't have a wallet yet!`)
        return preMenu();
    }

    const { balanceInEth } = await WalletService.getBalance(myAddres);
    console.log(`${SYMBOL} ${balanceInEth}`);

    preMenu();    
} 

function sendTx(){
    console.clear();

    if(!myAddres){
        console.log(`You don't have a wallet yet!`)
        return preMenu();
    }

    console.log(`Your wallet is ${myAddres}`);
    rl.question(`To Wallet: `, (toWallet) => {
        if(!WalletService.addressIsValid(toWallet)){
            console.log(`Invalid wallet!`);
            return preMenu();
        }

        rl.question(`Amount (in ${SYMBOL}): `, async(amountInEth) => {
            if(!amountInEth){
                console.log(`Invalid amount!`);
                return preMenu();
            }

            const tx = await WalletService.buildTransaction(toWallet, amountInEth);

            if(!tx){
                console.log(`Insufficient balance (amount + fee)!`);
                return preMenu();
            }

            try{
               const txRecipt = await WalletService.sendTransaction(tx);
               console.log(`Transaction successful!`);
               console.log(txRecipt);     
            }
            catch(err){
                console.error()
            }   

            return preMenu();
        })
    })

    preMenu();   
}

function getTransaction(){
    console.clear();

    rl.question(`Your tx Hash: `, async (hash) => {
        const txRecipt = await WalletService.getTransaction(hash);
        console.log(`Your tx receipt: `);
        console.log(txRecipt);
        return preMenu();   
    })    
}

menu();