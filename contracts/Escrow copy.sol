pragma solidity ^0.7.4;

contract Escrow {
  mapping(address => address) public accounts;
  address[] public accountsKeys;

  function credit() public payable {
    if (accounts[msg.sender] == 0) {

    } else {
      
    }
  }
}

contract Account {
  address accountAdress;

}

// Factory contract for Confidential Multiparty Registered eDelivery
contract ConfidentialMultipartyRegisteredEDeliveryWithoutTTPFactory {
    mapping(address => address[]) public senderDeliveries;
    mapping(address => address[]) public receiverDeliveries;
    address[] public deliveries;

    function createDelivery(address[] _receivers, bytes _c1, bytes _c2, bytes _ya, bytes _g, bytes _p, uint _term1, uint _term2) public payable {
        address newDelivery = (new ConfidentialMultipartyRegisteredEDeliveryWithoutTTP)
            .value(msg.value)(msg.sender, _receivers, _c1, _c2, _ya, _g, _p, _term1, _term2);
        deliveries.push(newDelivery);
        senderDeliveries[msg.sender].push(newDelivery);
        for (uint i = 0; i<_receivers.length; i++) {
            receiverDeliveries[_receivers[i]].push(newDelivery);
        }
    }

    function getSenderDeliveries(address _sender) public view returns (address[]) {
        return senderDeliveries[_sender];
    }

    function getSenderDeliveriesCount(address _sender) public view returns (uint) {
        return senderDeliveries[_sender].length;
    }

    function getReceiverDeliveries(address _receiver) public view returns (address[]) {
        return receiverDeliveries[_receiver];
    }

    function getReceiverDeliveriesCount(address _receiver) public view returns (uint) {
        return receiverDeliveries[_receiver].length;
    }

    function getDeliveries() public view returns (address[]) {
        return deliveries;
    }

    function getDeliveriesCount() public view returns (uint) {
        return deliveries.length;
    }
}

