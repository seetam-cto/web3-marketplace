pragma solidity ^0.5.16;

contract Marketplace {
    string public name;
    uint public productCount = 0;
    mapping(uint => Product) public products;

    //Product Structure
    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event ProductPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Web3 MarketPlace";
    }

    function createProduct(string memory _name, uint _price) public {
        //Validate the product
        require(bytes(_name).length > 0); //validate name
        require(_price > 0); //validate price
        //increment product count
        productCount ++;
        //create product
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        //trigger an event to inform blockchain.
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
    }

    function purchaseProduct(uint _id) public payable {
        //Fetch Product
        Product memory _product = products[_id];
        //Fetch the owner
        address payable _seller = _product.owner;
        //Product is valid 
        require(_product.id > 0 && _product.id <= productCount); //Validate ID
        require(msg.value >= _product.price); // Enough Ether in Transaction
        require(!_product.purchased);//Validate Purchasable
        require(_seller != msg.sender);//Buye and Seller are different
        //Purchase It - Transfer Ownership
        _product.owner = msg.sender;
        //Product Purchased
        _product.purchased = true;
        //Update the product
        products[_id] = _product;
        //Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        //Trigger an event
         emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);
    }
}