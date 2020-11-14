import axios from "axios";

export class NodeService {

    getTreeTableNodes(): Promise<any[]> {
		return axios.get("data/treetablenodes.json").then(res => res.data.root);
	}

}
