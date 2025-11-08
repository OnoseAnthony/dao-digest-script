require("dotenv").config();
const {
  getAllGovernances,
  getProposalsByGovernance,
  getRealms,
} = require("@solana/spl-governance");
const { Connection, PublicKey } = require("@solana/web3.js");

// --- 1. Configuraßtion ---

// RPC URL
const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL;
const SOLANA_MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";
const RPC_URL = HELIUS_RPC_URL;

const connection = new Connection(RPC_URL, "recent");

// The SPL Governance Program ID
const programId = new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw");
const marinadeGovernanceId = new PublicKey(
  "GovMaiHfpVPw8BAM1mbdzgmSZYDw2tdP32J2fapoQoYs"
);

// Mango DAO, a large and active one
const mangoDaoPk = new PublicKey(
  "DPiH3H3c7t47BYqg5JVAhE5BsbvW5ytCFoheGjCgfZiy"
);

const mangoDaoPk2 = new PublicKey(
  "DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE"
);

// Marinade DAO, N.B TO USE THIS DAO as daoPk, PLEASE CHANGE THE programId to the marinadeGovernanceId
const marinadeDaoPk = new PublicKey(
  "899YG3yk4F66ZgbNWLHriZHTXSKk9e1kvsKEquW7L6Mo"
);

// Emergent Entities DAO
const emergentDaoPk = new PublicKey(
  "J4iqprHsf15xUdmEu6gqhm7YcD3NWJqRdyAEhrRXtCz5"
);
// Choose a Dao to use
const daoPk = emergentDaoPk;

/**
 * Account Type Enums (from the native program)
 * 2 = Governance
 * 3 = Proposal
 */
const ACCOUNT_TYPE_GOVERNANCE = 2;
const ACCOUNT_TYPE_PROPOSAL = 3;

/**
 * This is the main function that runs our logic.
 */
async function getDAOProposals() {
  const daoPkbase58 = daoPk.toBase58();
  // console.log(`Connecting to ${connection.rpcEndpoint}...`);
  // console.log(`Fetching proposals for DAO: ${daoPkbase58}`);

  try {
    // 2. Get the Realm / DAO
    const allRealms = await getRealms(connection, programId);
    if (allRealms.length === 0) {
      console.log("No DAOs Found");
      return;
    }

    // allRealms.forEach((el) =>
    //   console.log(
    //     `${el.pubkey} - ${el.account.name} ${el.account.votingProposalCount}`
    //   )
    // );

    const realm = allRealms.find(
      (dao) => dao.pubkey.toBase58() === daoPkbase58
    );

    if (!realm) {
      console.log(
        `❌ Error: Your DAO was not found in the list for this SPL Governance Program ID ${programId}.`
      );
      return;
    }

    console.log(`✅ Success! Found your DAO.`);
    console.log(`   Name: ${realm.account.name}`);
    console.log(`   Public Key: ${realm.pubkey.toBase58()}`);

    // 3. Get all GOVERNANCE accounts within that Realm
    const governances = await getAllGovernances(
      connection,
      programId,
      realm.pubkey
    );
    console.log(`Found ${governances.length} governance account(s).`);

    if (governances.length === 0) {
      console.log(
        `No governance account(s) found for this DAO - ${realm.account.name}.`
      );
      return;
    }

    // 4. Get the pubkeys for all the governance accounts
    const governancePubkeys = governances.map((g) => g.pubkey);

    // 5. Get the proposal for each governance account
    const proposalsByGovernance = [];

    for (const governacePubKey of governancePubkeys) {
      console.log(`Governance pubkey is ${governacePubKey}`);
      const prop = await getProposalsByGovernance(
        connection,
        programId,
        governacePubKey
      );
      if (prop.length !== 0) {
        proposalsByGovernance.push(prop);
      }
    }

    if (proposalsByGovernance.length === 0) {
      console.log(
        `No Proposal account(s) found for this DAO - ${realm.account.name}.`
      );
      return;
    }

    console.log(
      `Found ${proposalsByGovernance.length} total proposalsByGovernance.`
    );

    // 6. Flatten the array of proposalsByGovernance since it's an array of arrays
    const allProposals = proposalsByGovernance.flat();
    console.log(`Found ${allProposals.length} total proposals.`);

    // 6. Sort
    const recentProposals = allProposals.sort(
      (a, b) =>
        b.account.signingOffAt.toNumber() - a.account.signingOffAt.toNumber()
    );

    console.log("\n--- Here are the most recent proposals ---");

    for (const proposal of recentProposals) {
      console.log(`\nProposal Name: ${proposal.account.name}`);
      console.log(`Description Link: ${proposal.account.descriptionLink}`);
      console.log(`Account Type: ${proposal.account.accountType}`);
      console.log(`State: ${proposal.account.state}`);
    }
  } catch (err) {
    console.error("❌ Error fetching DAO data:", err);
  }
}

getDAOProposals();
