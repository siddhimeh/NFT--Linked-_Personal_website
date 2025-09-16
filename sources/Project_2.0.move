module MyModule::NFTWebsite {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::string::String;

    /// Struct representing an NFT-linked personal website
    struct PersonalWebsite has store, key {
        nft_token_id: u64,      // Unique NFT token ID linked to website
        website_url: String,    // Personal website URL
        owner: address,         // Owner of the NFT and website
        access_fee: u64,        // Fee required to access premium content
    }

    /// Error codes
    const E_WEBSITE_EXISTS: u64 = 1;
    const E_WEBSITE_NOT_FOUND: u64 = 2;
    const E_INSUFFICIENT_PAYMENT: u64 = 3;
    const E_NOT_OWNER: u64 = 4;

    /// Function to mint NFT and link it to a personal website
    public fun mint_website_nft(
        creator: &signer, 
        nft_token_id: u64, 
        website_url: String, 
        access_fee: u64
    ) {
        let creator_addr = signer::address_of(creator);
        assert!(!exists<PersonalWebsite>(creator_addr), E_WEBSITE_EXISTS);
        
        let website = PersonalWebsite {
            nft_token_id,
            website_url,
            owner: creator_addr,
            access_fee,
        };
        move_to(creator, website);
    }

    /// Function to pay for premium access to NFT-linked website
    public fun access_premium_content(
        visitor: &signer, 
        website_owner: address, 
        payment: u64
    ) acquires PersonalWebsite {
        assert!(exists<PersonalWebsite>(website_owner), E_WEBSITE_NOT_FOUND);
        
        let website = borrow_global<PersonalWebsite>(website_owner);
        assert!(payment >= website.access_fee, E_INSUFFICIENT_PAYMENT);
        
        // Transfer payment from visitor to website owner
        let payment_coins = coin::withdraw<AptosCoin>(visitor, payment);
        coin::deposit<AptosCoin>(website_owner, payment_coins);
        
        // In a full implementation, this would grant access to premium content
        // For now, the payment confirms access rights
    }
}