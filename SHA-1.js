const bitSize = str => new Blob([str]).size * 8;
const plaintext = '(AmirHossein Zendevani - 40009973)';
const numOfBits = bitSize(plaintext);
const lengthPart = dec2bin(numOfBits).padStart(64, '0');
const numOfKs = calculateKCount(numOfBits);
const x = strToBin(plaintext) + '1' + '0'.repeat(numOfKs) + lengthPart;
const arr = divideString(x, 512);
let H0 = hexToBinary('67452301');
let H1 = hexToBinary('EFCDAB89');
let H2 = hexToBinary('98BADCFE');
let H3 = hexToBinary('10325476');
let H4 = hexToBinary('C3D2E1F0');
const K1 = hexToBinary('5A827999');
const K2 = hexToBinary('6ED9EBA1');
const K3 = hexToBinary('8F1BBCDC');
const K4 = hexToBinary('CA62C1D6');
const result = [];

// check that length part not overflow
if (lengthPart.length > 64) {
  console.log('This message is too long.');
  return;
}

let A = H0;
let B = H1;
let C = H2;
let D = H3;
let E = H4;

for (let i = 0; i < arr.length; i++) {
  block(arr[i]);

  A = additionModulo32Bits(A, H0);
  B = additionModulo32Bits(B, H1);
  C = additionModulo32Bits(C, H2);
  D = additionModulo32Bits(D, H3);
  E = additionModulo32Bits(E, H4);

  H0 = A;
  H1 = B;
  H2 = C;
  H3 = D;
  H4 = E;

  result.push(binaryToHex(A + B + C + D + E));
}

for (const item of result) {
  console.log(item);
}

function block(str) {
  const Wj = calculteWj(str);
  for (let i = 0; i < 80; i++) {
    if (i < 20) {
      round(1, K1, Wj[i]);
    } else if (i < 40) {
      round(2, K2, Wj[i]);
    } else if (i < 60) {
      round(3, K3, Wj[i]);
    } else if (i < 80) {
      round(4, K4, Wj[i]);
    }
  }
}

function round(stage, K, W) {
  let PrevA = A;
  let PrevB = B;
  let PrevC = C;
  let PrevD = D;
  let PrevE = E;

  const fRes = f(stage);
  B = PrevA;

  for (let i = 0; i < 5; i++) PrevA = SHL(PrevA);

  for (let i = 0; i < 30; i++) PrevB = SHL(PrevB);

  C = PrevB;
  D = PrevC;
  E = PrevD;

  let temp = additionModulo32Bits(PrevE, fRes);
  temp = additionModulo32Bits(PrevA, temp);
  temp = additionModulo32Bits(W, temp);
  temp = additionModulo32Bits(K, temp);

  A = temp;
}

function f(stage) {
  if (stage == 1) {
    return OR(AND(B, C), AND(COM(B), D));
  }

  if (stage == 2) {
    return XOR(XOR(B, C), D);
  }

  if (stage == 3) {
    return OR(OR(AND(B, C), AND(B, D)), AND(C, D));
  }

  if (stage == 4) {
    return XOR(XOR(B, C), D);
  }
}

function binaryToHex(binStr) {
  let hex = '';
  for (let i = 0; i < binStr.length; i += 4) {
    const binChunk = binStr.substr(i, 4);
    const dec = parseInt(binChunk, 2);
    const hexChunk = dec.toString(16);
    hex += hexChunk;
  }
  return '0x' + hex.toUpperCase();
}

function hexToBinary(hexString) {
  const binaryString = parseInt(hexString, 16).toString(2);
  return binaryString.padStart(hexString.length * 4, '0');
}

function calculteWj(str) {
  const Wj = new Array(80);
  const dividation = divideString(str, 32);

  for (let i = 0; i < 80; i++) {
    if (i < 16) {
      Wj[i] = dividation[i];
    } else {
      let temp = XOR(Wj[i - 16], Wj[i - 14]);
      temp = XOR(temp, Wj[i - 8]);
      temp = XOR(temp, Wj[i - 3]);
      Wj[i] = SHL(temp);
    }
  }

  return Wj;
}

function divideString(str, len) {
  const dividedArray = [];
  const length = str.length;

  for (let i = 0; i < length; i += len) {
    dividedArray.push(str.substring(i, i + len));
  }

  return dividedArray;
}

function strToBin(input) {
  let binaryResult = '';

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    let binaryValue = '';

    for (let j = 7; j >= 0; j--) {
      binaryValue += (charCode >> j) & 1;
    }

    binaryResult += binaryValue;
  }

  return binaryResult.trim();
}

function calculateKCount(numbers) {
  let res = (448 - numbers - 1) % 512;

  while (res < 0) res += 512;
  return res;
}

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function additionModulo32Bits(binStr1, binStr2) {
  const num1 = parseInt(binStr1, 2);
  const num2 = parseInt(binStr2, 2);
  const sum = (num1 + num2) % Math.pow(2, 32);
  const result = sum.toString(2).padStart(32, '0');
  return result;
}

function COM(binaryString) {
  let result = '';

  for (let i = 0; i < binaryString.length; i++) {
    result += binaryString[i] === '0' ? '1' : '0';
  }

  return result;
}

function OR(a, b) {
  let result = '';
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '1' || b[i] === '1') {
      result += '1';
    } else {
      result += '0';
    }
  }

  return result;
}

function AND(a, b) {
  let result = '';
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '1' && b[i] === '1') {
      result += '1';
    } else {
      result += '0';
    }
  }

  return result;
}

function XOR(a, b) {
  let result = '';
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      result += '0';
    } else {
      result += '1';
    }
  }

  return result;
}

function SHL(binaryString) {
  let shifted = '';
  let carry = binaryString[0]; // Initialize carry to 0

  for (let i = 0; i < binaryString.length; i++) {
    if (i === binaryString.length - 1) {
      shifted += carry; // Append the carry to the end of the shifted string
    } else {
      shifted += binaryString[i + 1]; // Shift each bit to the left
    }
  }

  return shifted;
}
