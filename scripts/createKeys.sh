cardano-cli address key-gen \
--verification-key-file test.vkey \
--signing-key-file test.skey

cardano-cli address key-hash \
--payment-verification-key-file test.vkey \
--out-file test.pkh

cardano-cli address build \
    --payment-verification-key-file test.vkey \
    --out-file test.addr \
    --testnet-magic 0