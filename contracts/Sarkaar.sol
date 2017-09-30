pragma solidity ^0.4.4;

contract Sarkaar {

    enum Pay_State {Created, Accepted, Rejected, Cancelled}

    struct Person { 
        uint256 aadhar_id;
        address pay_id;
        bytes32 name;
		bool check;
    }
    
    struct Land {
        uint256 land_id;
        uint256 price;
        bytes32 land_address;
		bool check;		
    }
    
    struct Payment {
        uint256 payment_id;
        Person owner;
        Person buyer;
        Land   land;
        uint256 price;
        Pay_State pay_state;
		bool check;		
    }
    
    Person[] personArray;    
    Land[] landArray;   
    Payment[] paymentArray;
    mapping(uint256 => uint256) public ownership_map;
    mapping(uint256 => Person) person_map;
	mapping(uint256 => Land) land_map;
    mapping(uint256 => uint256[]) orders_map;
    address gov_address;
    mapping(uint256 => Payment) payment_map;    
    
    function Sarkaar(address addr) {
        gov_address = addr;
    }    
    
    function create_account(uint256 aadhar_id, bytes32 name, address account_id) public {
        require(msg.sender == gov_address);
		require(person_map[aadhar_id].check != true);
        if(person_map[aadhar_id].check != true) {
            Person memory newperson = Person(aadhar_id, account_id, name, true);
            personArray.push(newperson);
            person_map[aadhar_id] = newperson;
        }
    }
    
	function bytes32ToString(bytes32 x) constant returns (string) {
		bytes memory bytesString = new bytes(32);
		uint charCount = 0;
		for (uint j = 0; j < 32; j++) {
			byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
			if (char != 0) {
				bytesString[charCount] = char;
				charCount++;
			}
		}
		bytes memory bytesStringTrimmed = new bytes(charCount);
		for (j = 0; j < charCount; j++) {
			bytesStringTrimmed[j] = bytesString[j];
		}
		return string(bytesStringTrimmed);
	}	
	
	function uintToBytes(uint v) constant returns (bytes32 ret) {
		if (v == 0) {
			ret = '0';
		}
		else {
			while (v > 0) {
				ret = bytes32(uint(ret) / (2 ** 8));
				ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
				v /= 10;
			}
		}
		return ret;
	}	
	
	event sendUInt(uint mesg);
	event sendString(bytes32 mesg);	
	event sendAddress(address mesg);	
    event sendBool(bool mesg);		
	
    function register_land(uint256 aadhar_id, uint256 land_id, bytes32 land_address, uint256 price) {
        require(msg.sender == gov_address);
		require(person_map[aadhar_id].check == true);
		require(land_map[land_id].check != true);
        Person memory person = person_map[aadhar_id];
        Land memory land = Land(land_id, price, land_address, true);
        landArray.push(land);
        ownership_map[land_id] = person.aadhar_id;
		land_map[land_id] = land;
    }
    
    function pay_for_land(uint256 land_id, uint256 sender_aadhar_id) public payable {
        Land memory land = land_map[land_id];
        uint256 owner_id = ownership_map[land.land_id];
        Person memory owner = person_map[owner_id];
        Person memory buyer = person_map[sender_aadhar_id];
		require(land.check == true);
		require(buyer.check == true);
        Payment memory payment = Payment((paymentArray.length + 1), owner, buyer, land, msg.value, Pay_State.Created, true);
        paymentArray.push(payment);
        uint256[] storage owner_payments_array = orders_map[owner_id];
        owner_payments_array.push(payment.payment_id);
        payment_map[payment.payment_id] = payment;
    }
    
    function accept_order(uint256 payment_id) {
	    sendUInt(payment_id);
		require(payment.pay_state == Pay_State.Created);		
        Payment storage payment = payment_map[payment_id]; 
		sendBool(payment.check);		
	    sendAddress(msg.sender);		
		sendAddress(payment.owner.pay_id);		
		sendString(payment.owner.name);		
		require(payment.owner.pay_id == msg.sender);
		require(payment.check == true);
		payment.owner.pay_id.transfer(payment.price);
		payment.pay_state = Pay_State.Accepted;
        Land memory land = payment.land;
        Person memory buyer = payment.buyer;
        ownership_map[land.land_id] == buyer.aadhar_id;
    }
    
    function reject_order(uint256 payment_id) {
        Payment memory payment = payment_map[payment_id]; 
		require(payment.pay_state == Pay_State.Created);
        require(payment.owner.pay_id == msg.sender);
		require(payment.check == true);
		payment.buyer.pay_id.transfer(payment.price);
		payment.pay_state = Pay_State.Rejected;
    }
    
    function cancel_order(uint256 payment_id) {
        Payment memory payment = payment_map[payment_id]; 
        require(payment.buyer.pay_id == msg.sender);
		require(payment.check == true);
		payment.buyer.pay_id.transfer(payment.price);
		payment.pay_state = Pay_State.Cancelled;
    }
    
    function check_if_gov() public returns(bool) {
        return (gov_address == msg.sender);
    }
	
	function fetch_lands_length() returns(uint256) {
	    return (landArray.length);
	}

	function fetch_persons_size() returns(uint256) {
	    return (personArray.length);
	}
	
	function fetch_person_at_index(uint32 index) constant returns(uint256, address, bytes32) {
	    return (personArray[index].aadhar_id, personArray[index].pay_id, personArray[index].name);
	}	
	
	function fetch_land_at_index(uint32 index) constant returns(uint256, uint256, bytes32) {
	    return (landArray[index].land_id, landArray[index].price, landArray[index].land_address);
	}	
	
	function get_buy_requests_length(uint256 aadhar_id) returns(uint256) {
	    return (orders_map[aadhar_id].length);
	}
	
	function get_buy_request_at_index(uint256 aadhar_id, uint32 index) constant returns(uint256, uint256, uint, uint256) {
	    uint256 payment_id = orders_map[aadhar_id][index];
		Payment memory payment = payment_map[payment_id]; 
	    return (payment.payment_id, payment.land.land_id, uint(payment.pay_state), payment.price);
	}	
}