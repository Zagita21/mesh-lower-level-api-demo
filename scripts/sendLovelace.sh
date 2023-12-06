cardano-cli transaction build \
    --tx-in a761b8b2d0a658d0a1d498b7d09655065aeaeff6fac946818c2ab1f6b8350569#1 \
    --tx-out addr_test1qzamrgmvc0s8d45fzah8wd6v5fk5uzgy0jwem0gs4vxumt3qr062jqd50h9upf9k3h5tkw4vx5ww7fjcy9yd5swrld4slfpasu+5000000 \
    --tx-out addr_test1qzamrgmvc0s8d45fzah8wd6v5fk5uzgy0jwem0gs4vxumt3qr062jqd50h9upf9k3h5tkw4vx5ww7fjcy9yd5swrld4slfpasu+5000000 \
    --change-address $(cat test.addr) \
    --mainnet \
    --out-file tx.raw

cardano-cli transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file test.skey \
    --out-file tx.signed

cardano-cli transaction submit \
    --tx-file tx.signed \
    --mainnet