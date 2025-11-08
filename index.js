require("dotenv").config();
const {
  getRealm,
  getAllGovernances,
  getProposalsByGovernance,
  getProposal,
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

    /*
    // 2. Get all GOVERNANCE accounts within that Realm
    const allProgramAccounts = await connection.getProgramAccounts(
      programId, { 
      
      filters: [
        {
          // Filter 1: Find all Governance accounts
          // This is the 8-byte "discriminator"
          memcmp: {
            offset: 0,
            bytes: '2bW3F1NUPf2aN1',
          },
        },
        {
          // Filter 2: Find governances that belong to our DAO (Realm)
          memcmp: {
            offset: 8,
            bytes: daoPk.toBase58(),
          },
        } ] 
    });

    if (allProgramAccounts.length === 0) {
      console.log("No account found for this DAO.");
      return;
    }

    console.log(
      `✅ Fetched ${allProgramAccounts.length} total accounts. Now filtering...`
    );

    // --- 3. Step B: Loop through the results (Your solution) ---
    const governanceAccounts = [];
    const proposalAccounts = [];
    const daoPkString = daoPk.toBase58(); // For easy comparison

    for (const account of allProgramAccounts) {
      const data = account.account.data;

      // Safety check: ensure the account has enough data
      if (!data || data.length < 33) {
        continue;
      }

      // Get the 1-byte account type
      const accountType = data[0];

      // We only care about Governance or Proposal accounts
      if (
        accountType !== ACCOUNT_TYPE_GOVERNANCE &&
        accountType !== ACCOUNT_TYPE_PROPOSAL
      ) {
        continue;
      }

      // Get the 32-byte realm public key (from offset 1 to 33)
      const realmPkBytes = data.slice(1, 33);
      const realmPk = new PublicKey(realmPkBytes);

      // --- This is the filter ---
      // Check if this account's realm matches our DAO
      if (realmPk.toBase58() === daoPkString) {
        if (accountType === ACCOUNT_TYPE_GOVERNANCE) {
          governanceAccounts.push(account.pubkey);
        } else if (accountType === ACCOUNT_TYPE_PROPOSAL) {
          proposalAccounts.push(account.pubkey);
        }
      }
    }

    console.log(`✅ Filtering complete:`);
    console.log(
      `   - Found ${governanceAccounts.length} Governance account(s) for the DAO.`
    );
    console.log(
      `   - Found ${proposalAccounts.length} Proposal account(s) for the DAO.`
    );

    console.log(`✅ Found ${governanceAccounts.length} governance account(s).`);

    if (proposalAccounts.length === 0) {
      console.log("No proposal found for this DAO.");
      return;
    }

    // --- 4. Print the results ---
    console.log("\n--- Here are the first 5 proposals (raw pubkeys) ---");
    proposalAccounts.slice(0, 5).forEach((pubkey, index) => {
      console.log(`Proposal ${index + 1}: ${pubkey.toBase58()}`);
    });

    // const governances = await getGovernanceAccounts(connection,
    // programId,
    // GovernanceAccountParser,
    // (acct) => acct.realm.equals(daoPk));

    // const governances = await getAllGovernances(connection, programId, [daoPk]);
    // console.log(`Found ${governances.length} governance account(s).`);

    // 3. Get the pubkeys for all those governance accounts
    // const governancePubkeys = governances.map((g) => g.pubkey);

    // 4. Now, fetch all proposals for ALL those governances
    // const proposalsByGovernance = await getAllProposals(
    //  connection,
    //  programId,
    //  governancePubkeys
    // );

    // 5. Flatten the array
     const allProposals = proposalsByGovernance.flat();
    console.log(`✅ Found ${allProposals.length} total proposals.`);

    // 6. Sort and slice
    const recentProposals = allProposals
      .sort(
        (a, b) =>
          b.account.signingOffAt.toNumber() - a.account.signingOffAt.toNumber()
      )
      .slice(0, 3);

    // 7. Print
    console.log('\n--- Here are the 3 most recent proposals ---');
    for (const proposal of recentProposals) {
      console.log(`\nProposal Name: ${proposal.account.name}`);
      console.log(`Description Link: ${proposal.account.descriptionLink}`);
      console.log(`State: ${Object.keys(proposal.account.state)[0]}`);
    }

    */
  } catch (err) {
    console.error("❌ Error fetching DAO data:", err);
  }
}

getDAOProposals();
