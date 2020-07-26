import React, {useState} from 'react';
import firebaseApp from '../../FirebaseHelper';
import './style.scss';
import {Form} from "react-bootstrap";
import facebook from '../../facebook.svg';
import instagram from '../../instagram.svg';
import { Chart } from "react-google-charts";
class Home extends React.PureComponent {
    state = {
        data: null,
        yo: false,
        cities: [],
        products: [],
        users: [],
        cityFilter: null,
        productFilter: null,
    };
    componentWillMount() {
        let products = [];
        firebaseApp.database().ref().child('products').once('value').then((snapshot) => {
            const data = snapshot.val();
            for (let key in data){
                products = [...products,data[key]];
            }
            this.setState({products: products});
        });

        let myusers = [];
        firebaseApp.database().ref().child("sales_promoter").once('value').then((snapshot) => {
           const data = snapshot.val();
           console.log(data);
           for ( let key in data ) {
               const user = data[key];
               user.uid = key;
               myusers = [...myusers, user]
           }
            this.setState({users: myusers});
        });


        let cities = [];
        firebaseApp.database().ref().child('cities').once('value').then((snapshot) => {
           const data = snapshot.val();
           for (let key in data) {
               cities = [...cities, data[key]];
           }
           this.setState({cities: cities});
        });
        firebaseApp.database().ref().child('sales').once('value').then((snapshot) => {
            const data = snapshot.val();
            this.setState({ data: data });
        });
    }

    getBarChartData = () => {
        const products = this.state.products;
        const data = this.state.data;
        let barChartData = [["City", "Revenue"]];
        for (let city in data) {
            let cityAmount = 0;
            for (let product in data[city]) {
                const price = products.find((p) => p.name === product).price;
                for (let uid in data[city][product]) {
                    cityAmount = cityAmount + (data[city][product][uid]* price);
                }
            }
            barChartData = [...barChartData, [city,cityAmount]];
        }
        let max = 0;
        for(let i = 1 ; i < barChartData.length ; i++) {
            max = Math.max(max,barChartData[i][1]);
        }

        return ( this.state.data && <Chart
            width={window.innerWidth/2}
            height={'500px'}
            chartType="Bar"
            loader={<div>Loading Chart</div>}
            data={barChartData}
            options={{
                chart: {
                    title: 'City Graph',
                    subtitle: 'Revenue in cities',
                },
            }}
        />);
    };

    getPieChartData = () => {
        const data = this.state.data;
        let productData = {};
        for (let city in data) {
            for (let product in data[city]) {
                for (let uid in data[city][product]) {
                    if (!product in productData) {
                        productData[product] = 0;
                    }
                    productData[product] = data[city][product][uid] + productData[product];
                }
            }
        }
        let finalProductData = [["product", "count"]];
        for (let key in productData) {
            finalProductData = [...finalProductData, [key,productData[key]]]
        }
        return finalProductData;
    }

    getData = (cityFilter=null, productFilter=null) => {
        const products = this.state.products;
        const data = this.state.data;
        let allData = {};
        if (cityFilter === null) {
            for (let city in data) {
                for (let product in data[city]) {
                    for (let uid in data[city][product]) {
                        if (!(product in allData)) {
                            allData[product] = {};
                        }
                        if (!(uid in allData[product])) {
                            allData[product][uid] = data[city][product][uid];
                        } else {
                            allData[product][uid] = allData[product][uid] + data[city][product][uid];
                        }

                    }
                }
            }
        } else {
            if (cityFilter in data) {
                const cityData = data[cityFilter];
                for (let product in cityData) {
                    for (let uid in cityData[product]) {
                        if (!(product in allData)) {
                            allData[product] = {};
                        }
                        if (!(uid in allData[product])) {
                            allData[product][uid] = cityData[product][uid];
                        } else {
                            allData[product][uid] = allData[product][uid] + cityData[product][uid];
                        }
                    }
                }
            }
        }

        let finalData = {};

        if (productFilter === null) {
            for (let product in allData) {
                const price = products.find((p) => p.name === product).price;
                for (let uid in allData[product]) {
                    if (uid in finalData) {
                        finalData[uid]['quantity'] = finalData[uid]['quantity'] + allData[product][uid];
                        finalData[uid]['amount'] = finalData[uid]['amount'] + (price * allData[product][uid]);
                    } else {
                        finalData[uid] = {};
                        finalData[uid]['quantity'] = allData[product][uid];
                        finalData[uid]['amount'] = (price * allData[product][uid]);
                    }
                }
            }
        } else {
            const productData = allData[productFilter];
            const price = products.find((p) => p.name === productFilter).price;
            for(let uid in productData) {
                if (uid in finalData) {
                    finalData[uid]['quantity'] = finalData[uid]['quantity'] + productData[uid];
                    finalData[uid]['amount'] = finalData[uid]['amount'] + (price * productData[uid]);
                } else {
                    finalData[uid] = {};
                    finalData[uid]['quantity'] = productData[uid];
                    finalData[uid]['amount'] = (price * productData[uid]);
                }
            }
        }

        let fancyData = [];
        for(let uid in finalData) {
            const fd = finalData[uid];
            fd.uid = uid;
            fancyData = [...fancyData, fd];
        }

        return (
            <table>
                <tr>
                    <th>Sales Promoter</th>
                    <th>Quantity Sold</th>
                    <th>Amount Earned</th>
                </tr>
                {fancyData.map((fd) => (
                    console.log(fd) ||
                    <tr>
                        <td>
                            {this.state.users.find((u) => u.uid === fd.uid).name}
                            <img style={{ float: 'right'}} width={40} height={40} src={instagram}/>
                            <img style={{ float: 'right'}} width={40} height={40} src={facebook}/>
                        </td>
                        <td>{fd.quantity}</td>
                        <td>{fd.amount}</td>
                    </tr>
                ))}
            </table>
        )
    };

    render() {
        return (
            <div className="parent-div">
                <h1>Performance Reports</h1>
                <br />
                <Form.Label>City Filter</Form.Label>
                <Form.Control onChange={(e) => e.target.value === "null" ? this.setState({cityFilter: null}) : this.setState({cityFilter: e.target.value})} as="select">
                    <option value={"null"}>Select City</option>
                    {this.state.cities.map((c) => <option value={c}>{c}</option> )}
                </Form.Control>
                <br />
                <Form.Label>Product Filter</Form.Label>
                <Form.Control onChange={(e) => e.target.value === "null" ? this.setState({productFilter: null}) : this.setState({productFilter: e.target.value})} as="select">
                    <option value={"null"}>Select Product</option>
                    {this.state.products.map((p) => <option value={p.name}>{p.name}</option> )}
                </Form.Control>
                <br />
                <div id="performance-table">
                    {this.getData(this.state.cityFilter,this.state.productFilter)}
                </div>
                {this.state.data && this.getBarChartData()}
            </div>
        );
    }
}
export default Home;
