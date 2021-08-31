import { currentUser2 } from "@centre/demo-site/lib/auth-fns"
import { send } from "@centre/demo-site/lib/demo-fns"
import { ProcessingError } from "@centre/demo-site/lib/errors"
import {
  getProvider,
  verityTokenContractAddress,
  verityTokenContractArtifact
} from "@centre/demo-site/lib/eth-fns"
import { fullURL } from "@centre/demo-site/lib/utils"
import { verificationResult } from "@centre/verity"
import { BigNumber, Contract, Wallet } from "ethers"
import jwt from "jsonwebtoken"
import { apiHandler, requireMethod } from "../../../lib/api-fns"

type Response = {
  status: string
}

type Transaction = {
  amount: string
  address: string
}

/**
 * Fake centralized API to send VUSDC.
 *
 * This endpoint will immediately send funds if the amount is less than some
 * threshold. For demo purposes it is set to 10 VUSDC.
 *
 * Otherwise, we make an API call to the counterparty with information about
 * the transaction. This information the same as required on the VUSDC token
 * contract. If more information is necessary, e.g. to satisfy travel rule
 * requirements, they could be included.
 *
 * The payload also includes a callback URL that the receiving counterparty
 * can use to complete the transaction.
 */
export default apiHandler<Response>(async (req, res) => {
  requireMethod(req, "POST")

  const user = await currentUser2(req)

  // Input
  const transaction = req.body.transaction as Transaction

  if (!transaction) {
    throw new ProcessingError()
  }

  // If the amount is less than 10, go ahead and send it
  if (BigNumber.from(transaction.amount).lt(10)) {
    const success = await send(user, transaction)
    if (!success) {
      throw new ProcessingError()
    }

    res.status(200).json({ status: "ok" })
    return
  }

  // In a production environment, one would need to call out to a verifier to get a result
  const wallet = Wallet.fromMnemonic(user.mnemonic)
  const mnemonic =
    "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"
  const verification = await verificationResult(
    wallet.address,
    verityTokenContractAddress(),
    mnemonic,
    parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
  )

  // Create JWT for callback
  const token = jwt.sign(
    { transaction, verification },
    process.env.AUTH_JWT_SECRET,
    {
      subject: user.id,
      algorithm: "HS256",
      expiresIn: "1h"
    }
  )

  const payload = {
    callbackUrl: fullURL(`/api/cefi/callback/${token}`),
    transaction,
    verification
  }

  // Call out to other service letting them know the results
  await fetch(fullURL("/api/cefi/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  // Success
  res.status(200).json({ status: "pending" })
})
