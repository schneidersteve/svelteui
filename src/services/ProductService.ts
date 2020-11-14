import axios from "axios";

export class ProductService {

    getProductsSmall(): Promise<any[]> {
		return axios.get("data/products-small.json").then(res => res.data.data);
	}

}
