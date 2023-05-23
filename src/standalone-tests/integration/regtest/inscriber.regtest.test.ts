describe("Insciber", () => {
  xit("should be able to create a new inscription", () => {
    // send to legacy, segwit and taproot addresses
  });

    if (!address) throw new Error("Address is null");

    const scriptPubKey = bitcoin.address.toOutputScript(
      address,
      bitcoin.networks.regtest
    );
    await createInscription(scriptPubKey);

    const unspents1 = await regtestUtils.unspents(address);
    console.log({ unspents1 });
    const ordinal = unspents1[0];

    await regtestUtils.faucet(address, 1e10);
    const unspents = await regtestUtils.unspents(address);
    console.log({ unspents });
    expect(unspents).toHaveLength(2);

    // const hiroApi = new HiroInscriptionAPI();
    // const inscription = await hiroApi.getInscriptionsByAddress(address);
    // expect(inscription).not.toBeNull();

    // const btcTransactionService = new BtcTransactionService();
    // const receivingAddress = regtestUtils.RANDOM_ADDRESS;

    const cardinalUtxo = unspents.find(
      (u) => u.txId !== ordinal.txId || u.vout !== ordinal.vout
    );

    console.log({ cardinalUtxo });

    const randomAddress = regtestUtils.RANDOM_ADDRESS;
    const btcService = new BtcTransactionService();
    const { hashForInput0, hashForInput1, transaction } =
      btcService.prepareInscriptionTransaction({
        ordinalUtxo: {
          txid: ordinal.txId,
          vout: ordinal.vout,
          amount: ordinal.value,
          address,
        } as Utxo,
        cardinalUtxo: {
          txid: cardinalUtxo!.txId,
          vout: cardinalUtxo!.vout,
          amount: cardinalUtxo!.value,
          address,
        } as Utxo,
        destinationAddress: randomAddress,
      });
    console.log(hashForInput0, hashForInput1, transaction);

    const signature0 = keyPair.sign(hashForInput0);
    const signature1 = keyPair.sign(hashForInput1);

    const sig0 = bitcoin.script.compile([
      bitcoin.script.signature.encode(
        signature0,
        bitcoin.Transaction.SIGHASH_ALL
      ),
      keyPair.publicKey,
    ]);

    const sig1 = bitcoin.script.compile([
      bitcoin.script.signature.encode(
        signature1,
        bitcoin.Transaction.SIGHASH_ALL
      ),
      keyPair.publicKey,
    ]);

    transaction.setInputScript(0, sig0);
    transaction.setInputScript(1, sig1);

    const txId = await regtestUtils.broadcast(transaction.toHex());

    const addressUnspents = await regtestUtils.unspents(randomAddress);
    console.log({ addressUnspents });
    // const cardinalUtxo = unspents.find(
    //   (u) => u.txId !== inscription.txid || u.vout !== inscription.vout
    // );

    // map ordinal to a UTXO
    // cardinal is the other one
    // map them to
    // const transaction = await btcTransactionService.constructTransaction();

    // construct btc transaction with inscription first and other unspent second to destination address
    // console.log(inscription);

    // const transaction = new bitcoin.Transaction();

    // compute fee

    // sign the transaction

    // send the transaction

    // mine

    // check that inscription is at the destination address

    // child_process.exec(
    //   `ts-node /Users/traus/dev/yacht/btc/inscriber/inscriberModule.ts ${address}`,
    //   async (err, out) => {
    //     try {
    //       if (err) {
    //         console.log(err);
    //         return;
    //       }
    //       const unspents = await regtestUtils.unspents(
    //         bitcoin.address
    //           .toOutputScript(address!, bitcoin.networks.regtest)
    //           .toString("hex")
    //       );
    //       expect(unspents).toHaveLength(1);
    //       console.log("done");
    //       done();
    //     } catch (err) {
    //       done(err);
    //     }
    //   }
    // );

    //   done();
    // } catch (err) {
    //   done(err);
    // }
  }, 60000);

  xit("should be able to send an inscription from a taproot address to a segwit address", () => {});

  xit("Should be able to send an inscription from a segwit address to a taproot address", () => {});
});
