const express = require("express");
const cors = require("cors");
const { MongoClient }= require("mongodb");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/save", async (req, res) => {
	try {
		let url = process.env.MONGO_URL;
		if (!url) {
			console.error("Error: MONGO_URL environment variable is missing.");
			return res.status(500).json({ error: "Database configuration error" });
		}
		
		let con = new MongoClient(url);
		let db = con.db(process.env.DB_NAME);
		let coll = db.collection("student");
		let doc = { "name": req.body.name, "phone": req.body.phone, "query": req.body.query };
		
		await coll.insertOne(doc);
		
		// create a transporter object 
		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS
			}
		});
		
		// Mail options 
		let mailOptions = {
			from: process.env.EMAIL_USER,
			to: process.env.EMAIL_TO,
			subject: 'Enquiry from ' + req.body.name,
			text: "phone= " + req.body.phone + " query= " + req.body.query
		};
		
		// Send email
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error("Email Error:", error);
				return res.status(500).json({ error: "Failed to send email", details: error.message });
			}
			return res.status(200).json("mail send");
		});
	} catch (error) {
		console.error("Server Error:", error);
		return res.status(500).json({ error: "Internal server error", details: error.message });
	}
});
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => { console.log("ready to serve @ " + PORT); });
				




