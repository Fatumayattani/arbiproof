# verifier

Paste a receipt id. The app loads the receipt and its grant from the registry,
loads the real action transaction by its hash, decodes it, and checks the action
against the grant. The PASS or FAIL verdict is computed here, not trusted from
the agent.

## Run

npm install
cp .env.example .env   # fill it in
npm run dev
