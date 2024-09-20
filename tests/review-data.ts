import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ReviewData } from "../target/types/review_data";

describe("review-data", () => {

  // Step 1 - Define Review Inputs
  const HOTEL_NAME = "rajwadi-cholekhulche";
  const RATING = 50;
  const REVIEW = "nices service!";

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  
  anchor.setProvider(provider);

  console.log("Provider", provider);

  const program = anchor.workspace.ReviewData as Program<ReviewData>;
  
  it("Creates a hotel and posts a review", async () => {
    console.log("hererreer")
    const publicKey = anchor.AnchorProvider.local().wallet.publicKey;
    
    // Create a new keypair
    const newKeypair = anchor.web3.Keypair.generate();
    console.log("New keypair public key:", newKeypair.publicKey.toBase58());

    console.log("newKeypair", newKeypair);
    // Derive the PDA for the hotel account

    // Use this code when you want to use a existing keypair
    // const [HOTEL_PDA] = await anchor.web3.PublicKey.findProgramAddress(
    //   [Buffer.from("hotel"), new anchor.web3.PublicKey('HYabqNVyND8WZve2zE2QwqdtT9iudtxjGLbiArAwPNjr').toBuffer()],
    //   program.programId
    // );

    // Use this code when you want to use a new keypair
    const [HOTEL_PDA] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("hotel"), newKeypair.publicKey.toBuffer()],
      program.programId
    );
    console.log("Hotel PDA", HOTEL_PDA.toBase58());

    // Create a hotel first used when you want to create a new hotel
    await program.methods
      .createHotel(HOTEL_NAME)
      .accounts({
        hotel: HOTEL_PDA,
        signer: publicKey,
        hotelAddress: newKeypair.publicKey,
        systemProgram:  anchor.web3.SystemProgram.programId,
      }).signers([provider.wallet.payer])
      .rpc();
    
    console.log(`Hotel created with PDA: ${HOTEL_PDA.toBase58()}`);
    
   // Step 3 - Post a review
   await program.methods
      .postReview(REVIEW, RATING)
      .accounts({
        hotel: HOTEL_PDA,
        signer: publicKey,
      }).signers([provider.wallet.payer])
      .rpc();
    console.log(`Review posted for hotel with PDA: ${HOTEL_PDA.toBase58()}`);

    // Step 4 - Fetch the hotel data and log the result
    const hotelAccount = await program.account.hotel.fetch(HOTEL_PDA);
    console.log("hotelAccount", hotelAccount);
//     const hotelAccount = await program.account.hotel.fetch(HOTEL_PDA);
    
//     console.log(`Hotel name: ${hotelAccount.name}`);
//     console.log(`Review count: ${hotelAccount.reviewCount}`);
    
//     // Log the reviews
//     for (let i = 0; i < hotelAccount.reviewCount; i++) {
//       const review = hotelAccount.reviews[i];
      
//       console.log("review", review);

//       console.log(`Reviewer: ${review.reviewer.toString()}`);
//       console.log(`Review: ${review.review}`);
//       console.log(`Rating: ${review.rating}`);
//  }

//     // Fetch the data account and log results
//     const data = await program.account.hotel.fetch(HOTEL_PDA);
//     console.log("data", data);
//     console.log(`Reviewer: `,data.reviews[0].reviewer.toString());
//     console.log(`Review: `,data.reviews[0].review);
//     console.log(`Rating: `,data.reviews[0].rating);


  });
});