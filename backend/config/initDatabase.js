const mysql = require("mysql2/promise");
require("dotenv").config();

async function initDatabase() {
  let connection;
  const dbName = process.env.DB_NAME || "A_to_Z_Auto_Repair";
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
  const dbUser = process.env.DB_USER || "root";
  const dbPassword = process.env.DB_PASSWORD || "";

  try {
    // Try to connect directly to the database first (for existing databases)
    try {
      connection = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
      });
      console.log(`✅ Connected to existing database: ${dbName}`);
    } catch (connectError) {
      // If database doesn't exist, create it
      if (connectError.code === "ER_BAD_DB_ERROR") {
        console.log(`Database ${dbName} not found, creating it...`);
        // Connect without database
        connection = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
        });
        // Create database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database ${dbName} created`);
        // Close and reconnect with database
        await connection.end();
        connection = await mysql.createConnection({
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          database: dbName,
        });
      } else {
        throw connectError;
      }
    }

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        reset_token VARCHAR(255),
        reset_token_expires DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table created or already exists");

    // Add reset_token columns to users if they don't exist (migration)
    try {
      await connection.query(
        "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)"
      );
      console.log("Added reset_token column to users table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding reset_token column to users table:",
          error.message
        );
      }
    }

    try {
      await connection.query(
        "ALTER TABLE users ADD COLUMN reset_token_expires DATETIME"
      );
      console.log("Added reset_token_expires column to users table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding reset_token_expires column to users table:",
          error.message
        );
      }
    }

    // Create customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        reset_token VARCHAR(255),
        reset_token_expires DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Customers table created or already exists");

    // Add reset_token columns to customers if they don't exist (migration)
    try {
      await connection.query(
        "ALTER TABLE customers ADD COLUMN reset_token VARCHAR(255)"
      );
      console.log("Added reset_token column to customers table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding reset_token column to customers table:",
          error.message
        );
      }
    }

    try {
      await connection.query(
        "ALTER TABLE customers ADD COLUMN reset_token_expires DATETIME"
      );
      console.log("Added reset_token_expires column to customers table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding reset_token_expires column to customers table:",
          error.message
        );
      }
    }

    // Add password column to customers if it doesn't exist (migration)
    try {
      await connection.query(
        "ALTER TABLE customers ADD COLUMN password VARCHAR(255)"
      );
      console.log("Added password column to customers table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding password column to customers table:",
          error.message
        );
      }
    }

    // Create vehicles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        make VARCHAR(100),
        model VARCHAR(100),
        year INT,
        vehicle_type VARCHAR(50),
        vin VARCHAR(50),
        license_plate VARCHAR(20),
        color VARCHAR(50),
        mileage INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    console.log("Vehicles table created or already exists");

    // Add vehicle_type column to vehicles if it doesn't exist (migration)
    try {
      await connection.query(
        "ALTER TABLE vehicles ADD COLUMN vehicle_type VARCHAR(50)"
      );
      console.log("Added vehicle_type column to vehicles table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding vehicle_type column to vehicles table:",
          error.message
        );
      }
    }

    // Add mileage column to vehicles if it doesn't exist (migration)
    try {
      await connection.query("ALTER TABLE vehicles ADD COLUMN mileage INT");
      console.log("Added mileage column to vehicles table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding mileage column to vehicles table:",
          error.message
        );
      }
    }

    // Create employees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(50) DEFAULT 'Employee',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Employees table created or already exists");

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
      await connection.query(
        "ALTER TABLE orders ADD COLUMN received_by VARCHAR(255)"
      );
      console.log("Added received_by column to orders table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding received_by column to orders table:",
          error.message
        );
      }
    }

    // Remove service_type column if it exists (migration - we're using order_services now)
    try {
      await connection.query("ALTER TABLE orders DROP COLUMN service_type");
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

    // Add assignment and completion tracking columns to orders if they don't exist
    try {
      await connection.query(
        "ALTER TABLE orders ADD COLUMN assigned_employee_id INT NULL"
      );
      console.log("Added assigned_employee_id column to orders table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error(
          "Error adding assigned_employee_id column to orders table:",
          error.message
        );
      }
    }

    try {
      await connection.query(
        "ALTER TABLE orders ADD COLUMN completion_note TEXT NULL"
      );
      console.log("Added completion_note column to orders table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error(
          "Error adding completion_note column to orders table:",
          error.message
        );
      }
    }

    try {
      await connection.query(
        "ALTER TABLE orders ADD COLUMN completed_at DATETIME NULL"
      );
      console.log("Added completed_at column to orders table");
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") {
        console.error(
          "Error adding completed_at column to orders table:",
          error.message
        );
      }
    }

    // Add payment_status column to orders if it doesn't exist (migration)
    try {
      await connection.query(
        "ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'"
      );
      console.log("Added payment_status column to orders table");
    } catch (error) {
      if (error.code === "ER_DUP_FIELDNAME") {
        // Column already exists - this is expected, suppress the error
      } else {
        // Real error occurred - log it
        console.error(
          "Error adding payment_status column to orders table:",
          error.message
        );
      }
    }

    // Create payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        customer_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        payment_method VARCHAR(50) NOT NULL,
        payment_intent_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_customer_id (customer_id),
        INDEX idx_status (status),
        INDEX idx_payment_intent_id (payment_intent_id)
      )
    `);
    console.log("Payments table created or already exists");

    // Insert default services if they don't exist
    const [existingServices] = await connection.query(
      "SELECT COUNT(*) as count FROM services"
    );
    if (existingServices[0].count === 0) {
      const defaultServices = [
        [
          "Oil change",
          "Every 5,000 miles or so, you need to change the oil in your car to keep your engine in the best possible shape.",
        ],
        [
          "Spark Plug replacement",
          "Spark plugs are a small part that can cause huge problems. Their job is to ignite the fuel in your engine, helping it start.",
        ],
        [
          "Fuel Cap tightening",
          'Loose fuel caps are actually a main reason why the "check engine" light in a car comes on.',
        ],
        [
          "Oxygen Sensor replacement",
          "Oxygen sensors measure the concentration of oxygen in the exhaust gabs in order to optimize engine performance and emissions.",
        ],
        [
          "Brake work",
          "We all know why brake work is important, especially because one quarter of all Canadian car accidents are caused by a failure to stop.",
        ],
        [
          "Tire repairs and changes",
          "Without good, inflated tires, you loose speed, control, and fuel efficiency, hence the need to get them patched if there's a leak (for example, if you run over a nail), or replaced if they're too worn.",
        ],
        [
          "The Ignition System",
          "A car's ignition system includes its battery, starter, and the ignition itself.",
        ],
        [
          "Programming the camera software",
          "Programming and updating camera software for vehicle safety systems.",
        ],
      ];

      for (const [name, description] of defaultServices) {
        await connection.query(
          "INSERT INTO services (name, description) VALUES (?, ?)",
          [name, description]
        );
      }
      console.log("Default services inserted");
    }

    console.log("✅ Database initialization completed");
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      console.error(
        "\n❌ Database Connection Error: Cannot connect to MySQL server"
      );
      console.error(`   Host: ${dbHost}`);
      console.error(`   Port: ${dbPort}`);
      console.error(`   User: ${dbUser}`);
      console.error("\n   Possible solutions:");
      console.error("   1. Make sure MySQL server is running");
      console.error("   2. Check your database credentials in .env file");
      console.error("   3. Verify the MySQL port is correct");
      console.error("\n   Create a .env file with:");
      console.error(`   DB_HOST=${dbHost}`);
      console.error(`   DB_PORT=${dbPort}`);
      console.error(`   DB_USER=${dbUser}`);
      console.error(`   DB_PASSWORD=${dbPassword || "(empty)"}`);
      console.error(`   DB_NAME=${dbName}\n`);
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error(
        "\n❌ Database Authentication Error: Invalid username or password"
      );
      console.error(`   User: ${dbUser}`);
      console.error(
        "   Please check your DB_USER and DB_PASSWORD in .env file\n"
      );
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("\n❌ Database Error: Database does not exist");
      console.error(`   Database: ${dbName}\n`);
    } else {
      console.error("\n❌ Error initializing database:", error.message);
      console.error("   Error code:", error.code || "Unknown");
    }
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = initDatabase;
