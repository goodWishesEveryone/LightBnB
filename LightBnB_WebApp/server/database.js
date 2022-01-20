// const { Pool } = require("pg");

// const pool = new Pool({
//   user: "sm",
//   password: "123",
//   host: "localhost",
//   database: "lightbnb",
//   port: "3000",
// });

const db = require("./index.js");

const properties = require("./json/properties.json");
const users = require("./json/users.json");

////////////  const getUserWithEmail  ////////////
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return db
    .query(
      `
  SELECT *
  FROM users
  WHERE email = $1
  `,
      [email]
    )
    .then((res) => res.rows[0])
    .catch((err) => null);
};
exports.getUserWithEmail = getUserWithEmail;

////////////  getUserWithId  ////////////
/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return db
    .query(
      `
  SELECT *
  FROM users
  WHERE id = $1
  `,
      [id]
    )
    .then((res) => res.rows[0])
    .catch((err) => null);
};
exports.getUserWithId = getUserWithId;

////////////  ADD USER  ////////////
/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return db
    .query(
      `
  INSERT INTO users (name, email, password)
  VALUES($1, $2, $3)
  RETURNING *
  `,
      [user.name, user.email, user.password]
    )
    .then((res) => res.rows[0]);
};
exports.addUser = addUser;


////////////  Reservations  ////////////
/*
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return db.query(`
  SELECT reservations.*, properties.*, AVG(property_reviews.rating) as average_rating
  FROM reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE end_date < now()::date
  AND reservations.guest_id = $1
  GROUP BY reservations.id, properties.id
  ORDER BY start_date
  LIMIT $2;
  `,[guest_id, limit]
  )
    .then((res) => res.rows);
};
exports.getAllReservations = getAllReservations;


////////////  GET ALL Properties  ////////////
/*
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = function(options, limit = 10) {
  const queryParams = [limit];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`%${options.owner_id}%`);
    if (options.city) {
      queryString += `AND owner_id = $${queryParams.length} `;
    } else {
      queryString += `WHERE owner_id = $${queryParams.length} `;
    }
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(parseInt(options.minimum_price_per_night, 10));
    queryString += `AND cost_per_night >= $${queryParams.length} `;
    queryParams.push(parseInt(options.maximum_price_per_night, 10));
    queryString += `AND cost_per_night <= $${queryParams.length} `;
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length} 
    `;
  }

  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);
  return pool.query(queryString, queryParams).then((res) => res.rows);
};

exports.getAllProperties = getAllProperties;

////////////  ADD Property  ////////////
/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
