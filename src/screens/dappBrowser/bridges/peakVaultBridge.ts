/**
 * Injected JavaScript that creates window.peakvault object.
 * Compatible with the Peak Vault browser extension API.
 *
 * Communication flow:
 * 1. dApp calls window.peakvault.requestXXX(params) → returns Promise
 * 2. PeakVault dispatches CustomEvent('peak-vault-event', { detail })
 * 3. Our listener intercepts the event and posts to ReactNativeWebView
 * 4. Native handler processes, shows confirmation, signs/broadcasts
 * 5. Native injects CustomEvent('peak-vault-response-{resId}', { detail })
 * 6. PeakVault's internal listener resolves the Promise
 */
export const PEAK_VAULT_BRIDGE_JS = `
(function() {
  if (window.peakvault) return;
  if (window.location.protocol !== 'https:') return;

  // Simplified PeakVault class that mirrors the real extension's public API
  var PeakVault = (function() {
    function PeakVault() {
      this._responseId = 0;
      this._rpc = 'https://api.hive.blog';
    }

    PeakVault.prototype.setRpc = function(rpc) {
      this._rpc = rpc;
    };

    PeakVault.prototype._trigger = function(data) {
      data.sourceUrl = window.location.toString();
      data.rpc = this._rpc;
      document.dispatchEvent(new CustomEvent('peak-vault-event', { detail: data }));
    };

    PeakVault.prototype._triggerWithResponse = function(data) {
      var resId = this._responseId;
      this._responseId++;
      data.resId = resId;
      this._trigger(data);
      return new Promise(function(resolve, reject) {
        var listener = function(event) {
          document.removeEventListener('peak-vault-response-' + resId, listener);
          var eventDetail = JSON.parse(event.detail);
          if (eventDetail.error) {
            reject(eventDetail);
          } else {
            resolve(eventDetail);
          }
        };
        document.addEventListener('peak-vault-response-' + resId, listener);
      });
    };

    // --- Public API Methods ---

    PeakVault.prototype.requestSignOp = function(account, operations, keyRole, displayMessage) {
      displayMessage = displayMessage || { title: 'Sign transaction' };
      return this._triggerWithResponse({
        id: 'sign-request',
        open: 'index.html',
        account: account,
        operations: operations,
        keyRole: keyRole,
        broadcast: false,
        displayMessage: displayMessage
      });
    };

    PeakVault.prototype.requestSignTx = function(account, transaction, keyRole) {
      var displayMessage = { title: 'Sign transaction' };
      return this._triggerWithResponse({
        id: 'sign-request',
        open: 'index.html',
        account: account,
        operations: transaction.operations || [],
        keyRole: keyRole,
        broadcast: false,
        displayMessage: displayMessage,
        transaction: transaction
      });
    };

    PeakVault.prototype.requestBroadcast = function(account, operations, keyRole, displayMessage) {
      displayMessage = displayMessage || { title: 'Broadcast transaction' };
      return this._triggerWithResponse({
        id: 'sign-request',
        open: 'index.html',
        account: account,
        operations: operations,
        keyRole: keyRole,
        broadcast: true,
        displayMessage: displayMessage
      });
    };

    PeakVault.prototype.requestCustomJson = function(account, id, keyRole, json, displayMessage) {
      displayMessage = displayMessage || { title: 'Sign custom transaction' };
      var jsonStr = typeof json === 'string' ? json : JSON.stringify(json);
      var operations = [
        ['custom_json', {
          required_auths: keyRole === 'active' ? [account] : [],
          required_posting_auths: keyRole !== 'active' ? [account] : [],
          id: id,
          json: jsonStr
        }]
      ];
      return this.requestBroadcast(account, operations, keyRole, displayMessage);
    };

    PeakVault.prototype.requestTransfer = function(from, to, amount, currency, memo) {
      memo = memo || '';
      var transfer = ['transfer', {
        from: from,
        to: to,
        amount: amount.toFixed(3) + ' ' + currency,
        memo: memo
      }];
      var displayMessage = {
        title: 'Transfer ' + currency,
        message: 'Send ' + amount.toFixed(3) + ' ' + currency + ' to @' + to
      };
      return this.requestBroadcast(from, [transfer], 'active', displayMessage);
    };

    PeakVault.prototype.requestVote = function(voter, permlink, author, weight) {
      var vote = ['vote', { voter: voter, permlink: permlink, author: author, weight: weight }];
      return this.requestBroadcast(voter, [vote], 'posting', { title: 'Vote' });
    };

    PeakVault.prototype.requestPost = function(account, title, body, parentPermlink, parentAccount, json_metadata, permlink, otherOptions) {
      var operations = [];
      var comment = ['comment', {
        parent_author: parentAccount,
        parent_permlink: parentPermlink,
        author: account,
        permlink: permlink,
        title: title,
        body: body,
        json_metadata: JSON.stringify(json_metadata)
      }];
      operations.push(comment);
      if (otherOptions) {
        var commentOptions = ['comment_options', {
          author: account,
          permlink: permlink,
          max_accepted_payout: otherOptions.max_accepted_payout,
          percent_hbd: otherOptions.percent_hbd,
          allow_votes: otherOptions.allow_votes,
          allow_curation_rewards: otherOptions.allow_curation_rewards,
          extensions: otherOptions.extensions
        }];
        operations.push(commentOptions);
      }
      return this.requestBroadcast(account, operations, 'posting', { title: 'Post' });
    };

    PeakVault.prototype.requestSignBuffer = function(account, keyRole, message, displayMessage) {
      displayMessage = displayMessage || {
        title: 'Sign message',
        message: 'The website wants to verify that you have the required authority on this account.'
      };
      var verify = ['peakvault-sign_buffer', { message: message }];
      return this.requestSignOp(account, [verify], keyRole, displayMessage);
    };

    PeakVault.prototype.connect = function() {
      var operation = ['peakvault-connect', {}];
      var displayMessage = {
        title: 'Connect',
        message: 'Let the website know which accounts are present in the wallet.'
      };
      return this.requestSignOp('', [operation], 'posting', displayMessage);
    };

    PeakVault.prototype.requestDecode = function(account, secret, keyRole) {
      keyRole = keyRole || 'memo';
      var decode = ['peakvault-decode', { secret: secret }];
      var displayMessage = { title: 'Decode message', message: 'Decode an encrypted message using your private key.' };
      return this.requestSignOp(account, [decode], keyRole, displayMessage);
    };

    PeakVault.prototype.requestEncode = function(account, recipientAccount, message) {
      var encode = ['peakvault-encode', { recipient: recipientAccount, message: message }];
      var displayMessage = { title: 'Encode message', message: 'Encrypt a message.' };
      return this.requestSignOp(account, [encode], 'memo', displayMessage);
    };

    PeakVault.prototype.requestEncodeWithKeys = function(account, keyRole, publicKeys, message) {
      var encode = ['peakvault-encode_with_keys', { publicKeys: publicKeys, message: message }];
      var displayMessage = { title: 'Encode message', message: 'Encrypt a message with specific keys.' };
      return this.requestSignOp(account, [encode], keyRole, displayMessage);
    };

    PeakVault.prototype.requestAddAccountAuthority = function(account, accountToAuthorize, weight, keyRole) {
      var addAuth = ['account_update', {
        action: 'addAccountAuthority',
        account: account,
        accountToAuthorize: accountToAuthorize,
        weight: weight,
        keyRole: keyRole
      }];
      return this.requestBroadcast(account, [addAuth], 'active', { title: 'Add account authority' });
    };

    PeakVault.prototype.requestRemoveAccountAuthority = function(account, accountToRemove, keyRole) {
      var removeAuth = ['account_update', {
        action: 'removeAccountAuthority',
        account: account,
        accountToRemove: accountToRemove,
        keyRole: keyRole
      }];
      return this.requestBroadcast(account, [removeAuth], 'active', { title: 'Remove account authority' });
    };

    PeakVault.prototype.requestAddKeyAuthority = function(account, keyToAuthorize, weight, keyRole) {
      var addKey = ['account_update', {
        action: 'addKeyAuthority',
        account: account,
        keyToAuthorize: keyToAuthorize,
        weight: weight,
        keyRole: keyRole
      }];
      return this.requestBroadcast(account, [addKey], 'active', { title: 'Add key authority' });
    };

    PeakVault.prototype.requestRemoveKeyAuthority = function(account, keyToRemove, keyRole) {
      var removeKey = ['account_update', {
        action: 'removeKeyAuthority',
        account: account,
        keyToRemove: keyToRemove,
        keyRole: keyRole
      }];
      return this.requestBroadcast(account, [removeKey], 'active', { title: 'Remove key authority' });
    };

    PeakVault.prototype.requestWitnessVote = function(account, witness, approve) {
      var witnessVote = ['account_witness_vote', {
        account: account,
        witness: witness,
        approve: approve
      }];
      return this.requestBroadcast(account, [witnessVote], 'active', { title: 'Witness Vote' });
    };

    PeakVault.prototype.requestGovernanceProxy = function(account, proxy) {
      var proxyOp = ['account_witness_proxy', { account: account, proxy: proxy }];
      return this.requestBroadcast(account, [proxyOp], 'active', { title: 'Set Proxy' });
    };

    PeakVault.prototype.requestDelegation = function(delegator, delegatee, amount, unit) {
      var delegation = ['delegate_vesting_shares', {
        delegator: delegator,
        delegatee: delegatee,
        vesting_shares: amount + ' ' + (unit || 'VESTS')
      }];
      return this.requestBroadcast(delegator, [delegation], 'active', { title: 'Delegation' });
    };

    PeakVault.prototype.requestStake = function(from, to, amount) {
      var stake = ['transfer_to_vesting', { from: from, to: to || from, amount: amount.toFixed(3) + ' HIVE' }];
      return this.requestBroadcast(from, [stake], 'active', { title: 'Power Up' });
    };

    PeakVault.prototype.requestUnstake = function(account, amount) {
      var unstake = ['withdraw_vesting', { account: account, vesting_shares: amount + ' VESTS' }];
      return this.requestBroadcast(account, [unstake], 'active', { title: 'Power Down' });
    };

    PeakVault.prototype.requestRecurrentTransfer = function(from, to, amount, currency, memo, recurrence, executions, extensions) {
      var op = ['recurrent_transfer', {
        from: from,
        to: to,
        amount: amount.toFixed(3) + ' ' + currency,
        memo: memo || '',
        recurrence: recurrence,
        executions: executions,
        extensions: extensions || []
      }];
      return this.requestBroadcast(from, [op], 'active', { title: 'Recurrent Transfer' });
    };

    PeakVault.prototype.requestConversion = function(account, amount, HBD2HIVE) {
      var requestId = Math.floor(Date.now() / 1000);
      var opType = HBD2HIVE ? 'collateralized_convert' : 'convert';
      var asset = HBD2HIVE ? 'HIVE' : 'HBD';
      var op = [opType, {
        owner: account,
        amount: amount.toFixed(3) + ' ' + asset,
        requestid: requestId
      }];
      return this.requestBroadcast(account, [op], 'active', { title: 'Convert' });
    };

    PeakVault.prototype.requestCreateProposal = function(account, fundsReceiver, dailyPay, title, permlink, start, end, extensions) {
      var op = ['create_proposal', {
        creator: account,
        receiver: fundsReceiver,
        start_date: start,
        end_date: end,
        daily_pay: dailyPay,
        subject: title,
        permlink: permlink,
        extensions: extensions || []
      }];
      return this.requestBroadcast(account, [op], 'active', { title: 'Create Proposal' });
    };

    PeakVault.prototype.requestRemoveProposal = function(creator, proposalIds, extensions) {
      var op = ['remove_proposal', {
        proposal_owner: creator,
        proposal_ids: proposalIds,
        extensions: extensions || []
      }];
      return this.requestBroadcast(creator, [op], 'active', { title: 'Remove Proposal' });
    };

    PeakVault.prototype.requestUpdateProposalVotes = function(voter, proposalIds, approve, extensions) {
      var op = ['update_proposal_votes', {
        voter: voter,
        proposal_ids: proposalIds,
        approve: approve,
        extensions: extensions || []
      }];
      return this.requestBroadcast(voter, [op], 'active', { title: 'Proposal Vote' });
    };

    PeakVault.prototype.requestCreateClaimedAccount = function(creator, newAccount, ownerAuthority, activeAuthority, postingAuthority, publicMemoKey) {
      var op = ['create_claimed_account', {
        creator: creator,
        new_account_name: newAccount,
        owner: ownerAuthority,
        active: activeAuthority,
        posting: postingAuthority,
        memo_key: publicMemoKey,
        json_metadata: '',
        extensions: []
      }];
      return this.requestBroadcast(creator, [op], 'active', { title: 'Create Account' });
    };

    PeakVault.prototype.requestContact = function() {
      var operation = ['peakvault-choose_contact', {}];
      return this.requestSignOp('', [operation], 'posting', { title: 'Choose Contact' });
    };

    return PeakVault;
  })();

  window.peakvault = new PeakVault();

  // Intercept peak-vault-event and forward to React Native
  document.addEventListener('peak-vault-event', function(event) {
    var detail = event.detail;
    if (!detail || !detail.id) return;
    var msg = {
      name: 'pvRequest',
      data: detail
    };
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  });
})();
true;
`;
