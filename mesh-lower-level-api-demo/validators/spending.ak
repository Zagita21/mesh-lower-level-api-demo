use aiken/transaction.{ScriptContext, Spend}

validator {
  fn always_succeed(_datum: Data, _redeemer: Data, context: ScriptContext) {
    let ScriptContext { purpose, .. } = context
    expect Spend(_) = purpose
    True
  }
}
