cardano-cli transaction build \
--babbage-era \
--testnet-magic 1 \
--tx-in $UTXO_IN \
--tx-out $ALWAYS_SUCCEEDS_ADDRESS_PLUTUSTX+$LOVELACE_TO_LOCK \
--tx-out-inline-datum-value 1618 \
--change-address $SENDER_ADDRESS \
--out-file lock-always-succeeds.raw

cardano-cli transaction sign \
--signing-key-file $SENDER_KEY \
--testnet-magic 1 \
--tx-body-file lock-always-succeeds.raw \
--out-file lock-always-succeeds.signed

cardano-cli transaction submit \
--tx-file lock-always-succeeds.signed \
--testnet-magic 1