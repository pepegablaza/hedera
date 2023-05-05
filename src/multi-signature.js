const {
  AccountCreateTransaction,
  Hbar,
  Client,
  PrivateKey,
  KeyList,
  TransferTransaction,
} = require("@hashgraph/sdk");

// Acount 1
const account1 = PrivateKey.fromString(
  "302e020100300506032b6570042204203154df9a425aa090ba0f60f0a91ab7faa90d9233859659324508994089ab1df0"
);
const account1Id = "0.0.4568016";

// Acount 2
const account2 = PrivateKey.fromString(
  "302e020100300506032b657004220420f410b32e17cbd1b299a1ef34545bc14135334ad774fcf983673e3fdb5dd79dc3"
);
const account2Id = "0.0.4568018";

// Acount 3
const account3 = PrivateKey.fromString(
  "302e020100300506032b657004220420efa93198ab939877d7fab459411b2786820d89c942b9251a2db5c33236c9be41"
);
const account3Id = "0.0.4568020";

// Acount 4
const account4 = PrivateKey.fromString(
  "302e020100300506032b6570042204201738164df96e7bfb3cbe77a04422b1e02a84295da94c5fcb458d6636bbdbc8dd"
);
const account4Id = "0.0.4568021";

const client = Client.forTestnet();
client.setOperator(account1Id, account1);

const publicKeys = [account1.publicKey, account2.publicKey, account3.publicKey];

const newKey = new KeyList(publicKeys, 2);

async function createWallet() {
  let tx = await new AccountCreateTransaction()
    .setKey(newKey)
    .setInitialBalance(new Hbar(20))
    .execute(client);

  return (await tx.getReceipt(client)).accountId;
}

async function spendFail(accId) {
  const tx = await new TransferTransaction()
    .addHbarTransfer(accId, new Hbar(-10))
    .addHbarTransfer(account4Id, new Hbar(10))
    .freezeWith(client)
    .sign(account1);

  const executed = await (await tx.execute(client)).getReceipt(client);
  return executed;
}

async function spend(accId) {
  const tx = await (
    await new TransferTransaction()
      .addHbarTransfer(accId, new Hbar(-10))
      .addHbarTransfer(account4Id, new Hbar(10))
      .freezeWith(client)
      .sign(account1)
  ).sign(account2);

  const executed = await (await tx.execute(client)).getReceipt(client);
  return executed;
}

async function main() {
  const accountId = await createWallet();
  console.log(accountId);
  await spendFail(accountId).catch((err) => console.error(`Error: ${err}`));
  const tx = await spend(accountId);
  console.log(tx);
  process.exit();
}

main();
