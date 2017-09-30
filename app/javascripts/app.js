// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import sarkaar_artifacts from '../../build/contracts/Sarkaar.json'

// Sarkaar is our usable abstraction, which we'll use through the code below.
var Sarkaar = contract(sarkaar_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
	start: function() {
		var self = this;

		// Bootstrap the Sarkaar abstraction for Use.
		Sarkaar.setProvider(web3.currentProvider);

		// Get the initial account balance so it can be displayed.
		web3.eth.getAccounts(function(err, accs) {
		  if (err != null) {
			alert("There was an error fetching your accounts.");
			return;
		  }

		  if (accs.length == 0) {
			alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
			return;
		  }

		  accounts = accs;
		  account = accounts[0];
		  console.log(account);
		});

		var meta;
		Sarkaar.deployed().then(function(instance) {
			meta = instance;

			var uint = meta.sendUInt();

			// watch for changes
			uint.watch(function(error, result){
			// result will contain various information
			// including the argumets given to the Deposit
			// call.
			if (!error)
				console.log(result);
			});

			var str = meta.sendString();

			// watch for changes
			str.watch(function(error, result){
			// result will contain various information
			// including the argumets given to the Deposit
			// call.
			if (!error)
				console.log(result);
			});	

			var addr = meta.sendAddress();

			// watch for changes
			addr.watch(function(error, result){
			// result will contain various information
			// including the argumets given to the Deposit
			// call.
			if (!error)
				console.log(result);
			});	  
		});
	},

	register_land: function(aadhar_id, land_address, land_id, price) {  	  
		var meta;
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  return meta.register_land(aadhar_id, land_id, land_address, price, {from: account, gas: 1000000});
		}).then(function(value) {	
			alert("Successfully registered land");			
		}).catch(function(e) {
		  console.log(e);
		  alert("Failed");	  
		});	  
	},

	pay_for_land: function(aadhar_id, land_id, price) {  	  
		var meta;
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  return meta.pay_for_land(land_id, aadhar_id, {from: account, gas: 1000000, value: price});
		}).then(function(value) {	
			alert("Successfully paid for land");			
		}).catch(function(e) {
		  console.log(e);
		  alert("Failed");	  
		});	  
	},  

	create_account: function(aadhar_id, eth_id, name) {
		var meta;		
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  return meta.create_account(aadhar_id.toString(), name.toString(), eth_id.toString(), {from: account, gas: 1000000});
		}).then(function(value) {
			alert("Successfully created account");			
		}).catch(function(e) {
		  console.log(e);
		  alert("Failed");	  
		});	  
	},

	get_lands_length: function() {
		var meta;
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  return meta.fetch_lands_length.call({from: account});
		}).then(function(value) {
			console.log("Lands " +  value);		
		}).catch(function(e) {
		  console.log(e);
		  alert("Failed");	  
		});	  
	},

	fetch_requests: function(aadhar_id) {
		var meta;
		Sarkaar.deployed().then(function(instance) {
		    meta = instance;
			var div = document.getElementById('buy_requests');
		    meta.get_buy_requests_length.call(aadhar_id, {from: account}).then(function(value) {
		        console.log("Requests " +  value);	
			    var ul = document.createElement('ul'); 
				for(var i=0; i<value; i++) {
					meta.get_buy_request_at_index.call(aadhar_id, i, {from: account}).then(function(value) {
						if(value[2] == 0) {
							console.log("Buy request " +  value[0] + " " + value[1]);
							var li = document.createElement('li');
							var content = document.createTextNode("Payment id = " + value[0] + ", Land id = " + value[1] + ", Price offered = " + value[3] + " eth.");
							li.appendChild(content); // append the created textnode above to the li element
							ul.appendChild(li); // append the created li element above to the ul element
						}
		                    
					});			
				}
				div.appendChild(ul);
		    });
		});	  
	},

	accept_request: function(payment_id) {
		var meta;		
		console.log(payment_id);
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  return meta.accept_order(payment_id, {from: account, gas: 1000000});
		}).then(function(value) {
			alert("Successfully accepted request");			
		}).catch(function(e) {
		  console.log(e);
		  alert("Failed");	  
		});	  
	},

	reject_request: function(payment_id) {
		var meta;		
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  return meta.reject_order(payment_id, {from: account, gas: 1000000});
		}).then(function(value) {
			alert("Successfully rejected request");			
		}).catch(function(e) {
		  console.log(e);
		  alert("Failed");
		});	  
	},  

	fetch_persons_size: function() {
		var meta;
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  meta.fetch_persons_size.call({from: account}).then(function(value) {
			console.log("Person " +  value);		
		  });
		});	  
	},

	fetch_persons: function() {
		var meta;
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  meta.fetch_persons_size.call({from: account}).then(function(value) {
			console.log("Person " +  value);		
			for(var i=0; i<value; i++) {
				meta.fetch_person_at_index.call(i, {from: account}).then(function(value) {
					console.log("Person " +  value[0] + " " + value[1] + " " + web3.toAscii(value[2]));		
				});			
			}
		  });
		});	  
	},

	fetch_lands: function() {
		var meta;
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  meta.fetch_lands_length.call({from: account}).then(function(value) {
			console.log("Lands " +  value);		
			for(var i=0; i<value; i++) {
				meta.fetch_land_at_index.call(i, {from: account}).then(function(value) {
					console.log("Land " +  value[0] + " " + value[1] + " " + value[2]);		
				});			
			}
		  });
		});	  
	},  

	fetch_person_at_index: function() {
		var meta;
		Sarkaar.deployed().then(function(instance) {
		  meta = instance;
		  meta.fetch_person_at_index.call(1, {from: account}).then(function(value) {
			console.log("Person " +  value[0] + " " + value[1] + " " + value[2]);		
		  });
		});	  
	}  
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  /*if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  */
  window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  App.start();
});
