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
    evaluator: maestro,
  });

  const demo = new Demo(mesh, maestro, {
    walletAddress,
    skey,
    collateralUTxO: {
      txHash: "3fbdf2b0b4213855dd9b87f7c94a50cf352ba6edfdded85ecb22cf9ceb75f814",
      outputIndex: 7,
    },
  });

  const sendFundToSelf = async () => {
    const utxo = await getUtxosWithMinLovelace(2000000);
    const txInHash = utxo[0].input.txHash;
    const txInId = utxo[0].input.outputIndex;
    const txHash = await demo.sendFundToSelf(txInHash, txInId, 1000000);
    console.log("TXHASH", txHash);
  };

  return (
    <main>
      <button className="m-2 p-2 bg-slate-300" onClick={() => sendFundToSelf()}>
        Send Self
      </button>
      <button className="m-2 p-2 bg-slate-300">Send To Always Succeed</button>
      <button className="m-2 p-2 bg-slate-300">Mint Always Succeed</button>
      <button className="m-2 p-2 bg-slate-300">Unlock from + Mint Always Succeed</button>
      <button className="m-2 p-2 bg-slate-300">Frontend Tx</button>
      <button className="m-2 p-2 bg-slate-300" onClick={() => queryUtxos("")}>
        Query
      </button>
    </main>
  );
}

// {
//   "address": "addr_test1vpw22xesfv0hnkfw4k5vtrz386tfgkxu6f7wfadug7prl7s6gt89x",
//   "tx_hash": "3fbdf2b0b4213855dd9b87f7c94a50cf352ba6edfdded85ecb22cf9ceb75f814",
//   "tx_index": 6,
//   "output_index": 6,
//   "amount": [
//     {
//       "unit": "lovelace",
//       "quantity": "10000000"
//     }
//   ],
//   "block": "54f8ac30aab85d027b283fd124f969e0f5a0534343235e89e6d946862efe967d",
//   "data_hash": null,
//   "inline_datum": null,
//   "reference_script_hash": null
// },
