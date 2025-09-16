# NFT Website Access

This repository contains a Move smart contract for the Aptos blockchain that enables creators to link an NFT to a personal website and monetize premium content. The contract facilitates the creation of a unique on-chain entry that stores the website's URL and an access fee, allowing users to pay for access directly via a secure smart contract interaction.

-----

## 🛠️ Key Features

  * **NFT-Website Linking**: A creator can mint an NFT and associate it with a unique personal website URL.
  * **Monetized Access**: The creator can set a fee in AptosCoin for accessing premium content on the website.
  * **Secure Payment**: Users can securely pay the set access fee directly to the creator's wallet through a trustless smart contract function.
  * **On-Chain Verification**: The contract provides a clear record of the NFT, its owner, and the associated website, which can be verified on the Aptos blockchain.

-----

## ⚙️ How It Works

The core of the smart contract is the **`PersonalWebsite`** struct, which stores key information: the NFT token ID, the website URL, the owner's address, and the access fee.

  * **`mint_website_nft`**: This function is called by a creator to deploy their website's on-chain data. It takes the `nft_token_id`, `website_url`, and `access_fee` as arguments and creates a `PersonalWebsite` resource under the creator's account. This resource acts as the on-chain representation of their monetized website. A user can only have one website linked to their account at a time.
  * **`access_premium_content`**: A user (the `visitor`) can call this function to pay the creator's access fee. The function first verifies that a `PersonalWebsite` resource exists for the specified `website_owner`. It then checks if the payment amount is sufficient. If all checks pass, it uses the AptosCoin framework to transfer the specified amount from the `visitor`'s wallet to the `website_owner`'s wallet.

-----

## 💻 How to Use

### Prerequisites

  * Aptos CLI installed and configured.
  * An Aptos wallet with some APT for gas fees and testing.

### Step 1: Clone the Repository

```bash
git clone https://github.com/siddhimeh/NFT--Linked-_Personal_website
cd NFTWebsiteAccess
```

### Step 2: Deploy the Contract

Deploy the module to your Aptos account using the CLI.

```bash
aptos move publish --named-addresses NFTWebsiteAccess=<YOUR_ADDRESS>
```

*Replace `<YOUR_ADDRESS>` with your Aptos account address.*

### Step 3: Mint Your Website NFT

Call the `mint_website_nft` function from the Aptos CLI to create your on-chain website entry.

```bash
aptos move run --function-id '<YOUR_ADDRESS>::NFTWebsite2::mint_website_nft' --args 'u64:<NFT_TOKEN_ID>' 'string:<WEBSITE_URL>' 'u64:<ACCESS_FEE>'
```

  * `<NFT_TOKEN_ID>`: A unique identifier for your NFT (e.g., `12345`).
  * `<WEBSITE_URL>`: The URL of your website (e.g., `"https://mycoolsite.com"`).
  * `<ACCESS_FEE>`: The amount of AptosCoin to charge for access (e.g., `1000000` for 1 APT).

### Step 4: Access Premium Content

A visitor can now call the `access_premium_content` function to pay for access.

```bash
aptos move run --function-id '<VISITOR_ADDRESS>::NFTWebsite2::access_premium_content' --args 'address:<WEBSITE_OWNER_ADDRESS>' 'u64:<PAYMENT_AMOUNT>'
```

  * `<VISITOR_ADDRESS>`: The address of the person paying for access.
  * `<WEBSITE_OWNER_ADDRESS>`: The address of the website creator.
  * `<PAYMENT_AMOUNT>`: The amount of AptosCoin the visitor is paying. This must be equal to or greater than the `access_fee` set by the creator.

-----

## ❗ Error Codes

The contract includes clear error codes for common issues:

  * `E_WEBSITE_EXISTS (1)`: The creator already has a website linked to their account.
  * `E_WEBSITE_NOT_FOUND (2)`: The specified website owner does not have an on-chain website entry.
  * `E_INSUFFICIENT_PAYMENT (3)`: The payment amount is less than the required access fee.
  * `E_NOT_OWNER (4)`: An access control error that may occur in future function additions, though not used in the current version.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f7673c16-9e46-402d-8a94-2fe43aa9f0c7" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7d56038a-00e5-4383-bf0f-25dbf08e3010" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/aebaea5a-532f-467c-a442-198264a488a2" />


