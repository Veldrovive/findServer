import Datastore from 'nedb';

export default callback => {

	let db = new Datastore({ filename: 'src/db/devices.db', autoload: true });

	callback(db);
}
