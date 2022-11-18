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
const bookingsSelectSql = (whereField, id) => {
    let table = `(((bookings LEFT JOIN vehicles ON bookings.VehicleId = vehicles.VehicleId) 
      LEFT JOIN users AS customers ON bookings.CustomerId = customers.UserId) 
      LEFT JOIN users AS salesperson ON bookings.SalesId = salesperson.UserId)`;
    let fields = "VehicleMake, VehicleModel, VehicleYear,VehiclePrice, DateBooked, bookings.SalesId AS SalesId, CONCAT(salesperson.userFirstName,' ', salesperson.userSurname) AS Salesperson, bookings.CustomerId AS UserId, CONCAT(customers.userFirstName,' ', customers.userSurname) AS Customer";
   
    let sql = `SELECT ${fields} FROM ${table}`;
    if (id) sql += ` WHERE ${whereField}=${id}`;
    
    return sql;
  };

  const readBookings = async (whereField, id) => {
    const sql = bookingsSelectSql(whereField, id );

    try {
        const [result] = await database.query(sql);
        return (result.length === 0)
          ? { isSuccess: false, result: null, message: 'No record(s) found' }
          : { isSuccess: true, result: result, message: 'Record(s) successfully recovered' };
      }
      catch (error) {
        return { isSuccess: false, result: null, message: `Failed to execute query: ${error.message}` };
      }
    };

const bookingsController = async(res, whereField, id) => {

    // Data Access 
    const { isSuccess, result, message: accessMessage } = await readBookings(whereField, id);
    if (!isSuccess) return res.status(400).json({ message: accessMessage });
  
    // Response to request
    res.status(200).json(result);
  };


  const usersSelectSql = (whereField, id) => {
    let table = 'users LEFT JOIN UserTypes ON userUserTypeId=UserTypeID';
    let fields = ['UserId, userFirstName, userSurname, userUserTypeId, userTypeName'];
   
    let sql = `SELECT ${fields} FROM ${table}`;
    if (id) sql += ` WHERE ${whereField}=${id}`;
    
    return sql;
  };

  const readUsers = async (whereField, id) => {
    const sql = usersSelectSql(whereField, id );

    try {
        const [result] = await database.query(sql);
        return (result.length === 0)
          ? { isSuccess: false, result: null, message: 'No record(s) found' }
          : { isSuccess: true, result: result, message: 'Record(s) successfully recovered' };
      }
      catch (error) {
        return { isSuccess: false, result: null, message: `Failed to execute query: ${error.message}` };
      }
    };


    // Users
const usersController = async(res, whereField, id) => {

    // Data Access 
    const { isSuccess, result, message: accessMessage } = await readUsers(whereField, id);
    if (!isSuccess) return res.status(400).json({ message: accessMessage });
  
    // Response to request
    res.status(200).json(result);
  };

const postBookingsController = async(req,res) => {
    // Validation 
    const sql = buildBookingsInsertSQL (req.body);
}
// Endpoints ---------------------------
app.get('/api/bookings', (req, res) =>  bookingsController(res, null, null));
app.get('/api/bookings/:id(\\d+)',(req, res) =>  bookingsController(res, "BookingId",  req.params.id));
app.get('/api/bookings/sales/:id', (req, res) =>  bookingsController(res,"SalesId",  req.params.id));
app.get('/api/bookings/users/:id', (req, res) =>  bookingsController(res,"CustomerId",  req.params.id));
app.get('/api/bookings/customers/:id', (req, res) =>  bookingsController(res,"CustomerId",  req.params.id));

app.post('/api/bookings', postBookingsController);

// Users
const SALESPERSON = 1;
const CUSTOMERS = 2;
app.get('/api/users', (req, res) => usersController(res, null, null, false));
app.get('/api/users/:id(\\d+)', (req, res) => usersController(res, "UserId", req.params.id, false));
app.get('/api/users/customers', (req, res) => usersController(res, CUSTOMERS, req.params.id, false));
app.get('/api/users/sales', (req, res) => usersController(res, SALESPERSON, req.params.id, false));

app.get('/api/users/customers/:id', (req, res) => usersController(res,"userUserTypeId", req.params.id, false));
app.get('/api/users/sales/:id', (req, res) => usersController(res,"userUserTypeId", req.params.id, false));
// Start server ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));