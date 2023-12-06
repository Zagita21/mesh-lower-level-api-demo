import { Demo } from "../transactions/demo";
import { MaestroProvider, MeshTxBuilder } from "@meshsdk/core";

const maestro = new MaestroProvider({ apiKey: process.env.NEXT_PUBLIC_MAESTRO_APIKEY!, network: "Preprod" });
const walletAddress = process.env.NEXT_PUBLIC_WALLET_ADDRESS!;
const skey = process.env.NEXT_PUBLIC_SKEY!;

export default function Home() {
  const queryUtxos = async (walletAddress: string) => {
    const utxos = await maestro.fetchAddressUTxOs(walletAddress);
    console.log("UTXO", utxos);
    return utxos;
  };

  const getUtxosWithMinLovelace = async (lovelace: number) => {
    const utxos = await maestro.fetchAddressUTxOs(walletAddress);
    return utxos.filter((u) => {
      const lovelaceAmount = u.output.amount.find((a: any) => a.unit === "lovelace")?.quantity;
      return Number(lovelaceAmount) > lovelace;
    });
  };

  const mesh = new MeshTxBuilder({
    fetcher: maestro,
    submitter: maestro,
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

  return (
    <main>
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
      <button className="m-2 p-2 bg-slate-500">Frontend Tx</button>
      <button className="m-2 p-2 bg-slate-500" onClick={() => queryUtxos(walletAddress)}>
        Query
      </button>
    </main>
  );
}
