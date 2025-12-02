const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDatabase() {
  let connection;
  try {
    // Connect without selecting a database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "abe_garage"}`
    );
    console.log("Database created or already exists");

    // Switch to the database
    await connection.query(`USE ${process.env.DB_NAME || "abe_garage"}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created or already exists");

    // Create customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Customers table created or already exists");

    // Create vehicles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        make VARCHAR(100),
        model VARCHAR(100),
        year INT,
        vin VARCHAR(50),
        license_plate VARCHAR(20),
        color VARCHAR(50),
        mileage INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    console.log("Vehicles table created or already exists");

    // Add mileage column to vehicles if it doesn't exist (migration)
    try {
      await connection.query('ALTER TABLE vehicles ADD COLUMN mileage INT');
      console.log("Added mileage column to vehicles table");
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log("Mileage column already exists or error:", error.message);
      }
    }

    // Create services table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Services table created or already exists");

    // Create orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        vehicle_id INT,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Received',
        total_amount DECIMAL(10, 2),
        received_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
      )
    `);
    console.log("Orders table created or already exists");

    // Add received_by column to orders if it doesn't exist (migration)
    try {
      await connection.query('ALTER TABLE orders ADD COLUMN received_by VARCHAR(255)');
      console.log("Added received_by column to orders table");
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.log("received_by column already exists or error:", error.message);
      }
    }

    // Remove service_type column if it exists (migration - we're using order_services now)
    try {
      await connection.query('ALTER TABLE orders DROP COLUMN service_type');
      console.log("Removed service_type column from orders table");
    } catch (error) {
      // Column doesn't exist, which is fine
    }

    // Create order_services table (many-to-many relationship)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        service_id INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE KEY unique_order_service (order_id, service_id)
      )
    `);
    console.log("Order_services table created or already exists");

    // Insert default services if they don't exist
    const [existingServices] = await connection.query('SELECT COUNT(*) as count FROM services');
    if (existingServices[0].count === 0) {
      const defaultServices = [
        ['Oil change', 'Every 5,000 kilometres or so, you need to change the oil in your car to keep your engine in the best possible shape.'],
        ['Spark Plug replacement', 'Spark plugs are a small part that can cause huge problems. Their job is to ignite the fuel in your engine, helping it start.'],
        ['Fuel Cap tightening', 'Loose fuel caps are actually a main reason why the "check engine" light in a car comes on.'],
        ['Oxygen Sensor replacement', 'Oxygen sensors measure the concentration of oxygen in the exhaust gabs in order to optimize engine performance and emissions.'],
        ['Brake work', 'We all know why brake work is important, especially because one quarter of all Canadian car accidents are caused by a failure to stop.'],
        ['Tire repairs and changes', 'Without good, inflated tires, you loose speed, control, and fuel efficiency, hence the need to get them patched if there\'s a leak (for example, if you run over a nail), or replaced if they\'re too worn.'],
        ['The Ignition System', 'A car\'s ignition system includes its battery, starter, and the ignition itself.'],
        ['Programing the camera software', 'Programming and updating camera software for vehicle safety systems.']
      ];
      
      for (const [name, description] of defaultServices) {
        await connection.query('INSERT INTO services (name, description) VALUES (?, ?)', [name, description]);
      }
      console.log("Default services inserted");
    }

    console.log("Database initialization completed");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = initDatabase;
