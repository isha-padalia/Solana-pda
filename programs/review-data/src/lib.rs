use anchor_lang::prelude::*;
use std::mem::size_of;

declare_id!("A1eDpmJYGi8VHwkiqxqztvPK3C3UpSC3LpZ3cE7m6a9");

#[program]
pub mod review_data {
    use super::*;

    pub fn post_review(ctx: Context<ReviewAccounts>, restaurant:String, review:String, rating: u8) -> Result<()> {
        
        let new_review = &mut ctx.accounts.review;
        new_review.restaurant = restaurant;
        new_review.reviewer = ctx.accounts.signer.key();
        new_review.rating = rating;
        new_review.review = review;
        msg!("Restaurant review for {} - {} stars", new_review.restaurant, new_review.rating);
        msg!("Review: {}", new_review.review);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(restaurant: String)]
pub struct ReviewAccounts<'info> {
    #[account(
        init_if_needed,
        payer = signer,
        space = size_of::<Review>() + 8,
        seeds = [restaurant.as_bytes().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub review: Account<'info,Review>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Review{
    pub reviewer: Pubkey,
    pub restaurant: String,
    pub review: String,
    pub rating: u8,
}