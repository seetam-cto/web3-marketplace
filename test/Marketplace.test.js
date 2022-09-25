const { assert } = require("chai")

require('chai')
    .use(require('chai-as-promised'))
    .should()

const Marketplace = artifacts.require("Marketplace")

contract('Marketplace', ([deployer, seller, buyer]) => {
    let marketplace

    before(async () => {
        marketplace = await Marketplace.deployed()
    } )

    describe('deployment', async () => {
        it('deploy successfully', async () => {
            const address = await marketplace.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await marketplace.name()
            assert.equal(name, 'Web3 MarketPlace')
        })
    })


    describe('products', async () => {
        let result, productCount
        before(async () => {
            result = await marketplace.createProduct('iPhoneX', web3.utils.toWei('1', 'Ether'), {from: seller})
            productCount = await marketplace.productCount()
        } )

        it('creates products', async () => {
            //success cases
            assert.equal(productCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'iPhoneX', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, seller, 'id is correct')
            assert.equal(event.purchased, false, 'purchase is correct')

            //FAILURES
            
            //1: Product Should have a name
            await await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), {from: seller}).should.be.rejected;
            //2: Product Should have a price
            await await marketplace.createProduct('iPhoneX', 0, {from: seller}).should.be.rejected;

        })

        it('lists products', async () => {
            const product = await marketplace.products(productCount)
            assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(product.name, 'iPhoneX', 'name is correct')
            assert.equal(product.price, '1000000000000000000', 'price is correct')
            assert.equal(product.owner, seller, 'id is correct')
            assert.equal(product.purchased, false, 'purchase is correct')
        })

        it('sells products', async () => {
            //Track the Seller Balance before purchase
            let oldSellerBalance
            oldSellerBalance = await web3.eth.getBalance(seller)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)
            //SUCCESS - Buyer Makes Purchase
            result = await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('1', 'Ether')})
            //Check event logs
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name, 'iPhoneX', 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, buyer, 'id is correct')
            assert.equal(event.purchased, true, 'purchase is correct')

            //Check that seller Received funds
            let newSellerBalance
            newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance)

            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price)

            const expectedBalance = oldSellerBalance.add(price)

            assert.equal(newSellerBalance.toString(), expectedBalance.toString())

            //Failures
            //1. Tries to buy a product that does not exists, i.e. product must have valid id.
            await marketplace.purchaseProduct(99, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

            //2. Buy with enough ether.
            await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;

            //3. Buy the product twice
            await marketplace.purchaseProduct(productCount, {from: deployer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

            //4. Buyer can't be seller
            await marketplace.purchaseProduct(productCount, {from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        })
    })
})