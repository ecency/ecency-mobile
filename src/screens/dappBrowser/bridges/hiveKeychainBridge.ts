/**
 * Injected JavaScript that creates window.hive_keychain and window.hive objects.
 * Compatible with the Hive Keychain browser extension API.
 *
 * Communication flow:
 * 1. dApp calls window.hive_keychain.requestXXX(params, callback)
 * 2. Bridge stores callback keyed by request_id
 * 3. Bridge posts message to ReactNativeWebView
 * 4. Native handler processes, shows confirmation, signs
 * 5. Native injects response via hive_keychain.onAnswerReceived()
 * 6. Bridge invokes stored callback with response
 */
export const HIVE_KEYCHAIN_BRIDGE_JS = `
(function() {
  if (window.hive_keychain) return;

  var hive_keychain = {
    current_id: 1,
    requests: {},
    handshake_callback: null,

    requestHandshake: function(callback) {
      this.handshake_callback = callback;
      this.dispatchCustomEvent('swHandshake_hive', {});
    },

    requestEncodeMessage: function(username, receiver, message, key, callback, rpc) {
      var request = {
        type: 'encode',
        username: username,
        receiver: receiver,
        message: message,
        method: key,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestVerifyKey: function(account, message, key, callback, rpc) {
      var request = {
        type: 'decode',
        username: account,
        message: message,
        method: key,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestSignBuffer: function(account, message, key, callback, rpc, title) {
      var request = {
        type: 'signBuffer',
        username: account,
        message: message,
        method: key,
        rpc: rpc,
        title: title
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestAddAccountAuthority: function(account, authorizedUsername, role, weight, callback, rpc) {
      var request = {
        type: 'addAccountAuthority',
        username: account,
        authorizedUsername: authorizedUsername,
        role: role,
        weight: weight,
        method: 'Active',
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestRemoveAccountAuthority: function(account, authorizedUsername, role, callback, rpc) {
      var request = {
        type: 'removeAccountAuthority',
        username: account,
        authorizedUsername: authorizedUsername,
        role: role,
        method: 'Active',
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestAddKeyAuthority: function(account, authorizedKey, role, weight, callback, rpc) {
      var request = {
        type: 'addKeyAuthority',
        username: account,
        authorizedKey: authorizedKey,
        weight: weight,
        role: role,
        method: 'Active',
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestRemoveKeyAuthority: function(account, authorizedKey, role, callback, rpc) {
      var request = {
        type: 'removeKeyAuthority',
        username: account,
        authorizedKey: authorizedKey,
        role: role,
        method: 'Active',
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestBroadcast: function(account, operations, key, callback, rpc) {
      var request = {
        type: 'broadcast',
        username: account,
        operations: operations,
        method: key,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestSignTx: function(account, tx, key, callback, rpc) {
      var request = {
        type: 'signTx',
        username: account,
        tx: tx,
        method: key,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestSignedCall: function(account, method, params, key, callback, rpc) {
      var request = {
        type: 'signedCall',
        username: account,
        method: method,
        params: params,
        typeWif: key,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestPost: function(account, title, body, parent_perm, parent_account, json_metadata, permlink, comment_options, callback, rpc) {
      var request = {
        type: 'post',
        username: account,
        title: title,
        body: body,
        parent_perm: parent_perm,
        parent_username: parent_account,
        json_metadata: json_metadata,
        permlink: permlink,
        comment_options: comment_options,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestVote: function(account, permlink, author, weight, callback, rpc) {
      var request = {
        type: 'vote',
        username: account,
        permlink: permlink,
        author: author,
        weight: weight,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestCustomJson: function(account, id, key, json, display_msg, callback, rpc) {
      var request = {
        type: 'custom',
        username: account,
        id: id,
        method: key,
        json: json,
        display_msg: display_msg,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestTransfer: function(account, to, amount, memo, currency, callback, enforce, rpc) {
      var request = {
        type: 'transfer',
        username: account,
        to: to,
        amount: amount,
        memo: memo,
        enforce: enforce || false,
        currency: currency,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestSendToken: function(account, to, amount, memo, currency, callback, rpc) {
      var request = {
        type: 'sendToken',
        username: account,
        to: to,
        amount: amount,
        memo: memo,
        currency: currency,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestDelegation: function(username, delegatee, amount, unit, callback, rpc) {
      var request = {
        type: 'delegation',
        username: username,
        delegatee: delegatee,
        amount: amount,
        unit: unit,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestWitnessVote: function(username, witness, vote, callback, rpc) {
      var request = {
        type: 'witnessVote',
        username: username,
        witness: witness,
        vote: vote,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestProxy: function(username, proxy, callback, rpc) {
      var request = {
        type: 'proxy',
        username: username,
        proxy: proxy,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestPowerUp: function(username, recipient, hive, callback, rpc) {
      var request = {
        type: 'powerUp',
        username: username,
        recipient: recipient,
        steem: hive,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestPowerDown: function(username, hive_power, callback, rpc) {
      var request = {
        type: 'powerDown',
        username: username,
        steem_power: hive_power,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestCreateClaimedAccount: function(username, new_account, owner, active, posting, memo, callback, rpc) {
      var request = {
        type: 'createClaimedAccount',
        username: username,
        new_account: new_account,
        owner: owner,
        active: active,
        posting: posting,
        memo: memo,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestCreateProposal: function(username, receiver, subject, permlink, daily_pay, start, end, extensions, callback, rpc) {
      var request = {
        type: 'createProposal',
        username: username,
        receiver: receiver,
        subject: subject,
        permlink: permlink,
        start: start,
        end: end,
        daily_pay: daily_pay,
        extensions: extensions,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestRemoveProposal: function(username, proposal_ids, extensions, callback, rpc) {
      var request = {
        type: 'removeProposal',
        username: username,
        proposal_ids: proposal_ids,
        extensions: extensions,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestUpdateProposalVote: function(username, proposal_ids, approve, extensions, callback, rpc) {
      var request = {
        type: 'updateProposalVote',
        username: username,
        proposal_ids: proposal_ids,
        approve: approve,
        extensions: extensions,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestConversion: function(username, amount, collaterized, callback, rpc) {
      var request = {
        type: 'convert',
        username: username,
        amount: amount,
        collaterized: collaterized,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestSavingsOperation: function(username, to, amount, currency, operation, memo, callback, rpc) {
      if (typeof memo === 'function') {
        rpc = callback;
        callback = memo;
        memo = '';
      }
      var request = {
        type: 'savings',
        username: username,
        to: to,
        amount: amount,
        currency: currency,
        operation: operation,
        memo: memo || '',
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestRecurrentTransfer: function(username, to, amount, currency, memo, recurrence, executions, callback, rpc, pair_id) {
      var request = {
        type: 'recurrentTransfer',
        username: username,
        to: to,
        amount: amount,
        currency: currency,
        memo: memo,
        recurrence: recurrence,
        executions: executions,
        rpc: rpc,
        pair_id: pair_id
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestSwap: function(username, startToken, endToken, amount, slippage, steps, callback, rpc, partnerUsername, partnerFee) {
      var request = {
        type: 'swap',
        username: username,
        startToken: startToken,
        endToken: endToken,
        amount: amount,
        slippage: slippage,
        steps: steps,
        partnerUsername: partnerUsername,
        partnerFee: partnerFee,
        rpc: rpc
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    requestAddAccount: function(username, keys, callback) {
      var request = {
        type: 'addAccount',
        username: username,
        keys: keys
      };
      this.dispatchCustomEvent('swRequest_hive', request, callback);
    },

    dispatchCustomEvent: function(name, data, callback) {
      data.domain = window.location.href;
      this.requests[this.current_id] = callback;
      var obj = {
        name: name,
        request_id: this.current_id,
        data: data
      };
      window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      this.current_id++;
    },

    onAnswerReceived: function(type, response) {
      if (type && type === 'hive_keychain_response') {
        if (response && response.request_id) {
          if (this.requests[response.request_id]) {
            this.requests[response.request_id](response);
            delete this.requests[response.request_id];
          }
        }
      } else if (type && type === 'hive_keychain_handshake') {
        if (this.handshake_callback) {
          this.handshake_callback();
        }
      }
    }
  };

  window.hive_keychain = hive_keychain;
  window.hive = hive_keychain;

  window.hive_keychain_extension = true;
})();
true;
`;
