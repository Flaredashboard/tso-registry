# tso-registry

## To start the project follow

### Install dependencies

```
yarn
```

### Run tests

```
yarn test:all
```

To run a specific set of tests:

```
yarn test <path>
```

### Validate provider

```
yarn validate_provider <path>
```

### Validate username

```
yarn validate_username -u <username> -a <address> -c <chain>
```

### Validate file addresses

```
yarn validate_file_addresses -u <username> -f <path>
```

### Validate file deletion

```
yarn validate_file_deletion -u <username> -f <path>
```

## File format

The file submitted has to be a valid JSON.

Required fields:

- name (name of the TSO)
- description (short description about the TSO)
- website (must be https)
- logoURI (must be https or ipfs)
- ftso_info/stso_info (at least one is required)
    - chainId (14 for Flare, 19 for Songbird) - Required
    - address (submitting address of the TSO) - Required
    - sell_percentage (percentatge of the rewards sold by the TSO) - Optional
    - claim_addresses (array of addresses where the TSO claims or stores rewards) - Optional

Optional fields:

- twitter (https link to TSO twitter profile)
- signature
- general (long description about the TSO provider)
- infrastructure (information about the TSO infrastructure setups and costs)
- safeguards (information about the algorithm safeguards that the TSO has implemented)
- availability (information about how long the TSO has been operating, average uptime and downtimes, etc)
- selling (information about what the TSO does with their rewards earned)
- tooling (information about the products that the TSO team has built and future build plans)
- products (array of urls in https format to the products built by the TSO team)

The full details of the accepted schema can be found in src/singleProviderSchema.json.

## How to submit a file

- Authorise your github user/s with one of the following methods:
    - Use our Dapp.
    - Alternatively:
        - Check your user id with the endpoint https://api.github.com/users/{username}
        - Call the method getTsoGitlabUsers from your submitting address with all the userIds that you want to authorise. The proxy contract is on 0x16d6263932C4429EB6132536fb27492C8d83cA12.
- Fork the repo
- Add or edit your file. The name of the file should be the submitting address. If your TSO submits on both chains the name should be the Flare address.
- Submit a Pull Request to this repo.
