// Imports -----------------------------
import express from "express";
import database from "./database.js";
import cors from 'cors';
// Configure express app ---------------

const app = new express();
// Configure middleware ----------------
app.use(function (req, res, next) {
   
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
 app.use(cors({ origin: '*' }));
  
// Controllers -------------------------
const bookingsController = async(req,res) => {
    const id = req.params.id; // Undefined in the case of the /api/bookings end

    // Build SQL 
    const table  = "bookings";
    const fields = ['VehicleMake', 'VehicleModel', 'VehicleYear','VehiclePrice', 'DateBooked'];
    const whereField = 'SalesId';
    const extendedTable = `${table} LEFT JOIN vehicles ON bookings.VehicleId = vehicles.VehicleId`;
    const extendedFields = `${fields}, CONCAT (bookings.SalesId) AS SalesPerson `;
    let sql = `SELECT ${extendedFields} FROM ${extendedTable} `;
    if(id) sql += ` WHERE ${whereField} = ${id}`
    // Execute query

    let isSuccess = false;
    let message = "";
    let result = null; 
    try {
        [result] = await database.query(sql);
        if(result.length ===0) message = 'No record(s)';
        else{
        isSuccess = true;
        message = 'Record(s) successfully recovered';
    }
        
    } catch (error) {
        message = `Failed to execute query: ${error.message}`
    }
    
    isSuccess
     ? res.status(200).json(result)
     : res.status(400).json({message});

};

const salesController = async(req,res) => {
    const id = req.params.id;

    // Build SQL 
    const table  = "bookings";
    const fields = ['VehicleMake', 'VehicleModel', 'VehicleYear','VehiclePrice', 'DateBooked'];
    const whereField = 'SalesId'
    const extendedTable = `${table} LEFT JOIN vehicles ON bookings.VehicleId = vehicles.VehicleId`;
    const extendedFields = `${fields}, CONCAT (bookings.SalesId) AS SalesPerson `;
    const sql = `SELECT ${extendedFields} FROM ${extendedTable}  WHERE ${whereField} = ${id}`
    // Execute query

    let isSuccess = false;
    let message = "";
    let result = null; 
    try {
        [result] = await database.query(sql);
        if(result.length ===0) message = 'No record(s)';
        else{
        isSuccess = true;
        message = 'Record(s) successfully recovered';
    }
        
    } catch (error) {
        message = `Failed to execute query: ${error.message}`
    }
    
    isSuccess
     ? res.status(200).json(result)
     : res.status(400).json({message});

};

// Endpoints ---------------------------
app.get('/api/bookings', bookingsController);
app.get('/api/bookings/:id', bookingsController);
app.get('/api/bookings/sales/:id', salesController);

// Start server ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));