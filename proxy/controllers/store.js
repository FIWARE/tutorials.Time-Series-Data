
//
// This controller is an example of accessing and amending the Context Data
// programmatically. The code uses a nodejs library to envelop all the 
// necessary HTTP calls and responds with success or failure.
//

// Initialization - first require the NGSI v2 npm library and set 
// the client instance
const NgsiV2 = require('ngsi_v2');
const defaultClient = NgsiV2.ApiClient.instance;
const debug = require('debug')('proxy:server');
const monitor = require('../lib/monitoring');

// The basePath must be set - this is the location of the Orion
// context broker. It is best to do this with an environment
// variable (with a fallback if necessary)
defaultClient.basePath = process.env.CONTEXT_BROKER || 'http://localhost:1026/v2';

// This function receives the details of a store from the context
//
// It is effectively processing the following cUrl command:
//   curl -X GET \
//     'http://{{orion}}/v2/entities/?type=Store&options=keyValues'
//
function displayStore(req, res) {
	monitor('NGSI', 'retrieveEntity ' + req.params.storeId);
	retrieveEntity(
		req.params.storeId, { options: 'keyValues', type: 'Store' })
	.then(store => {
		// If a store has been found display it on screen
		return res.render('store', { title: store.name, store});
	})
	.catch(error => {
		debug(error);
		// If no store has been found, display an error screen
  		return res.render('store-error', {title: 'Error', error});
	});
}

// This function receives all products and a set of inventory items
//  from the context
//
// It is effectively processing the following cUrl commands:
//   curl -X GET \
//     'http://{{orion}}/v2/entities/?type=Product&options=keyValues'
//   curl -X GET \
//     'http://{{orion}}/v2/entities/?type=InventoryItem&options=keyValues&q=refStore==<entity-id>'
//
function displayTillInfo(req, res) {
	monitor('NGSI', 'listEntities type=Product');
	monitor('NGSI', 'listEntities type=InventoryItem refStore=' + req.params.storeId);
	Promise.all([ 
		listEntities({
		options: 'keyValues',
		type: 'Product',
	}), listEntities({
		q: 'refStore==' + req.params.storeId,
		options: 'keyValues',
		type: 'InventoryItem',
	})])
	.then(values => {
		// If values have been found display it on screen
		return res.render('till', { products : values[0], inventory : values[1] });
	})
	.catch(error => {
		debug(error);
		// An error occurred, return with no results
  		return res.render('till', { products : {}, inventory : {}});
	});
}


// This asynchronous function retrieves and updates an inventory item from the context
//
// It is effectively processing the following cUrl commands:
//
//   curl -X GET \
//     'http://{{orion}}/v2/entities/<entity-id>?type=InventoryItem&options=keyValues'
//   curl -X PATCH \
//     'http://{{orion}}/v2/entities/urn:ngsi-ld:Product:001/attrs' \
//     -H 'Content-Type: application/json' \
//     -d ' {
//        "shelfCount":{"type":"Integer", "value": 89}
//     }'
//
// There is no error handling on this function, it has been
// left to a function on the router.
async function buyItem(req, res) {
	monitor('NGSI', 'retrieveEntity ' + req.params.inventoryId);
	const inventory = await retrieveEntity(req.params.inventoryId, {
		options: 'keyValues',
		type: 'InventoryItem',
	});
	const count = inventory.shelfCount - 1;

	monitor('NGSI', 'updateExistingEntityAttributes ' + req.params.inventoryId,  { 
		shelfCount: { type: 'Integer', value: count }
	});
	await updateExistingEntityAttributes(
		req.params.inventoryId,
		{ shelfCount: { type: 'Integer', value: count } },
		{
			type: 'InventoryItem',
		}
	);
	res.redirect(`/app/store/${inventory.refStore}/till`);
}


// This function renders information for the warehouse of a store
// It is used to display alerts based on any low stock subscriptions received
//
function displayWarehouseInfo(req, res) {
	res.render('warehouse', { id: req.params.storeId });
}



// This is a promise to make an HTTP PATCH request to the /v2/entities/<entity-id>/attr end point
function updateExistingEntityAttributes(entityId, body, opts, headers = {}) {
	return new Promise(function(resolve, reject) {
		defaultClient.defaultHeaders = headers;
		const apiInstance = new NgsiV2.EntitiesApi();
		apiInstance.updateExistingEntityAttributes(entityId, body, opts, (error, data) => {
			return error ? reject(error) : resolve(data);
		});
	});
}


// This is a promise to make an HTTP GET request to the /v2/entities/<entity-id> end point
function retrieveEntity(entityId, opts, headers = {}) {
	return new Promise(function(resolve, reject) {
		defaultClient.defaultHeaders = headers;
		const apiInstance = new NgsiV2.EntitiesApi();
		apiInstance.retrieveEntity(entityId, opts, (error, data) => {
			return error ? reject(error) : resolve(data);
		});
	});
}

// This is a promise to make an HTTP GET request to the /v2/entities end point
function listEntities(opts, headers = {}) {
	return new Promise(function(resolve, reject) {
		defaultClient.defaultHeaders = headers;
		const apiInstance = new NgsiV2.EntitiesApi();
		apiInstance.listEntities(opts, (error, data) => {
			return error ? reject(error) : resolve(data);
		});
	});
}

module.exports = {
	buyItem,
	displayStore,
	displayTillInfo,
	displayWarehouseInfo
};
