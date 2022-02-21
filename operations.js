function greatestCommonDivisor(a, b) { // GREATETS COMMON DIVISOR WITH RECURSION
    if (isNaN(a) || isNaN(b)) {
        return undefined;
    }
    return b === 0 ? a : greatestCommonDivisor(b, a % b);
};

function leastCommonMultiple(a, b) {
    if (isNaN(a) || isNaN(b)) {
        return undefined;
    }
    return a * b / greatestCommonDivisor(a, b);
}

function smallerAbs(a, b) {
    if (isNaN(a) || isNaN(b)) {
        return undefined;
    }
    return Math.abs(a) < Math.abs(b) ? a : b
};

module.exports.gcd = greatestCommonDivisor;
module.exports.lcm = leastCommonMultiple;
module.exports.smallerAbs = smallerAbs;