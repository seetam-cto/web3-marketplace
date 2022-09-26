import React, { useState } from "react"

const Main = ({products, createProduct, purchaseProduct}) => {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('')
    const handleSubmit = async (e) => {
        e.preventDefault()
        let price_wei = window.web3.utils.toWei(productPrice.toString())
        createProduct(productName, price_wei)
    } 
    return (
        <div id="main" className='col-lg-6 d-flex flex-column'>
            <h2>Add Product</h2>
            <form onSubmit={(e) => handleSubmit(e)}>
                <div className="form-group mr-sm-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        id="productName"
                        required/>
                </div>
                <div className="form-group mr-sm-2">
                    <input
                        type="text"
                        className="form-control"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        id="productPrice"
                        placeholder="Product Price"
                        required/>
                </div>
                <button className="btn btn-primary" type="submit">Add Product</button>
            </form>
            <p>&nbsp;</p>
            <h2>Buy Product</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Owner</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody id="productList">
                    {products.map((product, key) => {
                        return (
                            <tr key={key}>
                                <th scope="row">{product.id.toString()}</th>
                                <td>{product.name}</td>
                                <td>{window.web3.utils.fromWei(product.price.toString())} ETH</td>
                                <td>{product.owner}</td>
                                <td><button
                                onClick={(event) => {
                                    event.preventDefault()
                                    purchaseProduct(product.id, product.price)
                                }}
                                className="btn btn-primary buyButton">Buy</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default Main