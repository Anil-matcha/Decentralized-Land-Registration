var landregistrar = artifacts.require("./Sarkaar.sol");

module.exports = function(deployer) {
  deployer.deploy(landregistrar, "0x198e13017d2333712bd942d8b028610b95c363da");
};