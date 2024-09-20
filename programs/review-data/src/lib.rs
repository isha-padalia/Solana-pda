use anchor_lang::prelude::*;

declare_id!("5FnywTyg3WvL9Mxy68TwuFWYk5UcMEU46zEL3tSLKTmC");

#[program]
pub mod review_data {
    use super::*;

    pub fn create_hotel(ctx: Context<CreateHotel>, name: String) -> Result<()> {
        let hotel = &mut ctx.accounts.hotel;
        hotel.name = name;
        hotel.review_count = 0;
        hotel.reviews = Vec::new();  // Initialize the reviews as an empty vector
        msg!("Hotel created with name: {}", hotel.name);
        Ok(())
    }

    pub fn post_review(ctx: Context<PostReview>, review: String, rating: u8) -> Result<()> {
        let hotel = &mut ctx.accounts.hotel;

        // Check if max reviews (e.g. 10) have been reached
        if hotel.review_count >= 10 {
            return Err(ErrorCode::MaxReviewsReached.into());
        }

        // Create a new review
        let new_review = Review {
            reviewer: ctx.accounts.signer.key(),
            review,
            rating,
        };

        // Push the review to the reviews vector
        hotel.reviews.push(new_review);
        hotel.review_count += 1;

        msg!("Review posted for {}: {} stars", hotel.name, rating);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateHotel<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 64 + (4 + 10 * (32 + 4 + 256 + 1)),  // Allocate space for hotel name, reviews, and review count
        seeds = [b"hotel", hotel_address.key().as_ref()],
        bump
    )]
    pub hotel: Account<'info, Hotel>,
    #[account(mut)]
    pub signer: Signer<'info>,
    /// CHECK
    #[account(mut)]
    pub hotel_address: AccountInfo<'info,>, 
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PostReview<'info> {
    #[account(mut)]
    pub hotel: Account<'info, Hotel>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Review {
    pub reviewer: Pubkey,
    pub review: String,
    pub rating: u8,
}

#[account]
pub struct Hotel {
    pub name: String,
    pub review_count: u8,
    pub reviews: Vec<Review>,  // Use Vec to dynamically handle reviews
}

// Custom error handling
#[error_code]
pub enum ErrorCode {
    #[msg("Maximum number of reviews reached.")]
    MaxReviewsReached,
}
