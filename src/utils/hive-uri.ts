import { get, isArray } from 'lodash';

import * as operationsData from './operations.json';

/**
 * checks if uri entered is valid hive uri
 * Accepts a string
 * Returns boolean if uri starts with 'hive://'
 * */

export const isHiveUri = (uri: string) => {
  const trimUri = uri.trim();
  return trimUri.startsWith('hive://');
};

// check operation array is valid and is a single operation array
const _checkOpsArray = (ops: any) => {
  return ops && isArray(ops) && ops.length === 1 && isArray(ops[0]) && ops[0].length === 2;
};

const findParentKey = (obj, value, parentKey = null) => {

    Object.keys(obj).forEach((key) => {
      if (obj[key] === value) {
        return parentKey;
      } else if (typeof obj[key] === 'object') {
        const foundKey = findParentKey(obj[key], value, key);
        if (foundKey) {
          return foundKey;
        }
      }
    })
  return null;
};

// get operation name and signer field from operation object
const getOperationProps = (opName: string) => {
  const op = get(operationsData, opName, null);
  if (op) {
    const signerField = findParentKey(op, '__signer');
    return {
      opName: op.name,
      opAuthority: op.authority || '',
      signerField,
    };
  } else {
    return null;
  }
};

// validate and format amount field in operation to 3 decimal places
const _formatAmount = (amount: string) => {
  const splitAmt = amount.split(' ');
  if (
    splitAmt.length === 2 &&
    parseFloat(splitAmt[0]) &&
    (splitAmt[1] === 'HIVE' || splitAmt[1] === 'HBD')
  ) {
    return `${parseFloat(splitAmt[0]).toFixed(3)} ${splitAmt[1]}`;
  } else {
    return null;
  }
};

/**
 * Validates tx from parsed data from hive-uri, checks if operation length is not greater than one and __signer is present in operation
 * Accepts tx object of parsed uri from decode method of hive-uri
 * Returns promise with keys for showing errors, and operation name parsed from operations.json and in case of success returns formatted tx
 *
 * */
export const getFormattedTx = (tx: any, authoritiesMap: Map<string, boolean>) => {
  const errorObj = {
    errorKey1: '',
    errorKey2: '',
    authorityKeyType: '',
  };

  const ops = get(tx, 'operations', []);
  const isValidOp = _checkOpsArray(ops);
  if (!isValidOp) {
    errorObj.errorKey1 = 'qr.multi_array_ops_alert';
    errorObj.errorKey2 = 'qr.multi_array_ops_aler_desct';
    return Promise.reject(errorObj);
  }
  const op = ops[0]; // single operation
  const operationName = op[0]; // operation name
  const operationObj = op[1]; // operation object

  if (!operationName) {
    errorObj.errorKey1 = 'qr.invalid_op';
    errorObj.errorKey2 = 'qr.invalid_op_desc';
    return Promise.reject(errorObj);
  }
  const opProps = getOperationProps(operationName); // get operation props from operations.json file i-e signer field and operation name
  errorObj.authorityKeyType = opProps?.opAuthority || ''; // set key type to validate object

  if (!opProps) {
    errorObj.errorKey1 = 'qr.invalid_op';
    errorObj.errorKey2 = 'qr.invalid_op_desc';
    return Promise.reject(errorObj);
  }
  if (authoritiesMap && !authoritiesMap.get(opProps.opAuthority)) {
    errorObj.errorKey1 = 'qr.invalid_key';
    errorObj.errorKey2 = 'qr.invalid_key_desc';
    return Promise.reject(errorObj);
  }
  // if amount field present in operation, validate and check for proper formatting and format to 3 decimal places
  if (!!operationObj?.amount) {
    const amount = _formatAmount(operationObj.amount);
    operationObj.amount = amount;
    if (!amount) {
      errorObj.errorKey1 = 'qr.invalid_amount';
      errorObj.errorKey2 = 'qr.invalid_amount_desc';
      return Promise.reject(errorObj);
    }
  }
  const opSignerValue = get(op[1], opProps.signerField, '');
  // if signer field contains empty value, fill it with __signer
  if (!opSignerValue) {
    operationObj[opProps.signerField] = '__signer';
  }

  const { opName } = opProps;
  tx = {
    ...tx,
    operations: [[operationName, operationObj]],
  };
  // resolve with formatted tx and opName
  return Promise.resolve({ tx, opName });
};
