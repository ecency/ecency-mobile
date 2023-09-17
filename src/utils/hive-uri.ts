import { get, isArray } from 'lodash';
const operationsData = require('./operations.json');

/**
 * checks if uri entered is valid hive uri
 * Accepts a string
 * Returns boolean if uri starts with 'hive://'
 * */

export const isHiveUri = (uri: string) => {
  let trimUri = uri.trim();
  return trimUri.startsWith('hive://');
};

// check operation array is valid and is a single operation array
const _checkOpsArray = (ops: any) => {
  return ops && isArray(ops) && ops.length === 1 && isArray(ops[0]) && ops[0].length === 2;
};

const findParentKey = (obj, value, parentKey = null) => {
  for (let key in obj) {
    if (obj[key] === value) {
      return parentKey;
    } else if (typeof obj[key] === 'object') {
      const foundKey = findParentKey(obj[key], value, key);
      if (foundKey) {
        return foundKey;
      }
    }
  }
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
 * Validates parsed data from hive-uri, checks if operation length is not greater than one and __signer is present in operation
 * Accepts parsed uri from decode method of hive-uri
 * Returns an object with error status, keys for showing errors, and operation name parsed from operations.json
 *
 * */
export const validateParsedHiveUri = (parsedUri: any, authoritiesMap: Map<string, boolean>) => {
  let validateObj = {
    error: false,
    key1: '',
    key2: '',
    opName: '',
    keyType: '',
    tx: parsedUri.tx,
  };

  const ops = get(parsedUri.tx, 'operations', []);
  const isValidOp = _checkOpsArray(ops);
  if (!isValidOp) {
    validateObj.error = true;
    validateObj.key1 = 'qr.multi_array_ops_alert';
    validateObj.key2 = 'qr.multi_array_ops_aler_desct';
    return validateObj;
  }
  const op = ops[0]; // single operation
  const operationName = op[0]; // operation name
  let operationObj = op[1]; // operation object

  if (!operationName) {
    validateObj.error = true;
    validateObj.key1 = 'qr.invalid_op';
    validateObj.key2 = 'qr.invalid_op_desc';
    return validateObj;
  }
  const opProps = getOperationProps(operationName); // get operation props from operations.json file i-e signer field and operation name
  validateObj.keyType = opProps?.opAuthority || ''; // set key type to validate object

  if (!opProps) {
    validateObj.error = true;
    validateObj.key1 = 'qr.invalid_op';
    validateObj.key2 = 'qr.invalid_op_desc';
    return validateObj;
  }
  if (authoritiesMap && !authoritiesMap.get(opProps.opAuthority)) {
    validateObj.error = true;
    validateObj.key1 = 'qr.invalid_key';
    validateObj.key2 = 'qr.invalid_key_desc';
    return validateObj;
  }
  // if amount field present in operation, validate and check for proper formatting and format to 3 decimal places
  if (operationObj.hasOwnProperty('amount')) {
    const amount = _formatAmount(operationObj.amount);
    operationObj.amount = amount;
    if (!amount) {
      validateObj.error = true;
      validateObj.key1 = 'qr.invalid_amount';
      validateObj.key2 = 'qr.invalid_amount_desc';
      return validateObj;
    }
  }
  const opSignerValue = get(op[1], opProps.signerField, '');
  // if signer field contains empty value, fill it with __signer
  if (!opSignerValue) {
    operationObj[opProps.signerField] = '__signer';
    validateObj.error = false;
    validateObj.key1 = '';
    validateObj.key2 = '';
    validateObj.opName = opProps.opName;
    validateObj.tx = {
      ...validateObj.tx,
      operations: [[operationName, operationObj]],
    };
    return validateObj;
  }
  validateObj.error = false;
  validateObj.key1 = '';
  validateObj.key2 = '';
  validateObj.opName = opProps.opName;
  validateObj.tx = {
    ...validateObj.tx,
    operations: [[operationName, operationObj]],
  };
  return validateObj;
};
