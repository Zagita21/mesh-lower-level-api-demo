import { IFetcher, MeshTxBuilder, UTxO } from "@meshsdk/core";
import { applyParamsToScript, blueprint } from "../aiken";
import { getV2ScriptHash, mConStr0, stringToHex, v2ScriptHashToBech32 } from "@sidan-lab/sidan-csl";

export type InputUTxO = UTxO["input"];

export type SetupConstants = {
  collateralUTxO: InputUTxO;
  walletAddress: string;
  skey: string;
};

export type ScriptIndex = "Minting" | "Spending";

export const getScriptCbor = (scriptIndex: ScriptIndex) => {
  const validators = blueprint.validators;
  switch (scriptIndex) {
    case "Minting":
      return applyParamsToScript(validators[0].compiledCode, {
        type: "Mesh",
        params: [],
      });
    case "Spending":
      return applyParamsToScript(validators[1].compiledCode, {
        type: "Mesh",
        params: [],
      });
  }
};

export const getScriptHash = (scriptIndex: ScriptIndex) => {
  const scriptCbor = getScriptCbor(scriptIndex);
  return getV2ScriptHash(scriptCbor);
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

  getAlwaysSucceedAddress = () => v2ScriptHashToBech32(getScriptHash("Spending"));

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

  example102 = async (txInHash: string, txInId: number) => {
    const validatorAddress = v2ScriptHashToBech32(getScriptHash("Spending"));
    await this.mesh
      .txIn(txInHash, txInId)
      .txOut(validatorAddress, [])
      .txOutInlineDatumValue(1618)
      .changeAddress(this.constants.walletAddress)
      .signingKey(this.constants.skey)
      .complete();
    const txHash = await this.signSubmitReset();
    return txHash;
  };

  unlockExample102 = async (txInHash: string, txInId: number) => {
    const validatorAddress = v2ScriptHashToBech32(getScriptHash("Spending"));
    const validatorUtxo = await this.fetcher.fetchAddressUTxOs(validatorAddress);
    if (validatorUtxo.length === 0) {
      console.log("There is no output sitting in validator");
      return "";
    }
    const validatorInput: InputUTxO = validatorUtxo[0].input;

    await this.mesh
      .txIn(txInHash, txInId)
      .spendingPlutusScriptV2()
      .txIn(validatorInput.txHash, validatorInput.outputIndex)
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr0([]))
      .txInScript(getScriptCbor("Spending"))
      .txOut(this.constants.walletAddress, [])
      .changeAddress(this.constants.walletAddress)
      .txInCollateral(this.constants.collateralUTxO.txHash, this.constants.collateralUTxO.outputIndex)
      .signingKey(this.constants.skey)
      .complete();

    const txHash = await this.signSubmitReset();
    return txHash;
  };

  mintAlwaysSucceed = async (txInHash: string, txInId: number) => {
    const mintingScript = getScriptCbor("Minting");
    const policyId = getScriptHash("Minting");
    const tokenName = stringToHex("LiveCodingTesting");
    await this.mesh
      .txIn(txInHash, txInId)
      .mintPlutusScriptV2()
      .mint(1, policyId, tokenName)
      .mintingScript(mintingScript)
      .mintRedeemerValue(mConStr0([]))
      .txOut(this.constants.walletAddress, [{ unit: policyId + tokenName, quantity: "1" }])
      .changeAddress(this.constants.walletAddress)
      .txInCollateral(this.constants.collateralUTxO.txHash, this.constants.collateralUTxO.outputIndex)
      .signingKey(this.constants.skey)
      .complete();

    const txHash = await this.signSubmitReset();
    return txHash;
  };

  unlockExample102AndMintAlwaysSucceed = async (txInHash: string, txInId: number) => {
    const mintingScript = getScriptCbor("Minting");
    const policyId = getScriptHash("Minting");
    const tokenName = stringToHex("LiveCodingTestingAtUnlock");

    const validatorAddress = v2ScriptHashToBech32(getScriptHash("Spending"));
    const validatorUtxo = await this.fetcher.fetchAddressUTxOs(validatorAddress);
    if (validatorUtxo.length === 0) {
      console.log("There is no output sitting in validator");
      return "";
    }
    const validatorInput: InputUTxO = validatorUtxo[0].input;

    await this.mesh
      .txIn(txInHash, txInId)
      .spendingPlutusScriptV2()
      .txIn(validatorInput.txHash, validatorInput.outputIndex)
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr0([]))
      .txInScript(getScriptCbor("Spending"))
      .mintPlutusScriptV2()
      .mint(1, policyId, tokenName)
      .mintingScript(mintingScript)
      .mintRedeemerValue(mConStr0([]))
      .txOut(this.constants.walletAddress, [{ unit: policyId + tokenName, quantity: "1" }])
      .changeAddress(this.constants.walletAddress)
      .txInCollateral(this.constants.collateralUTxO.txHash, this.constants.collateralUTxO.outputIndex)
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
