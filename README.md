# TheGraph example with UT

This example uses only the `Transfer` event

## Schema

In [schema.graphql](./schema.graphql): there are 2 entities:

`Balance`: Store the balance as amount and all the transactions that address did

`Transaction`: Store all the transactions of the addresses. The id is: `{txHash}-{address}`

## Mappers

 There are 2 mappers for in [im-usd.ts](./src/im-usd.ts) for the `Transfer` event:

`handleTransferSave(event: Transfer)`: this example logs every event happening.

`handleTransferContract(event: Transfer)`: this example logs every event happening but it gets the total balance from `balanceOf` from the contract and it ignores *mint/burn* transfers.

## Commands

### Install

```bash
# install
yarn
# codegen
graph codegen
```

### Deploy

```bash
# build
graph build
# auth
graph auth --studio {key}
# deploy
graph deploy --studio {project}
```

### Test

```bash
# test using docker
graph test -d -l
```
