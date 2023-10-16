# tso-registry

## How to submit a file

- Authorise your github user/s with one of the following methods. Keep in mind that you have to authorize the user from Flare and Songbird if you are submitting on both chains.
    - Use our Dapp: https://app.flaredashboard.io/
    - Alternatively:
        - Check your user id with the endpoint https://api.github.com/users/{username}
        - Call the method setTsoGithubUsers from your submitting address (or a proxy address) with all the userIds that you want to authorise. The method is located at the implementation of the proxy contract which is at the address 0xda64978ff8f5fAAE13A928d0E6548bc0756205C3.
- Fork the repo
- Add or edit your file inside the providers folder. The name of the file should be the submitting address. If your TSO submits on both chains the name should be the Flare address.
- Submit a Pull Request to this repo.

## File format

The file submitted has to be a valid JSON.

Required fields:

- name (name of the TSO)
- description (short description about the TSO)
- website (must be https)
- logoURI (must be https or ipfs)
- members (number of members of the team running the TSO)
- country (country where the headquarters are located)
- nodes (total number of nodes that the TSO runs on both chains)
- categories (array of categories that the team is building products). The valid categories are: "NFT", "DeFi", "Metaverse", "Wallets", "Gaming" and "Utilities".
- ftso_info/stso_info (at least one is required)
    - chainId (14 for Flare, 19 for Songbird) - Required
    - address (submitting address of the TSO) - Required
    - epoch (first epoch where the TSO began submitting) - Required
    - claim_addresses (array of addresses where the TSO claims or stores rewards) - Optional

Optional fields:

- twitter (https link to TSO twitter profile)
- signature
- general (long description about the TSO provider)
- infrastructure (information about the TSO infrastructure setups and costs)
- safeguards (information about the algorithm safeguards that the TSO has implemented)
- availability (information about how long the TSO has been operating, average uptime and downtimes, etc)
- tooling (information about the products that the TSO team has built and future build plans)
- products (array of urls in https format to the products built by the TSO team)

The full details of the accepted schema can be found in src/singleProviderSchema.json.

## To start the project follow

### Install dependencies

```
yarn
```

To make sure your file will pass the validations you can run the following checks before submitting your pull request.

### Validate provider

```
yarn validate_provider <path>
```

### Validate username

```
yarn validate_username -u <username> -a <address> -c <chain>
```

### Validate file addresses

This check needs a FLARE_API_KEY set up in a .env file. You can get one for free at: https://api-portal.flare.network/

```
yarn validate_file_addresses -u <username> -f <path>
```

### Validate file deletion

```
yarn validate_file_deletion -u <username> -f <path>
```

## Development

### Run tests

```
yarn test:all
```

To run a specific set of tests:

```
yarn test <path>
```
