import { version } from '../../package.json';
import express, { Router } from 'express';
import familyIterator from './functions.js'
import facets from './facets';

export default ({ config, db }) => {
	let family = new familyIterator(process.env.DEFAULT_FAMILY || config.family, db, process.env.DEFAULT_INTERTIME || config.interTime);
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});

	api.get('/ping', (req, res) => {
		res.send("pong");
	});

	api.get("/switchFamily/:family/:interTime", async (req, res) => {
		await family.save();
		family = new familyIterator(req.params.family, db, req.params.interTime);
		res.send("Creating");
	});

	api.get("/deviceList", async (req, res) => {
		res.json({devices: family.returnDevices(), success: true});
	});

	api.get("/family", async (req, res) => {
		res.json(family.getFamily());
	})

	api.get("/device/:name", async (req, res) => {
		res.json(await family.returnDevice(req.params.name));
	});

	api.post("/addLocations", async (req, res) => {
		res.send(family.addLocations(req.body.locations));
	});

	api.get("/getLocations", async (req, res) => {
		res.json({data: family.locationList, success: true});
	})

	api.get("/save", async (req, res) => {
		res.json(await family.save());
	})

	return api;
}
