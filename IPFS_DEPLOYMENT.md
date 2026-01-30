# IPFS Deployment Guide

This repository is configured to automatically deploy to IPFS (InterPlanetary File System) via Pinata when changes are pushed to the `main` branch.

## Prerequisites

To enable IPFS deployment, you need to configure Pinata API credentials as GitHub secrets.

### Step 1: Get Pinata API Keys

1. Go to [Pinata Cloud](https://app.pinata.cloud/)
2. Sign up or log in to your account
3. Navigate to the [API Keys page](https://app.pinata.cloud/keys)
4. Click "New Key" and generate a new API key with the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS` (optional)
5. Copy both the **API Key** and **API Secret** (you won't be able to see the secret again)

### Step 2: Add Secrets to GitHub Repository

1. Go to your repository settings: `https://github.com/vicisaac48-eng/zikalyze/settings/secrets/actions`
2. Click "New repository secret"
3. Add the following secrets:

   **Secret 1:**
   - Name: `PINATA_API_KEY`
   - Value: Your Pinata API Key

   **Secret 2:**
   - Name: `PINATA_SECRET_KEY`
   - Value: Your Pinata API Secret

### Step 3: Verify Deployment

Once the secrets are configured:

1. Push a commit to the `main` branch
2. Go to the Actions tab in your repository
3. Check the "Deploy to IPFS" workflow
4. If successful, the workflow will output IPFS gateway URLs where your app is accessible

## Manual Deployment

You can also deploy manually using the deployment script:

```bash
# Set environment variables
export PINATA_API_KEY=your_api_key
export PINATA_SECRET_KEY=your_secret_key

# Run the deployment script
node scripts/deploy-ipfs.js
```

## Accessing Your Deployed App

After a successful deployment, your app will be accessible via multiple IPFS gateways:

- **Pinata Gateway**: `https://gateway.pinata.cloud/ipfs/{CID}`
- **IPFS.io**: `https://ipfs.io/ipfs/{CID}`
- **Dweb.link**: `https://dweb.link/ipfs/{CID}`
- **Cloudflare IPFS**: `https://cloudflare-ipfs.com/ipfs/{CID}`

The CID (Content Identifier) will be displayed in the workflow logs after a successful deployment.

## Deployment Info

Each deployment creates an `ipfs-deployment.json` file with:
- The IPFS CID
- Pin size
- Timestamp
- Access URLs

## Troubleshooting

### Workflow Fails with "Missing Pinata credentials"

- Make sure you've added both `PINATA_API_KEY` and `PINATA_SECRET_KEY` secrets to your repository
- Verify the secret names are exactly as specified (case-sensitive)
- Check that the secrets have values (not empty)

### Build Succeeds but Upload Fails

- Verify your Pinata API key has the correct permissions
- Check your Pinata account storage limits
- Review the workflow logs for specific error messages

### Unable to Access Deployed App

- Some IPFS gateways may take a few minutes to propagate content
- Try different gateway URLs
- Verify the CID in the deployment logs

## Additional Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
