(() => {
  "use strict";
  var t = {
      352: function (t, n) {
        var e =
          (this && this.__awaiter) ||
          function (t, n, e, i) {
            return new (e || (e = Promise))(function (r, o) {
              function s(t) {
                try {
                  c(i.next(t));
                } catch (t) {
                  o(t);
                }
              }
              function a(t) {
                try {
                  c(i.throw(t));
                } catch (t) {
                  o(t);
                }
              }
              function c(t) {
                var n;
                t.done
                  ? r(t.value)
                  : ((n = t.value),
                    n instanceof e
                      ? n
                      : new e(function (t) {
                          t(n);
                        })).then(s, a);
              }
              c((i = i.apply(t, n || [])).next());
            });
          };
        Object.defineProperty(n, "__esModule", { value: !0 }),
          (n.BaseAPI = void 0),
          (n.BaseAPI = class {
            fetchData(t) {
              return e(this, void 0, void 0, function* () {
                try {
                  const n = yield fetch(`${this.baseURL}${t}`);
                  return yield n.json();
                } catch (t) {
                  this.handleError(t);
                }
              });
            }
            handleError(t) {
              throw t;
            }
          });
      },
      299: function (t, n, e) {
        var i =
          (this && this.__awaiter) ||
          function (t, n, e, i) {
            return new (e || (e = Promise))(function (r, o) {
              function s(t) {
                try {
                  c(i.next(t));
                } catch (t) {
                  o(t);
                }
              }
              function a(t) {
                try {
                  c(i.throw(t));
                } catch (t) {
                  o(t);
                }
              }
              function c(t) {
                var n;
                t.done
                  ? r(t.value)
                  : ((n = t.value),
                    n instanceof e
                      ? n
                      : new e(function (t) {
                          t(n);
                        })).then(s, a);
              }
              c((i = i.apply(t, n || [])).next());
            });
          };
        Object.defineProperty(n, "__esModule", { value: !0 }),
          (n.HiroInscriptionAPI = void 0);
        const r = e(729);
        class o extends r.InscriptionAPI {
          constructor() {
            super(),
              (this.getInscription = (t) =>
                i(this, void 0, void 0, function* () {
                  try {
                    if (!this.isValidInscriptionId(t))
                      throw new Error(`Invalid inscription id: ${t}`);
                    if (!this.isValidInscriptionNumber(t))
                      throw new Error(`Invalid inscription number: ${t}`);
                    const n = `/inscriptions/${t}`;
                    return yield this.fetchData(n);
                  } catch (t) {
                    throw new Error(
                      `Failed to retrieve inscription details: ${t.message}`
                    );
                  }
                })),
              (this.baseURL = "https://api.hiro.so");
          }
          normalizeInscriptionResponse(t) {
            const {
              id: n,
              number: e,
              address: i,
              location: r,
              output: o,
              value: s,
              offset: a,
            } = t;
            return {
              id: n,
              number: e,
              address: i,
              location: r,
              output: o,
              value: s,
              offset: a,
            };
          }
        }
        n.HiroInscriptionAPI = o;
      },
      729: (t, n, e) => {
        Object.defineProperty(n, "__esModule", { value: !0 }),
          (n.InscriptionAPI = void 0);
        const i = e(352);
        class r extends i.BaseAPI {
          isValidInscriptionNumber(t) {
            return /^[0-9]+$/.test(t);
          }
          isValidInscriptionId(t) {
            return /^[a-fA-F0-9]{64}i[0-9]+$/.test(t);
          }
        }
        n.InscriptionAPI = r;
      },
      908: function (t, n, e) {
        var i =
          (this && this.__awaiter) ||
          function (t, n, e, i) {
            return new (e || (e = Promise))(function (r, o) {
              function s(t) {
                try {
                  c(i.next(t));
                } catch (t) {
                  o(t);
                }
              }
              function a(t) {
                try {
                  c(i.throw(t));
                } catch (t) {
                  o(t);
                }
              }
              function c(t) {
                var n;
                t.done
                  ? r(t.value)
                  : ((n = t.value),
                    n instanceof e
                      ? n
                      : new e(function (t) {
                          t(n);
                        })).then(s, a);
              }
              c((i = i.apply(t, n || [])).next());
            });
          };
        Object.defineProperty(n, "__esModule", { value: !0 }),
          (n.BlockchainInfoUtxoApi = void 0);
        const r = e(620);
        class o extends r.UtxoAPI {
          constructor() {
            super(),
              (this.getUtxosByAddress = (t, n = 0) =>
                i(this, void 0, void 0, function* () {
                  try {
                    const e = `${this.baseURL}/unspent?active=${t}&confirmations=${n}&cors=true`;
                    return (yield this.fetchData(e)).map((n) =>
                      Object.assign(
                        Object.assign({}, this.normalizeUtxoResponse(n)),
                        { address: t }
                      )
                    );
                  } catch (t) {
                    throw new Error(`Failed to retrieve UTXOs: ${t.message}`);
                  }
                })),
              (this.baseURL = "https://blockchain.info");
          }
          normalizeUtxoResponse(t) {
            return {
              id: `${t.tx_hash}:${t.tx_output_n}`,
              txid: t.tx_hash,
              vout: t.tx_output_n,
              scriptPubKey: t.script,
              amount: t.value,
              confirmations: t.confirmations,
              address: "",
            };
          }
        }
        n.BlockchainInfoUtxoApi = o;
      },
      620: (t, n, e) => {
        Object.defineProperty(n, "__esModule", { value: !0 }),
          (n.UtxoAPI = void 0);
        const i = e(352);
        class r extends i.BaseAPI {}
        n.UtxoAPI = r;
      },
      149: function (t, n, e) {
        var i =
          (this && this.__awaiter) ||
          function (t, n, e, i) {
            return new (e || (e = Promise))(function (r, o) {
              function s(t) {
                try {
                  c(i.next(t));
                } catch (t) {
                  o(t);
                }
              }
              function a(t) {
                try {
                  c(i.throw(t));
                } catch (t) {
                  o(t);
                }
              }
              function c(t) {
                var n;
                t.done
                  ? r(t.value)
                  : ((n = t.value),
                    n instanceof e
                      ? n
                      : new e(function (t) {
                          t(n);
                        })).then(s, a);
              }
              c((i = i.apply(t, n || [])).next());
            });
          };
        Object.defineProperty(n, "__esModule", { value: !0 }),
          (n.checkInscriptionStatus = void 0);
        const r = e(39),
          o = e(299),
          s = e(908),
          a = new o.HiroInscriptionAPI(),
          c = new s.BlockchainInfoUtxoApi(),
          u = new r.ListingService(a, c);
        n.checkInscriptionStatus = function (t, n) {
          return i(this, void 0, void 0, function* () {
            const {
              listingIsConfirmed: e,
              utxos: i,
              inscription: r,
            } = yield u.confirmListing({ inscriptionId: n, pkpBtcAddress: t });
            if (!e)
              throw new Error(
                "We are not able to confirm that the seller's listing is ready for sale"
              );
            const [o, s, a] = r.location.split(":"),
              [c] = i.filter((t) => t.id === o && t.vout.toString() === s),
              [d] = i.filter((t) => t.txid !== c.txid || t.vout !== c.vout);
            return { ordinalUtxo: c, cardinalUtxo: d };
          });
        };
      },
      821: function (t, n, e) {
        var i =
          (this && this.__awaiter) ||
          function (t, n, e, i) {
            return new (e || (e = Promise))(function (r, o) {
              function s(t) {
                try {
                  c(i.next(t));
                } catch (t) {
                  o(t);
                }
              }
              function a(t) {
                try {
                  c(i.throw(t));
                } catch (t) {
                  o(t);
                }
              }
              function c(t) {
                var n;
                t.done
                  ? r(t.value)
                  : ((n = t.value),
                    n instanceof e
                      ? n
                      : new e(function (t) {
                          t(n);
                        })).then(s, a);
              }
              c((i = i.apply(t, n || [])).next());
            });
          };
        Object.defineProperty(n, "__esModule", { value: !0 });
        const r = e(149),
          o = e(21);
        !(function () {
          i(this, void 0, void 0, function* () {
            const { ordinalUtxo: t, cardinalUtxo: n } = yield (0,
              r.checkInscriptionStatus)(pkpBtcAddress, "{{inscriptionId}}"),
              e = yield (0, o.getInboundEthTransactions)(pkpEthAddress),
              { winningTransfer: i, losingTransfers: s } = (0,
              o.findWinnersByTransaction)(e, "{{hardEthPrice}}");
            let a, c;
            if (
              (Lit.Auth.authSigAddress === (null == i ? void 0 : i.from) &&
                t &&
                n &&
                console.log(
                  "Found Cardinal and Ordinal and are creating btc payout transaction"
                ),
              (i || s) &&
                ({ maxPriorityFeePerGas: a, maxFeePerGas: c } = yield (0,
                o.getCurrentGasPrices)(80001)),
              i)
            ) {
              const t = (0, o.mapTransferToTransaction)(
                i,
                "{{ethPayoutAddress}}",
                0,
                a,
                c,
                80001
              );
              Lit.Actions.setResponse({ response: JSON.stringify(t) }),
                yield Lit.LitActions.signEcdsa({
                  toSign: (0, o.hashTransaction)(t),
                  publicKey: pkpPublicKey,
                  sigName: "ethPayoutSignature",
                });
            }
          });
        })();
      },
      21: function (t, n) {
        var e =
          (this && this.__awaiter) ||
          function (t, n, e, i) {
            return new (e || (e = Promise))(function (r, o) {
              function s(t) {
                try {
                  c(i.next(t));
                } catch (t) {
                  o(t);
                }
              }
              function a(t) {
                try {
                  c(i.throw(t));
                } catch (t) {
                  o(t);
                }
              }
              function c(t) {
                var n;
                t.done
                  ? r(t.value)
                  : ((n = t.value),
                    n instanceof e
                      ? n
                      : new e(function (t) {
                          t(n);
                        })).then(s, a);
              }
              c((i = i.apply(t, n || [])).next());
            });
          };
        Object.defineProperty(n, "__esModule", { value: !0 }),
          (n.getInboundEthTransactions =
            n.mapTransferToTransaction =
            n.findWinnersByTransaction =
            n.getCurrentGasPrices =
            n.hashTransaction =
              void 0),
          "{{hardEthPrice}}".slice(1, -1);
        function i(t) {
          return e(this, void 0, void 0, function* () {
            let n;
            switch (t) {
              case 137:
                n = "https://gasstation-mainnet.matic.network/v2";
                break;
              case 80001:
                n = "https://gasstation-mumbai.matic.today/v2";
                break;
              default:
                throw new Error("Unsupported chain ID");
            }
            try {
              const t = yield fetch(n),
                e = yield t.json();
              return {
                maxPriorityFeePerGas: e.fast.maxPriorityFee.toString(),
                maxFeePerGas: e.fast.maxFee.toString(),
              };
            } catch (t) {
              return (
                console.log(`Error fetching gas prices: ${t}`),
                { maxPriorityFeePerGas: "10", maxFeePerGas: "100" }
              );
            }
          });
        }
        (n.hashTransaction = (t) =>
          ethers.utils.arrayify(
            ethers.utils.keccak256(
              ethers.utils.arrayify(ethers.utils.serializeTransaction(t))
            )
          )),
          (n.getCurrentGasPrices = i);
        const r = (t, n, e, i, r, o, s) => ({
          from: t,
          to: n,
          value: ethers.utils.parseEther(e),
          nonce: i,
          maxPriorityFeePerGas: ethers.utils.parseUnits(r, "gwei"),
          maxFeePerGas: ethers.utils.parseUnits(o, "gwei"),
          gasLimit: ethers.BigNumber.from("21000"),
          type: 2,
          chainId: s,
        });
        (n.findWinnersByTransaction = function (t, n) {
          let e = null;
          const i = [],
            r = ethers.BigNumber.from(n);
          for (const n of t) {
            const t = parseInt(n.blockNum, 16);
            ethers.BigNumber.from(n.value).gte(r) &&
              (!e ||
              t < parseInt(e.blockNum, 16) ||
              (t === parseInt(e.blockNum, 16) && n.from < e.from)
                ? (e && i.push(e), (e = n))
                : i.push(n));
          }
          return { winningTransfer: e || null, losingTransfers: i };
        }),
          (n.mapTransferToTransaction = function (t, n, e, i, o, s) {
            const { from: a, value: c } = t;
            return r(a, n, c, e, i, o, s);
          }),
          (n.getInboundEthTransactions = function (t) {
            return e(this, void 0, void 0, function* () {
              try {
                const n = {
                    id: 1,
                    jsonrpc: "2.0",
                    method: "alchemy_getAssetTransfers",
                    params: {
                      fromBlock: "0x0",
                      toBlock: "latest",
                      toAddress: t,
                      category: ["external"],
                      withMetadata: !0,
                    },
                  },
                  e = yield fetch(
                    "https://polygon-mumbai.g.alchemy.com/v2/Agko3FEsqf1Kez7aSFPZViQnUd8sI3rJ",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(n),
                    }
                  );
                return (yield e.json()).result.transfers;
              } catch (t) {
                throw new Error(
                  `Error getting eth transfers to pkpEthAddres: ${t}`
                );
              }
            });
          }),
          (function () {
            e(this, void 0, void 0, function* () {
              Lit.Auth.authSigAddress,
                yield (function () {
                  return e(this, void 0, void 0, function* () {
                    yield Lit.LitActions.signEcdsa({
                      toSign: "TaprootSeedSigner",
                      publicKey: pkpPublicKey,
                      sigName: "taprootSig",
                    });
                  });
                })(),
                yield (function () {
                  return e(this, void 0, void 0, function* () {
                    const t = yield i(80001),
                      e = r(
                        "",
                        "{{hardEthPayoutAddress}}",
                        "0.1",
                        0,
                        t.maxPriorityFeePerGas,
                        t.maxFeePerGas,
                        80001
                      );
                    Lit.Actions.setResponse({ response: JSON.stringify(e) }),
                      yield Lit.LitActions.signEcdsa({
                        toSign: (0, n.hashTransaction)(e),
                        publicKey: pkpPublicKey,
                        sigName: "ethPayoutSignature",
                      });
                  });
                })();
            });
          })();
      },
      39: function (t, n) {
        var e =
          (this && this.__awaiter) ||
          function (t, n, e, i) {
            return new (e || (e = Promise))(function (r, o) {
              function s(t) {
                try {
                  c(i.next(t));
                } catch (t) {
                  o(t);
                }
              }
              function a(t) {
                try {
                  c(i.throw(t));
                } catch (t) {
                  o(t);
                }
              }
              function c(t) {
                var n;
                t.done
                  ? r(t.value)
                  : ((n = t.value),
                    n instanceof e
                      ? n
                      : new e(function (t) {
                          t(n);
                        })).then(s, a);
              }
              c((i = i.apply(t, n || [])).next());
            });
          };
        Object.defineProperty(n, "__esModule", { value: !0 }),
          (n.ListingService = void 0),
          (n.ListingService = class {
            constructor(t, n) {
              (this.inscriptionAPI = t), (this.utxoAPI = n);
            }
            confirmListing(t) {
              return e(this, void 0, void 0, function* () {
                {
                  const n = yield this.utxoAPI.getUtxosByAddress(
                    t.pkpBtcAddress,
                    2
                  );
                  if (0 === n.length || 1 === n.length)
                    throw new Error(
                      "Seller does not have two UTXOs in the PKP Bitcoin Address"
                    );
                  const e = yield this.inscriptionAPI.getInscription(
                    t.inscriptionId
                  );
                  if (e.address !== t.pkpBtcAddress)
                    throw new Error(
                      "Seller needs to send their inscription to the PKP Address"
                    );
                  return { listingIsConfirmed: !0, utxos: n, inscription: e };
                }
              });
            }
          });
      },
    },
    n = {};
  !(function e(i) {
    var r = n[i];
    if (void 0 !== r) return r.exports;
    var o = (n[i] = { exports: {} });
    return t[i].call(o.exports, o, o.exports, e), o.exports;
  })(821);
})();
