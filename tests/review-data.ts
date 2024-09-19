import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ReviewData } from "../target/types/review_data";

describe("review-data", () => {

  // Step 1 - Define Review Inputs
  const RESTAURANT = "Quick Eats2";
  const RATING = 5;
  const REVIEW = "Always super fast!";

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  
  anchor.setProvider(provider);

  console.log("Provider", provider);

  const program = anchor.workspace.ReviewData as Program<ReviewData>;

  it("Is initialized!", async () => {
    const publicKey = anchor.AnchorProvider.local().wallet.publicKey;

    const [REVIEW_PDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(RESTAURANT), publicKey.toBuffer()],
      program.programId
    );

    console.log("Review PDA", REVIEW_PDA.toBase58());
    const tx = await program.methods
    .postReview(
      RESTAURANT,
      REVIEW,
      RATING
    )
    .accounts({ review: REVIEW_PDA })
    .transaction();
  
    console.log("Your transaction signature", tx);

    const connection = new anchor.web3.Connection(
      anchor.web3.clusterApiUrl('devnet'),
      'confirmed' // You can also use 'processed' or 'finalized' depending on the level of confirmation you want
    );

    console.log(provider.wallet.payer)
    const txId = await anchor.web3.sendAndConfirmTransaction( connection, tx, [provider.wallet.payer] );
    console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`);

    // Step 5 - Fetch the data account and log results
    const data = await program.account.review.fetch(REVIEW_PDA);
    console.log(`Reviewer: `,data.reviewer.toString());
    console.log(`Restaurant: `,data.restaurant);
    console.log(`Review: `,data.review);
    console.log(`Rating: `,data.rating);
  });
});