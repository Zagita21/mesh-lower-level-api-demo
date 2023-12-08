cardano-cli transaction build \
--testnet-magic 1 \
--tx-in $CONTRACT_UTXO \
--tx-in-script-file $PLUTUS_SCRIPT_FILE \
--tx-in-inline-datum-present \
--tx-in-redeemer-value 1000 \
--tx-in-collateral $COLLATERAL_UTXO \
--change-address $SENDER_ADDRESS \
--protocol-params-file protocol.json \
--out-file unlock-always-succeeds.raw

cardano-cli transaction sign \
--signing-key-file $SENDER_KEY \
--testnet-magic 1 \
--tx-body-file unlock-always-succeeds.raw \
--out-file unlock-always-succeeds.signed

cardano-cli transaction submit \
--tx-file unlock-always-succeeds.signed \
--testnet-magic 1