// Confidential Multiparty Registered eDelivery
contract ConfidentialMultipartyRegisteredEDeliveryWithoutTTP {
    using BigNumber for *;

    // Possible states
    enum State {notexists, created, cancelled, accepted, finished, rejected }

    struct ReceiverState{
        bytes z1;
        bytes z2;
        bytes yb;
        bytes c;
        bytes w;
        State state;
    }
    // Parties involved
    address public sender;
    address[] public receivers;
    mapping (address => ReceiverState) public receiversState;
    uint acceptedReceivers;

    // Message
    bytes public c1;
    bytes public c2;
    bytes public ya;
    bytes public g;
    bytes public p;
    // Time limit (in seconds)
    // See units: http://solidity.readthedocs.io/en/develop/units-and-global-variables.html?highlight=timestamp#time-units
    uint public term1;
    uint public term2;
    // Start time
    uint public start;

    // Constructor funcion to create the delivery
    constructor (address _sender, address[] _receivers, bytes _c1, bytes _c2, bytes _ya, bytes _g, bytes _p, uint _term1, uint _term2) public payable {
        // Requires that the sender send a deposit of minimum 1 wei (>0 wei)
        require(msg.value>0, "Sender has to send a deposit of minimun 1 wei");
        require(_term1 < _term2, "Timeout term2 must be greater than _term1");
        sender = _sender;
        receivers = _receivers;
        // We set the state of every receiver to 'created'
        for (uint i = 0; i<receivers.length; i++) {
            receiversState[receivers[i]].state = State.created;
        }
        acceptedReceivers = 0;
        c1 = _c1;
        c2 = _c2;
        ya = _ya;
        g = _g;
        p = _p;
        start = now; // now = block.timestamp
        term1 = _term1; // timeout term1, in seconds
        term2 = _term2; // timeout term2, in seconds
    }

    // accept() lets receivers accept the delivery
    function accept(bytes _z1, bytes _z2, bytes _yb, bytes _c) public {
        require(now < start+term1, "The timeout term1 has been reached");
        require(receiversState[msg.sender].state==State.created, "Only receivers with 'created' state can accept");

        acceptedReceivers = acceptedReceivers+1;
        receiversState[msg.sender].z1 = _z1;
        receiversState[msg.sender].z2 = _z2;
        receiversState[msg.sender].yb = _yb;
        receiversState[msg.sender].c = _c;
        receiversState[msg.sender].state = State.accepted;
    }

    function bignumber_equals(bytes _a, bytes _b) internal view returns(bool) {
        BigNumber.instance memory a;
        BigNumber.instance memory b;

        a.val = _a;
        a.bitlen = BigNumber.get_bit_length(_a);
        a.neg = false;

        b.val = _b;
        b.bitlen = BigNumber.get_bit_length(_b);
        b.neg = false;

        // BigNumber.cmp() returns -1 on a<b, 0 on a==b, 1 on a>b
        return BigNumber.cmp(a, b, false)==0;
    }

    function bignumber_modmul(bytes _a, bytes _b, bytes _m) internal view returns(bytes) {
        BigNumber.instance memory a;
        BigNumber.instance memory b;
        BigNumber.instance memory m;

        a.val = _a;
        a.bitlen = BigNumber.get_bit_length(_a);
        a.neg = false;

        b.val = _b;
        b.bitlen = BigNumber.get_bit_length(_b);
        b.neg = false;

        m.val = _m;
        m.bitlen = BigNumber.get_bit_length(_m);
        m.neg = false;

        BigNumber.instance memory res = a.modmul(b, m);

        return (res.val);
    }

    function bignumber_modexp(bytes _b, bytes _e, bytes _m) internal view returns(bytes) {
        BigNumber.instance memory b;
        BigNumber.instance memory e;
        BigNumber.instance memory m;

        b.val = _b;
        b.bitlen = BigNumber.get_bit_length(_b);
        b.neg = false;

        e.val = _e;
        e.bitlen = BigNumber.get_bit_length(_e);
        e.neg = false;

        m.val = _m;
        m.bitlen = BigNumber.get_bit_length(_m);
        m.neg = false;

        BigNumber.instance memory res = b.prepare_modexp(e, m);

        return (res.val);
    }

    // finish() lets sender finish the delivery sending the message
    function finish(address _receiver, bytes _w) public {
        require((now >= start+term1) || (acceptedReceivers>=receivers.length),
            "The timeout term1 has not been reached and not all receivers have been accepted the delivery");
        require (msg.sender==sender, "Only sender of the delivery can finish");

        // g^w mod p
        bytes memory check_1 = bignumber_modexp(g, _w, p);
        // (c1·(yb^c mod p)) mod p
        bytes memory check_2 = bignumber_modmul( c1 , bignumber_modexp(receiversState[_receiver].yb, receiversState[_receiver].c, p), p);

        require (bignumber_equals(check_1, check_2), "(g^w mod p) and (((g^r mod p)·(yb^c mod p)) mod p) are not equals");

        sender.transfer(this.balance); // Sender receives the refund of the deposit
        // We set the state of every receiver with 'accepted' state to 'finished'
        for (uint i = 0; i<receivers.length; i++) {
            receiversState[receivers[i]].w = _w;

            if (receiversState[receivers[i]].state == State.accepted) {
                receiversState[receivers[i]].state = State.finished;
            } else if (receiversState[receivers[i]].state == State.created) {
                receiversState[receivers[i]].state = State.rejected;
            }
        }
    }

    // cancel() lets receivers cancel the delivery
    function cancel() public {
        require(now >= start+term2, "The timeout term2 has not been reached");
        require(receiversState[msg.sender].state==State.accepted, "Only receivers with 'accepted' state can cancel");

        receiversState[msg.sender].state = State.cancelled;
    }

    // getState(address) returns the state of a receiver in an string format
    function getState(address _receiver) public view returns (string) {
        if (receiversState[_receiver].state==State.notexists) {
            return "not exists";
        } else if (receiversState[_receiver].state==State.created) {
            return "created";
        } else if (receiversState[_receiver].state==State.cancelled) {
            return "cancelled";
        } else if (receiversState[_receiver].state==State.accepted) {
            return "accepted";
        } else if (receiversState[_receiver].state==State.finished) {
            return "finished";
        } else if (receiversState[_receiver].state==State.rejected) {
            return "rejected";
        }
    }

    // getW(address) returns the W value of a receiver
    function getW(address _receiver) public view returns (bytes) {
        return receiversState[_receiver].w;
    }
}