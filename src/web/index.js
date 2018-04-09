import "babel-polyfill";

import { version } from '../../package.json';
import express, { Router } from 'express';
import facets from './facets';
import path from 'path';

export default ({ config, db }) => {
	let web = Router();
  const webDirectory = __dirname+'../../../web/'

	// mount the facets resource
	web.use('/facets', facets({ config, db }));

  // use static directory
  web.use('/static', express.static(path.join(webDirectory, "public")));

	// perhaps expose some API metadata at the root
	web.get('/', (req, res) => {
		res.sendFile(path.join(webDirectory, "index.html"))
	});

	return web;
}
