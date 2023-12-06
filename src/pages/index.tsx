import { Demo } from "../transactions/demo";
import { MaestroProvider, MeshTxBuilder, MeshTxBuilderBody, UTxO, resolvePaymentKeyHash } from "@meshsdk/core";
import { useWalletList, useWallet, CardanoWallet } from "@meshsdk/react";

const maestro = new MaestroProvider({ apiKey: process.env.NEXT_PUBLIC_MAESTRO_APIKEY!, network: "Preprod" });
const walletAddress = process.env.NEXT_PUBLIC_WALLET_ADDRESS!;
const skey = process.env.NEXT_PUBLIC_SKEY!;

export default function Home() {
  const { connect, connected, wallet } = useWallet();

  const queryUtxos = async (walletAddress: string) => {
    const utxos = await maestro.fetchAddressUTxOs(walletAddress);
    console.log("UTXO", utxos);
    return utxos;
  };

  const getUtxosWithMinLovelace = async (lovelace: number, providedUtxos: UTxO[] = []) => {
    let utxos: UTxO[] = providedUtxos;
    if (!providedUtxos || providedUtxos.length === 0) {
      utxos = await maestro.fetchAddressUTxOs(walletAddress);
    }
    return utxos.filter((u) => {
      const lovelaceAmount = u.output.amount.find((a: any) => a.unit === "lovelace")?.quantity;
      return Number(lovelaceAmount) > lovelace;
    });
  };

  const mesh = new MeshTxBuilder({
    fetcher: maestro,
    submitter: maestro,
    evaluator: maestro,
  });

  const demo = new Demo(mesh, maestro, {
    walletAddress,
    skey,
    collateralUTxO: {
      txHash: "ee8369ffadd6ed6efdd939639b393f08974fca388b2c43d03a96a1fa4840c5f8",
      outputIndex: 0,
    },
  });

  const getAlwaysSucceedAddress = () => {
    console.log(demo.getAlwaysSucceedAddress());
  };

  const sendFundToSelf = async () => {
    const utxo = await getUtxosWithMinLovelace(2000000);
    const txInHash = utxo[0].input.txHash;
    const txInId = utxo[0].input.outputIndex;
    const txHash = await demo.sendFundToSelf(txInHash, txInId, 5000000);
    console.log("TXHASH", txHash);
  };

  const example102 = async () => {
    const utxo = await getUtxosWithMinLovelace(6000000);
    const txInHash = utxo[0].input.txHash;
    const txInId = utxo[0].input.outputIndex;
    const txHash = await demo.example102(txInHash, txInId);
    console.log("TXHASH", txHash);
  };

  const unlockExample102 = async () => {
    const utxo = await getUtxosWithMinLovelace(6000000);
    const txInHash = utxo[0].input.txHash;
    const txInId = utxo[0].input.outputIndex;
    const txHash = await demo.unlockExample102(txInHash, txInId);
    console.log("TXHASH", txHash);
  };

  const mintAlwaysSucceed = async () => {
    const utxo = await getUtxosWithMinLovelace(6000000);
    const txInHash = utxo[0].input.txHash;
    const txInId = utxo[0].input.outputIndex;
    const txHash = await demo.mintAlwaysSucceed(txInHash, txInId);
    console.log("TXHASH", txHash);
  };

  const unlockExample102AndMintAlwaysSucceed = async () => {
    const utxo = await getUtxosWithMinLovelace(6000000);
    const txInHash = utxo[0].input.txHash;
    const txInId = utxo[0].input.outputIndex;
    const txHash = await demo.unlockExample102AndMintAlwaysSucceed(txInHash, txInId);
    console.log("TXHASH", txHash);
  };

  const frontendTx = async () => {
    const utxos = await wallet.getUtxos();
    const utxo = await getUtxosWithMinLovelace(3000000, utxos);
    const myAddress = await wallet.getUnusedAddresses();
    const changeAddress = await wallet.getChangeAddress();
    console.log("UTXO", utxo);

    const txInHash = utxo[0].input.txHash;
    const txInId = utxo[0].input.outputIndex;
    await mesh
      .txIn(txInHash, txInId)
      .txOut(myAddress[0], [{ unit: "lovelace", quantity: "2000000" }])
      .changeAddress(changeAddress)
      .complete();
    const builtTx = mesh.completeSigning();
    const signedTx = await wallet.signTx(builtTx, false);
    const txHash = await wallet.submitTx(signedTx);
    demo.resetTxBody();
    console.log("TXHASH", txHash);
  };

  const buildTxFromObject = async () => {
    const utxos = await maestro.fetchAddressUTxOs(walletAddress);
    console.log("UTXO", utxos);
    const txHash1 = utxos[0].input.txHash;
    const txIndex1 = utxos[0].input.outputIndex;
    const txHash2 = utxos[1].input.txHash;
    const txIndex2 = utxos[1].input.outputIndex;

    const meshTxBody: MeshTxBuilderBody = {
      inputs: [
        {
          type: "PubKey",
          txIn: {
            txHash: txHash1,
            txIndex: txIndex1,
          },
        },
        {
          type: "PubKey",
          txIn: {
            txHash: txHash2,
            txIndex: txIndex2,
          },
        },
      ],
      outputs: [
        {
          address: walletAddress,
          amount: [{ unit: "lovelace", quantity: "1000000" }],
        },
      ],
      collaterals: [
        {
          type: "PubKey",
          txIn: {
            txHash: "ee8369ffadd6ed6efdd939639b393f08974fca388b2c43d03a96a1fa4840c5f8",
            txIndex: 0,
          },
        },
      ],
      requiredSignatures: [],
      referenceInputs: [],
      mints: [],
      changeAddress: walletAddress,
      metadata: [],
      validityRange: {},
      signingKey: [skey],
    };

    await mesh.complete(meshTxBody);
    const signedTx = mesh.completeSigning();
    const txHash = await maestro.submitTx(signedTx);
    console.log("TXHASH", txHash);
  };

  return (
    <main>
      <span className="text-black">Connected: {connected ? "Yes" : "No"}</span>
      <button
        className="m-2 p-2 bg-slate-500"
        onClick={() => {
          connect("eternl");
        }}>
        Connect Eternl
      </button>

      <button className="m-2 p-2 bg-slate-500" onClick={getAlwaysSucceedAddress}>
        Get always succeed address
      </button>
      <button className="m-2 p-2 bg-slate-500" onClick={sendFundToSelf}>
        Send To Self
      </button>
      <button className="m-2 p-2 bg-slate-500" onClick={example102}>
        Send To Always Succeed
      </button>
      <button className="m-2 p-2 bg-slate-500" onClick={unlockExample102}>
        Unlock From Always Succeed
      </button>
      <button className="m-2 p-2 bg-slate-500" onClick={mintAlwaysSucceed}>
        Mint Always Succeed
      </button>
      <button className="m-2 p-2 bg-slate-500" onClick={unlockExample102AndMintAlwaysSucceed}>
        Unlock from + Mint Always Succeed
      </button>
      <button className="m-2 p-2 bg-slate-500" onClick={frontendTx}>
        Frontend Tx
      </button>
      <button className="m-2 p-2 bg-slate-500" onClick={buildTxFromObject}>
        Build Tx From Object
      </button>
      <button className="m-2 p-2 bg-slate-500" onClick={() => queryUtxos(walletAddress)}>
        Query
      </button>
    </main>
  );
}
