use aiken/transaction.{Mint, ScriptContext}

validator {
  fn always_succeed(_redeemer: Data, context: ScriptContext) {
    let ScriptContext { purpose, .. } = context
    expect Mint(_) = purpose
    True
  }
}
