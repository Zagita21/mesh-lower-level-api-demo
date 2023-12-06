import { IFetcher, MeshTxBuilder, UTxO } from "@meshsdk/core";

export type InputUTxO = UTxO["input"];

export type SetupConstants = {
  collateralUTxO: InputUTxO;
  walletAddress: string;
  skey: string;
};

const makeMeshTxBuilderBody = () => {
  return {
    inputs: [],
    outputs: [],
    collaterals: [],
    requiredSignatures: [],
    referenceInputs: [],
    mints: [],
    changeAddress: "",
    metadata: [],
    validityRange: {},
    signingKey: [],
  };
};

export class Demo {
  mesh: MeshTxBuilder;
  fetcher: IFetcher;
  constants: SetupConstants;

  constructor(mesh: MeshTxBuilder, fetcher: IFetcher, setupConstants: SetupConstants) {
    this.mesh = mesh;
    this.fetcher = fetcher;
    this.constants = setupConstants;
  }

  sendFundToSelf = async (txInHash: string, txInId: number, amount: number) => {
    await this.mesh
      .txIn(txInHash, txInId)
      .txOut(this.constants.walletAddress, [{ unit: "lovelace", quantity: amount.toString() }])
      .changeAddress(this.constants.walletAddress)
      .signingKey(this.constants.skey)
      .complete();

    const txHash = await this.signSubmitReset();
    return txHash;
  };

  private signSubmitReset = async () => {
    const signedTx = this.mesh.completeSigning();
    const txHash = await this.mesh.submitTx(signedTx);
    this.mesh.meshTxBuilderBody = makeMeshTxBuilderBody();
    return txHash;
  };
}
