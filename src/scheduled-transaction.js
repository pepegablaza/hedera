const {
  TransferTransaction,
  Client,
  ScheduleCreateTransaction,
  ScheduleDeleteTransaction,
  ScheduleSignTransaction,
  PrivateKey,
  Hbar,
} = require("@hashgraph/sdk");

const myAccountId = "0.0.4567578";
const myPrivateKey = PrivateKey.fromString(
  "302e020100300506032b65700422042023f7d0ed1d29b4a88099a6a885db231ce8a48f6eff3b192dabdcb7719edb32cd"
);

const otherAccountId1 = "0.0.4568016";
const otherPrivateKey1 = PrivateKey.fromString(
  "302e020100300506032b657004220420dba18dbca438373688db1db6a63728f8a98122f7fe94240cb46611f6f2b467f6"
);
const otherAccountId2 = "0.0.4568018";

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {
  //Create a transaction to schedule
  const transferTransaction = new TransferTransaction()
    .addHbarTransfer(otherAccountId1, Hbar.fromTinybars(-100))
    .addHbarTransfer(otherAccountId2, Hbar.fromTinybars(100));

  //Schedule a transaction
  const scheduleTransaction = await new ScheduleCreateTransaction()
    .setScheduledTransaction(transferTransaction)
    .setScheduleMemo("Scheduled Transaction Mario")
    .setAdminKey(myPrivateKey)
    .execute(client);

  //Get the receipt of the transaction
  const scheduledTxReceipt = await scheduleTransaction.getReceipt(client);

  //Get the schedule ID
  const scheduleId = scheduledTxReceipt.scheduleId;
  console.log("The schedule ID is " + scheduleId);

  //Get the scheduled transaction ID
  const scheduledTxId = scheduledTxReceipt.scheduledTransactionId;
  console.log("The scheduled transaction ID is " + scheduledTxId);

  //Create the transaction and sign with the admin key
  const transaction = await new ScheduleDeleteTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(myPrivateKey);

  //Sign with the operator key and submit to a Hedera network
  const txResponse = await transaction.execute(client);

  //Get the transaction receipt
  const receipt = await txResponse.getReceipt(client);

  //Get the transaction status
  const transactionStatus = receipt.status;
  console.log("The transaction consensus status is " + transactionStatus);

  //Try to execute the deleted scheduled tx
  const scheduledSignTransaction = await new ScheduleSignTransaction()
    .setScheduleId(scheduleId)
    .freezeWith(client)
    .sign(otherPrivateKey1);

  const txResponse1 = await scheduledSignTransaction.execute(client);
  const receipt1 = await txResponse1.getReceipt(client);

  //Get the transaction status - should fail
  const transactionStatus1 = receipt1.status;
  console.log("The transaction consensus status is " + transactionStatus1);

  process.exit();
}

main();
