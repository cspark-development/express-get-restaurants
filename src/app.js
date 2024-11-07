const express = require("express");
const app = express();
const Restaurant = require("../models/index")
const db = require("../db/connection");

app.use(express.json());
app.use(express.urlencoded());
const {check, validationResult} = require("express-validator");

//TODO: Create your GET Request Route Below: 
app.get("/restaurants", async (request, response) => {
	response.json(await Restaurant.findAll());
});

app.get("/restaurants/:id", async (request, response) => {
	response.json(await Restaurant.findByPk(request.params.id));
});

app.post("/restaurants/:id",	
	[
		check("name").notEmpty().trim(), 
		check("location").notEmpty().trim(),
		check("cuisine").notEmpty().trim()
	], 
	async (request, response) => {
		const errors = validationResult(request);
		if (errors.isEmpty() === false) {
			response.json({ error: errors.array });	
			return;
		}
	
		const targetRestaurant = await Restaurant.findByPk(request.params.id);
		if (targetRestaurant) {
			response.status(400).json("Resource already exists!");
			return;
		};
	
		const jsonRestaurant = Restaurant.toJSON();
		const hasAllKeys = Object.keys(request.body).every((item) => { 
			jsonRestaurant.hasOwnProperty(item);
		})
		if (hasAllKeys === false) {
			response.status(400).json("Incorrect arguments provided!");	
			return;
		}
	
		await Restaurant.create(request.body)
		response.json("Resource successfulley created.");
	}
);

app.put("/restaurants/:id", async (request, response) => {
	const targetRestaurant = await Restaurant.findByPk(request.params.id);
	const jsonRestaurant = Restaurant.toJSON();

	for (const [key, value] of Object.entries(request.body)) {
		if (key in jsonRestaurant) {
			let updateTarget = {};
			updateTarget[key] = value;
			await targetRestaurant.update(updateTarget);
		} else {
			response.status(400).json(`Argument "${key}: ${value}" provided do not exist!`);	
		}
	}

	response.json("Resource successfully updated.");
});

app.delete("/restaurants/:id", async (request, response) => {
	const targetRestaurant = await Restaurant.findByPk(request.params.id);
	await targetRestaurant.destroy();

	response.json(`Resource successfully deleted.`);
});


module.exports = app;
