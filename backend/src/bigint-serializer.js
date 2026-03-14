// Fix for BigInt serialization in JSON.stringify
// This adds a toJSON method to BigInt prototype
if (!BigInt.prototype.toJSON) {
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
}
