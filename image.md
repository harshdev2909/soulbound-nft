# How to change NFT images

NFT images are not stored on-chain. The contract points to a **base URL**; each token’s `tokenURI` is `baseURL + tokenId`. That URL returns a **metadata JSON** that contains an **`image`** URL. To change an NFT’s image, you update that metadata (and optionally the image file) where it’s hosted.

---

## Option A: Same hosting (e.g. Pinata) – replace metadata/image

Use this when you keep the same base URL and only change the image (or the metadata file) for a token.

### 1. Upload the new image

- Upload the new image to Pinata (or your host).
- Copy the new image URL (e.g. `https://your-gateway.mypinata.cloud/ipfs/NEW_IMAGE_CID`).

### 2. Update the metadata JSON

- Open your metadata file for that token (e.g. `1.json` for token ID 1).
- Set the **`image`** field to the new image URL:

```json
{
  "name": "Telis Soulbound #1",
  "description": "Teleport instantly.",
  "image": "https://your-gateway.mypinata.cloud/ipfs/NEW_IMAGE_CID",
  "attributes": []
}
```

### 3. Re-upload the metadata

- **Pinata:** Replace the file in the same folder and re-upload the folder, or use Pinata’s replace/update if you keep the same CID.
- If the folder CID **changes**, go to **Option B** and point the contract to the new base URL.

If the metadata URL (e.g. `https://.../ipfs/OLD_CID/1`) is unchanged and you only replaced the file content on your server, you’re done; wallets will load the new image on next refresh.

---

## Option B: New metadata folder (new base URL)

Use this when you upload a **new** metadata folder (e.g. new Pinata folder CID) and want the contract to use it.

### 1. Prepare the new image and metadata

- Upload the new image → get image URL.
- Create or update metadata JSON (e.g. `1.json`, `2.json`) with the correct **`image`** URLs.
- Upload the **folder** that contains these JSON files (e.g. `1`, `2` or `1.json`, `2.json`) to Pinata → get the **folder CID**.

### 2. Set the new base URI on the contract

Only the contract **owner** can run this. From the project root:

```bash
CONTRACT_ADDRESS=0xBd24fD29a638ce7f4dd91AF1d1Fcda8C7C84E357 \
BASE_URI=https://your-gateway.mypinata.cloud/ipfs/NEW_FOLDER_CID/ \
npm run set-base-uri -- --network megaeth_mainnet
```

- Replace `NEW_FOLDER_CID` with your new folder CID.
- Ensure `tokenURI(tokenId)` matches how you named files: contract uses `baseURI + tokenId`, so the file for token `1` must be at `.../NEW_FOLDER_CID/1` (or your host must serve that path).

### 3. Verify

- Check what the contract returns:

```bash
CONTRACT_ADDRESS=0xBd24fD29a638ce7f4dd91AF1d1Fcda8C7C84E357 \
npm run check-token-uri -- --network megaeth_mainnet
```

- Open the printed **tokenURI(1)** in a browser → JSON should have the new **`image`** URL.
- Open the **image** URL → you should see the new image.

---

## Quick reference

| Goal | What to do |
|------|------------|
| Change image for token 1 only | Update the metadata file for token 1 (e.g. `1.json`) so **`image`** is the new URL; re-upload that file (or folder) so the same `tokenURI` URL returns the new JSON. |
| New folder with new images | Upload new image(s), put metadata (with new `image` URLs) in a new folder, get new folder CID, then run **set-base-uri** with the new base URL (see Option B). |
| Contract points to new base URL | `CONTRACT_ADDRESS=0x... BASE_URI=https://.../ npm run set-base-uri -- --network megaeth_mainnet` |

---

## File naming (contract uses no suffix)

Your contract returns `tokenURI(id) = baseURI + id` (no `.json`). So:

- Either host the metadata file with **no** extension (e.g. file named `1` for token 1), **or**
- Configure your host so that the path `.../1` serves the same content as `.../1.json`.

Then the contract’s `tokenURI(1)` URL will resolve to the metadata that contains the new **`image`** URL.
