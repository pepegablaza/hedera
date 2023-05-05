const {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  AccountId,
  Hbar,
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

const client = Client.forTestnet()
  .setOperator(account1Id, account1)
  .setDefaultMaxTransactionFee(new Hbar(10));

const client2 = Client.forTestnet()
  .setOperator(account2Id, account2)
  .setDefaultMaxTransactionFee(new Hbar(10));

const client3 = Client.forTestnet()
  .setOperator(account3Id, account3)
  .setDefaultMaxTransactionFee(new Hbar(10));

async function createTopic() {
  let txResponse = await new TopicCreateTransaction()
    .setSubmitKey(account1.publicKey)
    .setSubmitKey(account2.publicKey)
    .execute(client);

  let receipt = await txResponse.getReceipt(client);
  return receipt.topicId.toString();
}

async function send_message(topicId, client) {
  const message = new Date().toISOString();

  const response = await new TopicMessageSubmitTransaction({
    topicId,
    message,
  }).execute(client);

  let receipt = await response.getReceipt(client);
  console.log(`\nSent message to topic: ${topicId}, message: ${message}`);
  return receipt.status.toString();
}

async function main() {
  let topicId = await createTopic();
  console.log(`Created topic with id: ${topicId}`);
  console.log(
    `Look at topic messages: https://hashscan.io/testnet/topic/${topicId}`
  );
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await send_message(topicId, client3).catch((error) =>
    console.log(`Err: ${error}`)
  );
  await send_message(topicId, client2);
  process.exit();
}

main();
