const express = require("express");
const hbs = require("express-handlebars");
const { MongoClient, ObjectId } = require("mongodb");
const { setChecked } = require("./helper.js");

const app = express();
app.engine(
	"hbs",
	hbs({ defaultLayout: "default.hbs", helpers: require("./helper.js") })
);

// redirect views to __dirname + views for docker 
app.set("views",  __dirname + '/views')
//  app.set("view engine", "hbs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/static"));

const MONGO_URL = "mongodb://localhost:27017"
//const MONGO_URL = "mongodb://admin:password@mongodb";
const MONGODB_NAME = "berry";
const MONGODB_COLL = "biography";

const mongoClient = new MongoClient(MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const PORT =
	parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

app.post("/update", async (req, res) => {
	const { name, age, gender } = req.body;
	try {
		let result = await mongoClient
			.db(MONGODB_NAME)
			.collection(MONGODB_COLL)
			.updateOne({ name }, { $set: req.body }, { upsert: true });

		res.status(200);
		res.type("application/json");
		res.send("updated!");
	} catch (e) {
		console.log(e);
	}
});

app.get("/", async (req, res) => {
	console.log("hello")
	try {
		let result = await mongoClient
			.db(MONGODB_NAME)
			.collection(MONGODB_COLL)
			.findOne({ name: "Berry" });
		res.status(200);
		res.type("html");
		res.render("form.hbs", {
			nameValue: result.name,
			ageValue: result.age,
			gender: result.gender,
		});
	} catch (e) {
		console.log(e);
	}
});

mongoClient
	.connect()
	.then(() => {
		app.listen(PORT, ()=> {
		    console.log(`${PORT} started on ${new Date()}`)
		})
	})
	.catch((e) => {
		console.error("Cannot connect to mongodb", e);
	});

